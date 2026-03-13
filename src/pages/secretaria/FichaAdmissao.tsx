import { Plus, Printer, FileDown, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { usePessoas, useCreatePessoa } from "@/hooks/useSecretaria";
import { useState, useRef } from "react";
import { format } from "date-fns";

const formatDate = (d: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "—");

const FichaAdmissao = () => {
  const { toast } = useToast();
  const { data: pessoas = [], isLoading } = usePessoas();
  const createPessoa = useCreatePessoa();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewPessoa, setViewPessoa] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<Record<string, string>>({});

  const filtered = pessoas.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    ((p as any).cpf || "").includes(search)
  );

  const handleSave = async () => {
    if (!form.nome) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }
    try {
      await createPessoa.mutateAsync({
        nome: form.nome,
        data_nascimento: form.data_nascimento || null,
        telefone: form.telefone || null,
        email: form.email || null,
        observacoes: form.observacoes || null,
        situacao: form.situacao || "Ativo",
      } as any);
      toast({ title: "Ficha criada com sucesso!" });
      setDialogOpen(false);
      setForm({});
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader title="Ficha de Admissão" subtitle="Cadastro completo de associados" />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border" />
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" /> Nova Ficha
        </Button>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Nº</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Nome</th>
                <th className="text-left p-3 text-muted-foreground font-medium">CPF</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Situação</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3 text-muted-foreground">{p.numero_associado || "—"}</td>
                  <td className="p-3 text-card-foreground font-medium">{p.nome}</td>
                  <td className="p-3 text-muted-foreground">{p.cpf || "—"}</td>
                  <td className="p-3"><Badge variant={p.situacao === "Ativo" ? "default" : "secondary"}>{p.situacao}</Badge></td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewPessoa(p)} title="Visualizar Ficha"><Eye className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum associado encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog Nova Ficha */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-card-foreground">Nova Ficha de Admissão</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2"><Label className="text-muted-foreground">Nome Completo *</Label><Input value={form.nome || ""} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Data Nascimento</Label><Input type="date" value={form.data_nascimento || ""} onChange={(e) => setForm(f => ({ ...f, data_nascimento: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Nacionalidade</Label><Input value={form.nacionalidade || ""} onChange={(e) => setForm(f => ({ ...f, nacionalidade: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Naturalidade</Label><Input value={form.naturalidade || ""} onChange={(e) => setForm(f => ({ ...f, naturalidade: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Estado Civil</Label><Input value={form.estado_civil || ""} onChange={(e) => setForm(f => ({ ...f, estado_civil: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">RG</Label><Input value={form.rg || ""} onChange={(e) => setForm(f => ({ ...f, rg: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">CPF</Label><Input value={form.cpf || ""} onChange={(e) => setForm(f => ({ ...f, cpf: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Nome do Pai</Label><Input value={form.nome_pai || ""} onChange={(e) => setForm(f => ({ ...f, nome_pai: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Nome da Mãe</Label><Input value={form.nome_mae || ""} onChange={(e) => setForm(f => ({ ...f, nome_mae: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Telefone</Label><Input value={form.telefone || ""} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Email</Label><Input value={form.email || ""} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Data Admissão</Label><Input type="date" value={form.data_admissao || ""} onChange={(e) => setForm(f => ({ ...f, data_admissao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div className="col-span-2"><Label className="text-muted-foreground">Observações</Label><Textarea value={form.observacoes || ""} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} className="bg-muted border-border mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border">Cancelar</Button>
            <Button onClick={handleSave} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizar Ficha + Impressão */}
      <Dialog open={!!viewPessoa} onOpenChange={(o) => !o && setViewPessoa(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-card-foreground">Ficha de Admissão — {viewPessoa?.nome}</DialogTitle></DialogHeader>
          {viewPessoa && (
            <div ref={printRef} className="py-4 print-ficha">
              <div className="text-center mb-6 print:block hidden">
                <h2 className="text-lg font-bold">TENDA CONGAL DE MAMÃE OXUM</h2>
                <p className="text-sm">Ficha de Admissão do Associado</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nº Associado:</span> <span className="ml-2 text-card-foreground">{viewPessoa.numero_associado || "—"}</span></div>
                <div><span className="text-muted-foreground">Nome:</span> <span className="ml-2 text-card-foreground">{viewPessoa.nome}</span></div>
                <div><span className="text-muted-foreground">Nascimento:</span> <span className="ml-2 text-card-foreground">{formatDate(viewPessoa.data_nascimento)}</span></div>
                <div><span className="text-muted-foreground">Nacionalidade:</span> <span className="ml-2 text-card-foreground">{viewPessoa.nacionalidade || "—"}</span></div>
                <div><span className="text-muted-foreground">Naturalidade:</span> <span className="ml-2 text-card-foreground">{viewPessoa.naturalidade || "—"}</span></div>
                <div><span className="text-muted-foreground">Estado Civil:</span> <span className="ml-2 text-card-foreground">{viewPessoa.estado_civil || "—"}</span></div>
                <div><span className="text-muted-foreground">RG:</span> <span className="ml-2 text-card-foreground">{viewPessoa.rg || "—"}</span></div>
                <div><span className="text-muted-foreground">CPF:</span> <span className="ml-2 text-card-foreground">{viewPessoa.cpf || "—"}</span></div>
                <div><span className="text-muted-foreground">Nome do Pai:</span> <span className="ml-2 text-card-foreground">{viewPessoa.nome_pai || "—"}</span></div>
                <div><span className="text-muted-foreground">Nome da Mãe:</span> <span className="ml-2 text-card-foreground">{viewPessoa.nome_mae || "—"}</span></div>
                <div><span className="text-muted-foreground">Telefone:</span> <span className="ml-2 text-card-foreground">{viewPessoa.telefone || "—"}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="ml-2 text-card-foreground">{viewPessoa.email || "—"}</span></div>
                <div><span className="text-muted-foreground">Data Admissão:</span> <span className="ml-2 text-card-foreground">{formatDate(viewPessoa.data_admissao)}</span></div>
                <div><span className="text-muted-foreground">Situação:</span> <span className="ml-2 text-card-foreground">{viewPessoa.situacao}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Observações:</span> <span className="ml-2 text-card-foreground">{viewPessoa.observacoes || "—"}</span></div>
              </div>
            </div>
          )}
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setViewPessoa(null)} className="border-border">Fechar</Button>
            <Button variant="outline" onClick={handlePrint} className="border-border"><Printer className="w-4 h-4 mr-1" /> Imprimir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-ficha, .print-ficha * { visibility: visible; }
          .print-ficha { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default FichaAdmissao;
