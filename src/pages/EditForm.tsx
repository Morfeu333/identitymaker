import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Save, Eye, ArrowLeft } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { FieldPalette } from '@/components/forms/FieldPalette';
import { useToast } from '@/hooks/use-toast';

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

export default function EditForm() {
  const { formId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [fields, setFields] = useState<FormFieldData[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (formId) {
      fetchForm();
    }
  }, [user, formId]);

  const fetchForm = async () => {
    try {
      console.log('🔍 Carregando formulário:', formId, 'usuário:', user?.id);
      
      // Get form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('user_id', user?.id)
        .single();

      if (formError) {
        console.error('❌ Erro ao carregar dados do formulário:', formError);
        throw formError;
      }
      
      console.log('✅ Dados do formulário carregados:', formData?.title);

      setFormTitle(formData.title);
      setFormDescription(formData.description || '');
      setWebhookUrl(formData.settings?.webhook_url || '');
      setFormStatus(formData.status as 'draft' | 'published' | 'archived');

      // Get form fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('field_order');

      if (fieldsError) {
        console.error('❌ Erro ao carregar campos do formulário:', fieldsError);
        throw fieldsError;
      }
      
      console.log('✅ Campos do formulário carregados:', fieldsData?.length, 'campos');

      const formattedFields = fieldsData?.map(field => ({
        id: field.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || '',
        required: field.required || false,
        options: Array.isArray(field.options) ? field.options as string[] : [],
        validation_rules: field.validation_rules || {},
        field_order: field.field_order
      })) || [];

      setFields(formattedFields);
    } catch (error: any) {
      console.error('❌ Error fetching form:', error);
      
      let errorMessage = "Erro ao carregar formulário";
      
      if (error?.message?.includes("No API key found")) {
        errorMessage = "Erro de autenticação. Tente fazer login novamente.";
        console.error('🔑 Erro de API key - possível problema de sessão');
      } else if (error?.message?.includes("PGRST116")) {
        errorMessage = "Formulário não encontrado ou sem permissão de acesso.";
        console.error('🚫 Formulário não encontrado ou sem permissão');
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addField = (type: string) => {
    const newField: FormFieldData = {
      id: crypto.randomUUID(),
      type,
      label: `${type === 'text' ? 'Campo de Texto' :
               type === 'phone' ? 'Telefone' :
               type === 'number' ? 'Número' :
               type === 'select' ? 'Lista de Opções' :
               type === 'checkbox' ? 'Checkbox' :
               type === 'radio' ? 'Opção Múltipla' :
               type === 'ranking' ? 'Campo de Ranking' :
               type === 'textarea' ? 'Área de Texto' :
               type === 'date' ? 'Data' : 'Arquivo'}`,
      placeholder: 'Digite aqui...',
      required: false,
      options: type === 'select' || type === 'radio' ? ['Opção 1', 'Opção 2'] :
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

  const saveForm = async () => {
    if (!user || !formTitle.trim()) {
      toast({
        title: "Erro",
        description: "Título do formulário é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Get current form status to detect publish action
      const { data: currentForm } = await supabase
        .from('forms')
        .select('status')
        .eq('id', formId)
        .single();

      const wasPublished = currentForm?.status === 'published';
      const isBeingPublished = formStatus === 'published' && !wasPublished;

      // Update the form
      const { error: formError } = await supabase
        .from('forms')
        .update({
          title: formTitle,
          description: formDescription,
          settings: { webhook_url: webhookUrl || null },
          status: formStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', formId);

      if (formError) throw formError;

      // Delete existing fields
      const { error: deleteError } = await supabase
        .from('form_fields')
        .delete()
        .eq('form_id', formId);

      if (deleteError) throw deleteError;

      // Insert updated fields
      if (fields.length > 0) {
        const fieldsToInsert = fields.map(field => ({
          form_id: formId,
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

        if (fieldsError) throw fieldsError;

        // Handle table creation/update for published forms
        if (isBeingPublished) {
          // Create dynamic table for first-time publication
          const fieldsForTable = fields.map(field => ({
            id: field.id,
            type: field.type,
            label: field.label
          }));

          console.log('🚀 Criando tabela dinâmica para formulário publicado:', formTitle);
          console.log('🔧 Campos para tabela:', fieldsForTable);
          
          try {
            const { data: tableName, error: tableError } = await supabase
              .rpc('create_published_form_table', {
                form_id: formId,
                fields: fieldsForTable
              });

            if (tableError) {
              console.error('❌ Erro RPC ao criar tabela dinâmica:', tableError);
              throw new Error(`Falha na criação da tabela: ${tableError.message}`);
            }

            if (!tableName) {
              throw new Error('Função não retornou nome da tabela');
            }

            console.log('✅ Tabela dinâmica criada:', tableName);

            // Verificar se a tabela foi realmente criada
            const { data: tableExists, error: verifyError } = await supabase
              .from('form_sequence')
              .select('table_name')
              .eq('form_id', formId)
              .eq('table_name', tableName)
              .single();

            if (verifyError || !tableExists) {
              console.error('❌ Erro na verificação da tabela:', verifyError);
              throw new Error('Tabela não foi criada corretamente');
            }

            console.log('✅ Tabela verificada na form_sequence:', tableName);
            toast({
              title: "Sucesso!",
              description: `Formulário publicado! Tabela ${tableName} criada e verificada com sucesso.`
            });

          } catch (tableCreationError) {
            console.error('❌ Erro crítico ao criar tabela:', tableCreationError);
            
            // Reverter status para draft em caso de erro na criação da tabela
            await supabase
              .from('forms')
              .update({ status: 'draft' })
              .eq('id', formId);

            toast({
              title: "Erro na Publicação",
              description: `Erro ao criar tabela de dados: ${tableCreationError.message}. Formulário revertido para rascunho.`,
              variant: "destructive"
            });
            
            setFormStatus('draft');
            return;
          }
        } else if (wasPublished && formStatus === 'published') {
          // Update existing published form table structure
          const fieldsForTable = fields.map(field => ({
            id: field.id,
            type: field.type,
            label: field.label
          }));

          console.log('🔄 Atualizando estrutura da tabela para formulário já publicado');
          console.log('🔧 Novos campos:', fieldsForTable);
          
          try {
            const { data: updateSuccess, error: updateError } = await supabase
              .rpc('update_published_form_table', {
                form_id: formId,
                fields: fieldsForTable
              });

            if (updateError) {
              console.error('❌ Erro ao atualizar estrutura da tabela:', updateError);
              throw new Error(`Falha na atualização da tabela: ${updateError.message}`);
            }

            console.log('✅ Estrutura da tabela atualizada com sucesso');
            toast({
              title: "Sucesso!",
              description: "Formulário e estrutura da tabela atualizados com sucesso"
            });

          } catch (updateError) {
            console.error('❌ Erro crítico ao atualizar tabela:', updateError);
            toast({
              title: "Erro na Atualização",
              description: `Erro ao atualizar estrutura da tabela: ${updateError.message}`,
              variant: "destructive"
            });
            return;
          }
        } else {
          toast({
            title: "Sucesso!",
            description: "Formulário atualizado com sucesso"
          });
        }
      } else {
        toast({
          title: "Sucesso!",
          description: "Formulário atualizado com sucesso"
        });
      }

    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar formulário",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando formulário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Editar Formulário</h1>
              <p className="text-muted-foreground">Faça as alterações necessárias</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? 'Editar' : 'Visualizar'}
            </Button>
            <Button
              onClick={saveForm}
              disabled={saving || !formTitle.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {!isPreview && (
            <div className="lg:col-span-1">
              <FieldPalette onAddField={addField} />
            </div>
          )}

          <div className={`${isPreview ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título do Formulário</Label>
                    <Input
                      id="title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Digite o título do formulário"
                      disabled={isPreview}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Descreva o propósito do formulário"
                      disabled={isPreview}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook">Webhook URL (opcional)</Label>
                    <Input
                      id="webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-webhook-url.com/webhook/endpoint"
                      disabled={isPreview}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL onde as submissões do formulário serão enviadas para processamento
                    </p>
                  </div>
                  {!isPreview && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={formStatus === 'published'}
                        onCheckedChange={(checked) => 
                          setFormStatus(checked ? 'published' : 'draft')
                        }
                      />
                      <Label htmlFor="published">Formulário publicado</Label>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum campo adicionado ainda</p>
                      <p className="text-sm">Use a paleta ao lado para adicionar campos</p>
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