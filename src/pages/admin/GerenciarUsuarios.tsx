import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type AppPerfil = Database["public"]["Enums"]["app_perfil"];

interface UsuarioRow {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: AppPerfil;
  ativo: boolean;
  created_at: string;
}

const perfilLabels: Record<AppPerfil, string> = {
  administrador: "Administrador",
  congal: "Congal",
  tesouraria: "Tesouraria",
  secretaria: "Secretaria",
  biblioteca: "Biblioteca",
  almoxarifado: "Almoxarifado",
  acervo: "Acervo",
  pai_mae_de_santo: "Pai/Mãe de Santo",
};

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioRow | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", perfil: "tesouraria" as AppPerfil, senha: "", telefone: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin, usuario } = useAuth();

  const fetchUsuarios = async () => {
    const { data } = await supabase.from("usuarios").select("*").order("nome");
    if (data) setUsuarios(data as UsuarioRow[]);
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const filtered = usuarios.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Filter available profiles: only administrador can create another administrador
  const availableProfiles = Constants.public.Enums.app_perfil.filter(p => {
    if (p === "administrador" && !["administrador", "congal"].includes(usuario?.perfil || "")) return false;
    return true;
  });

  const handleSave = async () => {
    if (!form.nome.trim() || !form.email.trim()) return;
    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from("usuarios")
        .update({ nome: form.nome, email: form.email, perfil: form.perfil, telefone: form.telefone || null })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Usuário atualizado!" });
      }
    } else {
      if (!form.senha || form.senha.length < 6) {
        toast({ title: "Senha deve ter pelo menos 6 caracteres", variant: "destructive" });
        setSaving(false);
        return;
      }

      const { data: response, error: fnError } = await supabase.functions.invoke("create-user", {
        body: {
          email: form.email,
          password: form.senha,
          nome: form.nome,
          perfil: form.perfil,
          telefone: form.telefone || null,
        },
      });

      if (fnError || response?.error) {
        toast({ title: "Erro ao criar usuário", description: response?.error || fnError?.message || "Erro desconhecido", variant: "destructive" });
      } else {
        toast({ title: "Usuário criado com sucesso!" });
      }
    }

    setSaving(false);
    setDialogOpen(false);
    setEditing(null);
    setForm({ nome: "", email: "", perfil: "tesouraria", senha: "", telefone: "" });
    fetchUsuarios();
  };

  const toggleAtivo = async (u: UsuarioRow) => {
    const { error } = await supabase.from("usuarios").update({ ativo: !u.ativo }).eq("id", u.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: u.ativo ? "Usuário desativado" : "Usuário ativado" });
    }
    fetchUsuarios();
  };

  const handleEdit = (u: UsuarioRow) => {
    setEditing(u);
    setForm({ nome: u.nome, email: u.email, perfil: u.perfil, senha: "", telefone: u.telefone || "" });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuário removido!", variant: "destructive" });
    }
    fetchUsuarios();
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Gerenciar Usuários" subtitle="Cadastro e controle de acesso ao portal">
        <Button
          onClick={() => { setEditing(null); setForm({ nome: "", email: "", perfil: "tesouraria", senha: "", telefone: "" }); setDialogOpen(true); }}
          className="bg-gradient-gold text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar usuário..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nome</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Telefone</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Perfil</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{u.nome}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{u.telefone || "—"}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {perfilLabels[u.perfil]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                      u.ativo ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(u)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-muted-foreground", u.ativo ? "hover:text-warning" : "hover:text-success")} onClick={() => toggleAtivo(u)}>
                        {u.ativo ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(u.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{editing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className="bg-muted border-border mt-1" disabled={!!editing} />
            </div>
            {!editing && (
              <div>
                <Label className="text-muted-foreground">Senha temporária</Label>
                <Input type="password" value={form.senha} onChange={(e) => setForm(p => ({ ...p, senha: e.target.value }))} className="bg-muted border-border mt-1" placeholder="Mín. 6 caracteres" />
                <p className="text-[10px] text-muted-foreground mt-1">O usuário será obrigado a trocar a senha no primeiro login.</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm(p => ({ ...p, telefone: e.target.value }))} className="bg-muted border-border mt-1" placeholder="Opcional" />
            </div>
            <div>
              <Label className="text-muted-foreground">Perfil</Label>
              <Select value={form.perfil} onValueChange={(v) => setForm(p => ({ ...p, perfil: v as AppPerfil }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableProfiles.map(p => (
                    <SelectItem key={p} value={p}>{perfilLabels[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GerenciarUsuarios;
