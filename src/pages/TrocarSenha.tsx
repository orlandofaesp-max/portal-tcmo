import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound } from "lucide-react";

const TrocarSenha = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { usuario, marcarSenhaTrocada } = useAuth();

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
      setLoading(false);
      return;
    }

    // Mark password as changed in usuarios table
    if (usuario) {
      await supabase.from("usuarios").update({ deve_trocar_senha: false } as any).eq("id", usuario.id);
    }

    marcarSenhaTrocada();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold tracking-tight">TCMO</h1>
          <p className="text-sm text-muted-foreground mt-2">Troca de Senha Obrigatória</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-card">
          <p className="text-xs text-muted-foreground bg-warning/5 border border-warning/20 rounded-lg p-3">
            Por segurança, você precisa definir uma nova senha antes de continuar.
          </p>

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
            {loading ? "Salvando..." : "Definir Nova Senha"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TrocarSenha;
