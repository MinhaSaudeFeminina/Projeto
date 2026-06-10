import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import floral from '@/assets/login-floral.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Bem-vinda!', description: 'Acesso autorizado ao painel.' });
      navigate('/');
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Lado visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-warm">
        <img
          src={floral}
          alt="Padrão floral Minha Saúde Feminina"
          className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-accent/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground">
          <h2 className="font-display text-5xl leading-tight drop-shadow-md">
            Minha Saúde<br />Feminina
          </h2>
          <p className="mt-4 text-lg max-w-md font-light tracking-wide">
            Autocuidado, informação confiável e acompanhamento do ciclo — em um só lugar.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <Heart className="h-6 w-6 text-primary-foreground" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-primary leading-none">Minha Saúde</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Painel Feminina
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-semibold uppercase tracking-wide text-foreground">
            Bem-vinda de volta
          </h2>
          <p className="mt-2 text-muted-foreground">
            Acesse o painel para gerenciar conteúdos e cuidar de quem cuida.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="uppercase tracking-wider text-xs">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-secondary/40 border-secondary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="uppercase tracking-wider text-xs">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-secondary/40 border-secondary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-primary" />
                Lembrar de mim
              </label>
              <a href="#" className="text-primary hover:underline font-medium">
                Esqueci minha senha
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base uppercase tracking-widest font-semibold gradient-primary hover:opacity-90 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Minha Saúde Feminina · Apoio à Atenção Primária
          </p>
        </div>
      </div>
    </div>
  );
}
