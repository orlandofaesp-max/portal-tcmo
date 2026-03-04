import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const { signIn, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate("/");
  }, [session]);

  useEffect(() => {
    // Check if any users exist
    const check = async () => {
      const { count } = await supabase.from("usuarios").select("*", { count: "exact", head: true });
      setIsSetup(count === 0);
      setCheckingSetup(false);
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSetup) {
      // First user setup — trigger will auto-create usuario with congal profile
      if (!nome.trim() || password.length < 6) {
        setError("Preencha todos os campos. Senha mín. 6 caracteres.");
        setLoading(false);
        return;
      }
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { nome: nome.trim() },
        },
      });
      if (authError || !authData.user) {
        setError(authError?.message || "Erro ao criar conta.");
        setLoading(false);
        return;
      }
      // Try to sign in (works if auto-confirm is on or email already confirmed)
      const { error: signInError } = await signIn(email, password);
      setLoading(false);
      if (signInError) {
        setError("Conta criada! Verifique seu email para confirmar e depois faça login.");
      } else {
        navigate("/");
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setError("Email ou senha inválidos.");
      } else {
        navigate("/");
      }
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold tracking-tight">TCMO</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isSetup ? "Configuração Inicial" : "Portal de Gestão"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-card">
          {isSetup && (
            <>
              <p className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-3">
                Nenhum usuário cadastrado. Crie o primeiro administrador (Congal).
              </p>
              <div>
                <Label className="text-muted-foreground">Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} className="bg-muted border-border mt-1" required />
              </div>
            </>
          )}
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted border-border mt-1" required />
          </div>
          <div>
            <Label className="text-muted-foreground">Senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-muted border-border mt-1" required />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90">
            {isSetup ? <UserPlus className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
            {loading ? "Aguarde..." : isSetup ? "Criar Administrador" : "Entrar"}
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-6">v1.0 — Portal TCMO</p>
      </div>
    </div>
  );
};

export default Login;
