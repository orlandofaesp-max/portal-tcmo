import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  useRegistrosAcervo,
  useCategoriasAcervo,
  usePessoasAcervo,
  useCreateRegistroAcervo,
  useUpdateRegistroAcervo,
  useDeleteRegistroAcervo,
} from "@/hooks/useAcervo";
import { format } from "date-fns";

const TIPOS = [
  { value: "entrevista", label: "Entrevista" },
  { value: "documento", label: "Documento" },
  { value: "evento", label: "Evento" },
  { value: "foto", label: "Foto" },
  { value: "video", label: "Vídeo" },
];

interface FormState {
  titulo: string;
  descricao: string;
  tipo: string;
  data_evento: string;
  pessoa_id: string;
  categoria_id: string;
}
const emptyForm: FormState = { titulo: "", descricao: "", tipo: "", data_evento: "", pessoa_id: "", categoria_id: "" };

const RegistrosAcervo = () => {
  const { data: registros = [], isLoading } = useRegistrosAcervo();
  const { data: categorias = [] } = useCategoriasAcervo();
  const { data: pessoas = [] } = usePessoasAcervo();
  const createMut = useCreateRegistroAcervo();
  const updateMut = useUpdateRegistroAcervo();
  const deleteMut = useDeleteRegistroAcervo();
  const { isPerfil } = useAuth();
  const canEdit = isPerfil("acervo");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = registros.filter((r) =>
    r.titulo.toLowerCase().includes(search.toLowerCase()) ||
    r.tipo.toLowerCase().includes(search.toLowerCase()) ||
    (r.pessoas as any)?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.tipo) {
      toast({ title: "Preencha título e tipo", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao || null,
        tipo: form.tipo,
        data_evento: form.data_evento || null,
        pessoa_id: form.pessoa_id || null,
        categoria_id: form.categoria_id || null,
      };
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Registro atualizado!" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Registro adicionado!" });
      }
      setDialogOpen(false); setEditingId(null); setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Registro removido!" });
    } catch (e: any) {
      toast({ title: "Erro ao remover", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;

  return (
    <div>
      <PageHeader title="Registros do Acervo" subtitle="Entrevistas, documentos, fotos e vídeos históricos">
        {canEdit && (
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Novo Registro
          </Button>
        )}
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por título, tipo ou pessoa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Título</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Tipo</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Categoria</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Pessoa</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Data</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{reg.titulo}</td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className="text-[10px] capitalize">{reg.tipo}</Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{(reg.categorias_acervo as any)?.nome || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{(reg.pessoas as any)?.nome || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{reg.data_evento ? format(new Date(reg.data_evento + "T00:00:00"), "dd/MM/yyyy") : "—"}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => navigate(`/acervo/registros/${reg.id}`)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => {
                            setEditingId(reg.id);
                            setForm({
                              titulo: reg.titulo,
                              descricao: reg.descricao || "",
                              tipo: reg.tipo,
                              data_evento: reg.data_evento || "",
                              pessoa_id: reg.pessoa_id || "",
                              categoria_id: reg.categoria_id || "",
                            });
                            setDialogOpen(true);
                          }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(reg.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Nenhum registro encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="text-card-foreground">{editingId ? "Editar Registro" : "Novo Registro"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground">Categoria</Label>
              <Select value={form.categoria_id} onValueChange={(v) => setForm((p) => ({ ...p, categoria_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground">Pessoa vinculada</Label>
              <Select value={form.pessoa_id} onValueChange={(v) => setForm((p) => ({ ...p, pessoa_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {pessoas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground">Data do evento</Label>
              <Input type="date" value={form.data_evento} onChange={(e) => setForm((p) => ({ ...p, data_evento: e.target.value }))} className="bg-muted border-border mt-1" />
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

export default RegistrosAcervo;
