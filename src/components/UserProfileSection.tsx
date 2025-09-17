import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileSectionProps {
  userId: string;
}

export default function UserProfileSection({ userId }: UserProfileSectionProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <div>
        <h3 className="font-semibold mb-2">Dados do Perfil</h3>
        <div className="space-y-2">
          <div className="animate-pulse h-4 bg-muted rounded"></div>
          <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Dados do Perfil</h3>
      <p className="text-sm text-muted-foreground">
        Funcionalidade temporariamente indisponível. Os dados do usuário estão sendo migrados para o novo sistema.
      </p>
    </div>
  );
}