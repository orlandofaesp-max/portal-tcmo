import { useState, useMemo } from "react";
import { Plus, Edit2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import MonthFilter from "@/components/MonthFilter";
import {
  useLancamentos, useCreateLancamento, useUpdateLancamento,
  useCategorias, useAssociados, formatCurrency, meses,
} from "@/hooks/useFinanceiro";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type TipoFinanceiro = Database["public"]["Enums"]["tipo_financeiro"];
type OrigemLancamento = Database["public"]["Enums"]["origem_lancamento"];

interface FormState {
  data: string;
  tipo: TipoFinanceiro;
  valor: string;
  categoria_id: string;
  associado_id: string;
  origem: OrigemLancamento;
  responsavel: string;
  observacao: string;
}

const emptyForm: FormState = {
  data: "", tipo: "entrada", valor: "", categoria_id: "", associado_id: "",
  origem: "manual", responsavel: "", observacao: "",
};

const LivroCaixa = () => {
  const { data: lancamentos = [], isLoading } = useLancamentos();
  const { data: categorias = [] } = useCategorias();
  const { data: associados = [] } = useAssociados();
  const createMutation = useCreateLancamento();
  const updateMutation = useUpdateLancamento();
  const { isPerfil } = useAuth();
  const canEdit = isPerfil("tesouraria") && !isPerfil("congal") || isPerfil("tesouraria");
  const isCongal = useAuth().usuario?.perfil === "congal";

  const [search, setSearch] = useState("");
  const [mesFiltro, setMesFiltro] = useState("TODOS");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const { toast } = useToast();

  const mesFiltrado = useMemo(() => {
    if (mesFiltro === "TODOS") return lancamentos;
    return lancamentos.filter((l) => {
      const mesIdx = new Date(l.data + "T00:00:00").getMonth();
      return meses[mesIdx] === mesFiltro;
    });
  }, [lancamentos, mesFiltro]);

  const filtered = mesFiltrado.filter((l) => {
    const catNome = (l as any).categorias_financeiras?.nome || "";
    const obs = l.observacao || "";
    const q = search.toLowerCase();
    return catNome.toLowerCase().includes(q) || obs.toLowerCase().includes(q) || l.responsavel?.toLowerCase().includes(q);
  });

  const totalEntradas = mesFiltrado.reduce((s, l) => s + (l.tipo === "entrada" ? l.valor : 0), 0);
  const totalSaidas = mesFiltrado.reduce((s, l) => s + (l.tipo === "saida" ? l.valor : 0), 0);
  const saldo = totalEntradas - totalSaidas;

  const handleSave = async () => {
    if (!form.data || !form.valor || !form.categoria_id) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    const payload = {
      data: form.data,
      tipo: form.tipo,
      valor: Number(form.valor),
      categoria_id: form.categoria_id,
      associado_id: form.associado_id || null,
      origem: form.origem,
      responsavel: form.responsavel || null,
      observacao: form.observacao || null,
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Lançamento atualizado!" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Lançamento adicionado!" });
      }
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    }
  };

  const handleEdit = (l: any) => {
    setEditingId(l.id);
    setForm({
      data: l.data,
      tipo: l.tipo,
      valor: String(l.valor),
      categoria_id: l.categoria_id,
      associado_id: l.associado_id || "",
      origem: l.origem,
      responsavel: l.responsavel || "",
      observacao: l.observacao || "",
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;
  }

  return (
    <div>
      <PageHeader title="Livro Caixa" subtitle="Lançamentos financeiros">
        <div className="flex items-center gap-3">
          <MonthFilter value={mesFiltro} onChange={setMesFiltro} />
          {!isCongal && (
            <Button onClick={openNew} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase">Total Entradas</p>
          <p className="text-lg font-bold text-success font-mono">{formatCurrency(totalEntradas)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase">Total Saídas</p>
          <p className="text-lg font-bold text-destructive font-mono">{formatCurrency(totalSaidas)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-gold border-primary/20">
          <p className="text-xs text-muted-foreground uppercase">Saldo</p>
          <p className="text-lg font-bold text-primary font-mono">{formatCurrency(saldo)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar lançamento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Data</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Categoria</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Observação</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Tipo</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Valor</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Responsável</th>
                {!isCongal && <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{l.data}</td>
                  <td className="px-5 py-3 text-sm text-card-foreground">{(l as any).categorias_financeiras?.nome || "—"}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{l.observacao || "—"}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                      l.tipo === "entrada" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {l.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td className={cn("px-5 py-3 text-right text-xs font-mono font-medium",
                    l.tipo === "entrada" ? "text-success" : "text-destructive"
                  )}>
                    {l.tipo === "entrada" ? "+" : "-"}{formatCurrency(l.valor)}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{l.responsavel || "—"}</td>
                  {!isCongal && (
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(l)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-muted-foreground">Nenhum lançamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{editingId ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Data *</Label>
                <Input type="date" value={form.data} onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))} className="bg-muted border-border mt-1" />
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Valor (R$) *</Label>
                <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground">Categoria *</Label>
                <Select value={form.categoria_id} onValueChange={(v) => setForm((p) => ({ ...p, categoria_id: v }))}>
                  <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.filter(c => c.ativa).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Associado (opcional)</Label>
              <Select value={form.associado_id} onValueChange={(v) => setForm((p) => ({ ...p, associado_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {associados.filter(a => a.ativo).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Origem</Label>
                <Select value={form.origem} onValueChange={(v) => setForm((p) => ({ ...p, origem: v as OrigemLancamento }))}>
                  <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="extrato">Extrato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Responsável</Label>
                <Input value={form.responsavel} onChange={(e) => setForm((p) => ({ ...p, responsavel: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Observação</Label>
              <Textarea value={form.observacao} onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))} className="bg-muted border-border mt-1" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {(createMutation.isPending || updateMutation.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LivroCaixa;
