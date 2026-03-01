import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import MonthFilter from "@/components/MonthFilter";
import { formatCurrency, membros, lancamentosCaixa, resumoFinanceiro, meses } from "@/data/financialData";

const allMonthlyData = [
  { mes: 'JAN', entradas: 1974.12, saidas: 6571.84 },
  { mes: 'FEV', entradas: 4834.96, saidas: 1836.14 },
  { mes: 'MAR', entradas: 0, saidas: 0 },
  { mes: 'ABR', entradas: 0, saidas: 0 },
  { mes: 'MAI', entradas: 0, saidas: 0 },
  { mes: 'JUN', entradas: 0, saidas: 0 },
];

const composicaoData = [
  { name: 'Conta Corrente', value: 17074.77, color: 'hsl(210, 80%, 55%)' },
  { name: 'Fundo de Reserva', value: 178507.57, color: 'hsl(42, 80%, 55%)' },
];

const composicaoByMonth: Record<string, typeof composicaoData> = {
  JAN: [
    { name: 'Conta Corrente', value: 17074.77, color: 'hsl(210, 80%, 55%)' },
    { name: 'Fundo de Reserva', value: 178507.57, color: 'hsl(42, 80%, 55%)' },
  ],
  FEV: [
    { name: 'Conta Corrente', value: 20073.59, color: 'hsl(210, 80%, 55%)' },
    { name: 'Fundo de Reserva', value: 178507.57, color: 'hsl(42, 80%, 55%)' },
  ],
};

const saldoEvolution = [
  { mes: 'DEZ/25', saldo: 200180.06 },
  { mes: 'JAN/26', saldo: 195582.34 },
  { mes: 'FEV/26', saldo: 198581.16 },
];

const getMonthFromDate = (data: string): string => {
  const parts = data.split('/');
  if (parts.length < 2) return '';
  const monthNum = parseInt(parts[1], 10);
  return meses[monthNum - 1] || '';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-card">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [mesSelecionado, setMesSelecionado] = useState("TODOS");

  const filteredLancamentos = mesSelecionado === "TODOS"
    ? lancamentosCaixa
    : lancamentosCaixa.filter(l => getMonthFromDate(l.data) === mesSelecionado);

  const totalEntradas = filteredLancamentos.reduce((s, l) => s + l.credito, 0);
  const totalSaidas = filteredLancamentos.reduce((s, l) => s + l.debito, 0);

  const totalMembros = membros.length;
  const totalDevido = membros.reduce((sum, m) => {
    const mesesAtivos = mesSelecionado === "TODOS" ? 2 : 1;
    const devido = mesesAtivos * m.mensalidadeValor + (m.saldoAnterior > 0 ? m.saldoAnterior : 0);
    const pagsFiltrados = mesSelecionado === "TODOS"
      ? m.pagamentos
      : m.pagamentos.filter(p => p.mes === mesSelecionado);
    const pago = pagsFiltrados.reduce((s, p) => s + p.valor, 0) + (m.saldoAnterior < 0 ? Math.abs(m.saldoAnterior) : 0);
    return sum + Math.max(0, devido - pago);
  }, 0);
  const inadimplentes = membros.filter(m => {
    const pagsFiltrados = mesSelecionado === "TODOS"
      ? m.pagamentos
      : m.pagamentos.filter(p => p.mes === mesSelecionado);
    return pagsFiltrados.reduce((s, p) => s + p.valor, 0) === 0;
  }).length;

  const saldoAtual = mesSelecionado === "TODOS" ? 198581.16
    : mesSelecionado === "JAN" ? 195582.34 : 198581.16;

  const monthlyDataFiltered = mesSelecionado === "TODOS"
    ? allMonthlyData.filter(d => d.entradas > 0 || d.saidas > 0)
    : allMonthlyData.filter(d => d.mes === mesSelecionado && (d.entradas > 0 || d.saidas > 0));

  const currentComposicao = mesSelecionado === "TODOS" ? composicaoData
    : (composicaoByMonth[mesSelecionado] || composicaoData);

  const currentComposicaoTotal = currentComposicao.reduce((s, c) => s + c.value, 0);

  const recentLancamentos = mesSelecionado === "TODOS"
    ? lancamentosCaixa.slice(-8).reverse()
    : filteredLancamentos.slice(-8).reverse();

  const subtitleMes = mesSelecionado === "TODOS" ? "2026" : `${mesSelecionado}/2026`;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Visão geral financeira — TCMO ${subtitleMes}`}>
        <MonthFilter value={mesSelecionado} onChange={setMesSelecionado} />
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(saldoAtual)}
          icon={<Wallet className="w-5 h-5" />}
          variant="gold"
          trend={{ value: "1.5%", positive: true }}
        />
        <StatCard
          title={`Entradas (${subtitleMes})`}
          value={formatCurrency(totalEntradas)}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title={`Saídas (${subtitleMes})`}
          value={formatCurrency(totalSaidas)}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="Mensalidades em Aberto"
          value={formatCurrency(totalDevido)}
          subtitle={`${inadimplentes} associados sem pagamento`}
          icon={<Users className="w-5 h-5" />}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Evolution Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Entradas vs Saídas</h3>
          <p className="text-xs text-muted-foreground mb-4">Comparativo {subtitleMes}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDataFiltered} barGap={4}>
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="entradas" name="Entradas" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Composition */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Composição do Saldo</h3>
          <p className="text-xs text-muted-foreground mb-4">{formatCurrency(currentComposicaoTotal)}</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={currentComposicao} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {currentComposicao.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {currentComposicao.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-card-foreground">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saldo Evolution */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Evolução do Patrimônio</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos 3 meses</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={saldoEvolution}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(42, 80%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(42, 80%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(42, 80%, 55%)" fill="url(#goldGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Últimos Lançamentos</h3>
          <p className="text-xs text-muted-foreground mb-4">Livro Caixa — {subtitleMes}</p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
            {recentLancamentos.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${l.credito > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {l.credito > 0 
                      ? <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                      : <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                    }
                  </div>
                  <div>
                    <p className="text-xs font-medium text-card-foreground">{l.historico}</p>
                    <p className="text-[10px] text-muted-foreground">{l.data}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-medium ${l.credito > 0 ? 'text-success' : 'text-destructive'}`}>
                  {l.credito > 0 ? '+' : '-'}{formatCurrency(l.credito > 0 ? l.credito : l.debito)}
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
