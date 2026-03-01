import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { resumoFinanceiro, formatCurrency } from "@/data/financialData";
import { cn } from "@/lib/utils";

const Demonstracoes = () => {
  const [periodo, setPeriodo] = useState("FEV");

  const meses = periodo === "JAN" ? ["JAN"] : ["JAN", "FEV"];
  
  const getEntradas = (mes: string) => resumoFinanceiro.entradas[mes as keyof typeof resumoFinanceiro.entradas] || {};
  const getSaidas = (mes: string) => resumoFinanceiro.saidas[mes as keyof typeof resumoFinanceiro.saidas] || {};

  const totalEntradas = meses.reduce((sum, m) => {
    const ent = getEntradas(m) as Record<string, number>;
    return sum + (Object.values(ent) as number[]).reduce((s, v) => s + v, 0);
  }, 0);

  const totalSaidas = meses.reduce((sum, m) => {
    const sai = getSaidas(m) as Record<string, number>;
    return sum + (Object.values(sai) as number[]).reduce((s, v) => s + Math.abs(v), 0);
  }, 0);

  const saldoMes = totalEntradas - totalSaidas;
  const saldoAcumulado = resumoFinanceiro.saldoAnterior + saldoMes;

  const composicao = resumoFinanceiro.composicao[periodo as keyof typeof resumoFinanceiro.composicao];

  // All unique categories
  const allEntradas = new Set<string>();
  const allSaidas = new Set<string>();
  meses.forEach(m => {
    Object.keys(getEntradas(m)).forEach(k => allEntradas.add(k));
    Object.keys(getSaidas(m)).forEach(k => allSaidas.add(k));
  });

  return (
    <div>
      <PageHeader title="Demonstrações Financeiras" subtitle="Movimento financeiro consolidado — Tesouraria 2026">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-36 bg-card border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="JAN">Até Janeiro</SelectItem>
            <SelectItem value="FEV">Até Fevereiro</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="border-border text-muted-foreground hover:text-primary">
          <Download className="w-4 h-4 mr-2" /> Exportar
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Statement */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entradas */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-success/5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-success">ENTRADAS</h3>
                <span className="text-sm font-bold font-mono text-success">{formatCurrency(totalEntradas)}</span>
              </div>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs text-muted-foreground py-2 px-2">Descrição</th>
                    {meses.map(m => <th key={m} className="text-right text-xs text-muted-foreground py-2 px-2">{m}</th>)}
                    <th className="text-right text-xs text-muted-foreground py-2 px-2">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(allEntradas).map(cat => {
                    const acum = meses.reduce((s, m) => s + (getEntradas(m)[cat] || 0), 0);
                    return (
                      <tr key={cat} className="border-b border-border/20">
                        <td className="text-xs text-card-foreground py-2 px-2">{cat}</td>
                        {meses.map(m => (
                          <td key={m} className="text-right text-xs font-mono text-card-foreground py-2 px-2">
                            {getEntradas(m)[cat] ? formatCurrency(getEntradas(m)[cat]) : "—"}
                          </td>
                        ))}
                        <td className="text-right text-xs font-mono font-medium text-success py-2 px-2">{formatCurrency(acum)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Saídas */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-destructive/5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-destructive">SAÍDAS</h3>
                <span className="text-sm font-bold font-mono text-destructive">-{formatCurrency(totalSaidas)}</span>
              </div>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs text-muted-foreground py-2 px-2">Descrição</th>
                    {meses.map(m => <th key={m} className="text-right text-xs text-muted-foreground py-2 px-2">{m}</th>)}
                    <th className="text-right text-xs text-muted-foreground py-2 px-2">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(allSaidas).map(cat => {
                    const acum = meses.reduce((s, m) => s + Math.abs(getSaidas(m)[cat] || 0), 0);
                    return (
                      <tr key={cat} className="border-b border-border/20">
                        <td className="text-xs text-card-foreground py-2 px-2">{cat}</td>
                        {meses.map(m => (
                          <td key={m} className="text-right text-xs font-mono text-card-foreground py-2 px-2">
                            {getSaidas(m)[cat] ? formatCurrency(Math.abs(getSaidas(m)[cat])) : "—"}
                          </td>
                        ))}
                        <td className="text-right text-xs font-mono font-medium text-destructive py-2 px-2">{formatCurrency(acum)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Column */}
        <div className="space-y-6">
          {/* Resultado */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Resultado do Período</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Entradas</span>
                <span className="text-sm font-mono text-success">{formatCurrency(totalEntradas)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Saídas</span>
                <span className="text-sm font-mono text-destructive">-{formatCurrency(totalSaidas)}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-card-foreground">Saldo do Período</span>
                  <span className={cn("text-sm font-bold font-mono", saldoMes >= 0 ? "text-success" : "text-destructive")}>
                    {formatCurrency(saldoMes)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Patrimônio */}
          <div className="bg-card rounded-xl border border-primary/20 p-6 shadow-gold">
            <h3 className="text-sm font-semibold text-primary mb-4">Patrimônio Acumulado</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Saldo Anterior</span>
                <span className="text-sm font-mono text-card-foreground">{formatCurrency(resumoFinanceiro.saldoAnterior)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Resultado</span>
                <span className={cn("text-sm font-mono", saldoMes >= 0 ? "text-success" : "text-destructive")}>
                  {saldoMes >= 0 ? "+" : ""}{formatCurrency(saldoMes)}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-primary">Saldo Acumulado</span>
                  <span className="text-lg font-bold font-mono text-primary">{formatCurrency(saldoAcumulado)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Composição */}
          {composicao && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Composição do Saldo</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Numerários em Caixa</span>
                  <span className="text-xs font-mono text-card-foreground">{formatCurrency(composicao.numerariosCaixa)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Conta Corrente BB</span>
                  <span className="text-xs font-mono text-info">{formatCurrency(composicao.saldoContaCorrente)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Fundo de Reserva BB</span>
                  <span className="text-xs font-mono text-primary">{formatCurrency(composicao.fundoReserva)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-card-foreground">Total</span>
                    <span className="text-sm font-bold font-mono text-card-foreground">
                      {formatCurrency(composicao.numerariosCaixa + composicao.saldoContaCorrente + composicao.fundoReserva)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demonstracoes;
