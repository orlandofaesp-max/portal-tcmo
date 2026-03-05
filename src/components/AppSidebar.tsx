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
  Archive,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Shield,
  Tag,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const modules = [
  {
    label: "Administração",
    perfil: "congal" as const,
    icon: ShieldCheck,
    items: [
      { to: "/admin/usuarios", icon: Users, label: "Usuários" },
    ],
  },
  {
    label: "Tesouraria",
    perfil: "tesouraria" as const,
    icon: Receipt,
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/tesouraria/associados", icon: UserCheck, label: "Associados" },
      { to: "/tesouraria/categorias", icon: Tag, label: "Categorias" },
      { to: "/tesouraria/mensalidades", icon: Receipt, label: "Mensalidades" },
      { to: "/tesouraria/livro-caixa", icon: BookOpen, label: "Livro Caixa" },
      { to: "/tesouraria/demonstracoes", icon: TrendingUp, label: "Demonstrações" },
      { to: "/tesouraria/fundo-reserva", icon: Shield, label: "Fundo de Reserva" },
    ],
  },
  {
    label: "Secretaria",
    perfil: "secretaria" as const,
    icon: ClipboardList,
    items: [
      { to: "/secretaria/pessoas", icon: UserCheck, label: "Pessoas" },
    ],
  },
  {
    label: "Biblioteca",
    perfil: "biblioteca" as const,
    icon: Library,
    items: [
      { to: "/biblioteca/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/biblioteca/obras", icon: BookOpen, label: "Obras" },
      { to: "/biblioteca/autores", icon: Users, label: "Autores" },
      { to: "/biblioteca/categorias", icon: Tag, label: "Categorias" },
      { to: "/biblioteca/emprestimos", icon: ClipboardList, label: "Empréstimos" },
    ],
  },
  {
    label: "Almoxarifado",
    perfil: "almoxarifado" as const,
    icon: Package,
    items: [
      { to: "/almoxarifado/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/almoxarifado/itens", icon: Package, label: "Itens" },
      { to: "/almoxarifado/categorias", icon: Tag, label: "Categorias" },
      { to: "/almoxarifado/movimentacoes", icon: ClipboardList, label: "Movimentações" },
    ],
  },
  {
    label: "Acervo Histórico",
    perfil: "acervo" as const,
    icon: Archive,
    items: [
      { to: "/acervo/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/acervo/registros", icon: Archive, label: "Registros" },
      { to: "/acervo/eventos", icon: ClipboardList, label: "Eventos" },
    ],
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const { usuario, isPerfil, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-gradient-gold tracking-tight">TCMO</h1>
        <p className="text-xs text-sidebar-foreground mt-1">Portal de Gestão</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {modules.map((mod) => {
          if (!isPerfil(mod.perfil)) return null;
          return (
            <div key={mod.label}>
              <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 mb-2 mt-4 px-3 first:mt-0">
                {mod.label}
              </p>
              {mod.items.map((item) => {
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
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {usuario && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{usuario.nome}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{usuario.perfil}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors w-full rounded-lg hover:bg-destructive/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
        <div className="px-3 py-1 mt-1">
          <p className="text-[10px] text-muted-foreground">v1.0 — Portal TCMO</p>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
