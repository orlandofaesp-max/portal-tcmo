import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, FileIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useRegistroAcervo, useUploadArquivoAcervo, useDeleteArquivoAcervo } from "@/hooks/useAcervo";
import { format } from "date-fns";
import { useRef } from "react";

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const RegistroDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: registro, isLoading } = useRegistroAcervo(id);
  const uploadMut = useUploadArquivoAcervo();
  const deleteMut = useDeleteArquivoAcervo();
  const { isPerfil } = useAuth();
  const canEdit = isPerfil("acervo");
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      await uploadMut.mutateAsync({ registroId: id, file });
      toast({ title: "Arquivo enviado!" });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDeleteArquivo = async (arquivoId: string, url: string) => {
    if (!id) return;
    try {
      await deleteMut.mutateAsync({ id: arquivoId, url, registroId: id });
      toast({ title: "Arquivo removido!" });
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Carregando...</p></div>;
  if (!registro) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-sm">Registro não encontrado.</p></div>;

  const arquivos = (registro as any).arquivos_acervo || [];

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/acervo/registros")} className="text-muted-foreground hover:text-foreground gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>

      <PageHeader title={registro.titulo} subtitle="Detalhes do registro do acervo" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex gap-2">
            <Badge variant="secondary" className="capitalize">{registro.tipo}</Badge>
          </div>
          {registro.descricao && <p className="text-sm text-card-foreground whitespace-pre-wrap">{registro.descricao}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Pessoa vinculada</p>
              <p className="text-card-foreground mt-1">{(registro.pessoas as any)?.nome || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Categoria</p>
              <p className="text-card-foreground mt-1">{(registro.categorias_acervo as any)?.nome || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Data do evento</p>
              <p className="text-card-foreground mt-1">{registro.data_evento ? format(new Date(registro.data_evento + "T00:00:00"), "dd/MM/yyyy") : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Criado em</p>
              <p className="text-card-foreground mt-1">{format(new Date(registro.created_at), "dd/MM/yyyy HH:mm")}</p>
            </div>
          </div>
        </div>

        {/* Arquivos */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-card-foreground">Arquivos</h3>
            {canEdit && (
              <>
                <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending} className="border-border text-muted-foreground gap-1">
                  <Upload className="w-3.5 h-3.5" /> {uploadMut.isPending ? "Enviando..." : "Upload"}
                </Button>
              </>
            )}
          </div>

          {arquivos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum arquivo anexado.</p>
          ) : (
            <div className="space-y-2">
              {arquivos.map((arq: any) => (
                <div key={arq.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/50">
                  <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-card-foreground truncate">{arq.nome_arquivo}</p>
                    <p className="text-[10px] text-muted-foreground">{formatBytes(arq.tamanho)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                      <a href={arq.url} target="_blank" rel="noreferrer"><Download className="w-3 h-3" /></a>
                    </Button>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteArquivo(arq.id, arq.url)} disabled={deleteMut.isPending}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroDetalhe;
