import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { meses } from "@/data/financialData";

interface MonthFilterProps {
  value: string;
  onChange: (value: string) => void;
  showAll?: boolean;
  label?: string;
}

const MonthFilter = ({ value, onChange, showAll = true, label }: MonthFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44 bg-card border-border">
        <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
        <SelectValue placeholder={label || "Mês"} />
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value="TODOS">Todos os meses</SelectItem>}
        {meses.map((m) => (
          <SelectItem key={m} value={m}>{m}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MonthFilter;
