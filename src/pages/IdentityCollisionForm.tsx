import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { NumberSlider } from '@/components/ui/number-slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';

interface FormField {
  id: string;
  label: string;
  type: 'radio' | 'text' | 'textarea' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

interface ReportData {
  textReport?: string;
  assessmentType?: string;
  [key: string]: any;
}

const IdentityCollisionForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [step, setStep] = useState<'email' | 'form' | 'loading' | 'success' | 'report'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load form configuration
  useEffect(() => {
    if (formId) {
      loadFormData();
    }
  }, [formId]);

  const loadFormData = async () => {
    try {
      // Get form basic info
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;

      // Get form fields
      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('field_order');

      if (fieldsError) throw fieldsError;

      // Combine form and fields data
      const formWithFields = {
        ...form,
        fields: fields || []
      };

      setFormData(formWithFields);
    } catch (error) {
      console.error('Error loading form:', error);
      toast({
        title: "Error",
        description: "Failed to load form. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    setStep('form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStep('loading');

    try {
      // Prepare form responses
      const fieldBasedData: Record<string, string> = {};
      formData?.fields.forEach(field => {
        const value = formValues[field.id];
        if (value) {
          fieldBasedData[field.label] = value;
        }
      });

      // Generate a temporary submission ID for tracking
      const tempSubmissionId = crypto.randomUUID();
      setSubmissionId(tempSubmissionId);

      // Call n8n webhook - n8n will handle Supabase insertion
      const webhookData = {
        formId,
        formTitle: formData?.title || 'Identity Collision Assessment',
        userEmail,
        submissionId: tempSubmissionId,
        submissionTimestamp: new Date().toISOString(),
        formResponses: fieldBasedData,
        metadata: {
          totalQuestions: formData?.fields.length || 0,
          submissionSource: 'identity_collision_form',
          userAgent: navigator.userAgent
        }
      };

      console.log('🚀 Sending data to n8n webhook:', webhookData);

      const webhookResponse = await fetch('https://purposewaze.app.n8n.cloud/webhook/identityColision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }

      const webhookResult = await webhookResponse.json();
      console.log('✅ Webhook response:', webhookResult);

      // Use the submission ID returned by the webhook if available
      const finalSubmissionId = webhookResult.submissionId || tempSubmissionId;
      setSubmissionId(finalSubmissionId);

      // Start polling for report
      await pollForReport(finalSubmissionId);

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const pollForReport = async (submissionId: string) => {
    const maxAttempts = 40; // 2 minutes with 3-second intervals
    let attempts = 0;

    const poll = async (): Promise<boolean> => {
      try {
        // Try to get any report for this submission
        const { data: report, error } = await supabase
          .from('form_reports')
          .select('report_json')
          .eq('submission_id', submissionId)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && report && report.report_json) {
          console.log('✅ Report found! Displaying report...');
          
          // Process the report data
          const reportData = typeof report.report_json === 'string'
            ? { textReport: report.report_json, assessmentType: 'Identity Collision Assessment' }
            : report.report_json;

          setReportData(reportData);
          setStep('report');
          return true; // Report found
        } else {
          console.log('⏳ Report not ready yet, continuing to poll...');
          return false; // Report not ready
        }
      } catch (error) {
        console.error('Error polling for report:', error);
        return false;
      }
    };

    // Initial poll
    if (await poll()) return;

    // Continue polling
    const pollInterval = setInterval(async () => {
      attempts++;
      
      if (await poll()) {
        clearInterval(pollInterval);
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        console.log('⏰ Polling timeout reached');
        setStep('success'); // Show success screen if report takes too long
      }
    }, 3000);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (formData?.fields.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isLastQuestion = currentQuestionIndex === (formData?.fields.length || 0) - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentField = formData?.fields[currentQuestionIndex];
  const currentValue = currentField ? formValues[currentField.id] || '' : '';
  const canProceed = currentField?.required ? currentValue.trim() !== '' : true;

  const renderField = (field: FormField) => {
    const value = formValues[field.id] || '';

    switch (field.type) {
      case 'radio':
        return (
          <div key={field.id} className="space-y-4">
            <Label className="text-xl font-bold text-foreground leading-relaxed">{field.label}</Label>
            <RadioGroup
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
              className="space-y-3"
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value={option} id={`${field.id}-${index}`} className="mt-1 border-primary text-primary" />
                  <Label
                    htmlFor={`${field.id}-${index}`}
                    className="text-base leading-relaxed cursor-pointer flex-1 text-foreground"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-4">
            <Label className="text-xl font-bold text-foreground leading-relaxed">{field.label}</Label>
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="min-h-[120px] border-primary/30 focus:border-primary focus:ring-primary/20 text-base"
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-4">
            <Label className="text-xl font-bold text-foreground leading-relaxed">{field.label}</Label>
            <NumberSlider
              value={value}
              onChange={(newValue) => handleFieldChange(field.id, newValue)}
              label=""
              required={field.required}
              className="mb-6"
            />
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-4">
            <Label className="text-xl font-bold text-foreground leading-relaxed">{field.label}</Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="h-12 border-primary/30 focus:border-primary focus:ring-primary/20 text-base"
            />
          </div>
        );
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        {/* Futuristic Grid Background */}
        <div className="grid-background fixed inset-0 pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4 shadow-glow-md"></div>
          <p className="text-foreground text-lg">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-4 relative">
      {/* Futuristic Grid Background */}
      <div className="grid-background fixed inset-0 pointer-events-none" />

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl lg:max-w-4xl relative z-10">
        {step === 'email' && (
          <div className="glass-effect card-glow border-primary/30 p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">{formData.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{formData.description}</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-base font-medium text-foreground mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="h-12 text-base border-primary/30 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <Button type="submit" variant="futuristic" className="w-full h-12 text-base font-semibold">
                Continue to Assessment →
              </Button>
            </form>
          </div>
        )}

        {step === 'form' && currentField && (
          <div className="glass-effect card-glow border-primary/30 p-6 sm:p-8 lg:p-10" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-primary font-semibold">
                  Question {currentQuestionIndex + 1} of {formData?.fields.length}
                </span>
                <span className="text-sm text-primary font-semibold">
                  {Math.round(((currentQuestionIndex + 1) / (formData?.fields.length || 1)) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out shadow-glow-sm"
                  style={{ width: `${((currentQuestionIndex + 1) / (formData?.fields.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current question */}
            <div className="min-h-[400px] flex flex-col justify-between">
              <div className="space-y-6">
                {renderField(currentField)}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                <Button
                  type="button"
                  onClick={handlePreviousQuestion}
                  disabled={isFirstQuestion}
                  variant="outline"
                  className="px-6 py-3 border-primary/50 text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={handleFormSubmit}
                    disabled={!canProceed || submitting}
                    variant="futuristic"
                    className="px-8 py-3 font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={!canProceed}
                    variant="futuristic"
                    className="px-8 py-3 font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="glass-effect card-glow border-primary/30 p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6 shadow-glow-md"></div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Generating Your Report</h2>
            <p className="text-muted-foreground text-lg">Our AI is analyzing your responses and creating a personalized assessment...</p>
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="glass-effect card-glow border-primary/30 p-8 text-center">
            <div className="text-primary text-6xl mb-6 animate-pulse">✓</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Assessment Submitted!</h2>
            <p className="text-muted-foreground text-lg mb-6">Your personalized report is being generated. You'll receive it via email shortly.</p>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              Return to Home
            </Button>
          </div>
        )}

        {step === 'report' && reportData && (
          <div className="glass-effect card-glow border-primary/30 overflow-hidden">
            <div className="p-3 sm:p-6 lg:p-8 max-h-[85vh] overflow-y-auto bg-gradient-to-br from-background via-card to-background">
              <div className="max-w-5xl mx-auto glass-effect rounded-2xl sm:rounded-3xl lg:rounded-[2rem] shadow-glow-lg border border-primary/20 p-6 sm:p-8 lg:p-16" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div className="space-y-8 sm:space-y-10 lg:space-y-12">
                  {reportData.textReport && (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {reportData.textReport.split('\n').map((paragraph, index) => {
                        if (!paragraph.trim()) return null;

                        // Handle headers (lines starting with ###)
                        if (paragraph.startsWith('###')) {
                          return (
                            <div key={index} className="relative my-6 sm:my-8 lg:my-10">
                              <div className="bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-glow-md">
                                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-primary-foreground leading-tight text-center">
                                  {paragraph.replace('###', '').replace(/\*\*/g, '').trim()}
                                </h2>
                              </div>
                              {/* Decorative accent */}
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-glow-sm"></div>
                            </div>
                          );
                        }

                        // Handle subject line
                        if (paragraph.startsWith('Subject:')) {
                          return (
                            <div key={index} className="text-center mb-8 sm:mb-12 lg:mb-16">
                              <div className="relative">
                                {/* Decorative background gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl transform -rotate-1"></div>
                                <div className="relative bg-gradient-to-br from-card to-background p-6 sm:p-8 lg:p-12 rounded-2xl shadow-glow-lg border border-primary/30">
                                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-primary leading-tight tracking-tight">
                                    {paragraph.replace('Subject:', '').trim()}
                                  </h1>
                                  {/* Decorative underline */}
                                  <div className="mt-4 sm:mt-6 flex justify-center">
                                    <div className="w-24 sm:w-32 lg:w-40 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-glow-sm"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Handle regular paragraphs with bold text
                        // Check if this is the first non-header, non-subject paragraph (title)
                        const isFirstParagraph = index === reportData.textReport.split('\n').findIndex(p =>
                          p.trim() && !p.startsWith('###') && !p.startsWith('Subject:')
                        );

                        return (
                          <p key={index} className={`leading-relaxed mb-4 sm:mb-5 lg:mb-6 px-2 font-medium ${
                            isFirstParagraph
                              ? 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-center mb-8 sm:mb-12 lg:mb-16 text-white'
                              : 'text-sm sm:text-base lg:text-lg text-white'
                          }`}>
                            {paragraph.split('**').map((part, partIndex) => {
                              if (partIndex % 2 === 1) {
                                return <span key={partIndex} className="font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded shadow-glow-sm">{part}</span>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  )}

                  {/* Call to Action Section */}
                  <div className="relative mt-8 sm:mt-12 lg:mt-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl sm:rounded-3xl transform rotate-1 shadow-glow-lg"></div>
                    <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl text-center shadow-glow-lg border border-primary/50">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-primary-foreground mb-4 sm:mb-6 leading-tight">Ready to Transform Your Business?</h2>
                      <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/90 leading-relaxed mb-6 sm:mb-8 lg:mb-10 px-2 font-medium">
                        This insight is powerful, but action is what creates results. Let's work together to implement these strategies.
                      </p>
                      <Button
                        className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 lg:py-6 bg-background text-foreground font-black rounded-full shadow-glow-md hover:bg-card hover:scale-105 transition-all duration-300 text-base sm:text-lg lg:text-xl border-2 border-background"
                        onClick={() => window.open('https://calendly.com/your-calendar-link', '_blank')}
                      >
                        START MY 30 DAYS PLAN
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityCollisionForm;
