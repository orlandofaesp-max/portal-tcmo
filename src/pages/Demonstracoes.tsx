import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import MonthFilter from "@/components/MonthFilter";
import { useLancamentos, formatCurrency, meses } from "@/hooks/useFinanceiro";
import { cn } from "@/lib/utils";

const Demonstracoes = () => {
  const { data: lancamentos = [], isLoading } = useLancamentos();
  const [mesFiltro, setMesFiltro] = useState("TODOS");

  const filtered = useMemo(() => {
    if (mesFiltro === "TODOS") return lancamentos;
    return lancamentos.filter((l) => {
      const mesIdx = new Date(l.data + "T00:00:00").getMonth();
      return meses[mesIdx] === mesFiltro;
    });
  }, [lancamentos, mesFiltro]);

  const { categoriasEntrada, categoriasSaida, totalEntradas, totalSaidas, saldo } = useMemo(() => {
    const entMap: Record<string, number> = {};
    const saiMap: Record<string, number> = {};
    let ent = 0, sai = 0;

    filtered.forEach((l) => {
      const catNome = (l as any).categorias_financeiras?.nome || "Outros";
      if (l.tipo === "entrada") {
        entMap[catNome] = (entMap[catNome] || 0) + l.valor;
        ent += l.valor;
      } else {
        saiMap[catNome] = (saiMap[catNome] || 0) + l.valor;
        sai += l.valor;
      }
    });

    return {
      categoriasEntrada: Object.entries(entMap).sort((a, b) => b[1] - a[1]),
      categoriasSaida: Object.entries(saiMap).sort((a, b) => b[1] - a[1]),
      totalEntradas: ent,
      totalSaidas: sai,
      saldo: ent - sai,
    };
  }, [filtered]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;
  }

  return (
    <div>
      <PageHeader title="Demonstrações Financeiras" subtitle="Movimento financeiro consolidado — Tesouraria">
        <MonthFilter value={mesFiltro} onChange={setMesFiltro} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <th className="text-left text-xs text-muted-foreground py-2 px-2">Categoria</th>
                    <th className="text-right text-xs text-muted-foreground py-2 px-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasEntrada.map(([cat, val]) => (
                    <tr key={cat} className="border-b border-border/20">
                      <td className="text-xs text-card-foreground py-2 px-2">{cat}</td>
                      <td className="text-right text-xs font-mono font-medium text-success py-2 px-2">{formatCurrency(val)}</td>
                    </tr>
                  ))}
                  {categoriasEntrada.length === 0 && (
                    <tr><td colSpan={2} className="text-center py-4 text-xs text-muted-foreground">Sem entradas no período</td></tr>
                  )}
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
                    <th className="text-left text-xs text-muted-foreground py-2 px-2">Categoria</th>
                    <th className="text-right text-xs text-muted-foreground py-2 px-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasSaida.map(([cat, val]) => (
                    <tr key={cat} className="border-b border-border/20">
                      <td className="text-xs text-card-foreground py-2 px-2">{cat}</td>
                      <td className="text-right text-xs font-mono font-medium text-destructive py-2 px-2">{formatCurrency(val)}</td>
                    </tr>
                  ))}
                  {categoriasSaida.length === 0 && (
                    <tr><td colSpan={2} className="text-center py-4 text-xs text-muted-foreground">Sem saídas no período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-primary/20 p-6 shadow-gold">
            <h3 className="text-sm font-semibold text-primary mb-4">
              Resultado {mesFiltro !== "TODOS" ? `— ${mesFiltro}` : ""}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Entradas</span>
                <span className="text-sm font-mono text-success">{formatCurrency(totalEntradas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Saídas</span>
                <span className="text-sm font-mono text-destructive">-{formatCurrency(totalSaidas)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-xs font-semibold text-primary">Saldo</span>
                <span className={cn("text-lg font-bold font-mono", saldo >= 0 ? "text-success" : "text-destructive")}>
                  {formatCurrency(saldo)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demonstracoes;
