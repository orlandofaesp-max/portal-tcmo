import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Associado = Tables<"associados">;
export type CategoriaFinanceira = Tables<"categorias_financeiras">;
export type Lancamento = Tables<"lancamentos">;
export type Mensalidade = Tables<"mensalidades">;

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

// ============ ASSOCIADOS ============

export const useAssociados = () =>
  useQuery({
    queryKey: ["associados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("associados")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Associado[];
    },
  });

export const useCreateAssociado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"associados">) => {
      const { data, error } = await supabase.from("associados").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["associados"] }),
  });
};

export const useUpdateAssociado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: TablesUpdate<"associados"> & { id: string }) => {
      const { data, error } = await supabase.from("associados").update(input).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["associados"] }),
  });
};

// ============ CATEGORIAS ============

export const useCategorias = () =>
  useQuery({
    queryKey: ["categorias_financeiras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias_financeiras")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as CategoriaFinanceira[];
    },
  });

export const useCreateCategoria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"categorias_financeiras">) => {
      const { data, error } = await supabase.from("categorias_financeiras").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_financeiras"] }),
  });
};

export const useUpdateCategoria = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: TablesUpdate<"categorias_financeiras"> & { id: string }) => {
      const { data, error } = await supabase.from("categorias_financeiras").update(input).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_financeiras"] }),
  });
};

// ============ LANCAMENTOS ============

export const useLancamentos = () =>
  useQuery({
    queryKey: ["lancamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos")
        .select("*, categorias_financeiras(nome), associados(nome)")
        .order("data", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useCreateLancamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"lancamentos">) => {
      const { data, error } = await supabase.from("lancamentos").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lancamentos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateLancamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: TablesUpdate<"lancamentos"> & { id: string }) => {
      const { data, error } = await supabase.from("lancamentos").update(input).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lancamentos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// ============ MENSALIDADES ============

export const useMensalidades = () =>
  useQuery({
    queryKey: ["mensalidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mensalidades")
        .select("*, associados(nome, numero, mensalidade_valor)")
        .order("competencia", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateMensalidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<"mensalidades">) => {
      const { data, error } = await supabase.from("mensalidades").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mensalidades"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateMensalidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: TablesUpdate<"mensalidades"> & { id: string }) => {
      const { data, error } = await supabase.from("mensalidades").update(input).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mensalidades"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// ============ FUNDO DE RESERVA ============

export const useFundoReserva = () =>
  useQuery({
    queryKey: ["fundo_reserva"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundo_reserva")
        .select("*")
        .order("data_movimento", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useCreateFundoReserva = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { data_movimento: string; descricao: string; entrada: number; saida: number }) => {
      const { data, error } = await supabase.from("fundo_reserva").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fundo_reserva"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// ============ CONFIGURAÇÕES ============

export const useConfiguracao = (chave: string) =>
  useQuery({
    queryKey: ["configuracoes", chave],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("valor")
        .eq("chave", chave)
        .maybeSingle();
      if (error) throw error;
      return data?.valor ?? null;
    },
  });
