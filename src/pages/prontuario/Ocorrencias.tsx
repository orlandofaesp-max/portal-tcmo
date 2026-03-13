import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useOcorrencias, useCreateOcorrencia, useDeleteOcorrencia } from "@/hooks/useProntuario";
import { usePessoas } from "@/hooks/useSecretaria";
import { useState } from "react";
import { format } from "date-fns";

const formatDate = (d: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "—");

const Ocorrencias = () => {
  const { toast } = useToast();
  const { data: ocorrencias = [], isLoading } = useOcorrencias();
  const { data: pessoas = [] } = usePessoas();
  const createOcorrencia = useCreateOcorrencia();
  const deleteOcorrencia = useDeleteOcorrencia();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ data: new Date().toISOString().split("T")[0] });

  const handleSave = async () => {
    if (!form.pessoa_id) { toast({ title: "Selecione um médium", variant: "destructive" }); return; }
    try {
      await createOcorrencia.mutateAsync({
        pessoa_id: form.pessoa_id,
        data: form.data || undefined,
        descricao: form.descricao || null,
        responsavel: form.responsavel || null,
      });
      toast({ title: "Ocorrência registrada!" });
      setDialogOpen(false);
      setForm({ data: new Date().toISOString().split("T")[0] });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOcorrencia.mutateAsync(id);
      toast({ title: "Ocorrência removida!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader title="Ocorrências Mediúnicas" subtitle="Registro de ocorrências da casa" />

      <Button size="sm" onClick={() => setDialogOpen(true)} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
        <Plus className="w-4 h-4 mr-1" /> Nova Ocorrência
      </Button>

      {isLoading ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
        <div className="space-y-3">
          {ocorrencias.length === 0 ? <p className="text-muted-foreground text-sm">Nenhuma ocorrência registrada.</p> : ocorrencias.map((o: any) => (
            <div key={o.id} className="flex items-start justify-between p-4 bg-card rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-card-foreground">{o.pessoas?.nome || "—"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(o.data)} {o.responsavel ? `— Resp: ${o.responsavel}` : ""}</p>
                {o.descricao && <p className="text-sm text-muted-foreground mt-1">{o.descricao}</p>}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(o.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Nova Ocorrência</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Médium</Label>
              <Select value={form.pessoa_id || ""} onValueChange={(v) => setForm(f => ({ ...f, pessoa_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{pessoas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-muted-foreground">Data</Label><Input type="date" value={form.data || ""} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Responsável</Label><Input value={form.responsavel || ""} onChange={(e) => setForm(f => ({ ...f, responsavel: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Descrição</Label><Textarea value={form.descricao || ""} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} className="bg-muted border-border mt-1" rows={4} /></div>
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

export default Ocorrencias;
