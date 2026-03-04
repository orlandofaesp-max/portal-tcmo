import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import MonthFilter from "@/components/MonthFilter";
import { useLancamentos, useMensalidades, useFundoReserva, formatCurrency, meses } from "@/hooks/useFinanceiro";

const COLORS_PIE = ["hsl(var(--primary))", "hsl(var(--success))"];

const Dashboard = () => {
  const { data: lancamentos = [], isLoading: loadingL } = useLancamentos();
  const { data: mensalidades = [], isLoading: loadingM } = useMensalidades();
  const { data: associados = [], isLoading: loadingA } = useAssociados();

  const now = new Date();
  const mesAtualIdx = now.getMonth();
  const anoAtual = String(now.getFullYear());
  const mesAtualLabel = meses[mesAtualIdx];

  const [mesFiltro, setMesFiltro] = useState(mesAtualLabel);

  // ---- helpers ----
  const mesIdx = (label: string) => meses.indexOf(label);

  const lancByMonth = useMemo(() => {
    return lancamentos.filter((l) => {
      const d = new Date(l.data);
      if (d.getFullYear() !== Number(anoAtual)) return false;
      if (mesFiltro === "TODOS") return true;
      return d.getMonth() === mesIdx(mesFiltro);
    });
  }, [lancamentos, mesFiltro, anoAtual]);

  // ---- Resumo financeiro ----
  const resumo = useMemo(() => {
    const entradasMes = lancByMonth.reduce((s, l) => s + (l.tipo === "entrada" ? l.valor : 0), 0);
    const saidasMes = lancByMonth.reduce((s, l) => s + (l.tipo === "saida" ? l.valor : 0), 0);

    const lancAno = lancamentos.filter((l) => new Date(l.data).getFullYear() === Number(anoAtual));
    const entradasAcum = lancAno.reduce((s, l) => s + (l.tipo === "entrada" ? l.valor : 0), 0);
    const saidasAcum = lancAno.reduce((s, l) => s + (l.tipo === "saida" ? l.valor : 0), 0);

    return { entradasMes, saidasMes, entradasAcum, saidasAcum, saldo: entradasAcum - saidasAcum };
  }, [lancByMonth, lancamentos, anoAtual]);

  // bar chart data – monthly breakdown
  const barFinanceiro = useMemo(() => {
    if (mesFiltro !== "TODOS") {
      return [
        { name: mesFiltro, Entradas: resumo.entradasMes, Saídas: resumo.saidasMes },
      ];
    }
    return meses.map((m, i) => {
      const ml = lancamentos.filter((l) => {
        const d = new Date(l.data);
        return d.getFullYear() === Number(anoAtual) && d.getMonth() === i;
      });
      return {
        name: m,
        Entradas: ml.reduce((s, l) => s + (l.tipo === "entrada" ? l.valor : 0), 0),
        Saídas: ml.reduce((s, l) => s + (l.tipo === "saida" ? l.valor : 0), 0),
      };
    });
  }, [lancamentos, mesFiltro, anoAtual, resumo]);

  // ---- Inadimplência ----
  const inadimplencia = useMemo(() => {
    const filtered = mesFiltro === "TODOS"
      ? mensalidades.filter((m) => m.competencia.endsWith(`/${anoAtual}`))
      : mensalidades.filter((m) => {
          const idx = mesIdx(mesFiltro);
          const comp = `${String(idx + 1).padStart(2, "0")}/${anoAtual}`;
          return m.competencia === comp;
        });

    const abertas = filtered.filter((m) => m.status === "em_aberto");
    const pagas = filtered.filter((m) => m.status === "pago");
    const qtdAberto = abertas.length;
    const valorAberto = abertas.reduce((s, m) => s + m.valor, 0);
    const qtdPagas = pagas.length;
    const valorPago = pagas.reduce((s, m) => s + m.valor, 0);

    return { qtdAberto, valorAberto, qtdPagas, valorPago };
  }, [mensalidades, mesFiltro, anoAtual]);

  const barInadimplencia = useMemo(() => {
    if (mesFiltro !== "TODOS") {
      return [{ name: mesFiltro, "Em aberto": inadimplencia.qtdAberto, Pagas: inadimplencia.qtdPagas }];
    }
    return meses.map((m, i) => {
      const comp = `${String(i + 1).padStart(2, "0")}/${anoAtual}`;
      const mes = mensalidades.filter((mn) => mn.competencia === comp);
      return {
        name: m,
        "Em aberto": mes.filter((mn) => mn.status === "em_aberto").length,
        Pagas: mes.filter((mn) => mn.status === "pago").length,
      };
    });
  }, [mensalidades, mesFiltro, anoAtual, inadimplencia]);

  // ---- Fundo de reserva (placeholder – based on saldo_anterior of associados) ----
  const fundoReserva = useMemo(() => {
    const capital = associados.reduce((s, a) => s + (a.saldo_anterior || 0), 0);
    const rendimentos = resumo.saldo > 0 ? resumo.saldo * 0.1 : 0; // 10% estimado
    return { capital, rendimentos, total: capital + rendimentos };
  }, [associados, resumo]);

  const pieFundo = [
    { name: "Capital", value: fundoReserva.capital || 1 },
    { name: "Rendimentos", value: fundoReserva.rendimentos || 0 },
  ];

  const isLoading = loadingL || loadingM || loadingA;
  const labelPeriodo = mesFiltro === "TODOS" ? `Acumulado ${anoAtual}` : `${mesFiltro}/${anoAtual}`;

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
        <PageHeader title="Painel da Tesouraria" subtitle={`Visão financeira — TCMO ${anoAtual}`} />
        <MonthFilter value={mesFiltro} onChange={setMesFiltro} showAll label="Período" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Saldo Acumulado"
          value={formatCurrency(resumo.saldo)}
          icon={<Wallet className="w-5 h-5" />}
          variant="gold"
        />
        <StatCard
          title={`Entradas (${labelPeriodo})`}
          value={formatCurrency(mesFiltro === "TODOS" ? resumo.entradasAcum : resumo.entradasMes)}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title={`Saídas (${labelPeriodo})`}
          value={formatCurrency(mesFiltro === "TODOS" ? resumo.saidasAcum : resumo.saidasMes)}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="Mensalidades em Aberto"
          value={formatCurrency(inadimplencia.valorAberto)}
          subtitle={`${inadimplencia.qtdAberto} em aberto · ${inadimplencia.qtdPagas} pagas`}
          icon={<Users className="w-5 h-5" />}
          variant="info"
        />
      </div>

      {/* Section 1: Resumo Financeiro – bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Resumo Financeiro</h3>
          <p className="text-xs text-muted-foreground mb-4">Entradas × Saídas — {labelPeriodo}</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barFinanceiro} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="Entradas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saídas" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Entradas</span>
              <span className="font-mono text-success">{formatCurrency(mesFiltro === "TODOS" ? resumo.entradasAcum : resumo.entradasMes)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Saídas</span>
              <span className="font-mono text-destructive">-{formatCurrency(mesFiltro === "TODOS" ? resumo.saidasAcum : resumo.saidasMes)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-xs">
              <span className="font-medium text-card-foreground">Resultado</span>
              <span className={`font-bold font-mono ${(mesFiltro === "TODOS" ? resumo.saldo : resumo.entradasMes - resumo.saidasMes) >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(mesFiltro === "TODOS" ? resumo.saldo : resumo.entradasMes - resumo.saidasMes)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Inadimplência – bar chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Inadimplência</h3>
          <p className="text-xs text-muted-foreground mb-4">Mensalidades em aberto — {labelPeriodo}</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barInadimplencia} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="Pagas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Em aberto" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Qtd. em aberto</span>
              <span className="font-mono text-destructive">{inadimplencia.qtdAberto}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Valor em aberto</span>
              <span className="font-mono text-destructive">{formatCurrency(inadimplencia.valorAberto)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pagas</span>
              <span className="font-mono text-success">{inadimplencia.qtdPagas} ({formatCurrency(inadimplencia.valorPago)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Fundo de Reserva – pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Fundo de Reserva</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Capital × Rendimentos</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieFundo}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieFundo.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE[i]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">Saldo total</p>
            <p className="text-lg font-bold text-card-foreground">{formatCurrency(fundoReserva.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
