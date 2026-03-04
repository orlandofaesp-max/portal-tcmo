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
import GerenciarUsuarios from "@/pages/admin/GerenciarUsuarios";
import PlaceholderModule from "@/pages/PlaceholderModule";
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
          <Route path="/tesouraria/categorias" element={<ModuleRoute perfil="tesouraria"><Categorias /></ModuleRoute>} />
          <Route path="/tesouraria/mensalidades" element={<ModuleRoute perfil="tesouraria"><Mensalidades /></ModuleRoute>} />
          <Route path="/tesouraria/livro-caixa" element={<ModuleRoute perfil="tesouraria"><LivroCaixa /></ModuleRoute>} />
          <Route path="/tesouraria/demonstracoes" element={<ModuleRoute perfil="tesouraria"><Demonstracoes /></ModuleRoute>} />
          {/* Secretaria */}
          <Route path="/secretaria" element={<ModuleRoute perfil="secretaria"><PlaceholderModule title="Secretaria" description="Gestão de documentos e atas" /></ModuleRoute>} />
          {/* Biblioteca */}
          <Route path="/biblioteca" element={<ModuleRoute perfil="biblioteca"><PlaceholderModule title="Biblioteca" description="Controle de empréstimos e acervo bibliográfico" /></ModuleRoute>} />
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
