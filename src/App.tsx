import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Mensalidades from "@/pages/Mensalidades";
import LivroCaixa from "@/pages/LivroCaixa";
import Demonstracoes from "@/pages/Demonstracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppSidebar />
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mensalidades" element={<Mensalidades />} />
            <Route path="/livro-caixa" element={<LivroCaixa />} />
            <Route path="/demonstracoes" element={<Demonstracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
