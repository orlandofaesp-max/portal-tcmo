import { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useCategoriasBiblioteca, useCreateCategoriaBiblioteca, useUpdateCategoriaBiblioteca, useDeleteCategoriaBiblioteca } from "@/hooks/useBiblioteca";

interface FormState { nome: string; descricao: string; }
const emptyForm: FormState = { nome: "", descricao: "" };

const CategoriasBiblioteca = () => {
  const { data: categorias = [], isLoading } = useCategoriasBiblioteca();
  const createMut = useCreateCategoriaBiblioteca();
  const updateMut = useUpdateCategoriaBiblioteca();
  const deleteMut = useDeleteCategoriaBiblioteca();
  const isCongal = useAuth().usuario?.perfil === "congal";
  const isBiblioteca = useAuth().isPerfil("biblioteca");
  const canEdit = isBiblioteca && !isCongal;
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
        await updateMut.mutateAsync({ id: editingId, nome: form.nome, descricao: form.descricao || null });
        toast({ title: "Categoria atualizada!" });
      } else {
        await createMut.mutateAsync({ nome: form.nome, descricao: form.descricao || null });
        toast({ title: "Categoria adicionada!" });
      }
      setDialogOpen(false); setEditingId(null); setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Categoria removida!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;

  return (
    <div>
      <PageHeader title="Categorias da Biblioteca" subtitle="Classificação do acervo">
        {canEdit && (
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
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Descrição</th>
                {canEdit && <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{c.nome}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{c.descricao || "—"}</td>
                  {canEdit && (
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => { setEditingId(c.id); setForm({ nome: c.nome, descricao: c.descricao || "" }); setDialogOpen(true); }}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-sm text-muted-foreground">Nenhuma categoria encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">{editingId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Descrição</Label>
              <Input value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} className="bg-muted border-border mt-1" />
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

export default CategoriasBiblioteca;
