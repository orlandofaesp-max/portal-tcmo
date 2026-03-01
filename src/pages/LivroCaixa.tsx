import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { lancamentosCaixa as initialData, formatCurrency, LancamentoCaixa } from "@/data/financialData";
import { cn } from "@/lib/utils";

const categorias = ["Mensalidade", "Contribuição", "Rendimento", "Tarifa", "Reembolso", "Utilidade", "Evento", "Outros"];

const LivroCaixa = () => {
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>(initialData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LancamentoCaixa | null>(null);
  const [form, setForm] = useState({ data: "", credito: "", debito: "", historico: "", categoria: "Mensalidade" });
  const { toast } = useToast();

  const filtered = lancamentos.filter(l =>
    l.historico.toLowerCase().includes(search.toLowerCase()) ||
    l.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const totalCreditos = lancamentos.reduce((s, l) => s + l.credito, 0);
  const totalDebitos = lancamentos.reduce((s, l) => s + l.debito, 0);
  const saldoAtual = lancamentos[lancamentos.length - 1]?.saldo || 0;

  const recalcSaldos = (items: LancamentoCaixa[]): LancamentoCaixa[] => {
    let saldo = 22864.74; // saldo inicial
    return items.map(item => {
      if (item.historico === 'Saldo Anterior') return { ...item, saldo };
      saldo = saldo + item.credito - item.debito;
      return { ...item, saldo };
    });
  };

  const handleSave = () => {
    if (!form.historico.trim() || !form.data.trim()) return;
    if (editing) {
      const updated = lancamentos.map(l => l.id === editing.id ? {
        ...l, data: form.data, credito: Number(form.credito) || 0, debito: Number(form.debito) || 0,
        historico: form.historico, categoria: form.categoria, saldo: 0,
      } : l);
      setLancamentos(recalcSaldos(updated));
      toast({ title: "Lançamento atualizado!" });
    } else {
      const newItem: LancamentoCaixa = {
        id: String(Date.now()), data: form.data, credito: Number(form.credito) || 0,
        debito: Number(form.debito) || 0, historico: form.historico, categoria: form.categoria, saldo: 0,
      };
      const sorted = [...lancamentos, newItem].sort((a, b) => {
        const [da, ma, ya] = a.data.split('/').map(Number);
        const [db, mb, yb] = b.data.split('/').map(Number);
        return (ya - yb) || (ma - mb) || (da - db);
      });
      setLancamentos(recalcSaldos(sorted));
      toast({ title: "Lançamento adicionado!" });
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ data: "", credito: "", debito: "", historico: "", categoria: "Mensalidade" });
  };

  const handleEdit = (l: LancamentoCaixa) => {
    setEditing(l);
    setForm({ data: l.data, credito: String(l.credito || ""), debito: String(l.debito || ""), historico: l.historico, categoria: l.categoria });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = lancamentos.filter(l => l.id !== id);
    setLancamentos(recalcSaldos(updated));
    toast({ title: "Lançamento removido!", variant: "destructive" });
  };

  const handleImportExtrato = () => {
    toast({ title: "Importação de Extrato", description: "Funcionalidade de importação automática de extrato bancário disponível com backend integrado." });
  };

  return (
    <div>
      <PageHeader title="Livro Caixa" subtitle="Movimento bancário — Janeiro/2026">
        <Button variant="outline" onClick={handleImportExtrato} className="border-border text-muted-foreground hover:text-primary">
          <Upload className="w-4 h-4 mr-2" /> Importar Extrato
        </Button>
        <Button onClick={() => { setEditing(null); setForm({ data: "", credito: "", debito: "", historico: "", categoria: "Mensalidade" }); setDialogOpen(true); }}
          className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase">Total Créditos</p>
          <p className="text-lg font-bold text-success font-mono">{formatCurrency(totalCreditos)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase">Total Débitos</p>
          <p className="text-lg font-bold text-destructive font-mono">{formatCurrency(totalDebitos)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-gold border-primary/20">
          <p className="text-xs text-muted-foreground uppercase">Saldo Atual</p>
          <p className="text-lg font-bold text-primary font-mono">{formatCurrency(saldoAtual)}</p>
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
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Histórico</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Categoria</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Crédito</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Débito</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Saldo</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{l.data}</td>
                  <td className="px-5 py-3 text-sm text-card-foreground">{l.historico}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">{l.categoria}</span>
                  </td>
                  <td className={cn("px-5 py-3 text-right text-xs font-mono", l.credito > 0 ? "text-success" : "text-muted-foreground/30")}>
                    {l.credito > 0 ? formatCurrency(l.credito) : "—"}
                  </td>
                  <td className={cn("px-5 py-3 text-right text-xs font-mono", l.debito > 0 ? "text-destructive" : "text-muted-foreground/30")}>
                    {l.debito > 0 ? formatCurrency(l.debito) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right text-xs font-mono font-medium text-card-foreground">{formatCurrency(l.saldo)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(l)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(l.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{editing ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-muted-foreground">Data</Label>
              <Input placeholder="DD/MM/AA" value={form.data} onChange={(e) => setForm(p => ({ ...p, data: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Histórico</Label>
              <Input value={form.historico} onChange={(e) => setForm(p => ({ ...p, historico: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm(p => ({ ...p, categoria: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground">Crédito (R$)</Label>
                <Input type="number" value={form.credito} onChange={(e) => setForm(p => ({ ...p, credito: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              <div><Label className="text-muted-foreground">Débito (R$)</Label>
                <Input type="number" value={form.debito} onChange={(e) => setForm(p => ({ ...p, debito: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LivroCaixa;
