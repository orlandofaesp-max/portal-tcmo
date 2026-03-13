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
import ResetPassword from "@/pages/ResetPassword";
import TrocarSenha from "@/pages/TrocarSenha";
import Dashboard from "@/pages/Dashboard";
import Mensalidades from "@/pages/Mensalidades";
import LivroCaixa from "@/pages/LivroCaixa";
import Demonstracoes from "@/pages/Demonstracoes";
import Associados from "@/pages/tesouraria/Associados";
import Categorias from "@/pages/tesouraria/Categorias";
import ExtratoAssociado from "@/pages/tesouraria/ExtratoAssociado";
import GerenciarUsuarios from "@/pages/admin/GerenciarUsuarios";
import GerenciarPerfis from "@/pages/admin/GerenciarPerfis";
import GerenciarPermissoes from "@/pages/admin/GerenciarPermissoes";
import GerenciarFuncionalidades from "@/pages/admin/GerenciarFuncionalidades";
import Auditoria from "@/pages/admin/Auditoria";
import AcervoDashboard from "@/pages/acervo/AcervoDashboard";
import RegistrosAcervo from "@/pages/acervo/RegistrosAcervo";
import RegistroDetalhe from "@/pages/acervo/RegistroDetalhe";
import EventosHistoricos from "@/pages/acervo/EventosHistoricos";
import AlmoxarifadoDashboard from "@/pages/almoxarifado/AlmoxarifadoDashboard";
import ItensAlmoxarifado from "@/pages/almoxarifado/ItensAlmoxarifado";
import CategoriasAlmoxarifado from "@/pages/almoxarifado/CategoriasAlmoxarifado";
import MovimentacoesAlmoxarifado from "@/pages/almoxarifado/Movimentacoes";
import Pessoas from "@/pages/secretaria/Pessoas";
import PessoaPerfil from "@/pages/secretaria/PessoaPerfil";
import FichaAdmissao from "@/pages/secretaria/FichaAdmissao";
import Atas from "@/pages/secretaria/Atas";
import AtaEditor from "@/pages/secretaria/AtaEditor";
import FundoReserva from "@/pages/tesouraria/FundoReserva";
import BibliotecaDashboard from "@/pages/biblioteca/BibliotecaDashboard";
import ObrasPage from "@/pages/biblioteca/Obras";
import AutoresPage from "@/pages/biblioteca/Autores";
import CategoriasBibliotecaPage from "@/pages/biblioteca/CategoriasBiblioteca";
import EmprestimosPage from "@/pages/biblioteca/Emprestimos";
import DashboardEspiritual from "@/pages/prontuario/DashboardEspiritual";
import MediunsProntuario from "@/pages/prontuario/MediunsProntuario";
import FichaCorrente from "@/pages/prontuario/FichaCorrente";
import Ocorrencias from "@/pages/prontuario/Ocorrencias";
import ArvoreEspiritual from "@/pages/prontuario/ArvoreEspiritual";
import MapaEspiritual from "@/pages/prontuario/MapaEspiritual";
import LinhaDoTempo from "@/pages/prontuario/LinhaDoTempo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type AppPerfil = Database["public"]["Enums"]["app_perfil"];

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
          <p className="text-muted-foreground text-xs mt-1">Solicite ao administrador a ativação do seu perfil.</p>
        </div>
      </div>
    );
  }

  if (usuario.deve_trocar_senha) {
    return <TrocarSenha />;
  }

  return (
    <>
      <AppSidebar />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Administração */}
          <Route path="/admin/usuarios" element={<ModuleRoute perfil="congal"><GerenciarUsuarios /></ModuleRoute>} />
          <Route path="/admin/perfis" element={<ModuleRoute perfil="congal"><GerenciarPerfis /></ModuleRoute>} />
          <Route path="/admin/permissoes" element={<ModuleRoute perfil="congal"><GerenciarPermissoes /></ModuleRoute>} />
          <Route path="/admin/funcionalidades" element={<ModuleRoute perfil="congal"><GerenciarFuncionalidades /></ModuleRoute>} />
          <Route path="/admin/auditoria" element={<ModuleRoute perfil="congal"><Auditoria /></ModuleRoute>} />
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
          <Route path="/secretaria/ficha-admissao" element={<ModuleRoute perfil="secretaria"><FichaAdmissao /></ModuleRoute>} />
          <Route path="/secretaria/atas" element={<ModuleRoute perfil="secretaria"><Atas /></ModuleRoute>} />
          <Route path="/secretaria/atas/nova" element={<ModuleRoute perfil="secretaria"><AtaEditor /></ModuleRoute>} />
          {/* Prontuário Mediúnico */}
          <Route path="/prontuario/dashboard" element={<ModuleRoute perfil="pai_mae_de_santo"><DashboardEspiritual /></ModuleRoute>} />
          <Route path="/prontuario/mediuns" element={<ModuleRoute perfil="pai_mae_de_santo"><MediunsProntuario /></ModuleRoute>} />
          <Route path="/prontuario/mediuns/:id" element={<ModuleRoute perfil="pai_mae_de_santo"><FichaCorrente /></ModuleRoute>} />
          <Route path="/prontuario/ocorrencias" element={<ModuleRoute perfil="pai_mae_de_santo"><Ocorrencias /></ModuleRoute>} />
          <Route path="/prontuario/arvore" element={<ModuleRoute perfil="pai_mae_de_santo"><ArvoreEspiritual /></ModuleRoute>} />
          <Route path="/prontuario/mapa" element={<ModuleRoute perfil="pai_mae_de_santo"><MapaEspiritual /></ModuleRoute>} />
          <Route path="/prontuario/timeline" element={<ModuleRoute perfil="pai_mae_de_santo"><LinhaDoTempo /></ModuleRoute>} />
          {/* Biblioteca */}
          <Route path="/biblioteca/dashboard" element={<ModuleRoute perfil="biblioteca"><BibliotecaDashboard /></ModuleRoute>} />
          <Route path="/biblioteca/obras" element={<ModuleRoute perfil="biblioteca"><ObrasPage /></ModuleRoute>} />
          <Route path="/biblioteca/autores" element={<ModuleRoute perfil="biblioteca"><AutoresPage /></ModuleRoute>} />
          <Route path="/biblioteca/categorias" element={<ModuleRoute perfil="biblioteca"><CategoriasBibliotecaPage /></ModuleRoute>} />
          <Route path="/biblioteca/emprestimos" element={<ModuleRoute perfil="biblioteca"><EmprestimosPage /></ModuleRoute>} />
          {/* Almoxarifado */}
          <Route path="/almoxarifado/dashboard" element={<ModuleRoute perfil="almoxarifado"><AlmoxarifadoDashboard /></ModuleRoute>} />
          <Route path="/almoxarifado/itens" element={<ModuleRoute perfil="almoxarifado"><ItensAlmoxarifado /></ModuleRoute>} />
          <Route path="/almoxarifado/categorias" element={<ModuleRoute perfil="almoxarifado"><CategoriasAlmoxarifado /></ModuleRoute>} />
          <Route path="/almoxarifado/movimentacoes" element={<ModuleRoute perfil="almoxarifado"><MovimentacoesAlmoxarifado /></ModuleRoute>} />
          {/* Acervo */}
          <Route path="/acervo/dashboard" element={<ModuleRoute perfil="acervo"><AcervoDashboard /></ModuleRoute>} />
          <Route path="/acervo/registros" element={<ModuleRoute perfil="acervo"><RegistrosAcervo /></ModuleRoute>} />
          <Route path="/acervo/registros/:id" element={<ModuleRoute perfil="acervo"><RegistroDetalhe /></ModuleRoute>} />
          <Route path="/acervo/eventos" element={<ModuleRoute perfil="acervo"><EventosHistoricos /></ModuleRoute>} />
          {/* Legacy */}
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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
