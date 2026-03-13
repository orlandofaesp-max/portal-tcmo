import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePessoa,
  useObservacoesInternas, useCreateObservacaoInterna, useDeleteObservacaoInterna,
} from "@/hooks/useSecretaria";
import { useState } from "react";
import { format } from "date-fns";

const formatDate = (d: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "—");

const PessoaPerfil = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isCongal = useAuth().usuario?.perfil === "congal";

  const { data: pessoa, isLoading } = usePessoa(id);
  const { data: observacoes = [] } = useObservacoesInternas(id);

  const createObs = useCreateObservacaoInterna();
  const deleteObs = useDeleteObservacaoInterna();

  const [dialog, setDialog] = useState<{ type: string; open: boolean }>({ type: "", open: false });
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  const openDialog = (type: string, prefill?: Record<string, string>) => {
    setFormFields(prefill || {});
    setDialog({ type, open: true });
  };

  const handleAdd = async () => {
    if (!id) return;
    try {
      if (dialog.type === "observacao") {
        await createObs.mutateAsync({ pessoa_id: id, observacao: formFields.observacao || "", autor: formFields.autor || null, data: formFields.data || undefined });
      }
      toast({ title: "Registro adicionado!" });
      setDialog({ type: "", open: false });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (type: string, itemId: string) => {
    if (!id) return;
    try {
      if (type === "observacao") await deleteObs.mutateAsync({ id: itemId, pessoa_id: id });
      toast({ title: "Registro removido!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading || !pessoa) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;
  }

  const canEdit = !isCongal;
  const p = pessoa as any;

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/secretaria/pessoas")} className="mb-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">{pessoa.nome}</h1>
          <p className="text-sm text-muted-foreground">{pessoa.tipo_vinculo || "Sem vínculo"} — {pessoa.situacao}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="border-border print:hidden">
          <Printer className="w-4 h-4 mr-1" /> Imprimir
        </Button>
      </div>

      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList className="bg-muted border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <div className="bg-card rounded-xl border border-border p-6 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Nome:</span> <span className="text-card-foreground ml-2">{pessoa.nome}</span></div>
            <div><span className="text-muted-foreground">Nº Associado:</span> <span className="text-card-foreground ml-2">{p.numero_associado || "—"}</span></div>
            <div><span className="text-muted-foreground">Nascimento:</span> <span className="text-card-foreground ml-2">{formatDate(pessoa.data_nascimento)}</span></div>
            <div><span className="text-muted-foreground">Nacionalidade:</span> <span className="text-card-foreground ml-2">{p.nacionalidade || "—"}</span></div>
            <div><span className="text-muted-foreground">Naturalidade:</span> <span className="text-card-foreground ml-2">{p.naturalidade || "—"}</span></div>
            <div><span className="text-muted-foreground">Estado Civil:</span> <span className="text-card-foreground ml-2">{p.estado_civil || "—"}</span></div>
            <div><span className="text-muted-foreground">RG:</span> <span className="text-card-foreground ml-2">{p.rg || "—"}</span></div>
            <div><span className="text-muted-foreground">CPF:</span> <span className="text-card-foreground ml-2">{p.cpf || "—"}</span></div>
            <div><span className="text-muted-foreground">Nome do Pai:</span> <span className="text-card-foreground ml-2">{p.nome_pai || "—"}</span></div>
            <div><span className="text-muted-foreground">Nome da Mãe:</span> <span className="text-card-foreground ml-2">{p.nome_mae || "—"}</span></div>
            <div><span className="text-muted-foreground">Telefone:</span> <span className="text-card-foreground ml-2">{pessoa.telefone || "—"}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="text-card-foreground ml-2">{pessoa.email || "—"}</span></div>
            <div><span className="text-muted-foreground">Tipo Vínculo:</span> <span className="text-card-foreground ml-2">{pessoa.tipo_vinculo || "—"}</span></div>
            <div><span className="text-muted-foreground">Situação:</span> <span className="text-card-foreground ml-2">{pessoa.situacao}</span></div>
            <div><span className="text-muted-foreground">Possui Mensalidade:</span> <span className="text-card-foreground ml-2">{pessoa.possui_mensalidade ? "Sim" : "Não"}</span></div>
            <div><span className="text-muted-foreground">Ingresso Corrente:</span> <span className="text-card-foreground ml-2">{formatDate(pessoa.data_ingresso_corrente)}</span></div>
            <div><span className="text-muted-foreground">Data Admissão:</span> <span className="text-card-foreground ml-2">{formatDate(p.data_admissao)}</span></div>
            <div><span className="text-muted-foreground">Data Demissão:</span> <span className="text-card-foreground ml-2">{formatDate(p.data_demissao)}</span></div>
            <div className="col-span-2"><span className="text-muted-foreground">Observações:</span> <span className="text-card-foreground ml-2">{pessoa.observacoes || "—"}</span></div>
          </div>
        </TabsContent>

        <TabsContent value="observacoes">
          <div className="bg-card rounded-xl border border-border p-6">
            {canEdit && (
              <Button size="sm" onClick={() => openDialog("observacao", { data: new Date().toISOString().split("T")[0] })} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-1" /> Nova Observação
              </Button>
            )}
            {observacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma observação registrada.</p>
            ) : (
              <div className="space-y-3">
                {observacoes.map((o) => (
                  <div key={o.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-muted-foreground">{formatDate(o.data)}</p>
                        {o.autor && <p className="text-xs text-muted-foreground">— {o.autor}</p>}
                      </div>
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{o.observacao}</p>
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive ml-2" onClick={() => handleDelete("observacao", o.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Nova Observação</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-muted-foreground">Data</Label><Input type="date" value={formFields.data || ""} onChange={(e) => setFormFields((f) => ({ ...f, data: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Autor</Label><Input value={formFields.autor || ""} onChange={(e) => setFormFields((f) => ({ ...f, autor: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Observação</Label><Textarea value={formFields.observacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, observacao: e.target.value }))} className="bg-muted border-border mt-1" rows={4} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ type: "", open: false })} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleAdd} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PessoaPerfil;
