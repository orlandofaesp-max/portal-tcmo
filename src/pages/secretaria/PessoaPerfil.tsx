import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit2, Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePessoa,
  useCruzamentos, useCreateCruzamento, useUpdateCruzamento, useDeleteCruzamento,
  useCoroacoes, useCreateCoroacao, useDeleteCoroacao,
  useEntidades, useCreateEntidade, useUpdateEntidade, useDeleteEntidade,
  useHistoricoReligioso, useCreateHistoricoReligioso, useDeleteHistoricoReligioso,
  useObservacoesInternas, useCreateObservacaoInterna, useDeleteObservacaoInterna,
} from "@/hooks/useSecretaria";
import { useState } from "react";
import { format, differenceInYears, differenceInMonths } from "date-fns";

// TODO: integrar pessoa_id com associado_id da Tesouraria para vincular dados financeiros do médium.

const formatDate = (d: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "—");

const CRUZAMENTO_LINHAS = [
  "Amassi Niori (Orixá Individual)",
  "Oxum",
  "Ogum",
  "Iemanjá",
  "Cosme e Damião",
  "Preto Velho",
];

const CRUZAMENTO_SERIES = [
  { value: "1", label: "1ª Série" },
  { value: "2", label: "2ª Série" },
  { value: "3", label: "3ª Série" },
  { value: "4", label: "4ª Série" },
  { value: "5", label: "5ª Série" },
  { value: "6", label: "6ª Série" },
  { value: "7", label: "7ª Série" },
  { value: "dependencia", label: "Dependência" },
];

const ENTIDADE_LINHAS = [
  "Preto Velho",
  "Caboclo",
  "Erê",
  "Guardião",
  "Linha Auxiliar",
  "Linha Oriente",
];

const COROACAO_TIPOS = [
  "Coroa de Erê",
  "Pai/Mãe Pequeno(a)",
  "Deka",
  "Pai/Mãe de Santo",
];

const HISTORICO_TIPOS = [
  "Entrada na corrente",
  "Primeira incorporação",
  "Cruzamento",
  "Coroação",
  "Afastamento",
  "Retorno à corrente",
];

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
  const { data: observacoes = [] } = useObservacoesInternas(id);

  const createCruz = useCreateCruzamento();
  const updateCruz = useUpdateCruzamento();
  const deleteCruz = useDeleteCruzamento();
  const createCor = useCreateCoroacao();
  const deleteCor = useDeleteCoroacao();
  const createEnt = useCreateEntidade();
  const updateEnt = useUpdateEntidade();
  const deleteEnt = useDeleteEntidade();
  const createHist = useCreateHistoricoReligioso();
  const deleteHist = useDeleteHistoricoReligioso();
  const createObs = useCreateObservacaoInterna();
  const deleteObs = useDeleteObservacaoInterna();

  // Dialog state
  const [dialog, setDialog] = useState<{ type: string; open: boolean; editId?: string }>({ type: "", open: false });
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  // Entidade management dialog
  const [entLinhaDialog, setEntLinhaDialog] = useState<{ open: boolean; linha: string }>({ open: false, linha: "" });

  const openDialog = (type: string, prefill?: Record<string, string>, editId?: string) => {
    setFormFields(prefill || {});
    setDialog({ type, open: true, editId });
  };

  const handleAdd = async () => {
    if (!id) return;
    try {
      switch (dialog.type) {
        case "cruzamento":
          if (dialog.editId) {
            await updateCruz.mutateAsync({ id: dialog.editId, pessoa_id: id, data_cruzamento: formFields.data_cruzamento || null, observacao: formFields.observacao || null });
          } else {
            await createCruz.mutateAsync({ pessoa_id: id, linha: formFields.linha || null, serie: formFields.serie || null, data_cruzamento: formFields.data_cruzamento || null, observacao: formFields.observacao || null });
          }
          break;
        case "coroacao":
          await createCor.mutateAsync({ pessoa_id: id, tipo_coroacao: formFields.tipo_coroacao || null, data_coroacao: formFields.data_coroacao || null, observacao: formFields.observacao || null });
          break;
        case "entidade":
          if (dialog.editId) {
            await updateEnt.mutateAsync({
              id: dialog.editId,
              pessoa_id: id,
              nome_entidade: formFields.nome_entidade || null,
              observacao: formFields.observacao || null,
              data_manifestacao: formFields.data_manifestacao || null,
            });
          } else {
            await createEnt.mutateAsync({
              pessoa_id: id,
              nome_entidade: formFields.nome_entidade || null,
              linha: formFields.linha || null,
              observacao: formFields.observacao || null,
              data_manifestacao: formFields.data_manifestacao || null,
            });
          }
          break;
        case "historico":
          await createHist.mutateAsync({ pessoa_id: id, tipo_evento: formFields.tipo_evento || null, data_evento: formFields.data_evento || null, descricao: formFields.descricao || null });
          break;
        case "observacao":
          await createObs.mutateAsync({ pessoa_id: id, observacao: formFields.observacao || "", autor: formFields.autor || null, data: formFields.data || undefined });
          break;
      }
      toast({ title: dialog.editId ? "Registro atualizado!" : "Registro adicionado!" });
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
        case "observacao": await deleteObs.mutateAsync({ id: itemId, pessoa_id: id }); break;
      }
      toast({ title: type === "entidade" ? "Entidade desativada!" : "Registro removido!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  // --- Cruzamentos Grid helpers ---
  const getCruzamento = (linha: string, serie: string) =>
    cruzamentos.find((c) => c.linha === linha && (c as any).serie === serie);

  const handleCruzCellClick = (linha: string, serie: string) => {
    if (!canEdit) return;
    const existing = getCruzamento(linha, serie);
    if (existing) {
      openDialog("cruzamento", {
        linha,
        serie,
        data_cruzamento: existing.data_cruzamento || "",
        observacao: existing.observacao || "",
      }, existing.id);
    } else {
      openDialog("cruzamento", { linha, serie });
    }
  };

  // --- Entidades helpers (multiple per line) ---
  const getEntidadesByLinha = (linha: string) =>
    entidades.filter((e) => e.linha === linha);

  const handleEntLinhaClick = (linha: string) => {
    if (!canEdit) return;
    setEntLinhaDialog({ open: true, linha });
  };

  // --- Indicadores ---
  const cruzamentosRealizados = cruzamentos.filter(c => (c as any).serie !== "dependencia" && c.data_cruzamento).length;
  const linhasDesenvolvidas = new Set(entidades.map(e => e.linha)).size;

  const tempoCorrente = (() => {
    if (!pessoa?.data_ingresso_corrente) return "—";
    const ingresso = new Date(pessoa.data_ingresso_corrente);
    const now = new Date();
    const years = differenceInYears(now, ingresso);
    const months = differenceInMonths(now, ingresso) % 12;
    if (years === 0) return `${months} mês(es)`;
    return `${years} ano(s)${months > 0 ? ` e ${months} mês(es)` : ""}`;
  })();

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

      {/* Indicadores de progresso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cruzamentos realizados</p>
            <p className="text-lg font-bold text-card-foreground">{cruzamentosRealizados} / 42</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Linhas desenvolvidas</p>
            <p className="text-lg font-bold text-card-foreground">{linhasDesenvolvidas} / 6</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tempo de corrente</p>
            <p className="text-lg font-bold text-card-foreground">{tempoCorrente}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList className="bg-muted border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="cruzamentos">Cruzamentos</TabsTrigger>
          <TabsTrigger value="coroacoes">Coroações</TabsTrigger>
          <TabsTrigger value="entidades">Entidades</TabsTrigger>
          <TabsTrigger value="historico">Histórico Religioso</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
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

        {/* Cruzamentos - Grid */}
        <TabsContent value="cruzamentos">
          <div className="bg-card rounded-xl border border-border p-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground font-medium">Linha</th>
                  {CRUZAMENTO_SERIES.map((s) => (
                    <th key={s.value} className="text-center p-2 text-muted-foreground font-medium whitespace-nowrap">{s.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRUZAMENTO_LINHAS.map((linha) => (
                  <tr key={linha} className="border-b border-border/50">
                    <td className="p-2 text-card-foreground font-medium whitespace-nowrap">{linha}</td>
                    {CRUZAMENTO_SERIES.map((s) => {
                      const cruz = getCruzamento(linha, s.value);
                      return (
                        <td
                          key={s.value}
                          className={`p-2 text-center text-xs ${canEdit ? "cursor-pointer hover:bg-muted/50" : ""} ${cruz ? "text-card-foreground bg-primary/5" : "text-muted-foreground/40"}`}
                          onClick={() => handleCruzCellClick(linha, s.value)}
                          title={canEdit ? (cruz ? "Clique para editar" : "Clique para adicionar") : undefined}
                        >
                          {cruz ? formatDate(cruz.data_cruzamento) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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

        {/* Entidades - Grid com múltiplas por linha */}
        <TabsContent value="entidades">
          <div className="bg-card rounded-xl border border-border p-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {ENTIDADE_LINHAS.map((l) => (
                    <th key={l} className="text-center p-2 text-muted-foreground font-medium whitespace-nowrap">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {ENTIDADE_LINHAS.map((linha) => {
                    const ents = getEntidadesByLinha(linha);
                    return (
                      <td
                        key={linha}
                        className={`p-3 text-center text-sm align-top ${canEdit ? "cursor-pointer hover:bg-muted/50" : ""} ${ents.length > 0 ? "text-card-foreground" : "text-muted-foreground/40"}`}
                        onClick={() => handleEntLinhaClick(linha)}
                        title={canEdit ? "Clique para gerenciar" : undefined}
                      >
                        {ents.length > 0 ? (
                          <div className="space-y-1">
                            {ents.map((e) => (
                              <p key={e.id} className="font-medium text-xs">{e.nome_entidade || "—"}</p>
                            ))}
                          </div>
                        ) : "—"}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
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

        {/* Observações da Casa */}
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

      {/* Dialog para adicionar/editar registros */}
      <Dialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              {dialog.type === "cruzamento" && (dialog.editId ? "Editar Cruzamento" : "Novo Cruzamento")}
              {dialog.type === "coroacao" && "Nova Coroação"}
              {dialog.type === "entidade" && (dialog.editId ? "Editar Entidade" : "Nova Entidade")}
              {dialog.type === "historico" && "Novo Evento"}
              {dialog.type === "observacao" && "Nova Observação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {dialog.type === "cruzamento" && (
              <>
                <div>
                  <Label className="text-muted-foreground">Linha</Label>
                  <Input value={formFields.linha || ""} disabled className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Série</Label>
                  <Input value={CRUZAMENTO_SERIES.find(s => s.value === formFields.serie)?.label || formFields.serie || ""} disabled className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Data do Cruzamento</Label>
                  <Input type="date" value={formFields.data_cruzamento || ""} onChange={(e) => setFormFields((f) => ({ ...f, data_cruzamento: e.target.value }))} className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Observação</Label>
                  <Input value={formFields.observacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, observacao: e.target.value }))} className="bg-muted border-border mt-1" />
                </div>
                {dialog.editId && canEdit && (
                  <Button variant="destructive" size="sm" onClick={async () => {
                    await handleDelete("cruzamento", dialog.editId!);
                    setDialog({ type: "", open: false });
                  }}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover Cruzamento
                  </Button>
                )}
              </>
            )}
            {dialog.type === "coroacao" && (
              <>
                <div>
                  <Label className="text-muted-foreground">Tipo de Coroação</Label>
                  <Select value={formFields.tipo_coroacao || ""} onValueChange={(v) => setFormFields((f) => ({ ...f, tipo_coroacao: v }))}>
                    <SelectTrigger className="bg-muted border-border mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COROACAO_TIPOS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-muted-foreground">Data da Coroação</Label><Input type="date" value={formFields.data_coroacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, data_coroacao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Observação</Label><Input value={formFields.observacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, observacao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              </>
            )}
            {dialog.type === "entidade" && (
              <>
                <div>
                  <Label className="text-muted-foreground">Linha</Label>
                  <Input value={formFields.linha || ""} disabled className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Nome da Entidade</Label>
                  <Input value={formFields.nome_entidade || ""} onChange={(e) => setFormFields((f) => ({ ...f, nome_entidade: e.target.value }))} className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Manifestação</Label>
                  <Input type="date" value={formFields.data_manifestacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, data_manifestacao: e.target.value }))} className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Observação</Label>
                  <Input value={formFields.observacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, observacao: e.target.value }))} className="bg-muted border-border mt-1" />
                </div>
              </>
            )}
            {dialog.type === "historico" && (
              <>
                <div>
                  <Label className="text-muted-foreground">Tipo de Evento</Label>
                  <Select value={formFields.tipo_evento || ""} onValueChange={(v) => setFormFields((f) => ({ ...f, tipo_evento: v }))}>
                    <SelectTrigger className="bg-muted border-border mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HISTORICO_TIPOS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-muted-foreground">Data do Evento</Label><Input type="date" value={formFields.data_evento || ""} onChange={(e) => setFormFields((f) => ({ ...f, data_evento: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Descrição</Label><Textarea value={formFields.descricao || ""} onChange={(e) => setFormFields((f) => ({ ...f, descricao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              </>
            )}
            {dialog.type === "observacao" && (
              <>
                <div><Label className="text-muted-foreground">Data</Label><Input type="date" value={formFields.data || ""} onChange={(e) => setFormFields((f) => ({ ...f, data: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Autor</Label><Input value={formFields.autor || ""} onChange={(e) => setFormFields((f) => ({ ...f, autor: e.target.value }))} className="bg-muted border-border mt-1" /></div>
                <div><Label className="text-muted-foreground">Observação</Label><Textarea value={formFields.observacao || ""} onChange={(e) => setFormFields((f) => ({ ...f, observacao: e.target.value }))} className="bg-muted border-border mt-1" rows={4} /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ type: "", open: false })} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleAdd} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de gerenciamento de entidades por linha */}
      <Dialog open={entLinhaDialog.open} onOpenChange={(o) => setEntLinhaDialog((d) => ({ ...d, open: o }))}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Entidades — {entLinhaDialog.linha}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {getEntidadesByLinha(entLinhaDialog.linha).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma entidade registrada nesta linha.</p>
            ) : (
              getEntidadesByLinha(entLinhaDialog.linha).map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{e.nome_entidade || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {(e as any).data_manifestacao ? formatDate((e as any).data_manifestacao) : ""}
                      {e.observacao ? ` — ${e.observacao}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => {
                      setEntLinhaDialog({ open: false, linha: "" });
                      openDialog("entidade", {
                        linha: entLinhaDialog.linha,
                        nome_entidade: e.nome_entidade || "",
                        observacao: e.observacao || "",
                        data_manifestacao: (e as any).data_manifestacao || "",
                      }, e.id);
                    }}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete("entidade", e.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntLinhaDialog({ open: false, linha: "" })} className="border-border text-muted-foreground">Fechar</Button>
            <Button onClick={() => {
              setEntLinhaDialog({ open: false, linha: "" });
              openDialog("entidade", { linha: entLinhaDialog.linha });
            }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Entidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PessoaPerfil;
