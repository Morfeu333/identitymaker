import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    telefone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!formData.nome || !formData.email || !formData.password) return;

    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, {
      nome: formData.nome,
      empresa: formData.empresa,
      telefone: formData.telefone
    });
    setLoading(false);

    if (!error) {
      navigate('/login');
    }
  };

  const isPasswordMatch = formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-br flex items-center justify-center p-6 relative overflow-hidden">
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.04}
        duration={6}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] fill-slate-200/40 stroke-slate-200/40"
        )}
      />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="Unshakable Foundation" className="h-10 w-10" />
          <div>
            <h1 className="assessment-title text-2xl">Unshakable Foundation</h1>
            <p className="text-sm text-muted-foreground">Identity Shift Blueprint Platform</p>
          </div>
        </div>

        <Card className="assessment-card">
          <CardHeader className="text-center">
            <CardTitle className="assessment-title text-2xl">Get Started</CardTitle>
            <CardDescription className="assessment-subtitle">
              Create your free account and start building your foundation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Full Name *</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Your full name"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa">Organization (optional)</Label>
                <Input
                  id="empresa"
                  name="empresa"
                  type="text"
                  placeholder="Your organization name"
                  value={formData.empresa}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Phone (optional)</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={formData.confirmPassword && !isPasswordMatch ? 'border-destructive' : ''}
                />
                {formData.confirmPassword && !isPasswordMatch && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="assessment"
                disabled={loading || !isPasswordMatch || !formData.nome || !formData.email || !formData.password}
              >
                {loading ? 'Creating account...' : 'Start your foundation'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cadastro;