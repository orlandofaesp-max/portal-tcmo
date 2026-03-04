import { useState, useMemo } from "react";
import { Plus, Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAssociados, useMensalidades, useCreateMensalidade, useUpdateMensalidade,
  useCreateLancamento, useCategorias, useConfiguracao,
  formatCurrency, meses,
} from "@/hooks/useFinanceiro";
import { cn } from "@/lib/utils";

const Mensalidades = () => {
  const { data: associados = [] } = useAssociados();
  const { data: mensalidades = [], isLoading } = useMensalidades();
  const { data: categorias = [] } = useCategorias();
  const { data: valorPadrao } = useConfiguracao("valor_padrao_mensalidade");
  const createMens = useCreateMensalidade();
  const updateMens = useUpdateMensalidade();
  const createLanc = useCreateLancamento();
  const { usuario } = useAuth();
  const isCongal = usuario?.perfil === "congal";
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [competenciaFilter, setCompetenciaFilter] = useState("TODOS");
  const [gerarDialog, setGerarDialog] = useState(false);
  const [pagDialog, setPagDialog] = useState(false);
  const [selectedMens, setSelectedMens] = useState<any>(null);
  const [gerarForm, setGerarForm] = useState({ competencia: "", associado_id: "" });
  const [pagForm, setPagForm] = useState({ data_pagamento: "" });

  // Get current year
  const ano = new Date().getFullYear();

  // Build competencias list
  const competencias = useMemo(() => {
    const set = new Set<string>();
    mensalidades.forEach((m) => set.add(m.competencia));
    // also add current month
    const cur = `${String(new Date().getMonth() + 1).padStart(2, "0")}/${ano}`;
    set.add(cur);
    return Array.from(set).sort();
  }, [mensalidades, ano]);

  const filtered = useMemo(() => {
    return mensalidades.filter((m) => {
      const assoc = (m as any).associados;
      const nome = assoc?.nome || "";
      const matchSearch = nome.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "todos" || (filterStatus === "pago" && m.status === "pago") || (filterStatus === "em_aberto" && m.status === "em_aberto");
      const matchComp = competenciaFilter === "TODOS" || m.competencia === competenciaFilter;
      return matchSearch && matchStatus && matchComp;
    });
  }, [mensalidades, search, filterStatus, competenciaFilter]);

  const categoriaMensalidade = categorias.find((c) => c.nome === "Mensalidade");

  const handleGerar = async () => {
    if (!gerarForm.competencia) {
      toast({ title: "Selecione a competência", variant: "destructive" });
      return;
    }
    try {
      const assocList = gerarForm.associado_id
        ? associados.filter((a) => a.id === gerarForm.associado_id && a.ativo)
        : associados.filter((a) => a.ativo);

      let count = 0;
      for (const a of assocList) {
        const exists = mensalidades.find(
          (m) => m.associado_id === a.id && m.competencia === gerarForm.competencia
        );
        if (!exists) {
          await createMens.mutateAsync({
            associado_id: a.id,
            competencia: gerarForm.competencia,
            valor: a.mensalidade_valor || Number(valorPadrao) || 30,
            status: "em_aberto",
          });
          count++;
        }
      }
      toast({ title: `${count} mensalidade(s) gerada(s)!` });
      setGerarDialog(false);
      setGerarForm({ competencia: "", associado_id: "" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handlePagamento = async () => {
    if (!selectedMens || !pagForm.data_pagamento) {
      toast({ title: "Informe a data do pagamento", variant: "destructive" });
      return;
    }
    try {
      // Create lancamento
      let lancamento_id: string | null = null;
      if (categoriaMensalidade) {
        const lanc = await createLanc.mutateAsync({
          data: pagForm.data_pagamento,
          tipo: "entrada",
          valor: selectedMens.valor,
          categoria_id: categoriaMensalidade.id,
          associado_id: selectedMens.associado_id,
          origem: "manual",
          observacao: `Mensalidade ${selectedMens.competencia} - ${(selectedMens as any).associados?.nome || ""}`,
        });
        lancamento_id = (lanc as any)?.id || null;
      }

      await updateMens.mutateAsync({
        id: selectedMens.id,
        status: "pago",
        data_pagamento: pagForm.data_pagamento,
        lancamento_id,
      });
      toast({ title: "Pagamento registrado!" });
      setPagDialog(false);
      setSelectedMens(null);
      setPagForm({ data_pagamento: "" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;
  }

  return (
    <div>
      <PageHeader title="Controle de Mensalidades" subtitle="Gestão de pagamentos dos associados">
        {!isCongal && (
          <Button onClick={() => setGerarDialog(true)} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Gerar Mensalidades
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar associado..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
        <Select value={competenciaFilter} onValueChange={setCompetenciaFilter}>
          <SelectTrigger className="w-44 bg-card border-border"><SelectValue placeholder="Competência" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todas</SelectItem>
            {competencias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 bg-card border-border">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pago">Pagos</SelectItem>
            <SelectItem value="em_aberto">Em aberto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Associado</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Competência</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Valor</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Data Pgto</th>
                {!isCongal && <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const assoc = (m as any).associados;
                return (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">{assoc?.nome || "—"}</td>
                    <td className="px-3 py-3 text-center text-xs font-mono text-muted-foreground">{m.competencia}</td>
                    <td className="px-5 py-3 text-right text-xs font-mono text-card-foreground">{formatCurrency(m.valor)}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                        m.status === "pago" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      )}>
                        {m.status === "pago" ? "Pago" : "Em aberto"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs font-mono text-muted-foreground">{m.data_pagamento || "—"}</td>
                    {!isCongal && (
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center">
                          {m.status === "em_aberto" && (
                            <Button variant="ghost" size="sm" className="text-xs text-success hover:text-success" onClick={() => { setSelectedMens(m); setPagDialog(true); }}>
                              Registrar Pgto
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Nenhuma mensalidade encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gerar Mensalidades Dialog */}
      <Dialog open={gerarDialog} onOpenChange={setGerarDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Gerar Mensalidades</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Competência (MM/AAAA) *</Label>
              <Input placeholder="03/2026" value={gerarForm.competencia} onChange={(e) => setGerarForm((p) => ({ ...p, competencia: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Associado (deixe vazio para todos)</Label>
              <Select value={gerarForm.associado_id} onValueChange={(v) => setGerarForm((p) => ({ ...p, associado_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Todos os ativos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os ativos</SelectItem>
                  {associados.filter((a) => a.ativo).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGerarDialog(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleGerar} disabled={createMens.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {createMens.isPending ? "Gerando..." : "Gerar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagamento Dialog */}
      <Dialog open={pagDialog} onOpenChange={setPagDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Registrar Pagamento — {(selectedMens as any)?.associados?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p>Competência: <span className="font-medium text-card-foreground">{selectedMens?.competencia}</span></p>
              <p>Valor: <span className="font-medium text-card-foreground">{selectedMens ? formatCurrency(selectedMens.valor) : ""}</span></p>
            </div>
            <div>
              <Label className="text-muted-foreground">Data do Pagamento *</Label>
              <Input type="date" value={pagForm.data_pagamento} onChange={(e) => setPagForm({ data_pagamento: e.target.value })} className="bg-muted border-border mt-1" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Um lançamento de entrada será criado automaticamente no Livro Caixa.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagDialog(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handlePagamento} disabled={updateMens.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {updateMens.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mensalidades;
