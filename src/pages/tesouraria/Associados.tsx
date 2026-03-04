import { useState } from "react";
import { Plus, Edit2, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useAssociados, useCreateAssociado, useUpdateAssociado, formatCurrency } from "@/hooks/useFinanceiro";
import { cn } from "@/lib/utils";

interface FormState {
  numero: string;
  nome: string;
  mensalidade_valor: string;
  saldo_anterior: string;
  ativo: boolean;
}

const emptyForm: FormState = { numero: "", nome: "", mensalidade_valor: "30", saldo_anterior: "0", ativo: true };

const Associados = () => {
  const { data: associados = [], isLoading } = useAssociados();
  const createMut = useCreateAssociado();
  const updateMut = useUpdateAssociado();
  const isCongal = useAuth().usuario?.perfil === "congal";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = associados.filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!form.nome.trim()) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    const payload = {
      numero: form.numero || null,
      nome: form.nome,
      mensalidade_valor: Number(form.mensalidade_valor) || 30,
      saldo_anterior: Number(form.saldo_anterior) || 0,
      ativo: form.ativo,
    };
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Associado atualizado!" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Associado adicionado!" });
      }
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleEdit = (a: any) => {
    setEditingId(a.id);
    setForm({
      numero: a.numero || "",
      nome: a.nome,
      mensalidade_valor: String(a.mensalidade_valor),
      saldo_anterior: String(a.saldo_anterior),
      ativo: a.ativo,
    });
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;
  }

  return (
    <div>
      <PageHeader title="Associados" subtitle="Gestão de associados">
        {!isCongal && (
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Novo Associado
          </Button>
        )}
      </PageHeader>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar associado..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nº</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Nome</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Mensalidade</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Saldo Ant.</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{a.numero || "—"}</td>
                  <td className="px-5 py-3 text-sm font-medium text-card-foreground">{a.nome}</td>
                  <td className="px-5 py-3 text-right text-xs font-mono text-card-foreground">{formatCurrency(a.mensalidade_valor)}</td>
                  <td className={cn("px-5 py-3 text-right text-xs font-mono",
                    a.saldo_anterior > 0 ? "text-destructive" : a.saldo_anterior < 0 ? "text-success" : "text-muted-foreground"
                  )}>
                    {a.saldo_anterior !== 0 ? formatCurrency(a.saldo_anterior) : "—"}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full",
                      a.ativo ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {a.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Ver extrato" onClick={() => navigate(`/tesouraria/associados/${a.id}/extrato`)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {!isCongal && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(a)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Nenhum associado encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{editingId ? "Editar Associado" : "Novo Associado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Número</Label>
                <Input value={form.numero} onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground">Nome *</Label>
                <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Valor Mensalidade</Label>
                <Input type="number" value={form.mensalidade_valor} onChange={(e) => setForm((p) => ({ ...p, mensalidade_valor: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground">Saldo Anterior</Label>
                <Input type="number" value={form.saldo_anterior} onChange={(e) => setForm((p) => ({ ...p, saldo_anterior: e.target.value }))} className="bg-muted border-border mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.ativo} onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))} />
              <Label className="text-muted-foreground">Ativo</Label>
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

export default Associados;
