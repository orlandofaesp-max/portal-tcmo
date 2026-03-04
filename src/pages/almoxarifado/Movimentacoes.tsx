import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import {
  useMovimentacoesAlmoxarifado,
  useCreateMovimentacao,
  useItensAlmoxarifado,
  usePessoasAlmoxarifado,
} from "@/hooks/useAlmoxarifado";

interface FormState {
  item_id: string;
  pessoa_id: string;
  tipo: string;
  quantidade: string;
  data_movimento: string;
  observacao: string;
}

const emptyForm: FormState = {
  item_id: "",
  pessoa_id: "",
  tipo: "entrada",
  quantidade: "",
  data_movimento: new Date().toISOString().split("T")[0],
  observacao: "",
};

const tipoLabels: Record<string, string> = { entrada: "Entrada", saida: "Saída", ajuste: "Ajuste" };
const tipoVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  entrada: "default",
  saida: "destructive",
  ajuste: "secondary",
};

const Movimentacoes = () => {
  const { data: movs = [], isLoading } = useMovimentacoesAlmoxarifado();
  const { data: itens = [] } = useItensAlmoxarifado();
  const { data: pessoas = [] } = usePessoasAlmoxarifado();
  const createMut = useCreateMovimentacao();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = movs.filter((m) => {
    const itemNome = (m.itens_almoxarifado as any)?.nome || "";
    const pessoaNome = (m.pessoas as any)?.nome || "";
    const q = search.toLowerCase();
    return itemNome.toLowerCase().includes(q) || pessoaNome.toLowerCase().includes(q);
  });

  const handleSave = async () => {
    if (!form.item_id || !form.pessoa_id || !form.quantidade || Number(form.quantidade) <= 0) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      await createMut.mutateAsync({
        item_id: form.item_id,
        pessoa_id: form.pessoa_id,
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
        data_movimento: form.data_movimento,
        observacao: form.observacao || null,
      });
      toast({ title: "Movimentação registrada!" });
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;

  return (
    <div>
      <PageHeader title="Movimentações" subtitle="Registro de entradas e saídas do estoque">
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Nova Movimentação
        </Button>
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por item ou responsável..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Item</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Tipo</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Qtd</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Responsável</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Data</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Observação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{(m.itens_almoxarifado as any)?.nome || "—"}</td>
                  <td className="px-5 py-3 text-center">
                    <Badge variant={tipoVariants[m.tipo] || "secondary"} className="text-[10px]">
                      {tipoLabels[m.tipo] || m.tipo}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-right font-medium text-card-foreground">
                    {m.quantidade} {(m.itens_almoxarifado as any)?.unidade_medida || ""}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{(m.pessoas as any)?.nome || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(m.data_movimento), "dd/MM/yyyy")}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{m.observacao || "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Nenhuma movimentação encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Nova Movimentação</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Item *</Label>
              <Select value={form.item_id} onValueChange={(v) => setForm((p) => ({ ...p, item_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione o item..." /></SelectTrigger>
                <SelectContent>
                  {itens.filter((i) => i.ativo).map((i) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground">Responsável *</Label>
              <Select value={form.pessoa_id} onValueChange={(v) => setForm((p) => ({ ...p, pessoa_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {pessoas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}>
                  <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Quantidade *</Label>
                <Input type="number" min="0.01" step="0.01" value={form.quantidade} onChange={(e) => setForm((p) => ({ ...p, quantidade: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Data</Label>
              <Input type="date" value={form.data_movimento} onChange={(e) => setForm((p) => ({ ...p, data_movimento: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Observação</Label>
              <Textarea value={form.observacao} onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))} className="bg-muted border-border mt-1" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} disabled={createMut.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {createMut.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Movimentacoes;
