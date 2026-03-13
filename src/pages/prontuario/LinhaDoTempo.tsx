import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useTimeline, useCreateTimelineEvento } from "@/hooks/useProntuario";
import { useState } from "react";
import { format } from "date-fns";

const TIPOS_EVENTO = [
  { value: "institucional", label: "Institucional" },
  { value: "espiritual", label: "Espiritual" },
  { value: "administrativo", label: "Administrativo" },
  { value: "historico", label: "Histórico" },
];

const LinhaDoTempo = () => {
  const { toast } = useToast();
  const { data: eventos = [], isLoading } = useTimeline();
  const createEvento = useCreateTimelineEvento();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ data_evento: new Date().toISOString().split("T")[0] });

  const handleSave = async () => {
    if (!form.titulo || !form.tipo_evento) { toast({ title: "Preencha título e tipo", variant: "destructive" }); return; }
    try {
      await createEvento.mutateAsync({
        titulo: form.titulo,
        descricao: form.descricao || null,
        data_evento: form.data_evento,
        tipo_evento: form.tipo_evento,
        origem_modulo: form.origem_modulo || null,
      });
      toast({ title: "Evento adicionado!" });
      setDialogOpen(false);
      setForm({ data_evento: new Date().toISOString().split("T")[0] });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const tipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "espiritual": return "default";
      case "institucional": return "secondary";
      case "administrativo": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div>
      <PageHeader title="Linha do Tempo" subtitle="Timeline institucional da casa" />

      <Button size="sm" onClick={() => setDialogOpen(true)} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
        <Plus className="w-4 h-4 mr-1" /> Novo Evento
      </Button>

      {isLoading ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
        <div className="relative border-l-2 border-border ml-4 space-y-6 pl-6">
          {eventos.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum evento registrado.</p> : eventos.map((e: any) => (
            <div key={e.id} className="relative">
              <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-card-foreground">{e.titulo}</p>
                  <Badge variant={tipoBadgeVariant(e.tipo_evento)}>{e.tipo_evento}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{format(new Date(e.data_evento), "dd/MM/yyyy")}{e.origem_modulo ? ` — ${e.origem_modulo}` : ""}</p>
                {e.descricao && <p className="text-sm text-muted-foreground mt-2">{e.descricao}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Novo Evento na Timeline</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-muted-foreground">Título</Label><Input value={form.titulo || ""} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Tipo</Label>
              <Select value={form.tipo_evento || ""} onValueChange={(v) => setForm(f => ({ ...f, tipo_evento: v }))}><SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{TIPOS_EVENTO.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-muted-foreground">Data</Label><Input type="date" value={form.data_evento || ""} onChange={(e) => setForm(f => ({ ...f, data_evento: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Descrição</Label><Textarea value={form.descricao || ""} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border">Cancelar</Button>
            <Button onClick={handleSave} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinhaDoTempo;
