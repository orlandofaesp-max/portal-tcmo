import { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  useEventosHistoricos,
  useRegistrosAcervo,
  useCreateEventoHistorico,
  useUpdateEventoHistorico,
  useDeleteEventoHistorico,
} from "@/hooks/useAcervo";
import { format } from "date-fns";

interface FormState {
  titulo: string;
  descricao: string;
  data_evento: string;
  registro_id: string;
}
const emptyForm: FormState = { titulo: "", descricao: "", data_evento: "", registro_id: "" };

const EventosHistoricos = () => {
  const { data: eventos = [], isLoading } = useEventosHistoricos();
  const { data: registros = [] } = useRegistrosAcervo();
  const createMut = useCreateEventoHistorico();
  const updateMut = useUpdateEventoHistorico();
  const deleteMut = useDeleteEventoHistorico();
  const { isPerfil } = useAuth();
  const canEdit = isPerfil("acervo");
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = eventos.filter((e) =>
    e.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (e.descricao || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.data_evento) {
      toast({ title: "Preencha título e data", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao || null,
        data_evento: form.data_evento,
        registro_id: form.registro_id || null,
      };
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Evento atualizado!" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Evento adicionado!" });
      }
      setDialogOpen(false); setEditingId(null); setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Evento removido!" });
    } catch (e: any) {
      toast({ title: "Erro ao remover", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;

  return (
    <div>
      <PageHeader title="Eventos Históricos" subtitle="Timeline de eventos da casa">
        {canEdit && (
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Novo Evento
          </Button>
        )}
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar evento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Título</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Descrição</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Data</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Registro Vinculado</th>
                {canEdit && <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{ev.titulo}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground max-w-xs truncate">{ev.descricao || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{format(new Date(ev.data_evento + "T00:00:00"), "dd/MM/yyyy")}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{(ev.registros_acervo as any)?.titulo || "—"}</td>
                  {canEdit && (
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => {
                          setEditingId(ev.id);
                          setForm({
                            titulo: ev.titulo,
                            descricao: ev.descricao || "",
                            data_evento: ev.data_evento,
                            registro_id: ev.registro_id || "",
                          });
                          setDialogOpen(true);
                        }}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(ev.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={canEdit ? 5 : 4} className="text-center py-8 text-sm text-muted-foreground">Nenhum evento encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="text-card-foreground">{editingId ? "Editar Evento" : "Novo Evento"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Data do evento *</Label>
              <Input type="date" value={form.data_evento} onChange={(e) => setForm((p) => ({ ...p, data_evento: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Registro vinculado</Label>
              <Select value={form.registro_id} onValueChange={(v) => setForm((p) => ({ ...p, registro_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Nenhum (evento independente)" /></SelectTrigger>
                <SelectContent>
                  {registros.map((r) => <SelectItem key={r.id} value={r.id}>{r.titulo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground">Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} className="bg-muted border-border mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {(createMut.isPending || updateMut.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventosHistoricos;
