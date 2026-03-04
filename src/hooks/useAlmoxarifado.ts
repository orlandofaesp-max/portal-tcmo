import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---- Categorias Almoxarifado ----
export const useCategoriasAlmoxarifado = () =>
  useQuery({
    queryKey: ["categorias_almoxarifado"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias_almoxarifado").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

export const useCreateCategoriaAlmoxarifado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nome: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("categorias_almoxarifado").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_almoxarifado"] }),
  });
};

export const useUpdateCategoriaAlmoxarifado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; nome?: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("categorias_almoxarifado").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_almoxarifado"] }),
  });
};

export const useDeleteCategoriaAlmoxarifado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias_almoxarifado").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_almoxarifado"] }),
  });
};

// ---- Itens Almoxarifado ----
export const useItensAlmoxarifado = () =>
  useQuery({
    queryKey: ["itens_almoxarifado"],
    queryFn: async () => {
      // Fetch items with category
      const { data: itens, error: itensError } = await supabase
        .from("itens_almoxarifado")
        .select("*, categorias_almoxarifado(nome)")
        .order("nome");
      if (itensError) throw itensError;

      // Fetch all movements to calculate balances
      const { data: movs, error: movsError } = await supabase
        .from("movimentacoes_almoxarifado")
        .select("item_id, tipo, quantidade");
      if (movsError) throw movsError;

      // Calculate balance per item: entrada/ajuste add, saida subtracts
      const saldoMap: Record<string, number> = {};
      for (const m of movs || []) {
        const delta = m.tipo === "saida" ? -m.quantidade : m.quantidade;
        saldoMap[m.item_id] = (saldoMap[m.item_id] || 0) + delta;
      }

      return (itens || []).map((item) => ({
        ...item,
        saldo: saldoMap[item.id] || 0,
        diferenca: (saldoMap[item.id] || 0) - item.estoque_minimo,
      }));
    },
  });

export const useCreateItemAlmoxarifado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nome: string; categoria_id: string; unidade_medida: string; estoque_minimo?: number }) => {
      const { data, error } = await supabase.from("itens_almoxarifado").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens_almoxarifado"] });
      qc.invalidateQueries({ queryKey: ["almoxarifado_dashboard"] });
    },
  });
};

export const useUpdateItemAlmoxarifado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; nome?: string; categoria_id?: string; unidade_medida?: string; estoque_minimo?: number; ativo?: boolean }) => {
      const { data, error } = await supabase.from("itens_almoxarifado").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens_almoxarifado"] });
      qc.invalidateQueries({ queryKey: ["almoxarifado_dashboard"] });
    },
  });
};

export const useDeleteItemAlmoxarifado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("itens_almoxarifado").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens_almoxarifado"] });
      qc.invalidateQueries({ queryKey: ["almoxarifado_dashboard"] });
    },
  });
};

// ---- Movimentações ----
export const useMovimentacoesAlmoxarifado = () =>
  useQuery({
    queryKey: ["movimentacoes_almoxarifado"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimentacoes_almoxarifado")
        .select("*, itens_almoxarifado(nome, unidade_medida), pessoas(nome)")
        .order("data_movimento", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateMovimentacao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { item_id: string; pessoa_id: string; tipo: string; quantidade: number; data_movimento?: string; observacao?: string | null }) => {
      const { data, error } = await supabase.from("movimentacoes_almoxarifado").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimentacoes_almoxarifado"] });
      qc.invalidateQueries({ queryKey: ["itens_almoxarifado"] });
      qc.invalidateQueries({ queryKey: ["almoxarifado_dashboard"] });
    },
  });
};

// ---- Pessoas (for selects) ----
export const usePessoasAlmoxarifado = () =>
  useQuery({
    queryKey: ["pessoas_almoxarifado"],
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

// ---- Dashboard ----
export const useAlmoxarifadoDashboard = () =>
  useQuery({
    queryKey: ["almoxarifado_dashboard"],
    queryFn: async () => {
      const now = new Date();
      const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [itensRes, movsRes] = await Promise.all([
        supabase.from("itens_almoxarifado").select("id, estoque_minimo, ativo").eq("ativo", true),
        supabase.from("movimentacoes_almoxarifado").select("item_id, tipo, quantidade, data_movimento"),
      ]);

      if (itensRes.error) throw itensRes.error;
      if (movsRes.error) throw movsRes.error;

      const itens = itensRes.data || [];
      const movs = movsRes.data || [];

      // Calculate balances
      const saldoMap: Record<string, number> = {};
      let entradasMes = 0;
      let saidasMes = 0;

      for (const m of movs) {
        const delta = m.tipo === "saida" ? -m.quantidade : m.quantidade;
        saldoMap[m.item_id] = (saldoMap[m.item_id] || 0) + delta;

        if (m.data_movimento >= firstOfMonth) {
          if (m.tipo === "entrada" || m.tipo === "ajuste") entradasMes += m.quantidade;
          if (m.tipo === "saida") saidasMes += m.quantidade;
        }
      }

      const totalItens = itens.length;
      const abaixoMinimo = itens.filter((i) => (saldoMap[i.id] || 0) < i.estoque_minimo).length;

      return { totalItens, abaixoMinimo, entradasMes, saidasMes };
    },
  });
