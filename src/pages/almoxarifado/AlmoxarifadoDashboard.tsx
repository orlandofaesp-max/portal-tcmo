import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useAlmoxarifadoDashboard } from "@/hooks/useAlmoxarifado";

const AlmoxarifadoDashboard = () => {
  const { data, isLoading } = useAlmoxarifadoDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  const d = data || { totalItens: 0, abaixoMinimo: 0, entradasMes: 0, saidasMes: 0 };

  return (
    <div>
      <PageHeader title="Almoxarifado" subtitle="Visão geral do estoque" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Itens Cadastrados" value={String(d.totalItens)} icon={<Package className="w-5 h-5" />} />
        <StatCard title="Abaixo do Mínimo" value={String(d.abaixoMinimo)} icon={<AlertTriangle className="w-5 h-5" />} variant="warning" />
        <StatCard title="Entradas (mês)" value={String(d.entradasMes)} icon={<ArrowDownToLine className="w-5 h-5" />} variant="success" />
        <StatCard title="Saídas (mês)" value={String(d.saidasMes)} icon={<ArrowUpFromLine className="w-5 h-5" />} variant="info" />
      </div>
    </div>
  );
};

export default AlmoxarifadoDashboard;
