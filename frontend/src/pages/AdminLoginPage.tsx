import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, Lock, Mail } from "lucide-react";
import floral from "@/assets/login-floral.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { loginAdmin } from "@/services/api/adminAuthApi";
import { saveAdminSession } from "@/state/adminAuthStore";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const session = await loginAdmin(email, password);
      saveAdminSession(session.token, session.user);
      toast({ title: "Bem-vinda!", description: "Acesso autorizado ao painel administrativo." });
      navigate("/");
    } catch (error) {
      toast({
        title: "Não foi possível entrar",
        description: error instanceof Error ? error.message : "Verifique e-mail e senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-1/2">
        <img
          src={floral}
          alt="Padrão floral Minha Saúde Feminina"
          className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-accent/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground">
          <h2 className="font-display text-5xl leading-tight drop-shadow-md">
            Minha Saúde
            <br />
            Feminina
          </h2>
          <p className="mt-4 max-w-md text-lg font-light">
            Portal administrativo para gestão editorial, revisão e publicação de conteúdos educativos.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary shadow-lg shadow-primary/30">
              <Heart className="h-6 w-6 text-primary-foreground" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-display text-2xl leading-none text-primary">Minha Saúde</h1>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Painel Feminina
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-semibold uppercase tracking-wide text-foreground">
            Bem-vinda de volta
          </h2>
          <p className="mt-2 text-muted-foreground">
            Acesse o painel para gerenciar conteúdos, revisões e publicações.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 border-secondary bg-secondary/40 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 border-secondary bg-secondary/40 pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full text-base font-semibold uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Entrando" /> : "Entrar"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Minha Saúde Feminina · Portal administrativo
          </p>
        </div>
      </div>
    </div>
  );
}
