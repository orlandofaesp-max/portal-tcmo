import { useState, useEffect } from "react";
import { Edit2, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface FuncRow {
  id: string;
  modulo: string;
  nome_funcionalidade: string;
  rota: string | null;
  ativo: boolean;
  descricao: string | null;
}

const moduloLabels: Record<string, string> = {
  administracao: "Administração",
  tesouraria: "Tesouraria",
  secretaria: "Secretaria",
  biblioteca: "Biblioteca",
  almoxarifado: "Almoxarifado",
  acervo: "Acervo",
};

const GerenciarFuncionalidades = () => {
  const [funcs, setFuncs] = useState<FuncRow[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FuncRow | null>(null);
  const [descricao, setDescricao] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchFuncs = async () => {
    const { data } = await supabase.from("funcionalidades").select("*").order("modulo").order("nome_funcionalidade");
    if (data) setFuncs(data);
  };

  useEffect(() => { fetchFuncs(); }, []);

  const filtered = funcs.filter(f =>
    f.nome_funcionalidade.toLowerCase().includes(search.toLowerCase()) ||
    f.modulo.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAtivo = async (f: FuncRow) => {
    const { error } = await supabase.from("funcionalidades").update({ ativo: !f.ativo }).eq("id", f.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: f.ativo ? "Funcionalidade desativada" : "Funcionalidade ativada" });
    }
    fetchFuncs();
  };

  const handleEdit = (f: FuncRow) => {
    setEditing(f);
    setDescricao(f.descricao || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from("funcionalidades").update({ descricao: descricao || null }).eq("id", editing.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Funcionalidade atualizada!" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchFuncs();
  };

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Acesso restrito.</p></div>;
  }

  return (
    <div>
      <PageHeader title="Funcionalidades" subtitle="Ativar/desativar funcionalidades do sistema" />

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar funcionalidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Módulo</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Funcionalidade</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Rota</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Descrição</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase">{moduloLabels[f.modulo] || f.modulo}</td>
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{f.nome_funcionalidade}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{f.rota || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground max-w-xs truncate">{f.descricao || "—"}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                      f.ativo ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {f.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(f)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-muted-foreground", f.ativo ? "hover:text-warning" : "hover:text-success")} onClick={() => toggleAtivo(f)}>
                        {f.ativo ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma funcionalidade encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Editar Funcionalidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Descrição</Label>
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-muted border-border mt-1" />
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

export default GerenciarFuncionalidades;
