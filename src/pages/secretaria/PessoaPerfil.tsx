import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePessoa,
  useCruzamentos, useCreateCruzamento, useDeleteCruzamento,
  useCoroacoes, useCreateCoroacao, useDeleteCoroacao,
  useEntidades, useCreateEntidade, useDeleteEntidade,
  useHistoricoReligioso, useCreateHistoricoReligioso, useDeleteHistoricoReligioso,
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
  const { data: cruzamentos = [] } = useCruzamentos(id);
  const { data: coroacoes = [] } = useCoroacoes(id);
  const { data: entidades = [] } = useEntidades(id);
  const { data: historico = [] } = useHistoricoReligioso(id);

  const createCruz = useCreateCruzamento();
  const deleteCruz = useDeleteCruzamento();
  const createCor = useCreateCoroacao();
  const deleteCor = useDeleteCoroacao();
  const createEnt = useCreateEntidade();
  const deleteEnt = useDeleteEntidade();
  const createHist = useCreateHistoricoReligioso();
  const deleteHist = useDeleteHistoricoReligioso();

  // Dialog state
  const [dialog, setDialog] = useState<{ type: string; open: boolean }>({ type: "", open: false });
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  const openDialog = (type: string) => {
    setFormFields({});
    setDialog({ type, open: true });
  };

  const handleAdd = async () => {
    if (!id) return;
    try {
      switch (dialog.type) {
        case "cruzamento":
          await createCruz.mutateAsync({ pessoa_id: id, linha: formFields.linha || null, data_cruzamento: formFields.data_cruzamento || null, observacao: formFields.observacao || null });
          break;
        case "coroacao":
          await createCor.mutateAsync({ pessoa_id: id, tipo_coroacao: formFields.tipo_coroacao || null, data_coroacao: formFields.data_coroacao || null, observacao: formFields.observacao || null });
          break;
        case "entidade":
          await createEnt.mutateAsync({ pessoa_id: id, nome_entidade: formFields.nome_entidade || null, linha: formFields.linha || null, observacao: formFields.observacao || null });
          break;
        case "historico":
          await createHist.mutateAsync({ pessoa_id: id, tipo_evento: formFields.tipo_evento || null, data_evento: formFields.data_evento || null, descricao: formFields.descricao || null });
          break;
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
      switch (type) {
        case "cruzamento": await deleteCruz.mutateAsync({ id: itemId, pessoa_id: id }); break;
        case "coroacao": await deleteCor.mutateAsync({ id: itemId, pessoa_id: id }); break;
        case "entidade": await deleteEnt.mutateAsync({ id: itemId, pessoa_id: id }); break;
        case "historico": await deleteHist.mutateAsync({ id: itemId, pessoa_id: id }); break;
      }
      toast({ title: "Registro removido!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading || !pessoa) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  const canEdit = !isCongal;

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/secretaria/pessoas")} className="mb-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground">{pessoa.nome}</h1>
        <p className="text-sm text-muted-foreground">{pessoa.tipo_vinculo || "Sem vínculo"} — {pessoa.situacao}</p>
      </div>

      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="cruzamentos">Cruzamentos</TabsTrigger>
          <TabsTrigger value="coroacoes">Coroações</TabsTrigger>
          <TabsTrigger value="entidades">Entidades</TabsTrigger>
          <TabsTrigger value="historico">Histórico Religioso</TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="dados">
          <div className="bg-card rounded-xl border border-border p-6 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Nome:</span> <span className="text-card-foreground ml-2">{pessoa.nome}</span></div>
            <div><span className="text-muted-foreground">Nascimento:</span> <span className="text-card-foreground ml-2">{formatDate(pessoa.data_nascimento)}</span></div>
            <div><span className="text-muted-foreground">Telefone:</span> <span className="text-card-foreground ml-2">{pessoa.telefone || "—"}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="text-card-foreground ml-2">{pessoa.email || "—"}</span></div>
            <div><span className="text-muted-foreground">Tipo Vínculo:</span> <span className="text-card-foreground ml-2">{pessoa.tipo_vinculo || "—"}</span></div>
            <div><span className="text-muted-foreground">Situação:</span> <span className="text-card-foreground ml-2">{pessoa.situacao}</span></div>
            <div><span className="text-muted-foreground">Possui Mensalidade:</span> <span className="text-card-foreground ml-2">{pessoa.possui_mensalidade ? "Sim" : "Não"}</span></div>
            <div><span className="text-muted-foreground">Ingresso Corrente:</span> <span className="text-card-foreground ml-2">{formatDate(pessoa.data_ingresso_corrente)}</span></div>
            <div className="col-span-2"><span className="text-muted-foreground">Observações:</span> <span className="text-card-foreground ml-2">{pessoa.observacoes || "—"}</span></div>
          </div>
        </TabsContent>

        {/* Cruzamentos */}
        <TabsContent value="cruzamentos">
          <div className="bg-card rounded-xl border border-border p-6">
            {canEdit && (
              <Button size="sm" onClick={() => openDialog("cruzamento")} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-1" /> Novo Cruzamento
              </Button>
            )}
            {cruzamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cruzamento registrado.</p>
            ) : (
              <div className="space-y-3">
                {cruzamentos.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{c.linha || "—"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(c.data_cruzamento)}{c.observacao ? ` — ${c.observacao}` : ""}</p>
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete("cruzamento", c.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Coroações */}
        <TabsContent value="coroacoes">
          <div className="bg-card rounded-xl border border-border p-6">
            {canEdit && (
              <Button size="sm" onClick={() => openDialog("coroacao")} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-1" /> Nova Coroação
              </Button>
            )}
            {coroacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma coroação registrada.</p>
            ) : (
              <div className="space-y-3">
                {coroacoes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{c.tipo_coroacao || "—"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(c.data_coroacao)}{c.observacao ? ` — ${c.observacao}` : ""}</p>
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete("coroacao", c.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Entidades */}
        <TabsContent value="entidades">
          <div className="bg-card rounded-xl border border-border p-6">
            {canEdit && (
              <Button size="sm" onClick={() => openDialog("entidade")} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-1" /> Nova Entidade
              </Button>
            )}
            {entidades.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma entidade registrada.</p>
            ) : (
              <div className="space-y-3">
                {entidades.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{e.nome_entidade || "—"}</p>
                      <p className="text-xs text-muted-foreground">{e.linha || ""}{e.observacao ? ` — ${e.observacao}` : ""}</p>
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete("entidade", e.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Histórico Religioso */}
        <TabsContent value="historico">
          <div className="bg-card rounded-xl border border-border p-6">
            {canEdit && (
              <Button size="sm" onClick={() => openDialog("historico")} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-1" /> Novo Evento
              </Button>
            )}
            {historico.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
            ) : (
              <div className="space-y-3">
                {historico.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{h.tipo_evento || "—"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(h.data_evento)}{h.descricao ? ` — ${h.descricao}` : ""}</p>
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete("historico", h.id)}>
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

      {/* Dialog genérico para adicionar registros */}
      <Dialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              {dialog.type === "cruzamento" && "Novo Cruzamento"}
              {dialog.type === "coroacao" && "Nova Coroação"}
              {dialog.type === "entidade" && "Nova Entidade"}
              {dialog.type === "historico" && "Novo Evento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {dialog.type === "cruzamento" && (
              <>
                <div><Label className="text-muted-foreground">Linha</Label><Input value={formFields.linha || ""} onChange={(e) => setFormFields((f) => ({ ...f, linha: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Data do Cruzamento</Label><Input type="date" value={formFields.data_cruzamento || ""} onChange={(e) => setFormFields((f) => ({ ...f, data_cruzamento: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Observação</Label><Input value={formFields.observacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, observacao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              </>
            )}
            {dialog.type === "coroacao" && (
              <>
                <div><Label className="text-muted-foreground">Tipo de Coroação</Label><Input value={formFields.tipo_coroacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, tipo_coroacao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Data da Coroação</Label><Input type="date" value={formFields.data_coroacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, data_coroacao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Observação</Label><Input value={formFields.observacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, observacao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              </>
            )}
            {dialog.type === "entidade" && (
              <>
                <div><Label className="text-muted-foreground">Nome da Entidade</Label><Input value={formFields.nome_entidade || ""} onChange={(e) => setFormFields((f) => ({ ...f, nome_entidade: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Linha</Label><Input value={formFields.linha || ""} onChange={(e) => setFormFields((f) => ({ ...f, linha: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Observação</Label><Input value={formFields.observacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, observacao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              </>
            )}
            {dialog.type === "historico" && (
              <>
                <div><Label className="text-muted-foreground">Tipo de Evento</Label><Input value={formFields.tipo_evento || ""} onChange={(e) => setFormFields((f) => ({ ...f, tipo_evento: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Data do Evento</Label><Input type="date" value={formFields.data_evento || ""} onChange={(e) => setFormFields((f) => ({ ...f, data_evento: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Descrição</Label><Input value={formFields.descricao || ""} onChange={(e) => setFormFields((f) => ({ ...f, descricao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              </>
            )}
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
