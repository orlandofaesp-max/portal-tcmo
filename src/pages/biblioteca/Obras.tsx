import { useState } from "react";
import { Plus, Edit2, Search, BookOpen, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  useObras, useCreateObra, useUpdateObra, useDeleteObra,
  useAutores, useCategoriasBiblioteca,
  useCreateExemplar, usePessoasBiblioteca, useEmprestarExemplarAutomatico,
} from "@/hooks/useBiblioteca";

interface ObraForm { titulo: string; descricao: string; autor_id: string; categoria_id: string; tipo: string; }
const emptyObraForm: ObraForm = { titulo: "", descricao: "", autor_id: "", categoria_id: "", tipo: "" };

interface ExemplarForm { codigo: string; localizacao: string; }
const emptyExemplarForm: ExemplarForm = { codigo: "", localizacao: "" };

interface EmprestarForm { pessoa_id: string; data_prevista_devolucao: string; }
const emptyEmprestarForm: EmprestarForm = { pessoa_id: "", data_prevista_devolucao: "" };

const Obras = () => {
  const { data: obras = [], isLoading } = useObras();
  const { data: autores = [] } = useAutores();
  const { data: categorias = [] } = useCategoriasBiblioteca();
  const { data: pessoas = [] } = usePessoasBiblioteca();
  const createObra = useCreateObra();
  const updateObra = useUpdateObra();
  const deleteObra = useDeleteObra();
  const createExemplar = useCreateExemplar();
  const emprestarAuto = useEmprestarExemplarAutomatico();
  const isCongal = useAuth().usuario?.perfil === "congal";
  const isBiblioteca = useAuth().isPerfil("biblioteca");
  const canEdit = isBiblioteca && !isCongal;
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [obraDialogOpen, setObraDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [obraForm, setObraForm] = useState<ObraForm>(emptyObraForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Exemplar dialog
  const [exemplarDialogOpen, setExemplarDialogOpen] = useState(false);
  const [exemplarObraId, setExemplarObraId] = useState<string>("");
  const [exemplarForm, setExemplarForm] = useState<ExemplarForm>(emptyExemplarForm);

  // Emprestar dialog
  const [emprestarDialogOpen, setEmprestarDialogOpen] = useState(false);
  const [emprestarObraId, setEmprestarObraId] = useState<string>("");
  const [emprestarForm, setEmprestarForm] = useState<EmprestarForm>(emptyEmprestarForm);

  const filtered = obras.filter((o) => {
    const q = search.toLowerCase();
    const autorNome = (o.autores as any)?.nome?.toLowerCase() || "";
    const catNome = (o.categorias_biblioteca as any)?.nome?.toLowerCase() || "";
    return o.titulo.toLowerCase().includes(q) || autorNome.includes(q) || catNome.includes(q);
  });

  const handleSaveObra = async () => {
    if (!obraForm.titulo.trim()) { toast({ title: "Título obrigatório", variant: "destructive" }); return; }
    const payload = {
      titulo: obraForm.titulo,
      descricao: obraForm.descricao || null,
      autor_id: obraForm.autor_id || null,
      categoria_id: obraForm.categoria_id || null,
      tipo: obraForm.tipo || null,
    };
    try {
      if (editingId) {
        await updateObra.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Obra atualizada!" });
      } else {
        await createObra.mutateAsync(payload);
        toast({ title: "Obra adicionada!" });
      }
      setObraDialogOpen(false); setEditingId(null); setObraForm(emptyObraForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveExemplar = async () => {
    try {
      await createExemplar.mutateAsync({ obra_id: exemplarObraId, codigo: exemplarForm.codigo || null, localizacao: exemplarForm.localizacao || null });
      toast({ title: "Exemplar adicionado!" });
      setExemplarDialogOpen(false); setExemplarForm(emptyExemplarForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleEmprestar = async () => {
    if (!emprestarForm.pessoa_id) { toast({ title: "Selecione uma pessoa", variant: "destructive" }); return; }
    try {
      await emprestarAuto.mutateAsync({
        obra_id: emprestarObraId,
        pessoa_id: emprestarForm.pessoa_id,
        data_prevista_devolucao: emprestarForm.data_prevista_devolucao || null,
      });
      toast({ title: "Empréstimo registrado com sucesso!" });
      setEmprestarDialogOpen(false); setEmprestarForm(emptyEmprestarForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;

  return (
    <div>
      <PageHeader title="Obras" subtitle="Acervo bibliográfico">
        {canEdit && (
          <Button onClick={() => { setEditingId(null); setObraForm(emptyObraForm); setObraDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Nova Obra
          </Button>
        )}
      </PageHeader>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por título, autor ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Título</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Autor</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Categoria</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Disponíveis / Total</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const exemplares = (o.exemplares as any[]) || [];
                const total = exemplares.length;
                const disponiveis = exemplares.filter((e: any) => e.disponivel).length;
                const isExpanded = expandedId === o.id;

                return (
                  <>
                    <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-card-foreground">
                        <button onClick={() => setExpandedId(isExpanded ? null : o.id)} className="flex items-center gap-2 hover:text-primary transition-colors">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {o.titulo}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{(o.autores as any)?.nome || "—"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{(o.categorias_biblioteca as any)?.nome || "—"}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn("text-sm font-mono", disponiveis > 0 ? "text-success" : "text-destructive")}>
                          {disponiveis} / {total}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Emprestar exemplar"
                                onClick={() => { setEmprestarObraId(o.id); setEmprestarForm(emptyEmprestarForm); setEmprestarDialogOpen(true); }}>
                                <BookOpen className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Editar obra"
                                onClick={() => { setEditingId(o.id); setObraForm({ titulo: o.titulo, descricao: o.descricao || "", autor_id: o.autor_id || "", categoria_id: o.categoria_id || "", tipo: o.tipo || "" }); setObraDialogOpen(true); }}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Excluir obra"
                                onClick={async () => { try { await deleteObra.mutateAsync(o.id); toast({ title: "Obra removida!" }); } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); } }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={5} className="bg-muted/10 px-8 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exemplares</p>
                            {canEdit && (
                              <Button size="sm" variant="outline" className="h-7 text-xs border-border" onClick={() => { setExemplarObraId(o.id); setExemplarForm(emptyExemplarForm); setExemplarDialogOpen(true); }}>
                                <Plus className="w-3 h-3 mr-1" /> Adicionar Exemplar
                              </Button>
                            )}
                          </div>
                          {exemplares.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum exemplar cadastrado.</p>
                          ) : (
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase px-3 py-2">Código</th>
                                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase px-3 py-2">Localização</th>
                                  <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase px-3 py-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {exemplares.map((ex: any) => (
                                  <tr key={ex.id} className="border-b border-border/30">
                                    <td className="px-3 py-2 text-xs font-mono text-card-foreground">{ex.codigo || "—"}</td>
                                    <td className="px-3 py-2 text-xs text-muted-foreground">{ex.localizacao || "—"}</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                                        ex.disponivel ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                      )}>
                                        {ex.disponivel ? "Disponível" : "Emprestado"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">Nenhuma obra encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Nova/Editar Obra */}
      <Dialog open={obraDialogOpen} onOpenChange={setObraDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">{editingId ? "Editar Obra" : "Nova Obra"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Título *</Label>
              <Input value={obraForm.titulo} onChange={(e) => setObraForm((p) => ({ ...p, titulo: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Descrição</Label>
              <Input value={obraForm.descricao} onChange={(e) => setObraForm((p) => ({ ...p, descricao: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Autor</Label>
                <Select value={obraForm.autor_id} onValueChange={(v) => setObraForm((p) => ({ ...p, autor_id: v }))}>
                  <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {autores.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Categoria</Label>
                <Select value={obraForm.categoria_id} onValueChange={(v) => setObraForm((p) => ({ ...p, categoria_id: v }))}>
                  <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Tipo</Label>
              <Input value={obraForm.tipo} onChange={(e) => setObraForm((p) => ({ ...p, tipo: e.target.value }))} placeholder="Ex: Livro, Apostila, DVD" className="bg-muted border-border mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setObraDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSaveObra} disabled={createObra.isPending || updateObra.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {(createObra.isPending || updateObra.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Novo Exemplar */}
      <Dialog open={exemplarDialogOpen} onOpenChange={setExemplarDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Novo Exemplar</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Código</Label>
              <Input value={exemplarForm.codigo} onChange={(e) => setExemplarForm((p) => ({ ...p, codigo: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Localização</Label>
              <Input value={exemplarForm.localizacao} onChange={(e) => setExemplarForm((p) => ({ ...p, localizacao: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExemplarDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSaveExemplar} disabled={createExemplar.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {createExemplar.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Emprestar Exemplar Automático */}
      <Dialog open={emprestarDialogOpen} onOpenChange={setEmprestarDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Emprestar Exemplar</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">O sistema selecionará automaticamente um exemplar disponível.</p>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Pessoa *</Label>
              <Select value={emprestarForm.pessoa_id} onValueChange={(v) => setEmprestarForm((p) => ({ ...p, pessoa_id: v }))}>
                <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione a pessoa" /></SelectTrigger>
                <SelectContent>
                  {pessoas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground">Data Prevista de Devolução</Label>
              <Input type="date" value={emprestarForm.data_prevista_devolucao} onChange={(e) => setEmprestarForm((p) => ({ ...p, data_prevista_devolucao: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmprestarDialogOpen(false)} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleEmprestar} disabled={emprestarAuto.isPending} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              {emprestarAuto.isPending ? "Registrando..." : "Confirmar Empréstimo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Obras;
