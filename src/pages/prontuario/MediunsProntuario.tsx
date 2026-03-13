import { useNavigate } from "react-router-dom";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import { useMediuns } from "@/hooks/useProntuario";
import { useState } from "react";

const MediunsProntuario = () => {
  const navigate = useNavigate();
  const { data: mediuns = [], isLoading } = useMediuns();
  const [search, setSearch] = useState("");

  const filtered = mediuns.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Médiuns" subtitle="Lista de médiuns da casa" />

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar médium..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Nome</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Vínculo Umbanda</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => navigate(`/prontuario/mediuns/${p.id}`)}
                >
                  <td className="p-3 text-card-foreground font-medium">{p.nome}</td>
                  <td className="p-3 text-muted-foreground">{(p as any).tipo_vinculo_umbanda || "—"}</td>
                  <td className="p-3">
                    <Badge variant={p.situacao === "Ativo" ? "default" : "secondary"}>
                      {p.situacao}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Nenhum médium encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MediunsProntuario;
