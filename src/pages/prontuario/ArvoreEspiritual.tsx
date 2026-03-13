import { Plus, Trash2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useLinhagem, useCreateLinhagem, useDeleteLinhagem } from "@/hooks/useProntuario";
import { usePessoas } from "@/hooks/useSecretaria";
import { useState } from "react";

const TIPOS_VINCULO = [
  { value: "pai_de_santo", label: "Pai de Santo" },
  { value: "mae_de_santo", label: "Mãe de Santo" },
  { value: "filho_de_santo", label: "Filho de Santo" },
  { value: "neto_de_santo", label: "Neto de Santo" },
];

const ArvoreEspiritual = () => {
  const { toast } = useToast();
  const { data: linhagem = [], isLoading } = useLinhagem();
  const { data: pessoas = [] } = usePessoas();
  const createLinhagem = useCreateLinhagem();
  const deleteLinhagem = useDeleteLinhagem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleSave = async () => {
    if (!form.pessoa_id || !form.tipo_vinculo) { toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return; }
    try {
      await createLinhagem.mutateAsync({
        pessoa_id: form.pessoa_id,
        mentor_id: form.mentor_id || null,
        tipo_vinculo: form.tipo_vinculo,
      });
      toast({ title: "Vínculo registrado!" });
      setDialogOpen(false);
      setForm({});
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  // Group by hierarchy
  const paisMaes = linhagem.filter((l: any) => l.tipo_vinculo === "pai_de_santo" || l.tipo_vinculo === "mae_de_santo");
  const filhos = linhagem.filter((l: any) => l.tipo_vinculo === "filho_de_santo");
  const netos = linhagem.filter((l: any) => l.tipo_vinculo === "neto_de_santo");

  const renderNode = (item: any, level: number) => (
    <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 ${level > 0 ? "ml-8" : ""}`}>
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-primary" />
        <div>
          <p className="text-sm font-medium text-card-foreground">{item.pessoas?.nome || "—"}</p>
          <p className="text-xs text-muted-foreground">
            {TIPOS_VINCULO.find(t => t.value === item.tipo_vinculo)?.label || item.tipo_vinculo}
            {item.mentor?.nome ? ` — Mentor: ${item.mentor.nome}` : ""}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={async () => {
        try { await deleteLinhagem.mutateAsync(item.id); toast({ title: "Vínculo removido!" }); } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
      }}><Trash2 className="w-3.5 h-3.5" /></Button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Árvore Espiritual" subtitle="Linhagem espiritual da casa" />

      <Button size="sm" onClick={() => setDialogOpen(true)} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
        <Plus className="w-4 h-4 mr-1" /> Novo Vínculo
      </Button>

      {isLoading ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
        <div className="space-y-2">
          {linhagem.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum vínculo registrado.</p> : (
            <>
              {paisMaes.map((l: any) => renderNode(l, 0))}
              {filhos.map((l: any) => renderNode(l, 1))}
              {netos.map((l: any) => renderNode(l, 2))}
            </>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Novo Vínculo Espiritual</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-muted-foreground">Pessoa</Label>
              <Select value={form.pessoa_id || ""} onValueChange={(v) => setForm(f => ({ ...f, pessoa_id: v }))}><SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{pessoas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-muted-foreground">Tipo de Vínculo</Label>
              <Select value={form.tipo_vinculo || ""} onValueChange={(v) => setForm(f => ({ ...f, tipo_vinculo: v }))}><SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{TIPOS_VINCULO.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-muted-foreground">Mentor (opcional)</Label>
              <Select value={form.mentor_id || ""} onValueChange={(v) => setForm(f => ({ ...f, mentor_id: v }))}><SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{pessoas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent></Select></div>
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

export default ArvoreEspiritual;
