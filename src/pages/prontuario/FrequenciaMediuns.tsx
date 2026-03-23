import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useCorrentes, usePessoasCorrentes, useFrequencia, useUpsertFrequencia } from "@/hooks/useCorrente";
import { format } from "date-fns";

const FrequenciaMediuns = () => {
  const { toast } = useToast();
  const { data: correntes = [] } = useCorrentes();
  const { data: pessoaLinks = [] } = usePessoasCorrentes();
  const upsertFreq = useUpsertFrequencia();

  const [correnteId, setCorrenteId] = useState("");
  const [data, setData] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: frequencias = [] } = useFrequencia(correnteId || undefined, data || undefined);

  const mediunsDaCorrente = correnteId
    ? pessoaLinks.filter((l: any) => l.corrente_id === correnteId && l.pessoas)
    : [];

  const getPresente = (pessoaId: string) => {
    const f = frequencias.find((fr: any) => fr.pessoa_id === pessoaId);
    return f ? f.presente : null;
  };

  const handleToggle = async (pessoaId: string, presente: boolean) => {
    if (!correnteId || !data) return;
    try {
      await upsertFreq.mutateAsync({ pessoa_id: pessoaId, corrente_id: correnteId, data, presente });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader title="Frequência de Médiuns" subtitle="Controle de presença por corrente" />

      <div className="flex gap-3 mb-6 flex-wrap items-end">
        <div>
          <Label className="text-muted-foreground text-xs">Corrente</Label>
          <Select value={correnteId} onValueChange={setCorrenteId}>
            <SelectTrigger className="w-[200px] bg-card border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>{correntes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Data</Label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-[180px] bg-card border-border" />
        </div>
      </div>

      {!correnteId ? (
        <p className="text-sm text-muted-foreground">Selecione uma corrente para registrar a frequência.</p>
      ) : mediunsDaCorrente.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum médium vinculado a esta corrente.</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Médium</th>
                <th className="text-center p-3 text-muted-foreground font-medium w-32">Presença</th>
              </tr>
            </thead>
            <tbody>
              {mediunsDaCorrente.map((l: any) => {
                const presente = getPresente(l.pessoa_id);
                return (
                  <tr key={l.id} className="border-b border-border/50">
                    <td className="p-3 text-card-foreground font-medium">{l.pessoas?.nome}</td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant={presente === true ? "default" : "outline"}
                          className={`h-7 w-7 p-0 ${presente === true ? "bg-green-600 hover:bg-green-700" : ""}`}
                          onClick={() => handleToggle(l.pessoa_id, true)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={presente === false ? "default" : "outline"}
                          className={`h-7 w-7 p-0 ${presente === false ? "bg-destructive hover:bg-destructive/90" : ""}`}
                          onClick={() => handleToggle(l.pessoa_id, false)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FrequenciaMediuns;
