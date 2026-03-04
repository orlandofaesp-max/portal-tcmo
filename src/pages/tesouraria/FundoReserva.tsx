import { useState, useMemo } from "react";
import { Plus, Shield } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import MonthFilter from "@/components/MonthFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFundoReserva, useCreateFundoReserva, formatCurrency, meses } from "@/hooks/useFinanceiro";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const FundoReserva = () => {
  const { isPerfil } = useAuth();
  const { data: movimentos = [], isLoading } = useFundoReserva();
  const createMutation = useCreateFundoReserva();

  const now = new Date();
  const mesAtualLabel = meses[now.getMonth()];
  const anoAtual = String(now.getFullYear());

  const [mesFiltro, setMesFiltro] = useState(mesAtualLabel);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ data_movimento: "", descricao: "", entrada: "", saida: "" });

  const canEdit = isPerfil("tesouraria");

  // Calculate cumulative saldo over ALL records, then filter for display
  const movimentosComSaldo = useMemo(() => {
    let saldoAcum = 0;
    return movimentos.map((m) => {
      saldoAcum += Number(m.entrada) - Number(m.saida);
      return { ...m, saldo: saldoAcum };
    });
  }, [movimentos]);

  const movimentosFiltrados = useMemo(() => {
    if (mesFiltro === "TODOS") {
      return movimentosComSaldo.filter(
        (m) => new Date(m.data_movimento).getFullYear() === Number(anoAtual)
      );
    }
    const idx = meses.indexOf(mesFiltro);
    return movimentosComSaldo.filter((m) => {
      const d = new Date(m.data_movimento);
      return d.getFullYear() === Number(anoAtual) && d.getMonth() === idx;
    });
  }, [movimentosComSaldo, mesFiltro, anoAtual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entrada = Number(form.entrada) || 0;
    const saida = Number(form.saida) || 0;

    if (entrada === 0 && saida === 0) {
      toast({ title: "Erro", description: "Informe um valor de entrada ou saída.", variant: "destructive" });
      return;
    }
    if (entrada > 0 && saida > 0) {
      toast({ title: "Erro", description: "Entrada e saída não podem ter valores ao mesmo tempo.", variant: "destructive" });
      return;
    }

    try {
      await createMutation.mutateAsync({
        data_movimento: form.data_movimento,
        descricao: form.descricao,
        entrada,
        saida,
      });
      toast({ title: "Lançamento criado com sucesso." });
      setForm({ data_movimento: "", descricao: "", entrada: "", saida: "" });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Fundo de Reserva"
          subtitle="Conta corrente do fundo de reserva"
        />
        <div className="flex items-center gap-3">
          <MonthFilter value={mesFiltro} onChange={setMesFiltro} showAll label="Período" />
          {canEdit && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Novo Lançamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Lançamento — Fundo de Reserva</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Data</Label>
                    <Input
                      type="date"
                      required
                      value={form.data_movimento}
                      onChange={(e) => setForm({ ...form, data_movimento: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      required
                      value={form.descricao}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Entrada (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.entrada}
                        onChange={(e) => setForm({ ...form, entrada: e.target.value, saida: e.target.value ? "" : form.saida })}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label>Saída (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.saida}
                        onChange={(e) => setForm({ ...form, saida: e.target.value, entrada: e.target.value ? "" : form.entrada })}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Saldo atual */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Saldo atual do fundo</p>
          <p className="text-2xl font-bold text-card-foreground">
            {formatCurrency(movimentosComSaldo.length > 0 ? movimentosComSaldo[movimentosComSaldo.length - 1].saldo : 0)}
          </p>
        </div>
        <Shield className="w-8 h-8 text-primary/30" />
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Entrada</TableHead>
              <TableHead className="text-right">Saída</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum movimento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              movimentosFiltrados.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(m.data_movimento + "T00:00:00"), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{m.descricao}</TableCell>
                  <TableCell className="text-right font-mono text-success">
                    {Number(m.entrada) > 0 ? formatCurrency(Number(m.entrada)) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-destructive">
                    {Number(m.saida) > 0 ? formatCurrency(Number(m.saida)) : "—"}
                  </TableCell>
                  <TableCell className={`text-right font-mono font-semibold ${m.saldo >= 0 ? "text-card-foreground" : "text-destructive"}`}>
                    {formatCurrency(m.saldo)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FundoReserva;
