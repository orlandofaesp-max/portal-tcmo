import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Mensalidades from "@/pages/Mensalidades";
import LivroCaixa from "@/pages/LivroCaixa";
import Demonstracoes from "@/pages/Demonstracoes";
import GerenciarUsuarios from "@/pages/admin/GerenciarUsuarios";
import PlaceholderModule from "@/pages/PlaceholderModule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

  // User authenticated but no active usuario record
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
          <Route path="/tesouraria/mensalidades" element={<Mensalidades />} />
          <Route path="/tesouraria/livro-caixa" element={<LivroCaixa />} />
          <Route path="/tesouraria/demonstracoes" element={<Demonstracoes />} />
          <Route path="/admin/usuarios" element={<GerenciarUsuarios />} />
          <Route path="/secretaria" element={<PlaceholderModule title="Secretaria" description="Gestão de documentos e atas" />} />
          <Route path="/biblioteca" element={<PlaceholderModule title="Biblioteca" description="Controle de empréstimos e acervo bibliográfico" />} />
          <Route path="/almoxarifado" element={<PlaceholderModule title="Almoxarifado" description="Controle de estoque e mercadorias" />} />
          <Route path="/acervo" element={<PlaceholderModule title="Acervo Histórico" description="Preservação do patrimônio histórico e cultural" />} />
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
