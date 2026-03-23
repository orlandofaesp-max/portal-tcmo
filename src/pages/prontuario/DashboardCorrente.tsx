import { useState } from "react";
import { Users, Calendar, GitBranch, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useCorrentes, usePessoasCorrentes } from "@/hooks/useCorrente";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DashboardCorrente = () => {
  const { data: correntes = [] } = useCorrentes();
  const { data: pessoaLinks = [] } = usePessoasCorrentes();
  const [correnteId, setCorrenteId] = useState<string>("all");

  const filteredLinks = correnteId && correnteId !== "all"
    ? pessoaLinks.filter((l: any) => l.corrente_id === correnteId)
    : pessoaLinks;

  const ativos = filteredLinks.filter((l: any) => l.pessoas?.ativo_espiritual && l.pessoas?.situacao === "Ativo");
  const inativos = filteredLinks.filter((l: any) => !l.pessoas?.ativo_espiritual || l.pessoas?.situacao !== "Ativo");

  const { data: cruzamentos = [] } = useQuery({
    queryKey: ["all_cruzamentos_linha"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cruzamentos_linha").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: frequencias = [] } = useQuery({
    queryKey: ["all_frequencias"],
    queryFn: async () => {
      const { data, error } = await supabase.from("frequencia_mediuns").select("*");
      if (error) throw error;
      return data;
    },
  });

  const pessoaIds = new Set(filteredLinks.map((l: any) => l.pessoa_id));
  const cruzRealizados = cruzamentos.filter(c => pessoaIds.has(c.pessoa_id) && c.data_cruzamento).length;

  const freqTotal = frequencias.filter(f => pessoaIds.has(f.pessoa_id) && (correnteId ? f.corrente_id === correnteId : true));
  const freqPresentes = freqTotal.filter(f => f.presente);
  const freqMedia = freqTotal.length > 0 ? Math.round((freqPresentes.length / freqTotal.length) * 100) : 0;

  // Distribuição por linha
  const linhaCount: Record<string, number> = {};
  cruzamentos.filter(c => pessoaIds.has(c.pessoa_id) && c.data_cruzamento).forEach(c => {
    linhaCount[c.linha] = (linhaCount[c.linha] || 0) + 1;
  });

  return (
    <div>
      <PageHeader title="Dashboard por Corrente" subtitle="Indicadores dos médiuns por corrente" />

      <div className="mb-6 max-w-xs">
        <Select value={correnteId} onValueChange={setCorrenteId}>
          <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Todas as correntes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as correntes</SelectItem>
            {correntes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Médiuns Ativos" value={String(ativos.length)} icon={<Users className="w-5 h-5" />} variant="gold" />
        <StatCard title="Médiuns Inativos" value={String(inativos.length)} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Cruzamentos (Linhas)" value={String(cruzRealizados)} icon={<GitBranch className="w-5 h-5" />} variant="gold" />
        <StatCard title="Frequência Média" value={`${freqMedia}%`} icon={<CheckCircle className="w-5 h-5" />} variant="gold" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Médiuns por Corrente</h3>
          <div className="space-y-2">
            {correntes.map((c) => {
              const count = pessoaLinks.filter((l: any) => l.corrente_id === c.id).length;
              return (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.nome}</span>
                  <span className="text-card-foreground font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Cruzamentos por Linha</h3>
          <div className="space-y-2">
            {Object.entries(linhaCount).sort((a, b) => b[1] - a[1]).map(([linha, count]) => (
              <div key={linha} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{linha}</span>
                <span className="text-card-foreground font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(linhaCount).length === 0 && <p className="text-xs text-muted-foreground">Nenhum cruzamento registrado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCorrente;
