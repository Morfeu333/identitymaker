import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Copy, BarChart3, ArrowLeft } from 'lucide-react';
import { ShareFormDialog } from '@/components/forms/ShareFormDialog';
import { DeleteFormButton } from '@/components/forms/DeleteFormButton';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

interface Form {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  submission_count?: number;
}

export default function AllForms() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [forms, setForms] = useState<Form[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchForms();
    }
  }, [user, loading, navigate]);

  const fetchForms = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Since we removed form_submissions table, set submission_count to 0 for now
      // The actual submission count would need to be calculated from the dynamic tables
      const formsWithCount = (data || []).map(form => ({
        id: form.id,
        title: form.title,
        description: form.description || '',
        status: (form.status || 'draft') as 'draft' | 'published' | 'archived',
        created_at: form.created_at,
        updated_at: form.updated_at,
        submission_count: 0
      }));

      setForms(formsWithCount);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast({
        title: "Error",
        description: "Error loading forms",
        variant: "destructive"
      });
    } finally {
      setFormsLoading(false);
    }
  };

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline'
    } as const;
    
    const labels = {
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const duplicateForm = async (formId: string) => {
    try {
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;

      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('field_order');

      if (fieldsError) throw fieldsError;

      const { data: newForm, error: newFormError } = await supabase
        .from('forms')
        .insert({
          user_id: user?.id,
          title: `${formData.title} (Cópia)`,
          description: formData.description,
          settings: formData.settings,
          status: 'draft'
        })
        .select()
        .single();

      if (newFormError) throw newFormError;

      if (fieldsData && fieldsData.length > 0) {
        const newFields = fieldsData.map(field => ({
          form_id: newForm.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          required: field.required,
          options: field.options,
          validation_rules: field.validation_rules,
          field_order: field.field_order
        }));

        const { error: newFieldsError } = await supabase
          .from('form_fields')
          .insert(newFields);

        if (newFieldsError) throw newFieldsError;
      }

      toast({
        title: "Sucesso!",
        description: "Formulário duplicado com sucesso"
      });

      fetchForms();
    } catch (error) {
      console.error('Error duplicating form:', error);
      toast({
        title: "Erro",
        description: "Erro ao duplicar formulário",
        variant: "destructive"
      });
    }
  };

  const handleDeleteForm = async (formId: string) => {
    try {
      // First delete the form table if it exists
      const { error: tableError } = await supabase
        .rpc('delete_form_table', { form_id: formId });

      if (tableError) {
        console.warn('Error deleting form table:', tableError);
        // Continue with form deletion even if table deletion fails
      }

      // Then delete the form
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Formulário e tabela excluídos com sucesso"
      });

      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir formulário",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-br flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-br">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <img src={logo} alt="FormFácil BR" className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">FormFácil BR</h1>
                  <p className="text-xs text-muted-foreground">Todos os Formulários</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:block">
                Olá, {user.user_metadata?.nome || user.email}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Todos os Formulários
            </h2>
            <p className="text-muted-foreground">
              Gerencie todos os seus formulários criados ({forms.length} {forms.length === 1 ? 'formulário' : 'formulários'})
            </p>
          </div>
          <Button onClick={() => navigate('/criar-formulario')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Formulário
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {formsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredForms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No forms found' : 'No forms created yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Create your first form to start collecting responses'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/criar-formulario')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Formulário
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{form.title}</CardTitle>
                    {getStatusBadge(form.status)}
                  </div>
                  {form.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {form.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Criado em: {new Date(form.created_at).toLocaleDateString('pt-BR')}</p>
                      <p>Respostas: {form.submission_count || 0}</p>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/formulario/${form.id}/editar`)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/formulario/${form.id}/relatorios`)}
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Relatórios
                      </Button>
                      
                      
                      <ShareFormDialog
                        formId={form.id}
                        formTitle={form.title}
                        formStatus={form.status}
                      />
                      
                      <DeleteFormButton
                        formId={form.id}
                        formTitle={form.title}
                        onDelete={fetchForms}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}