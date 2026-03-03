import { Construction } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface Props {
  title: string;
  description?: string;
}

const PlaceholderModule = ({ title, description }: Props) => {
  return (
    <div>
      <PageHeader title={title} subtitle={description || "Módulo em desenvolvimento"} />
      <div className="flex flex-col items-center justify-center py-20">
        <Construction className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">Este módulo será implementado em breve.</p>
      </div>
    </div>
  );
};

export default PlaceholderModule;
