import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { usePessoas, useCreatePessoa, useUpdatePessoa, useDeletePessoa } from "@/hooks/useSecretaria";
import { cn } from "@/lib/utils";

interface FormState {
  nome: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  tipo_vinculo: string;
  situacao: string;
  possui_mensalidade: boolean;
  data_ingresso_corrente: string;
  observacoes: string;
}

const emptyForm: FormState = {
  nome: "",
  data_nascimento: "",
  telefone: "",
  email: "",
  tipo_vinculo: "",
  situacao: "Ativo",
  possui_mensalidade: false,
  data_ingresso_corrente: "",
  observacoes: "",
};

const tiposVinculo = ["Filho de Corrente", "Filho Coroado", "Pai/Mãe Pequeno(a)", "Pai/Mãe de Santo"];
const situacoes = ["Ativo", "Afastado", "Licenciado", "Desligado"];

const Pessoas = () => {
  const { data: pessoas = [], isLoading } = usePessoas();
  const createMut = useCreatePessoa();
  const updateMut = useUpdatePessoa();
  const deleteMut = useDeletePessoa();
  const isCongal = useAuth().usuario?.perfil === "congal";
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = pessoas.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    const payload = {
      nome: form.nome,
      data_nascimento: form.data_nascimento || null,
      telefone: form.telefone || null,
      email: form.email || null,
      tipo_vinculo: form.tipo_vinculo || null,
      situacao: form.situacao,
      possui_mensalidade: form.possui_mensalidade,
      data_ingresso_corrente: form.data_ingresso_corrente || null,
      observacoes: form.observacoes || null,
    };
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Pessoa atualizada!" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Pessoa adicionada!" });
      }
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      nome: p.nome,
      data_nascimento: p.data_nascimento || "",
      telefone: p.telefone || "",
      email: p.email || "",
      tipo_vinculo: p.tipo_vinculo || "",
      situacao: p.situacao || "Ativo",
      possui_mensalidade: p.possui_mensalidade ?? false,
      data_ingresso_corrente: p.data_ingresso_corrente || "",
      observacoes: p.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Pessoa removida!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Pessoas" subtitle="Gestão de pessoas da Secretaria">
        {!isCongal && (
          <Button
            onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }}
            className="bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Pessoa
          </Button>
        )}
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pessoa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nome</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Vínculo</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Situação</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Mensalidade</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{p.nome}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{p.tipo_vinculo || "—"}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                      p.situacao === "Ativo" ? "bg-success/10 text-success" :
                      p.situacao === "Afastado" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-destructive/10 text-destructive"
                    )}>
                      {p.situacao}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-muted-foreground">
                    {p.possui_mensalidade ? "Sim" : "Não"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => navigate(`/secretaria/pessoas/${p.id}`)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {!isCongal && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(p)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    Nenhuma pessoa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog de criação/edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{editingId ? "Editar Pessoa" : "Nova Pessoa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-muted-foreground">Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Data de Nascimento</Label>
                <Input type="date" value={form.data_nascimento} onChange={(e) => setForm((p) => ({ ...p, data_nascimento: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground">Telefone</Label>
                <Input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="bg-muted border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Tipo de Vínculo</Label>
                <Select value={form.tipo_vinculo} onValueChange={(v) => setForm((p) => ({ ...p, tipo_vinculo: v }))}>
                  <SelectTrigger className="bg-muted border-border mt-1">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposVinculo.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Situação</Label>
                <Select value={form.situacao} onValueChange={(v) => setForm((p) => ({ ...p, situacao: v }))}>
                  <SelectTrigger className="bg-muted border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {situacoes.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Data Ingresso Corrente</Label>
                <Input type="date" value={form.data_ingresso_corrente} onChange={(e) => setForm((p) => ({ ...p, data_ingresso_corrente: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch checked={form.possui_mensalidade} onCheckedChange={(v) => setForm((p) => ({ ...p, possui_mensalidade: v }))} />
                <Label className="text-muted-foreground">Possui Mensalidade</Label>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Observações</Label>
              <Input value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} className="bg-muted border-border mt-1" />
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

export default Pessoas;
