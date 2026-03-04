import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";
import AppSidebar from "@/components/AppSidebar";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Mensalidades from "@/pages/Mensalidades";
import LivroCaixa from "@/pages/LivroCaixa";
import Demonstracoes from "@/pages/Demonstracoes";
import Associados from "@/pages/tesouraria/Associados";
import Categorias from "@/pages/tesouraria/Categorias";
import ExtratoAssociado from "@/pages/tesouraria/ExtratoAssociado";
import GerenciarUsuarios from "@/pages/admin/GerenciarUsuarios";
import PlaceholderModule from "@/pages/PlaceholderModule";
import AlmoxarifadoDashboard from "@/pages/almoxarifado/AlmoxarifadoDashboard";
import ItensAlmoxarifado from "@/pages/almoxarifado/ItensAlmoxarifado";
import CategoriasAlmoxarifado from "@/pages/almoxarifado/CategoriasAlmoxarifado";
import MovimentacoesAlmoxarifado from "@/pages/almoxarifado/Movimentacoes";
import Pessoas from "@/pages/secretaria/Pessoas";
import PessoaPerfil from "@/pages/secretaria/PessoaPerfil";
import FundoReserva from "@/pages/tesouraria/FundoReserva";
import BibliotecaDashboard from "@/pages/biblioteca/BibliotecaDashboard";
import ObrasPage from "@/pages/biblioteca/Obras";
import AutoresPage from "@/pages/biblioteca/Autores";
import CategoriasBibliotecaPage from "@/pages/biblioteca/CategoriasBiblioteca";
import EmprestimosPage from "@/pages/biblioteca/Emprestimos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type AppPerfil = Database["public"]["Enums"]["app_perfil"];

/** Route guard by profile — congal always has access */
const ModuleRoute = ({ perfil, children }: { perfil: AppPerfil; children: React.ReactNode }) => {
  const { isPerfil } = useAuth();
  if (!isPerfil(perfil)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ProtectedRoutes = () => {
  const { session, loading, usuario } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (!usuario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Seu acesso ainda não foi configurado.</p>
          <p className="text-muted-foreground text-xs mt-1">Solicite ao administrador (Congal) a ativação do seu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppSidebar />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Administração — somente congal */}
          <Route path="/admin/usuarios" element={<ModuleRoute perfil="congal"><GerenciarUsuarios /></ModuleRoute>} />
          {/* Tesouraria */}
          <Route path="/tesouraria/associados" element={<ModuleRoute perfil="tesouraria"><Associados /></ModuleRoute>} />
          <Route path="/tesouraria/associados/:id/extrato" element={<ModuleRoute perfil="tesouraria"><ExtratoAssociado /></ModuleRoute>} />
          <Route path="/tesouraria/categorias" element={<ModuleRoute perfil="tesouraria"><Categorias /></ModuleRoute>} />
          <Route path="/tesouraria/mensalidades" element={<ModuleRoute perfil="tesouraria"><Mensalidades /></ModuleRoute>} />
          <Route path="/tesouraria/livro-caixa" element={<ModuleRoute perfil="tesouraria"><LivroCaixa /></ModuleRoute>} />
          <Route path="/tesouraria/demonstracoes" element={<ModuleRoute perfil="tesouraria"><Demonstracoes /></ModuleRoute>} />
          <Route path="/tesouraria/fundo-reserva" element={<ModuleRoute perfil="tesouraria"><FundoReserva /></ModuleRoute>} />
          {/* Secretaria */}
          <Route path="/secretaria/pessoas" element={<ModuleRoute perfil="secretaria"><Pessoas /></ModuleRoute>} />
          <Route path="/secretaria/pessoas/:id" element={<ModuleRoute perfil="secretaria"><PessoaPerfil /></ModuleRoute>} />
          {/* Biblioteca */}
          <Route path="/biblioteca/dashboard" element={<ModuleRoute perfil="biblioteca"><BibliotecaDashboard /></ModuleRoute>} />
          <Route path="/biblioteca/obras" element={<ModuleRoute perfil="biblioteca"><ObrasPage /></ModuleRoute>} />
          <Route path="/biblioteca/autores" element={<ModuleRoute perfil="biblioteca"><AutoresPage /></ModuleRoute>} />
          <Route path="/biblioteca/categorias" element={<ModuleRoute perfil="biblioteca"><CategoriasBibliotecaPage /></ModuleRoute>} />
          <Route path="/biblioteca/emprestimos" element={<ModuleRoute perfil="biblioteca"><EmprestimosPage /></ModuleRoute>} />
          {/* Almoxarifado */}
          <Route path="/almoxarifado" element={<ModuleRoute perfil="almoxarifado"><PlaceholderModule title="Almoxarifado" description="Controle de estoque e mercadorias" /></ModuleRoute>} />
          {/* Acervo */}
          <Route path="/acervo" element={<ModuleRoute perfil="acervo"><PlaceholderModule title="Acervo Histórico" description="Preservação do patrimônio histórico e cultural" /></ModuleRoute>} />
          {/* Legacy redirects */}
          <Route path="/mensalidades" element={<Navigate to="/tesouraria/mensalidades" replace />} />
          <Route path="/livro-caixa" element={<Navigate to="/tesouraria/livro-caixa" replace />} />
          <Route path="/demonstracoes" element={<Navigate to="/tesouraria/demonstracoes" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
