import { useState } from "react";
import { Plus, Edit2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useCategorias, useCreateCategoria, useUpdateCategoria } from "@/hooks/useFinanceiro";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type TipoFinanceiro = Database["public"]["Enums"]["tipo_financeiro"];

interface FormState {
  nome: string;
  tipo: TipoFinanceiro;
  ativa: boolean;
}

const emptyForm: FormState = { nome: "", tipo: "entrada", ativa: true };

const Categorias = () => {
  const { data: categorias = [], isLoading } = useCategorias();
  const createMut = useCreateCategoria();
  const updateMut = useUpdateCategoria();
  const isCongal = useAuth().usuario?.perfil === "congal";
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = categorias.filter((c) => c.nome.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!form.nome.trim()) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, nome: form.nome, tipo: form.tipo, ativa: form.ativa });
        toast({ title: "Categoria atualizada!" });
      } else {
        await createMut.mutateAsync({ nome: form.nome, tipo: form.tipo, ativa: form.ativa });
        toast({ title: "Categoria adicionada!" });
      }
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setForm({ nome: c.nome, tipo: c.tipo, ativa: c.ativa });
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;
  }

  return (
    <div>
      <PageHeader title="Categorias Financeiras" subtitle="Classificação dos lançamentos">
        {!isCongal && (
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Nova Categoria
          </Button>
        )}
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nome</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Tipo</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Status</th>
                {!isCongal && <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{c.nome}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                      c.tipo === "entrada" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {c.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                      c.ativa ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {c.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  {!isCongal && (
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(c)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">Nenhuma categoria encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{editingId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as TipoFinanceiro }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.ativa} onCheckedChange={(v) => setForm((p) => ({ ...p, ativa: v }))} />
              <Label className="text-muted-foreground">Ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {(createMut.isPending || updateMut.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categorias;
