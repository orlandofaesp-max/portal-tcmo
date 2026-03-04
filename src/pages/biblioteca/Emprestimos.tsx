import { useState } from "react";
import { Search, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useEmprestimos, useRegistrarDevolucao, useAprovarDevolucao } from "@/hooks/useBiblioteca";

type StatusEmprestimo = "emprestado" | "atrasado" | "aguardando_aprovacao" | "devolvido";

const getStatus = (emp: any): StatusEmprestimo => {
  if (emp.devolucao_aprovada) return "devolvido";
  if (emp.data_devolucao && !emp.devolucao_aprovada) return "aguardando_aprovacao";
  const today = new Date().toISOString().split("T")[0];
  if (!emp.data_devolucao && emp.data_prevista_devolucao && emp.data_prevista_devolucao < today) return "atrasado";
  return "emprestado";
};

const statusLabel: Record<StatusEmprestimo, string> = {
  emprestado: "Emprestado",
  atrasado: "Atrasado",
  aguardando_aprovacao: "Aguardando Aprovação",
  devolvido: "Devolvido",
};

const statusColors: Record<StatusEmprestimo, string> = {
  emprestado: "bg-info/10 text-info",
  atrasado: "bg-destructive/10 text-destructive",
  aguardando_aprovacao: "bg-warning/10 text-warning",
  devolvido: "bg-success/10 text-success",
};

const Emprestimos = () => {
  const { data: emprestimos = [], isLoading } = useEmprestimos();
  const registrarDevolucao = useRegistrarDevolucao();
  const aprovarDevolucao = useAprovarDevolucao();
  const isCongal = useAuth().usuario?.perfil === "congal";
  const isBiblioteca = useAuth().isPerfil("biblioteca");
  const canApprove = isBiblioteca && !isCongal;
  const { toast } = useToast();

  const [search, setSearch] = useState("");

  const filtered = emprestimos.filter((e) => {
    const q = search.toLowerCase();
    const obra = (e.exemplares as any)?.obras?.titulo?.toLowerCase() || "";
    const pessoa = (e.pessoas as any)?.nome?.toLowerCase() || "";
    return obra.includes(q) || pessoa.includes(q);
  });

  const handleRegistrarDevolucao = async (id: string) => {
    try {
      await registrarDevolucao.mutateAsync(id);
      toast({ title: "Devolução registrada! Aguardando aprovação." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleAprovarDevolucao = async (id: string, exemplar_id: string) => {
    try {
      await aprovarDevolucao.mutateAsync({ id, exemplar_id });
      toast({ title: "Devolução aprovada!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;

  return (
    <div>
      <PageHeader title="Empréstimos" subtitle="Controle de empréstimos do acervo" />

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por obra ou pessoa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Obra</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Exemplar</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Pessoa</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Data Empréstimo</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Prev. Devolução</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const status = getStatus(e);
                return (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">{(e.exemplares as any)?.obras?.titulo || "—"}</td>
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{(e.exemplares as any)?.codigo || "—"}</td>
                    <td className="px-5 py-3 text-sm text-card-foreground">{(e.pessoas as any)?.nome || "—"}</td>
                    <td className="px-3 py-3 text-center text-xs text-muted-foreground">{e.data_emprestimo}</td>
                    <td className="px-3 py-3 text-center text-xs text-muted-foreground">{e.data_prevista_devolucao || "—"}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full", statusColors[status])}>
                        {statusLabel[status]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {(status === "emprestado" || status === "atrasado") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Registrar devolução"
                            onClick={() => handleRegistrarDevolucao(e.id)} disabled={registrarDevolucao.isPending}>
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {status === "aguardando_aprovacao" && canApprove && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-success" title="Aprovar devolução"
                            onClick={() => handleAprovarDevolucao(e.id, e.exemplar_id)} disabled={aprovarDevolucao.isPending}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-sm text-muted-foreground">Nenhum empréstimo encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Emprestimos;
