import { Sparkles, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAllEntidades, useMediuns } from "@/hooks/useProntuario";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";

const LINHAS = ["Preto Velho", "Caboclo", "Erê", "Guardião", "Linha Auxiliar", "Linha Oriente"];

const MapaEspiritual = () => {
  const { data: entidades = [], isLoading } = useAllEntidades();
  const { data: mediuns = [] } = useMediuns();

  return (
    <div>
      <PageHeader title="Mapa Espiritual" subtitle="Entidades da casa organizadas por linha espiritual" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users} label="Médiuns Ativos" value={mediuns.length} />
        <StatCard icon={Sparkles} label="Total de Entidades" value={entidades.length} />
        <StatCard icon={Sparkles} label="Linhas Ativas" value={new Set(entidades.map(e => e.linha).filter(Boolean)).size} />
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LINHAS.map((linha) => {
            const ents = entidades.filter((e) => e.linha === linha);
            return (
              <div key={linha} className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {linha}
                  <Badge variant="secondary" className="ml-auto">{ents.length}</Badge>
                </h3>
                {ents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma entidade</p>
                ) : (
                  <div className="space-y-2">
                    {ents.map((e: any) => (
                      <div key={e.id} className="flex justify-between text-sm">
                        <span className="text-card-foreground">{e.nome_entidade || "—"}</span>
                        <span className="text-xs text-muted-foreground">{e.pessoas?.nome || "—"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MapaEspiritual;
