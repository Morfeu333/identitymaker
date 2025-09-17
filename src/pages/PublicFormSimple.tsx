import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { NumberSlider } from '@/components/ui/number-slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

const PublicFormSimple: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const { toast } = useToast();

  // State management
  const [step, setStep] = useState<'email' | 'form' | 'loading' | 'success'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load form configuration
  useEffect(() => {
    if (formId) {
      loadFormData();
    }
  }, [formId]);

  const loadFormData = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) throw error;
      setFormData(data);
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

      // Save to Supabase
      const tableName = `Formulario_${formId?.replace(/-/g, '_')}`;
      const submissionData = {
        email: userEmail,
        ...formValues,
        submitted_at: new Date().toISOString()
      };

      const { data: supabaseData, error: supabaseError } = await supabase
        .from(tableName)
        .insert([submissionData])
        .select('id')
        .single();

      if (supabaseError) throw supabaseError;

      // Call n8n webhook
      const webhookData = {
        formId,
        formTitle: formData?.title || 'Form Submission',
        userEmail,
        submissionId: supabaseData.id,
        submissionTimestamp: new Date().toISOString(),
        formResponses: fieldBasedData,
        metadata: {
          totalQuestions: formData?.fields.length || 0,
          submissionSource: 'public_form',
          userAgent: navigator.userAgent
        }
      };

      const webhookResponse = await fetch('https://purposewaze.app.n8n.cloud/webhook/OtherForms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }

      setStep('success');

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

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (field: FormField) => {
    const value = formValues[field.id] || '';

    switch (field.type) {
      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
            <RadioGroup
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
              className="space-y-2"
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <RadioGroupItem value={option} id={`${field.id}-${index}`} className="mt-1" />
                  <Label 
                    htmlFor={`${field.id}-${index}`} 
                    className="text-sm leading-relaxed cursor-pointer flex-1"
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
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="min-h-[100px]"
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <NumberSlider
            key={field.id}
            value={value}
            onChange={(newValue) => handleFieldChange(field.id, newValue)}
            label={field.label}
            required={field.required}
            className="mb-6"
          />
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
    }
  };

  const getPopoverContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="p-4 space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Continue to Form
            </Button>
          </form>
        );

      case 'form':
        return (
          <form onSubmit={handleFormSubmit} className="p-4 space-y-6">
            {formData?.fields.map(renderField)}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Form'}
            </Button>
          </form>
        );

      case 'loading':
        return (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Your Submission</h2>
            <p className="text-gray-600">Please wait while we process your form...</p>
          </div>
        );

      case 'success':
        return (
          <div className="p-8 text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Form Submitted Successfully!</h2>
            <p className="text-gray-600 mb-4">Thank you for your submission. We'll be in touch soon.</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.title}</h1>
          <p className="text-gray-600">{formData.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {getPopoverContent()}
        </div>
      </div>
    </div>
  );
};

export default PublicFormSimple;
