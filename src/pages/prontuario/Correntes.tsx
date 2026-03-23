import { useState } from "react";
import { Plus, Trash2, Users, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import {
  useCorrentes, useCreateCorrente, useDeleteCorrente,
  usePaiMaeCorrentes, useVincularPaiMaeCorrente, useDesvincularPaiMaeCorrente,
  usePessoasCorrentes, useVincularPessoaCorrente, useDesvincularPessoaCorrente,
} from "@/hooks/useCorrente";
import { useMediuns } from "@/hooks/useProntuario";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Correntes = () => {
  const { toast } = useToast();
  const { data: correntes = [] } = useCorrentes();
  const { data: mediuns = [] } = useMediuns();
  const { data: paiMaeLinks = [] } = usePaiMaeCorrentes();
  const { data: pessoaLinks = [] } = usePessoasCorrentes();
  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios_pai_mae"],
    queryFn: async () => {
      const { data, error } = await supabase.from("usuarios").select("id, nome, perfil").eq("ativo", true);
      if (error) throw error;
      return data.filter(u => u.perfil === "pai_mae_de_santo" || u.perfil === "congal" || u.perfil === "administrador");
    },
  });

  const createCorrente = useCreateCorrente();
  const deleteCorrente = useDeleteCorrente();
  const vincularPaiMae = useVincularPaiMaeCorrente();
  const desvincularPaiMae = useDesvincularPaiMaeCorrente();
  const vincularPessoa = useVincularPessoaCorrente();
  const desvincularPessoa = useDesvincularPessoaCorrente();

  const [dlgOpen, setDlgOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [linkDlg, setLinkDlg] = useState<{ type: "paimae" | "medium"; correnteId: string } | null>(null);
  const [selectedId, setSelectedId] = useState("");

  const handleCreate = async () => {
    if (!nome.trim()) return;
    try {
      await createCorrente.mutateAsync({ nome: nome.trim(), descricao: descricao.trim() || null });
      toast({ title: "Corrente criada!" });
      setDlgOpen(false);
      setNome("");
      setDescricao("");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleLink = async () => {
    if (!linkDlg || !selectedId) return;
    try {
      if (linkDlg.type === "paimae") {
        await vincularPaiMae.mutateAsync({ usuario_id: selectedId, corrente_id: linkDlg.correnteId });
      } else {
        await vincularPessoa.mutateAsync({ pessoa_id: selectedId, corrente_id: linkDlg.correnteId });
      }
      toast({ title: "Vínculo criado!" });
      setLinkDlg(null);
      setSelectedId("");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader title="Correntes" subtitle="Gestão de correntes espirituais" />

      <Button onClick={() => setDlgOpen(true)} className="mb-4 bg-gradient-gold text-primary-foreground hover:opacity-90">
        <Plus className="w-4 h-4 mr-1" /> Nova Corrente
      </Button>

      <div className="space-y-4">
        {correntes.map((c) => {
          const paiMaesDaCorrente = paiMaeLinks.filter((l: any) => l.corrente_id === c.id);
          const mediunsDaCorrente = pessoaLinks.filter((l: any) => l.corrente_id === c.id);
          return (
            <div key={c.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-card-foreground">{c.nome}</h3>
                  {c.descricao && <p className="text-xs text-muted-foreground">{c.descricao}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={async () => { await deleteCorrente.mutateAsync(c.id); toast({ title: "Corrente removida!" }); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Tabs defaultValue="mediuns" className="space-y-2">
                <TabsList className="h-8 bg-muted/50">
                  <TabsTrigger value="mediuns" className="text-xs">Médiuns ({mediunsDaCorrente.length})</TabsTrigger>
                  <TabsTrigger value="paimae" className="text-xs">Pai/Mãe ({paiMaesDaCorrente.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="mediuns">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {mediunsDaCorrente.map((l: any) => (
                      <Badge key={l.id} variant="secondary" className="gap-1">
                        {l.pessoas?.nome}
                        <button onClick={async () => { await desvincularPessoa.mutateAsync({ id: l.id, pessoa_id: l.pessoa_id }); }} className="ml-1 hover:text-destructive">×</button>
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setLinkDlg({ type: "medium", correnteId: c.id }); setSelectedId(""); }}>
                    <Link2 className="w-3.5 h-3.5 mr-1" /> Vincular Médium
                  </Button>
                </TabsContent>

                <TabsContent value="paimae">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {paiMaesDaCorrente.map((l: any) => (
                      <Badge key={l.id} variant="secondary" className="gap-1">
                        {l.usuarios?.nome}
                        <button onClick={async () => { await desvincularPaiMae.mutateAsync(l.id); }} className="ml-1 hover:text-destructive">×</button>
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setLinkDlg({ type: "paimae", correnteId: c.id }); setSelectedId(""); }}>
                    <Link2 className="w-3.5 h-3.5 mr-1" /> Vincular Pai/Mãe
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          );
        })}
        {correntes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma corrente cadastrada.</p>}
      </div>

      {/* Dialog Nova Corrente */}
      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Nova Corrente</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-muted-foreground">Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Descrição</Label><Input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-muted border-border mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Vincular */}
      <Dialog open={!!linkDlg} onOpenChange={(o) => !o && setLinkDlg(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Vincular {linkDlg?.type === "paimae" ? "Pai/Mãe" : "Médium"}</DialogTitle></DialogHeader>
          <div className="py-4">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {linkDlg?.type === "paimae"
                  ? usuarios.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)
                  : mediuns.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDlg(null)}>Cancelar</Button>
            <Button onClick={handleLink} disabled={!selectedId} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Correntes;
