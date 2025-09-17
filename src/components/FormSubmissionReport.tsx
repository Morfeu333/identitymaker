import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Calendar, MapPin, FileText, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function FormSubmissionReport({ formId }: { formId: string }) {
  const [form, setForm] = useState<FormData | null>(null);
  const [tableName, setTableName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFormAndTable();
  }, [formId]);

  const fetchFormAndTable = async () => {
    try {
      // Fetch form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('id, title, description, status, created_at')
        .eq('id', formId)
        .single();

      if (formError) throw formError;
      setForm(formData);

      // Get table name from form sequence
      const { data: sequenceData, error: sequenceError } = await supabase
        .from('form_sequence')
        .select('table_name')
        .eq('form_id', formId)
        .single();

      if (sequenceError) {
        console.log('No table found for this form:', sequenceError);
      } else {
        setTableName(sequenceData.table_name);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do formulário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Formulário não encontrado.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="border-b pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Relatório: {form.title}
            </h1>
            <p className="text-muted-foreground">
              {form.description || 'Sem descrição'}
            </p>
          </div>
          <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
            {form.status === 'published' ? 'Publicado' : 'Rascunho'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Criado em: {new Date(form.created_at).toLocaleDateString('pt-BR')}
          </div>
          {tableName && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tabela: {tableName}
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema Simplificado:</strong> Os dados agora são armazenados diretamente na tabela <code>{tableName || 'não encontrada'}</code>. 
          {form.status !== 'published' && ' Publique o formulário para criar a tabela e começar a receber dados.'}
          {!tableName && form.status === 'published' && ' A tabela será criada automaticamente quando o formulário for republicado.'}
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status da Tabela</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tableName ? '✓ Criada' : '⏳ Pendente'}
            </div>
            <p className="text-xs text-muted-foreground">
              {tableName ? `Tabela ${tableName} está ativa` : 'Aguardando publicação'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Acesso aos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">💾</div>
            <p className="text-xs text-muted-foreground">
              {tableName 
                ? 'Dados disponíveis na tabela específica'
                : 'Dados serão disponibilizados após publicação'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🚀</div>
            <p className="text-xs text-muted-foreground">Novo sistema simplificado ativo</p>
          </CardContent>
        </Card>
      </div>

      {tableName && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Tabela</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nome da Tabela:</strong> <code>{tableName}</code></p>
              <p><strong>Estrutura:</strong> Campos personalizados + email, nome, submitted_at, ip_address</p>
              <p><strong>Acesso:</strong> Apenas usuários autenticados podem visualizar</p>
              <p><strong>Submissões:</strong> Qualquer pessoa pode enviar (se formulário publicado)</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}