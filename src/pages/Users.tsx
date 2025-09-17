import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, User, Mail, Calendar, Plus, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Users() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  const registerUser = async () => {
    if (!newUserEmail.trim() || !newUserName.trim()) {
      toast({
        title: "Error",
        description: "Email and name are required",
        variant: "destructive"
      });
      return;
    }

    setRegistering(true);
    try {
      const { data, error } = await supabase
        .rpc('register_user_in_all_forms', {
          user_email: newUserEmail.trim(),
          user_name: newUserName.trim()
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `User registered in ${data || 0} form(s)`
      });

      setNewUserEmail('');
      setNewUserName('');
    } catch (error) {
      console.error('Error registering user:', error);
      toast({
        title: "Error",
        description: "Error registering user",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-br">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Unified User System</h1>
            <p className="text-muted-foreground">
              Register users once and they will automatically appear in all forms
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Register New User</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Register User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          placeholder="Full name"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={registerUser}
                        disabled={registering}
                        className="w-full"
                      >
                        {registering ? 'Registering...' : 'Register in All Forms'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                With the unified system, registering a user here means they will be automatically included
                in all existing forms and any new forms you create in the future.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Unified User System
              </h3>
              <p className="text-muted-foreground">
                All registered users are stored in a central table and are automatically
                synchronized with all forms. When you create new forms, already
                registered users will appear automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}