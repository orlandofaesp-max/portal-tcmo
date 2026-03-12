import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery token in the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    if (type === "recovery") {
      setValidToken(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidToken(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    }
    setLoading(false);
  };

  if (!validToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold text-gradient-gold tracking-tight mb-4">TCMO</h1>
          <p className="text-sm text-muted-foreground">Link inválido ou expirado.</p>
          <Button onClick={() => navigate("/login")} variant="outline" className="mt-4 border-border text-muted-foreground">
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-card-foreground mb-2">Senha alterada com sucesso!</h2>
          <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold tracking-tight">TCMO</h1>
          <p className="text-sm text-muted-foreground mt-2">Redefinir Senha</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-card">
          <div>
            <Label className="text-muted-foreground">Nova Senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-muted border-border mt-1" placeholder="Mín. 6 caracteres" required />
          </div>
          <div>
            <Label className="text-muted-foreground">Confirmar Senha</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-muted border-border mt-1" required />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90">
            <KeyRound className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Redefinir Senha"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
