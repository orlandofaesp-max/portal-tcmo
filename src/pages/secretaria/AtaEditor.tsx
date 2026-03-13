import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Printer, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAta, useCreateAta, useUpdateAta, useAssinaturasAta, useCreateAssinatura, useUpdateAssinatura } from "@/hooks/useAtas";
import { useState, useEffect } from "react";
import { format } from "date-fns";

const MODELO_ATA = `ATA DA REUNIÃO DA TENDA CONGAL DE MAMÃE OXUM

Aos [data], reuniram-se os membros da Tenda Congal de Mamãe Oxum para a realização da reunião.

Participantes:
[lista de participantes]

Assuntos tratados:
[conteúdo da reunião]

Nada mais havendo a tratar, encerrou-se a reunião.`;

const STATUS_MAP: Record<string, string> = {
  rascunho: "Rascunho",
  aguardando_assinatura: "Aguardando Assinatura",
  assinada: "Assinada",
  arquivada: "Arquivada",
};

const AtaEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const { data: existingAta } = useAta(editId || undefined);
  const { data: assinaturas = [] } = useAssinaturasAta(editId || undefined);
  const createAta = useCreateAta();
  const updateAta = useUpdateAta();
  const createAssinatura = useCreateAssinatura();
  const updateAssinatura = useUpdateAssinatura();

  const [form, setForm] = useState({
    titulo: "",
    tipo_reuniao: "",
    data_reuniao: new Date().toISOString().split("T")[0],
    conteudo: MODELO_ATA,
    status: "rascunho",
  });

  const [assinanteForm, setAssinanteForm] = useState({ nome: "", email: "" });

  useEffect(() => {
    if (existingAta) {
      setForm({
        titulo: existingAta.titulo || "",
        tipo_reuniao: existingAta.tipo_reuniao || "",
        data_reuniao: existingAta.data_reuniao || "",
        conteudo: existingAta.conteudo || "",
        status: existingAta.status || "rascunho",
      });
    }
  }, [existingAta]);

  const handleSave = async () => {
    if (!form.titulo) { toast({ title: "Título é obrigatório", variant: "destructive" }); return; }
    try {
      if (editId) {
        await updateAta.mutateAsync({ id: editId, ...form });
      } else {
        const result = await createAta.mutateAsync(form);
        navigate(`/secretaria/atas/nova?id=${result.id}`, { replace: true });
      }
      toast({ title: "Ata salva!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleAddAssinante = async () => {
    if (!editId || !assinanteForm.nome) return;
    try {
      await createAssinatura.mutateAsync({ ata_id: editId, nome_assinante: assinanteForm.nome, email_assinante: assinanteForm.email || null });
      setAssinanteForm({ nome: "", email: "" });
      toast({ title: "Assinante adicionado!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleSimularAssinatura = async (assinaturaId: string) => {
    if (!editId) return;
    try {
      await updateAssinatura.mutateAsync({ id: assinaturaId, ata_id: editId, status_assinatura: "assinado", data_assinatura: new Date().toISOString() });
      toast({ title: "Assinatura simulada!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleEnviarAssinatura = async () => {
    if (!editId) return;
    try {
      await updateAta.mutateAsync({ id: editId, status: "aguardando_assinatura" });
      toast({ title: "Status atualizado para 'Aguardando Assinatura'" });
      setForm(f => ({ ...f, status: "aguardando_assinatura" }));
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/secretaria/atas")} className="mb-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-card-foreground">{editId ? "Editar Ata" : "Nova Ata"}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="border-border"><Printer className="w-4 h-4 mr-1" /> Imprimir</Button>
          <Button onClick={handleSave} className="bg-gradient-gold text-primary-foreground hover:opacity-90"><Save className="w-4 h-4 mr-1" /> Salvar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><Label className="text-muted-foreground">Título *</Label><Input value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              <div><Label className="text-muted-foreground">Tipo de Reunião</Label><Input value={form.tipo_reuniao} onChange={(e) => setForm(f => ({ ...f, tipo_reuniao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              <div><Label className="text-muted-foreground">Data</Label><Input type="date" value={form.data_reuniao} onChange={(e) => setForm(f => ({ ...f, data_reuniao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
              <div className="flex items-end"><Badge variant="secondary">{STATUS_MAP[form.status] || form.status}</Badge></div>
            </div>
            <div>
              <Label className="text-muted-foreground">Conteúdo da Ata</Label>
              <Textarea value={form.conteudo} onChange={(e) => setForm(f => ({ ...f, conteudo: e.target.value }))} className="bg-muted border-border mt-1 min-h-[400px] font-mono text-sm" />
            </div>
          </div>
        </div>

        {/* Painel de Assinaturas */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-card-foreground mb-4">Assinaturas</h3>
            {editId ? (
              <>
                <div className="space-y-3 mb-4">
                  {assinaturas.length === 0 ? <p className="text-xs text-muted-foreground">Nenhum assinante.</p> : assinaturas.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                      <div>
                        <p className="text-xs font-medium text-card-foreground">{a.nome_assinante}</p>
                        <p className="text-[10px] text-muted-foreground">{a.email_assinante || "—"}</p>
                      </div>
                      {a.status_assinatura === "pendente" ? (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleSimularAssinatura(a.id)}>Simular Assinatura</Button>
                      ) : (
                        <Badge variant="default">Assinado</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-border pt-3">
                  <Input placeholder="Nome do assinante" value={assinanteForm.nome} onChange={(e) => setAssinanteForm(f => ({ ...f, nome: e.target.value }))} className="bg-muted border-border text-sm" />
                  <Input placeholder="Email (opcional)" value={assinanteForm.email} onChange={(e) => setAssinanteForm(f => ({ ...f, email: e.target.value }))} className="bg-muted border-border text-sm" />
                  <Button size="sm" onClick={handleAddAssinante} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"><Plus className="w-3 h-3 mr-1" /> Adicionar</Button>
                </div>
                {form.status === "rascunho" && assinaturas.length > 0 && (
                  <Button size="sm" className="w-full mt-3" variant="outline" onClick={handleEnviarAssinatura}>Enviar para Assinatura</Button>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Salve a ata primeiro para gerenciar assinaturas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtaEditor;
