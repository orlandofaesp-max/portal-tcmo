import { Users, Sparkles, Crown, GitBranch } from "lucide-react";
import { useMediuns, useAllEntidades } from "@/hooks/useProntuario";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

const DashboardEspiritual = () => {
  const { data: mediuns = [] } = useMediuns();
  const { data: entidades = [] } = useAllEntidades();

  const { data: cruzamentos = [] } = useQuery({
    queryKey: ["all_cruzamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cruzamentos").select("id, data_cruzamento, serie");
      if (error) throw error;
      return data;
    },
  });

  const { data: coroacoes = [] } = useQuery({
    queryKey: ["all_coroacoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coroacoes").select("id");
      if (error) throw error;
      return data;
    },
  });

  const linhasAtivas = new Set(entidades.map((e) => e.linha).filter(Boolean));
  const cruzConcluidos = cruzamentos.filter((c) => c.data_cruzamento && c.serie !== "dependencia").length;

  return (
    <div>
      <PageHeader title="Dashboard Espiritual" subtitle="Indicadores gerais do Prontuário Mediúnico" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Médiuns Ativos" value={mediuns.length} />
        <StatCard icon={Sparkles} label="Entidades Ativas" value={entidades.length} />
        <StatCard icon={GitBranch} label="Linhas Espirituais Ativas" value={linhasAtivas.size} />
        <StatCard icon={Crown} label="Coroações Realizadas" value={coroacoes.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Cruzamentos Concluídos</h3>
          <p className="text-3xl font-bold text-card-foreground">{cruzConcluidos}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Entidades por Linha</h3>
          <div className="space-y-2">
            {["Preto Velho", "Caboclo", "Erê", "Guardião", "Linha Auxiliar", "Linha Oriente"].map((linha) => {
              const count = entidades.filter((e) => e.linha === linha).length;
              return (
                <div key={linha} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{linha}</span>
                  <span className="text-card-foreground font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEspiritual;
