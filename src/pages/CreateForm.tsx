import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Save, Eye, ArrowLeft, Mic, Upload } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { FieldPalette } from '@/components/forms/FieldPalette';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/ThemeToggle';

interface FormFieldData {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  validation_rules: any;
  field_order: number;
}

export default function CreateForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [fields, setFields] = useState<FormFieldData[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [formType, setFormType] = useState<'identity-collision' | 'standard'>('standard');

  // Set default values based on form type
  useEffect(() => {
    const type = searchParams.get('type') as 'identity-collision' | 'standard' | null;
    if (type) {
      setFormType(type);

      if (type === 'identity-collision') {
        setFormTitle('Identity Collision Assessment');
        setFormDescription('Most high-earning entrepreneurs feel like they should be further along by now. You know you have the potential, you work harder than most, but something\'s holding you back from the results you know you\'re capable of. This assessment identifies exactly what\'s blocking your execution and how you\'re naturally wired to break through.');
        setWebhookUrl('https://purposewaze.app.n8n.cloud/webhook/identityColision');
      } else {
        setFormTitle('');
        setFormDescription('');
        setWebhookUrl('https://purposewaze.app.n8n.cloud/webhook/OtherForms');
      }
    }
  }, [searchParams]);

  const addField = (type: string) => {
    const newField: FormFieldData = {
      id: crypto.randomUUID(),
      type,
      label: `${type === 'text' ? 'Text Field' :
               type === 'phone' ? 'Phone' :
               type === 'number' ? 'Number' :
               type === 'select' ? 'Options List' :
               type === 'checkbox' ? 'Checkbox' :
               type === 'radio' ? 'Multiple Choice' :
               type === 'ranking' ? 'Ranking Field' :
               type === 'textarea' ? 'Text Area' :
               type === 'date' ? 'Date' : 'File'}`,
      placeholder: 'Type here...',
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] :
               type === 'ranking' ? ['Item 1', 'Item 2', 'Item 3'] : [],
      validation_rules: {},
      field_order: fields.length
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormFieldData>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const reorderFields = (dragIndex: number, hoverIndex: number) => {
    const dragField = fields[dragIndex];
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragField);
    setFields(newFields.map((field, index) => ({ ...field, field_order: index })));
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Error",
        description: "Please select an audio file",
        variant: "destructive"
      });
      return;
    }

    setUploadingAudio(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('userId', user?.id || '');
      formData.append('timestamp', new Date().toISOString());

      console.log('🎵 Uploading audio file to n8n webhook...');

      const response = await fetch('https://purposewaze.app.n8n.cloud/webhook/newfiles', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Audio upload successful:', result);

      toast({
        title: "Success!",
        description: "Audio file uploaded successfully. Processing will begin shortly.",
      });

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('❌ Error uploading audio:', error);
      toast({
        title: "Error",
        description: `Failed to upload audio file: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUploadingAudio(false);
    }
  };

  const saveForm = async () => {
    if (!user || !formTitle.trim()) {
      toast({
        title: "Error",
        description: "Form title is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    let formData = null;
    
    try {
      console.log('🚀 Starting form creation:', formTitle);
      
      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: user.id,
          title: formTitle,
          description: formDescription,
          settings: { webhook_url: webhookUrl || null },
          status: 'draft'
        })
        .select()
        .single();

      if (formError) {
        console.error('❌ Error creating form:', formError);
        throw formError;
      }

      formData = form;
      console.log('✅ Form created with ID:', formData.id);

      // Create the form fields
      if (fields.length > 0) {
        const fieldsToInsert = fields.map(field => ({
          form_id: formData.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          required: field.required,
          options: field.options,
          validation_rules: field.validation_rules,
          field_order: field.field_order
        }));

        const { error: fieldsError } = await supabase
          .from('form_fields')
          .insert(fieldsToInsert);

        if (fieldsError) {
          console.error('❌ Error creating fields:', fieldsError);
          throw fieldsError;
        }

        console.log('✅ Fields created successfully');

        // Create dynamic table for this form - FIXING: Remove JSON.stringify()
        const fieldsForTable = fields.map(field => ({
          id: field.id,
          type: field.type,
          label: field.label
        }));

        console.log('🔧 Creating dynamic table with fields:', fieldsForTable);

        try {
          const { data: tableName, error: tableError } = await supabase
            .rpc('create_form_table', {
              form_title: formTitle,
              form_id: formData.id,
              fields: fieldsForTable // ✅ FIXED: Passing array directly instead of JSON string
            });

          if (tableError) {
            console.error('❌ RPC error creating dynamic table:', tableError);
            throw new Error(`Table creation failed: ${tableError.message}`);
          }

          if (!tableName) {
            throw new Error('Function did not return table name');
          }

          console.log('✅ Dynamic table created:', tableName);
          
        } catch (tableCreationError) {
          console.error('❌ Critical error creating table:', tableCreationError);

          // Don't block form creation, but log the error
          console.warn('⚠️ Form created, but dynamic table failed');
          toast({
            title: "Warning",
            description: "Form created, but data table may not be available",
            variant: "default"
          });
        }
      }

      toast({
        title: "Success!",
        description: "Form created successfully"
      });

      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Error saving form:', error);

      // Cleanup: delete form if it was created but failed later
      if (formData?.id) {
        try {
          await supabase.from('forms').delete().eq('id', formData.id);
          console.log('🧹 Incomplete form removed');
        } catch (cleanupError) {
          console.error('❌ Error cleaning up incomplete form:', cleanupError);
        }
      }

      toast({
        title: "Error",
        description: `Error saving form: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Futuristic Grid Background */}
      <div className="grid-background fixed inset-0 pointer-events-none opacity-20" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {formType === 'identity-collision' ? 'Create Identity Collision Assessment' : 'Create Standard Assessment'}
              </h1>
              <p className="text-muted-foreground">
                {formType === 'identity-collision'
                  ? 'Build a specialized assessment for identity pattern recognition'
                  : 'Build your personalized form'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAudio}
            >
              <Mic className="w-4 h-4 mr-2" />
              {uploadingAudio ? 'Uploading...' : 'Upload Audio'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="futuristic"
              onClick={saveForm}
              disabled={saving || !formTitle.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </div>

        {/* Hidden file input for audio upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          style={{ display: 'none' }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {!isPreview && (
            <div className="lg:col-span-1">
              <FieldPalette onAddField={addField} />
            </div>
          )}

          <div className={`${isPreview ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
            <Card className="card-glow border-primary/20">
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Form Title</Label>
                    <Input
                      id="title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Enter form title"
                      disabled={isPreview}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe the purpose of the form"
                      disabled={isPreview}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook">Webhook URL (optional)</Label>
                    <Input
                      id="webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-webhook-url.com/webhook/endpoint"
                      disabled={isPreview}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL where form submissions will be sent for processing
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No fields added yet</p>
                      <p className="text-sm">Use the palette on the side to add fields</p>
                    </div>
                  ) : (
                    fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        field={field}
                        index={index}
                        isPreview={isPreview}
                        onUpdate={(updates) => updateField(field.id, updates)}
                        onRemove={() => removeField(field.id)}
                        onReorder={reorderFields}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}