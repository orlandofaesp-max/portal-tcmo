import { BookOpen, BookX, AlertTriangle, ArrowDownUp, CheckCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useBibliotecaDashboard } from "@/hooks/useBiblioteca";

const BibliotecaDashboard = () => {
  const { data, isLoading } = useBibliotecaDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  const d = data || { disponiveis: 0, emprestados: 0, atrasados: 0, emprestimosDoMes: 0, devolucoesDoMes: 0 };

  return (
    <div>
      <PageHeader title="Biblioteca" subtitle="Visão geral do acervo" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Disponíveis" value={String(d.disponiveis)} icon={<BookOpen className="w-5 h-5" />} variant="success" />
        <StatCard title="Emprestados" value={String(d.emprestados)} icon={<BookX className="w-5 h-5" />} variant="info" />
        <StatCard title="Em Atraso" value={String(d.atrasados)} icon={<AlertTriangle className="w-5 h-5" />} variant="warning" />
        <StatCard title="Empréstimos (mês)" value={String(d.emprestimosDoMes)} icon={<ArrowDownUp className="w-5 h-5" />} />
        <StatCard title="Devoluções (mês)" value={String(d.devolucoesDoMes)} icon={<CheckCircle className="w-5 h-5" />} />
      </div>
    </div>
  );
};

export default BibliotecaDashboard;
