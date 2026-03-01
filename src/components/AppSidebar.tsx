import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Package, 
  Library, 
  ClipboardList,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainModules = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/mensalidades", icon: Receipt, label: "Mensalidades" },
  { to: "/livro-caixa", icon: BookOpen, label: "Livro Caixa" },
  { to: "/demonstracoes", icon: TrendingUp, label: "Demonstrações" },
];

const futureModules = [
  { icon: Users, label: "Associados", disabled: true },
  { icon: Package, label: "Estoque", disabled: true },
  { icon: Library, label: "Biblioteca", disabled: true },
  { icon: ClipboardList, label: "Secretaria", disabled: true },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-gradient-gold tracking-tight">TCMO</h1>
        <p className="text-xs text-sidebar-foreground mt-1">Gestão Financeira</p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-3">Módulo Financeiro</p>
        {mainModules.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary shadow-gold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive && "text-primary")} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
            </NavLink>
          );
        })}

        <div className="pt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-3">Em breve</p>
          {futureModules.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground/40 cursor-not-allowed"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="px-3 py-2">
          <p className="text-[10px] text-muted-foreground">v1.0 — Módulo Financeiro</p>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
