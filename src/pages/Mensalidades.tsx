import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, Send, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import MonthFilter from "@/components/MonthFilter";
import { membros as initialMembros, meses, formatCurrency, Membro, PagamentoMensalidade } from "@/data/financialData";
import { cn } from "@/lib/utils";

const Mensalidades = () => {
  const [membrosData, setMembrosData] = useState<Membro[]>(initialMembros);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [mesSelecionado, setMesSelecionado] = useState("TODOS");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagamentoDialog, setPagamentoDialog] = useState(false);
  const [extratoDialog, setExtratoDialog] = useState(false);
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null);
  const [selectedMembro, setSelectedMembro] = useState<Membro | null>(null);
  const [formData, setFormData] = useState({ nome: "", mensalidadeValor: "30", saldoAnterior: "0" });
  const [pagForm, setPagForm] = useState({ mes: "JAN", valor: "", data: "" });
  const { toast } = useToast();

  const mesesVisiveis = mesSelecionado === "TODOS" ? meses.slice(0, 2) : [mesSelecionado];

  const getStatus = (m: Membro) => {
    const pagsFiltrados = mesSelecionado === "TODOS"
      ? m.pagamentos
      : m.pagamentos.filter(p => p.mes === mesSelecionado);
    const totalPago = pagsFiltrados.reduce((s, p) => s + p.valor, 0);
    const mesesAtivos = mesSelecionado === "TODOS" ? 2 : 1;
    const totalDevido = mesesAtivos * m.mensalidadeValor + (m.saldoAnterior > 0 ? m.saldoAnterior : 0);
    const credito = m.saldoAnterior < 0 ? Math.abs(m.saldoAnterior) : 0;
    const saldo = totalDevido - totalPago - credito;
    if (saldo <= 0) return { label: "Em dia", class: "bg-success/10 text-success" };
    if (totalPago > 0) return { label: "Parcial", class: "bg-warning/10 text-warning" };
    return { label: "Inadimplente", class: "bg-destructive/10 text-destructive" };
  };

  const getSaldoMembro = (m: Membro) => {
    const pagsFiltrados = mesSelecionado === "TODOS"
      ? m.pagamentos
      : m.pagamentos.filter(p => p.mes === mesSelecionado);
    const totalPago = pagsFiltrados.reduce((s, p) => s + p.valor, 0);
    const mesesAtivos = mesSelecionado === "TODOS" ? 2 : 1;
    const totalDevido = mesesAtivos * m.mensalidadeValor + (m.saldoAnterior > 0 ? m.saldoAnterior : 0);
    const credito = m.saldoAnterior < 0 ? Math.abs(m.saldoAnterior) : 0;
    return totalDevido - totalPago - credito;
  };

  const filteredMembros = membrosData.filter((m) => {
    const matchSearch = m.nome.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === "todos") return matchSearch;
    const status = getStatus(m);
    if (filterStatus === "em-dia") return matchSearch && status.label === "Em dia";
    if (filterStatus === "inadimplente") return matchSearch && status.label === "Inadimplente";
    return matchSearch;
  });

  const handleSave = () => {
    if (!formData.nome.trim()) return;
    if (editingMembro) {
      setMembrosData(prev => prev.map(m => m.id === editingMembro.id ? {
        ...m, nome: formData.nome, mensalidadeValor: Number(formData.mensalidadeValor), saldoAnterior: Number(formData.saldoAnterior)
      } : m));
      toast({ title: "Associado atualizado com sucesso!" });
    } else {
      const newMembro: Membro = {
        id: String(Date.now()), numero: String(membrosData.length + 1), nome: formData.nome,
        mensalidadeValor: Number(formData.mensalidadeValor), saldoAnterior: Number(formData.saldoAnterior), pagamentos: [],
      };
      setMembrosData(prev => [...prev, newMembro]);
      toast({ title: "Associado adicionado com sucesso!" });
    }
    setDialogOpen(false);
    setEditingMembro(null);
    setFormData({ nome: "", mensalidadeValor: "30", saldoAnterior: "0" });
  };

  const handleDelete = (id: string) => {
    setMembrosData(prev => prev.filter(m => m.id !== id));
    toast({ title: "Associado removido!", variant: "destructive" });
  };

  const handleEdit = (m: Membro) => {
    setEditingMembro(m);
    setFormData({ nome: m.nome, mensalidadeValor: String(m.mensalidadeValor), saldoAnterior: String(m.saldoAnterior) });
    setDialogOpen(true);
  };

  const handleAddPagamento = () => {
    if (!selectedMembro || !pagForm.valor || !pagForm.data) return;
    const newPag: PagamentoMensalidade = {
      id: String(Date.now()), mes: pagForm.mes, valor: Number(pagForm.valor), dataPagamento: pagForm.data,
    };
    setMembrosData(prev => prev.map(m => m.id === selectedMembro.id
      ? { ...m, pagamentos: [...m.pagamentos, newPag] } : m
    ));
    setPagamentoDialog(false);
    setPagForm({ mes: "JAN", valor: "", data: "" });
    toast({ title: "Pagamento registrado!" });
  };

  const handleViewExtrato = (m: Membro) => {
    setSelectedMembro(m);
    setExtratoDialog(true);
  };

  const handleSendWhatsApp = (m: Membro) => {
    toast({ title: `Extrato enviado para ${m.nome} via WhatsApp`, description: "Funcionalidade disponível com backend integrado." });
  };

  const subtitleMes = mesSelecionado === "TODOS" ? "2026" : `${mesSelecionado}/2026`;

  return (
    <div>
      <PageHeader title="Controle de Mensalidades" subtitle={`Gestão de pagamentos dos associados — ${subtitleMes}`}>
        <Button onClick={() => { setEditingMembro(null); setFormData({ nome: "", mensalidadeValor: "30", saldoAnterior: "0" }); setDialogOpen(true); }}
          className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Novo Associado
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar associado..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border" />
        </div>
        <MonthFilter value={mesSelecionado} onChange={setMesSelecionado} />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 bg-card border-border">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="em-dia">Em dia</SelectItem>
            <SelectItem value="inadimplente">Inadimplentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nº</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nome</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Valor</th>
                {mesesVisiveis.map(m => (
                  <th key={m} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">{m}</th>
                ))}
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Saldo</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembros.map((m) => {
                const status = getStatus(m);
                const saldo = getSaldoMembro(m);
                return (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{m.numero}</td>
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">{m.nome}</td>
                    <td className="px-3 py-3 text-center text-xs font-mono text-card-foreground">{formatCurrency(m.mensalidadeValor)}</td>
                    {mesesVisiveis.map(mes => {
                      const pagMes = m.pagamentos.filter(p => p.mes === mes).reduce((s, p) => s + p.valor, 0);
                      return (
                        <td key={mes} className={cn("px-3 py-3 text-center text-xs font-mono", pagMes > 0 ? "text-success" : "text-muted-foreground")}>
                          {pagMes > 0 ? formatCurrency(pagMes) : "—"}
                        </td>
                      );
                    })}
                    <td className={cn("px-3 py-3 text-center text-xs font-mono font-medium", saldo > 0 ? "text-destructive" : "text-success")}>
                      {formatCurrency(Math.abs(saldo))}
                      {saldo < 0 && " (CR)"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full", status.class)}>{status.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-info"
                          onClick={() => handleViewExtrato(m)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => { setSelectedMembro(m); setPagamentoDialog(true); }}><Plus className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(m)}><Edit2 className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-success"
                          onClick={() => handleSendWhatsApp(m)}><Send className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{editingMembro ? "Editar Associado" : "Novo Associado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-muted-foreground">Nome</Label>
              <Input value={formData.nome} onChange={(e) => setFormData(p => ({ ...p, nome: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Valor Mensalidade (R$)</Label>
              <Input type="number" value={formData.mensalidadeValor} onChange={(e) => setFormData(p => ({ ...p, mensalidadeValor: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Saldo Anterior (positivo = devedor)</Label>
              <Input type="number" value={formData.saldoAnterior} onChange={(e) => setFormData(p => ({ ...p, saldoAnterior: e.target.value }))} className="bg-muted border-border mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={pagamentoDialog} onOpenChange={setPagamentoDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Registrar Pagamento — {selectedMembro?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-muted-foreground">Mês Referência</Label>
              <Select value={pagForm.mes} onValueChange={(v) => setPagForm(p => ({ ...p, mes: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{meses.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label className="text-muted-foreground">Valor (R$)</Label>
              <Input type="number" value={pagForm.valor} onChange={(e) => setPagForm(p => ({ ...p, valor: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Data do Pagamento</Label>
              <Input type="text" placeholder="DD/MM/AA" value={pagForm.data} onChange={(e) => setPagForm(p => ({ ...p, data: e.target.value }))} className="bg-muted border-border mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagamentoDialog(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleAddPagamento} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extrato Dialog */}
      <Dialog open={extratoDialog} onOpenChange={setExtratoDialog}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Extrato — {selectedMembro?.nome}</DialogTitle>
          </DialogHeader>
          {selectedMembro && (
            <div className="py-2">
              {selectedMembro.saldoAnterior !== 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                  Saldo de 2025: {selectedMembro.saldoAnterior > 0 
                    ? <span className="text-destructive font-medium">Devedor {formatCurrency(selectedMembro.saldoAnterior)}</span>
                    : <span className="text-success font-medium">Crédito {formatCurrency(Math.abs(selectedMembro.saldoAnterior))}</span>
                  }
                </p>
              )}
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">Mês</th>
                  <th className="text-right py-2 text-muted-foreground">Mensalidade</th>
                  <th className="text-right py-2 text-muted-foreground">Pago</th>
                  <th className="text-right py-2 text-muted-foreground">Data</th>
                </tr></thead>
                <tbody>
                  {meses.map(mes => {
                    const pags = selectedMembro.pagamentos.filter(p => p.mes === mes);
                    const totalPago = pags.reduce((s, p) => s + p.valor, 0);
                    return (
                      <tr key={mes} className="border-b border-border/30">
                        <td className="py-2 text-card-foreground">{mes}</td>
                        <td className="py-2 text-right text-muted-foreground">{formatCurrency(selectedMembro.mensalidadeValor)}</td>
                        <td className={cn("py-2 text-right font-mono", totalPago > 0 ? "text-success" : "text-muted-foreground/40")}>
                          {totalPago > 0 ? formatCurrency(totalPago) : "—"}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{pags[0]?.dataPagamento || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleSendWhatsApp(selectedMembro)} className="border-border text-muted-foreground hover:text-success">
                  <Send className="w-3.5 h-3.5 mr-2" /> Enviar via WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mensalidades;
