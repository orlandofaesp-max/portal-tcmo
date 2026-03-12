import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditRow {
  id: string;
  usuario_id: string | null;
  perfil: string | null;
  funcionalidade: string | null;
  operacao: string;
  registro_id: string | null;
  dados_anteriores: any;
  dados_novos: any;
  data_evento: string;
  ip_usuario: string | null;
  usuario_nome?: string;
}

const operacaoColors: Record<string, string> = {
  LOGIN: "bg-blue-500/10 text-blue-500",
  INSERT: "bg-success/10 text-success",
  UPDATE: "bg-warning/10 text-warning",
  DELETE: "bg-destructive/10 text-destructive",
};

const Auditoria = () => {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [search, setSearch] = useState("");
  const [operacaoFilter, setOperacaoFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditRow | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase.from("audit_log").select("*").order("data_evento", { ascending: false }).limit(500);

    if (operacaoFilter !== "all") {
      query = query.eq("operacao", operacaoFilter);
    }

    const { data } = await query;
    if (data) {
      // Fetch user names
      const userIds = [...new Set(data.filter(d => d.usuario_id).map(d => d.usuario_id))];
      let userMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: users } = await supabase.from("usuarios").select("id, nome").in("id", userIds as string[]);
        if (users) {
          users.forEach(u => { userMap[u.id] = u.nome; });
        }
      }
      setLogs(data.map(d => ({ ...d, usuario_nome: d.usuario_id ? userMap[d.usuario_id] || "—" : "Sistema" })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [operacaoFilter]);

  const filtered = logs.filter(l =>
    (l.usuario_nome || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.funcionalidade || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.operacao || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Acesso restrito.</p></div>;
  }

  return (
    <div>
      <PageHeader title="Auditoria" subtitle="Trilha de auditoria do sistema" />

      <div className="flex gap-4 mb-6">
        <div className="w-40">
          <Select value={operacaoFilter} onValueChange={setOperacaoFilter}>
            <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="INSERT">Inserção</SelectItem>
              <SelectItem value="UPDATE">Atualização</SelectItem>
              <SelectItem value="DELETE">Exclusão</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Data</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Usuário</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Perfil</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Operação</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Funcionalidade</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Carregando...</td></tr>
              ) : filtered.map(l => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(l.data_evento), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </td>
                  <td className="px-5 py-3 text-sm text-card-foreground">{l.usuario_nome}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground capitalize">{l.perfil || "—"}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full", operacaoColors[l.operacao] || "bg-muted text-muted-foreground")}>
                      {l.operacao}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{l.funcionalidade || "—"}</td>
                  <td className="px-5 py-3 text-center">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => { setSelectedLog(l); setDetailOpen(true); }}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum registro de auditoria encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Detalhes da Auditoria</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-card-foreground">{format(new Date(selectedLog.data_evento), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Operação</p>
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-full", operacaoColors[selectedLog.operacao])}>
                    {selectedLog.operacao}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usuário</p>
                  <p className="text-card-foreground">{selectedLog.usuario_nome}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Perfil</p>
                  <p className="text-card-foreground capitalize">{selectedLog.perfil || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Funcionalidade</p>
                  <p className="text-card-foreground">{selectedLog.funcionalidade || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ID do Registro</p>
                  <p className="text-card-foreground font-mono text-xs">{selectedLog.registro_id || "—"}</p>
                </div>
                {selectedLog.ip_usuario && (
                  <div>
                    <p className="text-xs text-muted-foreground">IP</p>
                    <p className="text-card-foreground font-mono text-xs">{selectedLog.ip_usuario}</p>
                  </div>
                )}
              </div>
              {selectedLog.dados_anteriores && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Dados Anteriores</p>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-40 text-card-foreground">
                    {JSON.stringify(selectedLog.dados_anteriores, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.dados_novos && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Dados Novos</p>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-40 text-card-foreground">
                    {JSON.stringify(selectedLog.dados_novos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auditoria;
