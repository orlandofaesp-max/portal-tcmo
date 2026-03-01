import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "gold" | "success" | "warning" | "info";
}

const variantStyles = {
  default: "border-border",
  gold: "border-primary/20 shadow-gold",
  success: "border-success/20",
  warning: "border-warning/20",
  info: "border-info/20",
};

const iconVariant = {
  default: "bg-muted text-muted-foreground",
  gold: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

const StatCard = ({ title, value, subtitle, icon, trend, variant = "default" }: StatCardProps) => {
  return (
    <div className={cn(
      "bg-card rounded-xl border p-5 transition-all duration-300 hover:shadow-card animate-fade-in",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2.5 rounded-lg", iconVariant[variant])}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {trend.positive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold mt-1 text-card-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
