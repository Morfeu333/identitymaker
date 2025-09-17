import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FormSubmissionReport from '@/components/FormSubmissionReport';
import logo from '@/assets/logo.png';

export default function FormAnalytics() {
  const { formId } = useParams<{ formId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user && formId) {
      fetchFormData();
    }
  }, [user, loading, navigate, formId]);

  const fetchFormData = async () => {
    try {
      // Fetch form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;
      setForm(formData);

    } catch (error) {
      console.error('Error fetching form data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do formulário",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    await user;
    navigate('/');
  };

  if (loading || dataLoading) {
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
                  <p className="text-xs text-muted-foreground">Relatórios</p>
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
        {formId && <FormSubmissionReport formId={formId} />}
      </main>
    </div>
  );
}