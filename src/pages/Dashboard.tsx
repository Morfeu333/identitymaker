import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, BarChart3, Settings, Search, Edit, Copy, User } from 'lucide-react';
import { ShareFormDialog } from '@/components/forms/ShareFormDialog';
import { DeleteFormButton } from '@/components/forms/DeleteFormButton';
import { FormTypeSelectionDialog } from '@/components/forms/FormTypeSelectionDialog';
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

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [forms, setForms] = useState<Form[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormTypeDialog, setShowFormTypeDialog] = useState(false);

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

  const deleteForm = async (formId: string, formTitle: string) => {
    // We'll handle the confirmation in the UI component
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Assessment System Style */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="Unshakable Foundation" className="h-8 w-8" />
              <div>
                <h1 className="assessment-title text-xl">Unshakable Foundation</h1>
                <p className="text-xs text-muted-foreground">Assessment Dashboard</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:block">
                Welcome, {user.user_metadata?.nome || user.email}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Assessment System Style */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="assessment-title text-3xl mb-2">
            Welcome to Your Assessment Dashboard
          </h2>
          <p className="assessment-subtitle">
            Track your foundation growth and identity patterns over time.
          </p>
        </div>

        {/* Quick Actions - Assessment System Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="assessment-card assessment-card-animate cursor-pointer group"
            onClick={() => setShowFormTypeDialog(true)}
          >
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">New Assessment</CardTitle>
              <CardDescription className="text-muted-foreground">
                Create an assessment from scratch
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="assessment-card assessment-card-animate cursor-pointer group"
          >
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Assessments Created</CardTitle>
              <CardDescription className="text-muted-foreground">
                {forms.length} assessment{forms.length !== 1 ? 's' : ''} created
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="assessment-card assessment-card-animate cursor-pointer group"
            onClick={() => navigate('/usuarios')}
          >
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Participants</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage assessment participants
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="assessment-card assessment-card-animate cursor-pointer group"
            onClick={() => navigate('/configuracoes')}
          >
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure account and profile
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Forms Management Section - Assessment System Style */}
        <Card className="assessment-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="assessment-title text-xl">Your Assessments</CardTitle>
                <CardDescription className="assessment-subtitle">
                  Manage and monitor your identity assessments
                </CardDescription>
              </div>
              <Button variant="assessment" onClick={() => setShowFormTypeDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No forms yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first form
                </p>
                <Button
                  variant="hero"
                  className="shadow-form"
                  onClick={() => setShowFormTypeDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Form
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Forms List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredForms.slice(0, 6).map((form) => (
                    <Card key={form.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base line-clamp-1">{form.title}</CardTitle>
                          {getStatusBadge(form.status)}
                        </div>
                        {form.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {form.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                          <span>{new Date(form.created_at).toLocaleDateString('pt-BR')}</span>
                          <span>{form.submission_count || 0} responses</span>
                        </div>
                        
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/formulario/${form.id}/editar`)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/formulario/${form.id}/relatorios`)}
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Data
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
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {forms.length > 6 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/todos-formularios')}
                    >
                      View All Forms ({forms.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Form Type Selection Dialog */}
      <FormTypeSelectionDialog
        open={showFormTypeDialog}
        onOpenChange={setShowFormTypeDialog}
      />
    </div>
  );
};

export default Dashboard;