import { useState, useEffect } from "react";
import { Edit2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PerfilRow {
  id: string;
  nome: string;
  descricao: string | null;
  perfil_pai: string | null;
}

const perfilLabels: Record<string, string> = {
  administrador: "Administrador",
  congal: "Congal",
  tesouraria: "Tesouraria",
  secretaria: "Secretaria",
  biblioteca: "Biblioteca",
  almoxarifado: "Almoxarifado",
  acervo: "Acervo",
};

const GerenciarPerfis = () => {
  const [perfis, setPerfis] = useState<PerfilRow[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PerfilRow | null>(null);
  const [form, setForm] = useState({ descricao: "", perfil_pai: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchPerfis = async () => {
    const { data } = await supabase.from("perfis").select("*").order("nome");
    if (data) setPerfis(data as PerfilRow[]);
  };

  useEffect(() => { fetchPerfis(); }, []);

  const filtered = perfis.filter(p =>
    (perfilLabels[p.nome] || p.nome).toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (p: PerfilRow) => {
    setEditing(p);
    setForm({ descricao: p.descricao || "", perfil_pai: p.perfil_pai || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from("perfis").update({
      descricao: form.descricao || null,
      perfil_pai: form.perfil_pai || null,
    }).eq("id", editing.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchPerfis();
  };

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Acesso restrito.</p></div>;
  }

  return (
    <div>
      <PageHeader title="Perfis" subtitle="Gerenciamento de perfis de acesso com herança" />

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar perfil..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Perfil</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Descrição</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Herda de</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const pai = p.perfil_pai ? perfis.find(x => x.id === p.perfil_pai) : null;
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">
                      <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {perfilLabels[p.nome] || p.nome}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{p.descricao || "—"}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {pai ? (perfilLabels[pai.nome] || pai.nome) : "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(p)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum perfil encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Editar Perfil: {editing ? (perfilLabels[editing.nome] || editing.nome) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Herda permissões de</Label>
              <Select value={form.perfil_pai} onValueChange={(v) => setForm(p => ({ ...p, perfil_pai: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {perfis.filter(p => p.id !== editing?.id).map(p => (
                    <SelectItem key={p.id} value={p.id}>{perfilLabels[p.nome] || p.nome}</SelectItem>
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

export default GerenciarPerfis;
