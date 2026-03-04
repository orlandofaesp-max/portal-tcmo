import { useState } from "react";
import { Plus, Edit2, Trash2, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  useItensAlmoxarifado,
  useCategoriasAlmoxarifado,
  useCreateItemAlmoxarifado,
  useUpdateItemAlmoxarifado,
  useDeleteItemAlmoxarifado,
} from "@/hooks/useAlmoxarifado";

interface FormState {
  nome: string;
  categoria_id: string;
  unidade_medida: string;
  estoque_minimo: string;
}
const emptyForm: FormState = { nome: "", categoria_id: "", unidade_medida: "", estoque_minimo: "0" };

const ItensAlmoxarifado = () => {
  const { data: itens = [], isLoading } = useItensAlmoxarifado();
  const { data: categorias = [] } = useCategoriasAlmoxarifado();
  const createMut = useCreateItemAlmoxarifado();
  const updateMut = useUpdateItemAlmoxarifado();
  const deleteMut = useDeleteItemAlmoxarifado();
  const isCongal = useAuth().usuario?.perfil === "congal";
  const isAlmoxarifado = useAuth().isPerfil("almoxarifado");
  const canEdit = isAlmoxarifado && !isCongal;
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = itens.filter((i) =>
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    (i.categorias_almoxarifado as any)?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.nome.trim() || !form.categoria_id || !form.unidade_medida.trim()) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        nome: form.nome,
        categoria_id: form.categoria_id,
        unidade_medida: form.unidade_medida,
        estoque_minimo: Number(form.estoque_minimo) || 0,
      };
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Item atualizado!" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Item adicionado!" });
      }
      setDialogOpen(false); setEditingId(null); setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Item removido!" });
    } catch (e: any) {
      toast({ title: "Erro ao remover", description: "Este item pode ter movimentações registradas.", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;

  return (
    <div>
      <PageHeader title="Itens do Almoxarifado" subtitle="Cadastro e controle de estoque">
        {canEdit && (
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Novo Item
          </Button>
        )}
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar item ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Item</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Categoria</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Unidade</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Estoque</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Mínimo</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Diferença</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Status</th>
                {canEdit && <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const abaixo = item.saldo < item.estoque_minimo;
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">{item.nome}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{(item.categorias_almoxarifado as any)?.nome || "—"}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{item.unidade_medida}</td>
                    <td className="px-5 py-3 text-sm text-right font-medium text-card-foreground">{item.saldo}</td>
                    <td className="px-5 py-3 text-sm text-right text-muted-foreground">{item.estoque_minimo}</td>
                    <td className={`px-5 py-3 text-sm text-right font-medium ${abaixo ? "text-destructive" : "text-emerald-500"}`}>
                      {item.diferenca > 0 ? `+${item.diferenca}` : item.diferenca}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {abaixo ? (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <AlertTriangle className="w-3 h-3" /> Abaixo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Normal</Badge>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => {
                            setEditingId(item.id);
                            setForm({
                              nome: item.nome,
                              categoria_id: item.categoria_id,
                              unidade_medida: item.unidade_medida,
                              estoque_minimo: String(item.estoque_minimo),
                            });
                            setDialogOpen(true);
                          }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={canEdit ? 8 : 7} className="text-center py-8 text-sm text-muted-foreground">Nenhum item encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">{editingId ? "Editar Item" : "Novo Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Categoria *</Label>
              <Select value={form.categoria_id} onValueChange={(v) => setForm((p) => ({ ...p, categoria_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground">Unidade de medida *</Label>
              <Input value={form.unidade_medida} onChange={(e) => setForm((p) => ({ ...p, unidade_medida: e.target.value }))} className="bg-muted border-border mt-1" placeholder="ex: unidade, kg, litro, maço" />
            </div>
            <div>
              <Label className="text-muted-foreground">Estoque mínimo</Label>
              <Input type="number" min="0" value={form.estoque_minimo} onChange={(e) => setForm((p) => ({ ...p, estoque_minimo: e.target.value }))} className="bg-muted border-border mt-1" />
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

export default ItensAlmoxarifado;
