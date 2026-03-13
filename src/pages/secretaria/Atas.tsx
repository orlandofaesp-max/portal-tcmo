import { Plus, FileText, Upload, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAtas, useCreateAta, useDeleteAta } from "@/hooks/useAtas";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { format } from "date-fns";

const STATUS_MAP: Record<string, string> = {
  rascunho: "Rascunho",
  aguardando_assinatura: "Aguardando Assinatura",
  assinada: "Assinada",
  arquivada: "Arquivada",
};

const Atas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: atas = [], isLoading } = useAtas();
  const createAta = useCreateAta();
  const deleteAta = useDeleteAta();

  const [importDialog, setImportDialog] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImport = async () => {
    if (!form.titulo || !file) { toast({ title: "Preencha título e selecione um arquivo", variant: "destructive" }); return; }
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("atas").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("atas").getPublicUrl(fileName);

      await createAta.mutateAsync({
        titulo: form.titulo,
        tipo_reuniao: form.tipo_reuniao || null,
        data_reuniao: form.data_reuniao || null,
        arquivo_original: urlData.publicUrl,
        status: "arquivada",
      });
      toast({ title: "Ata importada com sucesso!" });
      setImportDialog(false);
      setForm({});
      setFile(null);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAta.mutateAsync(id);
      toast({ title: "Ata removida!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "assinada": return "default";
      case "aguardando_assinatura": return "secondary";
      case "arquivada": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div>
      <PageHeader title="Atas" subtitle="Gestão de atas institucionais" />

      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={() => navigate("/secretaria/atas/nova")} className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          <FileText className="w-4 h-4 mr-1" /> Escrever Ata
        </Button>
        <Button size="sm" variant="outline" onClick={() => setImportDialog(true)} className="border-border">
          <Upload className="w-4 h-4 mr-1" /> Importar Ata
        </Button>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
        <div className="space-y-3">
          {atas.length === 0 ? <p className="text-muted-foreground text-sm">Nenhuma ata registrada.</p> : atas.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-card-foreground">{a.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {a.data_reuniao ? format(new Date(a.data_reuniao), "dd/MM/yyyy") : "—"}
                  {a.tipo_reuniao ? ` — ${a.tipo_reuniao}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(a.status)}>{STATUS_MAP[a.status] || a.status}</Badge>
                {a.conteudo && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/secretaria/atas/nova?id=${a.id}`)} title="Visualizar"><Eye className="w-3.5 h-3.5" /></Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-card-foreground">Importar Ata</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label className="text-muted-foreground">Título *</Label><Input value={form.titulo || ""} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Tipo de Reunião</Label><Input value={form.tipo_reuniao || ""} onChange={(e) => setForm(f => ({ ...f, tipo_reuniao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-muted-foreground">Data da Reunião</Label><Input type="date" value={form.data_reuniao || ""} onChange={(e) => setForm(f => ({ ...f, data_reuniao: e.target.value }))} className="bg-muted border-border mt-1" /></div>
            <div>
              <Label className="text-muted-foreground">Arquivo (PDF, JPG, PNG)</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-muted border-border mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialog(false)} className="border-border">Cancelar</Button>
            <Button onClick={handleImport} disabled={uploading} className="bg-gradient-gold text-primary-foreground hover:opacity-90">{uploading ? "Enviando..." : "Importar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Atas;
