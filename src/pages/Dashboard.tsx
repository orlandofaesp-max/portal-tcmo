import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { useLancamentos, useMensalidades, useAssociados, formatCurrency } from "@/hooks/useFinanceiro";

const Dashboard = () => {
  const { data: lancamentos = [], isLoading: loadingL } = useLancamentos();
  const { data: mensalidades = [], isLoading: loadingM } = useMensalidades();
  const { data: associados = [], isLoading: loadingA } = useAssociados();

  const now = new Date();
  const mesAtual = String(now.getMonth() + 1).padStart(2, "0");
  const anoAtual = String(now.getFullYear());
  const competenciaAtual = `${mesAtual}/${anoAtual}`;

  const stats = useMemo(() => {
    const totalEntradas = lancamentos.reduce(
      (s, l) => s + (l.tipo === "entrada" ? l.valor : 0),
      0
    );
    const totalSaidas = lancamentos.reduce(
      (s, l) => s + (l.tipo === "saida" ? l.valor : 0),
      0
    );
    const saldo = totalEntradas - totalSaidas;

    // Filter current month lancamentos
    const lancMes = lancamentos.filter((l) => {
      const d = new Date(l.data);
      return (
        d.getMonth() + 1 === Number(mesAtual) &&
        d.getFullYear() === Number(anoAtual)
      );
    });
    const entradasMes = lancMes.reduce(
      (s, l) => s + (l.tipo === "entrada" ? l.valor : 0),
      0
    );
    const saidasMes = lancMes.reduce(
      (s, l) => s + (l.tipo === "saida" ? l.valor : 0),
      0
    );
    const resultadoMes = entradasMes - saidasMes;

    // Mensalidades do mês atual
    const mensMes = mensalidades.filter((m) => m.competencia === competenciaAtual);
    const pagas = mensMes.filter((m) => m.status === "pago").length;
    const emAberto = mensMes.filter((m) => m.status === "em_aberto").length;
    const valorAberto = mensMes
      .filter((m) => m.status === "em_aberto")
      .reduce((s, m) => s + m.valor, 0);

    return { saldo, entradasMes, saidasMes, resultadoMes, pagas, emAberto, valorAberto };
  }, [lancamentos, mensalidades, mesAtual, anoAtual, competenciaAtual]);

  const recentLancamentos = useMemo(
    () => [...lancamentos].reverse().slice(0, 8),
    [lancamentos]
  );

  const isLoading = loadingL || loadingM || loadingA;

  const mesLabel = now.toLocaleString("pt-BR", { month: "short" }).toUpperCase().replace(".", "") + "/" + anoAtual;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Visão geral financeira — TCMO ${anoAtual}`} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(stats.saldo)}
          icon={<Wallet className="w-5 h-5" />}
          variant="gold"
        />
        <StatCard
          title={`Entradas (${mesLabel})`}
          value={formatCurrency(stats.entradasMes)}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title={`Saídas (${mesLabel})`}
          value={formatCurrency(stats.saidasMes)}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="Mensalidades em Aberto"
          value={formatCurrency(stats.valorAberto)}
          subtitle={`${stats.emAberto} em aberto · ${stats.pagas} pagas`}
          icon={<Users className="w-5 h-5" />}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resultado do mês */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Resultado do Mês</h3>
          <p className="text-xs text-muted-foreground mb-4">{mesLabel}</p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Entradas</span>
              <span className="text-sm font-mono text-success">{formatCurrency(stats.entradasMes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Saídas</span>
              <span className="text-sm font-mono text-destructive">-{formatCurrency(stats.saidasMes)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-xs font-medium text-card-foreground">Resultado</span>
              <span className={`text-sm font-bold font-mono ${stats.resultadoMes >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(stats.resultadoMes)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Últimos Lançamentos</h3>
          <p className="text-xs text-muted-foreground mb-4">Livro Caixa</p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
            {recentLancamentos.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum lançamento registrado.</p>
            )}
            {recentLancamentos.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${l.tipo === "entrada" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {l.tipo === "entrada" ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-card-foreground">
                      {(l as any).categorias_financeiras?.nome || "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{l.data}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-medium ${l.tipo === "entrada" ? "text-success" : "text-destructive"}`}>
                  {l.tipo === "entrada" ? "+" : "-"}
                  {formatCurrency(l.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
