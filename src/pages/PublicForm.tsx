import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NumberSlider } from '@/components/ui/number-slider';
import { ArrowRight, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PopoverForm, PopoverFormButton, PopoverFormSuccess } from '@/components/ui/popover-form';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';

interface FormFieldData {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation_rules?: any;
  field_order: number;
}

interface FormData {
  id: string;
  title: string;
  description?: string;
  status: string;
}

export default function PublicForm() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [form, setForm] = useState<FormData | null>(null);
  const [fields, setFields] = useState<FormFieldData[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'email' | 'form' | 'loading' | 'success' | 'report'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  // Handle URL parameters for direct report access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const reportIdParam = urlParams.get('reportId');

    if (emailParam && reportIdParam) {
      console.log('🔗 URL parameters detected:', { email: emailParam, reportId: reportIdParam });
      setUserEmail(emailParam);
      setReportId(reportIdParam);
      fetchReport(reportIdParam);
    }
  }, []);

  const fetchReport = async (reportId: string) => {
    console.log('🔄 Fetching report with ID:', reportId);
    setLoadingReport(true);
    try {
      const { data, error } = await supabase
        .rpc('get_form_report', { p_report_id: reportId });

      console.log('📊 Supabase response:', { data, error });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log('✅ Report found, checking for JSON data');
        console.log('📄 JSON data:', data[0].report_json);
        console.log('🔄 Current step:', step, '→ report');

        // Check if we have structured JSON data (preferred)
        if (data[0].report_json) {
          console.log('✅ Found structured JSON data, using React components');
          setReportData(data[0].report_json);
          setStep('report');
          console.log('✅ Step changed to report with JSON data');
        } else {
          console.log('❌ No JSON report data found');
          throw new Error('Report not found');
        }
      } else {
        console.log('❌ No report data found');
        throw new Error('Report not found');
      }
    } catch (error) {
      console.error('❌ Error fetching report:', error);
      toast({
        title: "Error",
        description: "Could not load the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchForm = async () => {
    try {
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('status', 'published')
        .single();

      if (formError) throw formError;
      setForm(formData);

      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('field_order');

      if (fieldsError) throw fieldsError;
      // Map fields data to match our interface  
      const mappedFields = (fieldsData || []).map(field => ({
        id: field.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || '',
        required: field.required,
        options: Array.isArray(field.options) 
          ? field.options.filter(opt => typeof opt === 'string') as string[]
          : [],
        validation_rules: field.validation_rules,
        field_order: field.field_order
      }));
      setFields(mappedFields);

    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email para continuar",
        variant: "destructive"
      });
      return;
    }

    setEmailLoading(true);

    // Verificar se o email está registrado no sistema central
    try {
      const { data: isRegistered, error: validationError } = await supabase
        .rpc('validate_email_registration', {
          user_email: userEmail.trim()
        });

      if (validationError) throw validationError;

      if (!isRegistered) {
        toast({
          title: "Email not registered",
          description: "This email is not registered in the system. Contact the administrator to be added.",
          variant: "destructive"
        });
        setEmailLoading(false);
        return;
      }

      // Show success briefly then transition
      setShowEmailSuccess(true);
      setEmailLoading(false);
      setTimeout(() => {
        setShowEmailSuccess(false);
        setStep('form');
        setFormValues({ email: userEmail });
      }, 1500);
      
    } catch (error) {
      console.error('Error validating email:', error);
      toast({
        title: "Validation Error",
        description: "Error validating email. Please try again.",
        variant: "destructive"
      });
      setEmailLoading(false);
    }
  };

  // Loading progress management
  const startLoadingProgress = () => {
    const startTime = Date.now();
    setLoadingStartTime(startTime);
    setLoadingProgress(0);

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const totalDuration = 90000; // 1 minute 30 seconds
      const progress = Math.min((elapsed / totalDuration) * 100, 100);

      setLoadingProgress(progress);

      if (progress < 100) {
        setTimeout(updateProgress, 100); // Update every 100ms
      }
    };

    updateProgress();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    setSubmitting(true);
    startLoadingProgress();
    try {
      // Create field-based data using field labels as keys
      const fieldBasedData: any = {};
      fields.forEach(field => {
        const value = formValues[field.id];
        if (value !== undefined && value !== '') {
          fieldBasedData[field.label] = value;
        }
      });

      // Debug logging
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('User Email:', userEmail);
      console.log('Form ID:', formId);
      console.log('Field Based Data:', fieldBasedData);
      console.log('Field Based Data JSON:', JSON.stringify(fieldBasedData, null, 2));
      console.log('Raw Form Values:', formValues);
      console.log('Fields:', fields);

      // Check for duplicate keys in fieldBasedData
      const keys = Object.keys(fieldBasedData);
      const uniqueKeys = [...new Set(keys)];
      console.log('Keys count:', keys.length, 'Unique keys count:', uniqueKeys.length);
      if (keys.length !== uniqueKeys.length) {
        console.error('DUPLICATE KEYS DETECTED!', keys);
      }

      if (!userEmail || userEmail.trim() === '') {
        throw new Error('User email is not set. Please refresh and try again.');
      }

      // Submit form data (user is already registered by admin)
      const { data, error } = await supabase
        .rpc('submit_form_data', {
          form_id: formId!,
          user_email: userEmail,
          form_data: fieldBasedData
        });

      console.log('Supabase response data:', data);

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        throw error;
      }

      // Extract submission_id from the response (now the function returns the UUID directly)
      const submissionId = data;
      console.log('Extracted submission_id:', submissionId);

      // Data saved successfully, show loading screen
      setStep('loading');

      // Send data to n8n webhook after successful Supabase save
      try {
        const webhookData = {
          formId: formId,
          formTitle: form.title,
          userEmail: userEmail,
          submissionId: submissionId,
          submissionTimestamp: new Date().toISOString(),
          formResponses: fieldBasedData,
          metadata: {
            totalQuestions: fields.length,
            submissionSource: "public_form",
            userAgent: navigator.userAgent
          }
        };

        // Call n8n webhook and start polling for report
        try {
          console.log('🚀 Calling n8n webhook and starting report polling...');
          console.log('📦 Webhook data being sent:', JSON.stringify(webhookData, null, 2));

          // Use form-specific webhook URL or fallback to default
          const webhookUrl = form?.settings?.webhook_url || 'https://purposewaze.app.n8n.cloud/webhook/identityColision';
          console.log('🎯 Using webhook URL:', webhookUrl);

          // Start loading immediately
          setStep('loading');

          // Call webhook (fire and forget - don't wait for response)
          fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
            mode: 'cors'
          }).then(response => {
            console.log('✅ Webhook called, status:', response.status);
            return response.json();
          }).then(result => {
            console.log('✅ Webhook response received:', result);
          }).catch(webhookError => {
            console.warn('🔄 Webhook error (continuing with polling):', webhookError);
          });

          // Start polling for report immediately
          const pollForReport = async () => {
            console.log('🔍 Polling for report...');

            // First try to get structured JSON reports (prioritize these)
            const { data: structuredReports, error: structuredError } = await supabase
              .from('form_reports')
              .select('report_json')
              .eq('submission_id', submissionId)
              .like('report_json', '{%') // Only JSON objects
              .order('generated_at', { ascending: false })
              .limit(1);

            if (!structuredError && structuredReports && structuredReports.length > 0) {
              console.log('✅ Structured JSON report found! Displaying report...');
              setReportData(structuredReports[0].report_json);
              setStep('report');
              setSubmitting(false);
              return true; // Report found
            }

            // If no structured report, try to get any report (including text)
            const { data: anyReport, error: anyError } = await supabase
              .from('form_reports')
              .select('report_json')
              .eq('submission_id', submissionId)
              .order('generated_at', { ascending: false })
              .limit(1)
              .single();

            if (!anyError && anyReport && anyReport.report_json) {
              console.log('✅ Text report found! Displaying report...');
              // If it's a text string, wrap it in a simple structure
              const reportData = typeof anyReport.report_json === 'string'
                ? { textReport: anyReport.report_json, assessmentType: 'Text Report' }
                : anyReport.report_json;

              setReportData(reportData);
              setStep('report');
              setSubmitting(false);
              return true; // Report found
            } else {
              console.log('⏳ Report not ready yet, continuing to poll...');
              return false; // Report not ready
            }
          };

          // Poll every 3 seconds for up to 2 minutes
          let pollCount = 0;
          const maxPolls = 40; // 40 * 3 seconds = 2 minutes

          const pollInterval = setInterval(async () => {
            pollCount++;
            console.log(`🔍 Poll attempt ${pollCount}/${maxPolls}`);

            const reportFound = await pollForReport();

            if (reportFound) {
              clearInterval(pollInterval);
              return;
            }

            if (pollCount >= maxPolls) {
              console.log('⏰ Polling timeout reached, showing success screen');
              clearInterval(pollInterval);
              setStep('success');
              setSubmitting(false);
              toast({
                title: "Processing Complete",
                description: "Your form has been submitted. The report may take a few more minutes to generate."
              });
            }
          }, 3000);

          // Also try immediate poll (in case report is already there)
          setTimeout(async () => {
            const reportFound = await pollForReport();
            if (reportFound) {
              clearInterval(pollInterval);
            }
          }, 1000);

        } catch (webhookError) {
          console.warn('🔄 Webhook setup error, showing success screen:', webhookError);
          setStep('success');
          setSubmitting(false);
          toast({
            title: "Form Submitted",
            description: "Your responses have been recorded. The report will be generated shortly."
          });
        }

      } catch (webhookError) {
        console.warn('Webhook error but continuing normally:', webhookError);
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Error submitting form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateValue = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const renderField = (field: FormFieldData) => {
    const value = formValues[field.id] || (field.type === 'ranking' ? field.options || [] : '');
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateValue(field.id, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateValue(field.id, e.target.value)}
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => updateValue(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => updateValue(field.id, val)}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'ranking':
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Drag to reorder from most terrifying (1) to least terrifying ({field.options?.length || 0}):
            </p>
            <div className="space-y-2">
              {(value || field.options)?.map((item: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg bg-background">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="flex-1 text-sm">{item}</span>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOrder = [...(value || field.options || [])];
                          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                          updateValue(field.id, newOrder);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        ↑
                      </button>
                    )}
                    {index < (value || field.options || []).length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOrder = [...(value || field.options || [])];
                          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                          updateValue(field.id, newOrder);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'number':
        return (
          <NumberSlider
            value={value}
            onChange={(newValue) => updateValue(field.id, newValue)}
            label={field.label}
            required={field.required}
            className="mb-6"
          />
        );
      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('fieldId', field.id);
                    formData.append('formId', form?.id || '');
                    formData.append('userEmail', userEmail);

                    await fetch('https://purposewaze.app.n8n.cloud/webhook/newfiles', {
                      method: 'POST',
                      body: formData,
                    });

                    updateValue(field.id, file.name);
                  } catch (error) {
                    console.error('Error uploading file:', error);
                  }
                }
              }}
            />
            {value && <p className="text-sm text-muted-foreground">Arquivo: {value}</p>}
          </div>
        );
      default:
        return <Input placeholder={field.placeholder} value={value} onChange={(e) => updateValue(field.id, e.target.value)} />;
    }
  };

  // Show loading while fetching form data
  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatedGridPattern
          numSquares={25}
          maxOpacity={0.1}
          duration={6}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] fill-slate-200/40 stroke-slate-200/30"
          )}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show "not found" if loading is complete AND form is null
  if (!loading && !form) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatedGridPattern
          numSquares={25}
          maxOpacity={0.1}
          duration={6}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] fill-slate-200/40 stroke-slate-200/30"
          )}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Form not found</h2>
              <p className="text-muted-foreground">This form may not exist or may no longer be available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get dynamic PopoverForm dimensions based on step
  const getPopoverDimensions = () => {
    switch (step) {
      case 'email':
        return { width: "400px", height: "auto" };
      case 'form':
        return { width: "600px", height: "auto" };
      case 'loading':
        return { width: "500px", height: "auto" };
      case 'success':
        return { width: "450px", height: "auto" };
      case 'report':
        // Responsive width for better desktop display
        const isDesktop = window.innerWidth > 768;
        return {
          width: isDesktop ? "80vw" : "95vw",
          height: "90vh"
        };
      default:
        return { width: "400px", height: "auto" };
    }
  };

  // Get PopoverForm content based on current step
  const getPopoverContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="p-4">
            <div className="mb-4 space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="pr-10"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Mail className="text-muted-foreground size-4" />
                </div>
              </div>
              <p className="text-muted-foreground text-xs tracking-tight">
                Enter your email to access the form
              </p>
            </div>
            <PopoverFormButton
              loading={emailLoading}
              text="Continue"
            />
          </form>
        );
      
      case 'form':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {form.title}
              </h2>
              {form.description && (
                <p className="text-muted-foreground text-sm">
                  {form.description}
                </p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                  {errors[field.id] && (
                    <p className="text-sm text-destructive">{errors[field.id]}</p>
                  )}
                </div>
              ))}
              <div className="pt-4">
                <PopoverFormButton
                  loading={submitting}
                  text={submitting ? "Submitting..." : "Submit Form"}
                />
              </div>


            </form>
          </div>
        );

      case 'loading':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Generating your personalized report
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                We are processing your responses and creating a unique report for you...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{Math.round(loadingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Loading Steps */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className={`flex items-center ${loadingProgress > 20 ? 'text-primary' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-3 ${loadingProgress > 20 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                Analyzing your responses
              </div>
              <div className={`flex items-center ${loadingProgress > 50 ? 'text-primary' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-3 ${loadingProgress > 50 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                Identifying behavioral patterns
              </div>
              <div className={`flex items-center ${loadingProgress > 80 ? 'text-primary' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-3 ${loadingProgress > 80 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                Generating personalized recommendations
              </div>
              <div className={`flex items-center ${loadingProgress >= 100 ? 'text-primary' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-3 ${loadingProgress >= 100 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                Finalizing your report
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> Your report will be unique and based on your specific responses.
                Please wait while our AI analyzes your data...
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <PopoverFormSuccess
              title="Form Submitted!"
              description="Thank you for filling out the form. Your responses have been successfully recorded."
            />
            <div className="mt-4 space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Important:</strong> To fill out other forms, always use the same email ({userEmail}) so your information is connected.
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-800">
                  <strong>Email Notification:</strong> You will receive an email with your personalized assessment results shortly.
                </AlertDescription>
              </Alert>

              {/* Check for Report Button */}
              <div className="mt-4">
                <Button
                  onClick={async () => {
                    setLoadingReport(true);
                    try {
                      // Try to fetch the report manually
                      const { data: structuredReports, error: structuredError } = await supabase
                        .from('form_reports')
                        .select('report_json')
                        .eq('user_email', userEmail)
                        .like('report_json', '{%') // Only JSON objects
                        .order('generated_at', { ascending: false })
                        .limit(1);

                      if (!structuredError && structuredReports && structuredReports.length > 0) {
                        setReportData(structuredReports[0].report_json);
                        setStep('report');
                        setLoadingReport(false);
                        return;
                      }

                      // If no structured report, try to get any report (including text)
                      const { data: anyReport, error: anyError } = await supabase
                        .from('form_reports')
                        .select('report_json')
                        .eq('user_email', userEmail)
                        .order('generated_at', { ascending: false })
                        .limit(1)
                        .single();

                      if (!anyError && anyReport && anyReport.report_json) {
                        const reportData = typeof anyReport.report_json === 'string'
                          ? { textReport: anyReport.report_json, assessmentType: 'Text Report' }
                          : anyReport.report_json;

                        setReportData(reportData);
                        setStep('report');
                      } else {
                        toast({
                          title: "Report Not Ready",
                          description: "Your report is still being generated. Please try again in a few minutes.",
                          variant: "default"
                        });
                      }
                    } catch (error) {
                      console.error('Error checking for report:', error);
                      toast({
                        title: "Error",
                        description: "Unable to check for report. Please try again.",
                        variant: "destructive"
                      });
                    } finally {
                      setLoadingReport(false);
                    }
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={loadingReport}
                >
                  {loadingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Checking for Report...
                    </>
                  ) : (
                    'Check for Report'
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'report':
        return (
          <div className="w-full h-full flex flex-col bg-white">
            {loadingReport ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Generating your personalized report...</p>
                </div>
              </div>
            ) : reportData || reportHtml ? (
              <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Report Generated Successfully!</h2>
                <p className="text-gray-600 mb-4">Your personalized report has been generated.</p>
                <Button onClick={() => setStep('success')} variant="outline">
                  Close Report
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p>No report available</p>
                  <Button onClick={() => setStep('success')} className="mt-4">
                    Go Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
              <>
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
                  <h2 className="text-lg font-semibold">Your Personalized Report</h2>
                  <Button
                    onClick={() => setStep('success')}
                    variant="outline"
                    size="sm"
                  >
                    Close Report
                  </Button>
                </div>

                {/* Enhanced report content with proper centering and styling */}
                <div className="flex-1 overflow-y-auto flex items-center justify-center p-4" style={{ maxHeight: 'calc(90vh - 80px)', backgroundColor: '#EFEFEF' }}>
                  {reportData ? (
                    // Detect data format and render accordingly
                    reportData.textReport ? (
                      // TEXT REPORT DISPLAY - SALES.HTML STYLE (no extra wrapper)
                      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden p-12 flex flex-col items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <div className="space-y-8 w-full">
                          <div className="whitespace-pre-wrap text-[#59422F] leading-relaxed">
                            {reportData.textReport.split('\n').map((paragraph, index) => {
                              // Skip empty lines
                              if (!paragraph.trim()) return null;

                              // Handle headers (lines starting with ###)
                              if (paragraph.startsWith('###')) {
                                return (
                                  <div key={index} className="bg-[#F8F6F4] p-8 rounded-2xl shadow-md my-6">
                                    <h2 className="text-2xl font-bold text-[#32230D] mb-4">
                                      {paragraph.replace('###', '').replace(/\*\*/g, '').trim()}
                                    </h2>
                                  </div>
                                );
                              }

                              // Handle subject line
                              if (paragraph.startsWith('Subject:')) {
                                return (
                                  <div key={index} className="text-center mb-10">
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#32230D] leading-tight">
                                      {paragraph.replace('Subject:', '').trim()}
                                    </h1>
                                  </div>
                                );
                              }

                              // Handle regular paragraphs
                              return (
                                <p key={index} className="text-[#59422F] leading-relaxed mb-4">
                                  {paragraph.split('**').map((part, partIndex) => {
                                    // Bold text between **
                                    if (partIndex % 2 === 1) {
                                      return <span key={partIndex} className="font-bold text-[#32230D]">{part}</span>;
                                    }
                                    return part;
                                  })}
                                </p>
                              );
                            })}
                          </div>

                          {/* Call to Action Section - Sales.html style */}
                          <div className="bg-[#32230D] p-8 rounded-2xl text-center shadow-md">
                            <h2 className="text-2xl font-bold text-white mb-4">This Is Your Breakthrough Moment. Let's Act Now.</h2>
                            <p className="text-[#F8F6F4] leading-relaxed mb-6">
                              This level of clarity, this insight into your own operating system, is potent. While this insight is fresh, we must act quickly to set a new trajectory.
                            </p>
                            <Button
                              className="inline-block px-8 py-4 bg-[#8D6B4E] text-white font-bold rounded-full shadow-lg hover:bg-[#A98E76] transition-colors duration-300"
                              onClick={() => window.open('https://calendly.com/your-calendar-link', '_blank')}
                            >
                              <span className="flex items-center justify-center">
                                Click here to schedule your complimentary strategy session
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center min-h-full p-4">
                        <div className="w-full max-w-4xl">
                        {reportData.assessmentType === "Authentic Self Discovery" ? (
                          // AUTHENTIC SELF DISCOVERY FORMAT DISPLAY
                          <div className="bg-white rounded-lg shadow-lg p-8">
                            <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">🌟 Authentic Self Discovery Report</h1>

                            {/* Core Identity */}
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                              <h2 className="text-xl font-semibold text-blue-900 mb-4">Your Core Identity</h2>
                              <p className="text-gray-700 leading-relaxed">
                                {reportData.authenticSelfProfile?.coreIdentity}
                              </p>
                            </div>

                            {/* Fear Analysis */}
                            <div className="bg-red-50 p-6 rounded-lg border border-red-200 mb-6">
                              <h2 className="text-xl font-semibold text-red-900 mb-4">Primary Fear Analysis</h2>
                              <p className="text-gray-700 font-medium mb-2">
                                Primary Fear: {reportData.fearAnalysis?.primaryFear}
                              </p>
                              <p className="text-gray-700 leading-relaxed">
                                {reportData.fearAnalysis?.fearImpact}
                              </p>
                            </div>

                            {/* Key Insights */}
                            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                              <h2 className="text-xl font-semibold text-green-900 mb-4">Key Insights</h2>
                              <p className="text-gray-700 leading-relaxed mb-4">
                                {reportData.personalizedInsights?.keyRevelation}
                              </p>
                              <div className="bg-white p-4 rounded border">
                                <h3 className="font-semibold text-green-800 mb-2">This Week's Action:</h3>
                                <p className="text-gray-700">
                                  {reportData.personalizedInsights?.actionableAdvice}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : reportData.temperamentAlignedProtocol ? (
                          // IDENTITY COLLISION ASSESSMENT FORMAT DISPLAY
                          <div className="bg-white rounded-lg shadow-lg p-8">
                            <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">⚡ Identity Collision Assessment Report</h1>

                            {/* Protocol Header */}
                            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-6">
                              <h2 className="text-2xl font-semibold text-purple-900 mb-4">{reportData.temperamentAlignedProtocol.name}</h2>
                              <p className="text-gray-700 leading-relaxed mb-4">
                                {reportData.temperamentAlignedProtocol.description}
                              </p>
                              <div className="bg-white p-4 rounded border">
                                <p className="text-sm text-purple-700 font-medium">
                                  ⏱️ Total Time Investment: {reportData.temperamentAlignedProtocol.totalTimeInvestment}
                                </p>
                              </div>
                            </div>

                            {/* Daily Practices */}
                            <div className="mb-6">
                              <h2 className="text-2xl font-semibold text-purple-900 mb-4">7-Day P.R.O.T.E.C.T. Protocol</h2>
                              <div className="space-y-4">
                                {reportData.temperamentAlignedProtocol.dailyPractices?.map((practice: any, index: number) => (
                                  <div key={index} className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                                    <div className="flex items-center mb-3">
                                      <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                                        {practice.day}
                                      </div>
                                      <h3 className="text-lg font-semibold text-indigo-900">{practice.letter}</h3>
                                      <span className="ml-auto text-sm text-indigo-600 font-medium">{practice.timing}</span>
                                    </div>

                                    <div className="mb-4">
                                      <h4 className="font-semibold text-indigo-800 mb-2">Practice: {practice.selectedPractice}</h4>
                                      <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                        {practice.fullInstructions}
                                      </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div className="bg-white p-3 rounded border">
                                        <h5 className="font-semibold text-indigo-700 text-sm mb-1">Why It Works:</h5>
                                        <p className="text-gray-600 text-sm">{practice.whyItWorks}</p>
                                      </div>
                                      <div className="bg-white p-3 rounded border">
                                        <h5 className="font-semibold text-indigo-700 text-sm mb-1">Success Indicator:</h5>
                                        <p className="text-gray-600 text-sm">{practice.successIndicator}</p>
                                      </div>
                                    </div>

                                    <div className="mt-3 bg-white p-3 rounded border">
                                      <h5 className="font-semibold text-indigo-700 text-sm mb-1">Business Application:</h5>
                                      <p className="text-gray-600 text-sm">{practice.businessApplication}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Emergency Protocol */}
                            {reportData.temperamentAlignedProtocol.emergencyProtocol && (
                              <div className="bg-red-50 p-6 rounded-lg border border-red-200 mb-6">
                                <h2 className="text-xl font-semibold text-red-900 mb-4">🚨 Emergency Protocol</h2>
                                <p className="text-sm text-red-700 font-medium mb-2">
                                  Duration: {reportData.temperamentAlignedProtocol.emergencyProtocol.duration}
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                  {reportData.temperamentAlignedProtocol.emergencyProtocol.fullInstructions}
                                </p>
                              </div>
                            )}

                            {/* Temperament Optimization */}
                            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                              <h2 className="text-xl font-semibold text-green-900 mb-4">🎯 Temperament Optimization</h2>
                              <p className="text-gray-700 leading-relaxed mb-4">
                                {reportData.temperamentAlignedProtocol.temperamentOptimization}
                              </p>
                              <div className="bg-white p-4 rounded border">
                                <h3 className="font-semibold text-green-800 mb-2">Practice Selection Rationale:</h3>
                                <p className="text-gray-700 text-sm">
                                  {reportData.temperamentAlignedProtocol.practiceSelectionRationale}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // DEFAULT FALLBACK DISPLAY
                          <div className="bg-white rounded-lg shadow-lg p-8">
                            <h1 className="text-3xl font-bold text-center mb-6">Assessment Report</h1>
                            <p className="text-center text-gray-600">Report content will be displayed here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : reportHtml ? (
                    // Legacy HTML report display
                    <div className="flex justify-center min-h-full p-4">
                      <div className="w-full max-w-4xl">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                          <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: reportHtml }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                  <p>Erro ao carregar o relatório</p>
                  <Button
                    onClick={() => reportId && fetchReport(reportId)}
                    className="mt-4"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getPopoverTitle = () => {
    switch (step) {
      case 'email':
        return form?.title || "Preencher Formulário";
      case 'form':
        return "Formulário";
      case 'loading':
        return "Processing...";
      case 'success':
        return "";
      case 'report':
        return "Your Personalized Report";
      default:
        return form?.title || "Formulário";
    }
  };

  const { width, height } = getPopoverDimensions();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedGridPattern
        numSquares={25}
        maxOpacity={0.1}
        duration={6}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] fill-slate-200/40 stroke-slate-200/30"
        )}
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className={`w-full ${step === 'report' ? 'max-w-4xl' : 'max-w-2xl'} ${step !== 'report' ? 'mr-8' : ''}`}>
          <PopoverForm
            title={getPopoverTitle()}
            open={popoverOpen}
            setOpen={setPopoverOpen}
            width={width}
            height={height}
            showSuccess={showEmailSuccess}
            showCloseButton={false}
            openChild={getPopoverContent()}
            successChild={
              <PopoverFormSuccess
                title="Email Validated!"
                description="Redirecting to the form..."
              />
            }
          />
        </div>
      </div>
    </div>
  );
}