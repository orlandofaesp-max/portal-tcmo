import { Archive, FileText, Mic, Calendar } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useAcervoDashboard } from "@/hooks/useAcervo";

const AcervoDashboard = () => {
  const { data, isLoading } = useAcervoDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  const d = data || { totalRegistros: 0, entrevistas: 0, documentos: 0, totalEventos: 0 };

  return (
    <div>
      <PageHeader title="Acervo Histórico" subtitle="Preservação do patrimônio histórico e cultural" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Registros" value={String(d.totalRegistros)} icon={<Archive className="w-5 h-5" />} variant="gold" />
        <StatCard title="Entrevistas" value={String(d.entrevistas)} icon={<Mic className="w-5 h-5" />} variant="info" />
        <StatCard title="Documentos" value={String(d.documentos)} icon={<FileText className="w-5 h-5" />} variant="success" />
        <StatCard title="Eventos Históricos" value={String(d.totalEventos)} icon={<Calendar className="w-5 h-5" />} variant="warning" />
      </div>
    </div>
  );
};

export default AcervoDashboard;
