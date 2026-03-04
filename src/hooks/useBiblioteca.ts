import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---- Autores ----
export const useAutores = () =>
  useQuery({
    queryKey: ["autores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("autores").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

export const useCreateAutor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nome: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("autores").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["autores"] }),
  });
};

export const useUpdateAutor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; nome?: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("autores").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["autores"] }),
  });
};

export const useDeleteAutor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("autores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["autores"] }),
  });
};

// ---- Categorias Biblioteca ----
export const useCategoriasBiblioteca = () =>
  useQuery({
    queryKey: ["categorias_biblioteca"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias_biblioteca").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

export const useCreateCategoriaBiblioteca = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nome: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("categorias_biblioteca").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_biblioteca"] }),
  });
};

export const useUpdateCategoriaBiblioteca = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; nome?: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("categorias_biblioteca").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_biblioteca"] }),
  });
};

export const useDeleteCategoriaBiblioteca = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias_biblioteca").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_biblioteca"] }),
  });
};

// ---- Obras ----
export const useObras = () =>
  useQuery({
    queryKey: ["obras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("*, autores(nome), categorias_biblioteca(nome), exemplares(id, disponivel)")
        .order("titulo");
      if (error) throw error;
      return data;
    },
  });

export const useObra = (id: string | undefined) =>
  useQuery({
    queryKey: ["obras", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("*, autores(nome), categorias_biblioteca(nome), exemplares(id, codigo, localizacao, disponivel, created_at)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

export const useCreateObra = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { titulo: string; descricao?: string | null; autor_id?: string | null; categoria_id?: string | null; tipo?: string | null }) => {
      const { data, error } = await supabase.from("obras").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["obras"] }),
  });
};

export const useUpdateObra = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("obras").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["obras"] }),
  });
};

export const useDeleteObra = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("obras").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["obras"] }),
  });
};

// ---- Exemplares ----
export const useCreateExemplar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { obra_id: string; codigo?: string | null; localizacao?: string | null }) => {
      const { data, error } = await supabase.from("exemplares").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obras"] });
    },
  });
};

export const useUpdateExemplar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("exemplares").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["obras"] }),
  });
};

// ---- Empréstimos ----
export const useEmprestimos = () =>
  useQuery({
    queryKey: ["emprestimos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emprestimos")
        .select("*, exemplares(id, codigo, obras(titulo)), pessoas(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

// Empréstimo automático com proteção contra concorrência
export const useEmprestarExemplarAutomatico = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { obra_id: string; pessoa_id: string; data_prevista_devolucao?: string | null; observacao?: string | null }) => {
      // 1. Find first available exemplar
      const { data: exemplar, error: findError } = await supabase
        .from("exemplares")
        .select("id")
        .eq("obra_id", payload.obra_id)
        .eq("disponivel", true)
        .order("created_at")
        .limit(1)
        .maybeSingle();

      if (findError) throw findError;
      if (!exemplar) throw new Error("Nenhum exemplar disponível para esta obra.");

      // 2. Atomic update — check disponivel = true to avoid race condition
      const { data: updated, error: updateError } = await supabase
        .from("exemplares")
        .update({ disponivel: false })
        .eq("id", exemplar.id)
        .eq("disponivel", true)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updated) throw new Error("Exemplar já emprestado, tente novamente.");

      // 3. Insert emprestimo
      const { data: emprestimo, error: insertError } = await supabase
        .from("emprestimos")
        .insert({
          exemplar_id: exemplar.id,
          pessoa_id: payload.pessoa_id,
          data_prevista_devolucao: payload.data_prevista_devolucao || null,
          observacao: payload.observacao || null,
        })
        .select()
        .single();

      if (insertError) {
        // Rollback exemplar availability
        await supabase.from("exemplares").update({ disponivel: true }).eq("id", exemplar.id);
        throw insertError;
      }

      return emprestimo;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obras"] });
      qc.invalidateQueries({ queryKey: ["emprestimos"] });
      qc.invalidateQueries({ queryKey: ["biblioteca_dashboard"] });
    },
  });
};

export const useRegistrarDevolucao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("emprestimos")
        .update({ data_devolucao: today, devolucao_aprovada: false })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emprestimos"] });
      qc.invalidateQueries({ queryKey: ["biblioteca_dashboard"] });
    },
  });
};

export const useAprovarDevolucao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, exemplar_id }: { id: string; exemplar_id: string }) => {
      const { error: empError } = await supabase
        .from("emprestimos")
        .update({ devolucao_aprovada: true })
        .eq("id", id);
      if (empError) throw empError;

      const { error: exError } = await supabase
        .from("exemplares")
        .update({ disponivel: true })
        .eq("id", exemplar_id);
      if (exError) throw exError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emprestimos"] });
      qc.invalidateQueries({ queryKey: ["obras"] });
      qc.invalidateQueries({ queryKey: ["biblioteca_dashboard"] });
    },
  });
};

// ---- Dashboard ----
export const useBibliotecaDashboard = () =>
  useQuery({
    queryKey: ["biblioteca_dashboard"],
    queryFn: async () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [exemplaresRes, emprestimosRes] = await Promise.all([
        supabase.from("exemplares").select("disponivel"),
        supabase.from("emprestimos").select("data_emprestimo, data_devolucao, data_prevista_devolucao, devolucao_aprovada"),
      ]);

      if (exemplaresRes.error) throw exemplaresRes.error;
      if (emprestimosRes.error) throw emprestimosRes.error;

      const exemplares = exemplaresRes.data || [];
      const emprestimos = emprestimosRes.data || [];

      const disponiveis = exemplares.filter((e) => e.disponivel).length;
      const emprestados = exemplares.filter((e) => !e.disponivel).length;

      const atrasados = emprestimos.filter(
        (e) => !e.data_devolucao && e.data_prevista_devolucao && e.data_prevista_devolucao < today
      ).length;

      const emprestimosDoMes = emprestimos.filter((e) => e.data_emprestimo >= firstOfMonth).length;
      const devolucoesDoMes = emprestimos.filter(
        (e) => e.data_devolucao && e.data_devolucao >= firstOfMonth && e.devolucao_aprovada
      ).length;

      return { disponiveis, emprestados, atrasados, emprestimosDoMes, devolucoesDoMes };
    },
  });

// ---- Pessoas (for biblioteca select) ----
export const usePessoasBiblioteca = () =>
  useQuery({
    queryKey: ["pessoas_biblioteca"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome")
        .eq("situacao", "Ativo")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
