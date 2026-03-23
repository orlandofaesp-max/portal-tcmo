import { useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useCorrentes, useAgendaCorrente, useCreateAgenda, useDeleteAgenda } from "@/hooks/useCorrente";
import { format } from "date-fns";

const AgendaCorrente = () => {
  const { toast } = useToast();
  const { data: correntes = [] } = useCorrentes();
  const [filtroCorrente, setFiltroCorrente] = useState<string>("all");
  const { data: eventos = [] } = useAgendaCorrente(filtroCorrente && filtroCorrente !== "all" ? filtroCorrente : undefined);
  const createAgenda = useCreateAgenda();
  const deleteAgenda = useDeleteAgenda();

  const [dlgOpen, setDlgOpen] = useState(false);
  const [form, setForm] = useState({ corrente_id: "", data: "", descricao: "" });

  const handleCreate = async () => {
    if (!form.corrente_id || !form.data) return;
    try {
      await createAgenda.mutateAsync({ corrente_id: form.corrente_id, data: form.data, descricao: form.descricao || null });
      toast({ title: "Evento criado!" });
      setDlgOpen(false);
      setForm({ corrente_id: "", data: "", descricao: "" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader title="Agenda por Corrente" subtitle="Eventos e compromissos das correntes" />

      <div className="flex gap-3 mb-4 flex-wrap">
        <Select value={filtroCorrente} onValueChange={setFiltroCorrente}>
          <SelectTrigger className="w-[200px] bg-card border-border"><SelectValue placeholder="Todas as correntes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {correntes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setDlgOpen(true)} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" /> Novo Evento
        </Button>
      </div>

      <div className="space-y-3">
        {eventos.map((ev: any) => (
          <div key={ev.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between">
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><CalendarDays className="w-4 h-4 text-primary" /></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{ev.descricao || "Sem descrição"}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(ev.data), "dd/MM/yyyy")} — {ev.correntes?.nome}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={async () => { await deleteAgenda.mutateAsync(ev.id); toast({ title: "Evento removido!" }); }}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
        {eventos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum evento agendado.</p>}
      </div>

      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Novo Evento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Corrente</Label>
              <Select value={form.corrente_id} onValueChange={(v) => setForm(f => ({ ...f, corrente_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{correntes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-muted-foreground">Data</Label><Input type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaCorrente;
