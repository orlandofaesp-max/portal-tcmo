import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---- Pessoas ----
export const usePessoas = () =>
  useQuery({
    queryKey: ["pessoas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

export const usePessoa = (id: string | undefined) =>
  useQuery({
    queryKey: ["pessoas", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

export const useCreatePessoa = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      nome: string;
      data_nascimento?: string | null;
      telefone?: string | null;
      email?: string | null;
      tipo_vinculo?: string | null;
      situacao?: string;
      possui_mensalidade?: boolean;
      data_ingresso_corrente?: string | null;
      observacoes?: string | null;
    }) => {
      const { data, error } = await supabase.from("pessoas").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas"] }),
  });
};

export const useUpdatePessoa = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("pessoas").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas"] }),
  });
};

export const useDeletePessoa = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pessoas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas"] }),
  });
};

// ---- Cruzamentos ----
export const useCruzamentos = (pessoaId: string | undefined) =>
  useQuery({
    queryKey: ["cruzamentos", pessoaId],
    enabled: !!pessoaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cruzamentos")
        .select("*")
        .eq("pessoa_id", pessoaId!)
        .order("data_cruzamento", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateCruzamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; linha?: string | null; serie?: string | null; data_cruzamento?: string | null; observacao?: string | null }) => {
      const { data, error } = await supabase.from("cruzamentos").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["cruzamentos", v.pessoa_id] }),
  });
};

export const useUpdateCruzamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id, ...payload }: { id: string; pessoa_id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("cruzamentos").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return { ...data, pessoa_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["cruzamentos", d.pessoa_id] }),
  });
};

export const useDeleteCruzamento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id }: { id: string; pessoa_id: string }) => {
      const { error } = await supabase.from("cruzamentos").delete().eq("id", id);
      if (error) throw error;
      return pessoa_id;
    },
    onSuccess: (pessoaId) => qc.invalidateQueries({ queryKey: ["cruzamentos", pessoaId] }),
  });
};

// ---- Coroações ----
export const useCoroacoes = (pessoaId: string | undefined) =>
  useQuery({
    queryKey: ["coroacoes", pessoaId],
    enabled: !!pessoaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coroacoes")
        .select("*")
        .eq("pessoa_id", pessoaId!)
        .order("data_coroacao", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateCoroacao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; tipo_coroacao?: string | null; data_coroacao?: string | null; observacao?: string | null }) => {
      const { data, error } = await supabase.from("coroacoes").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["coroacoes", v.pessoa_id] }),
  });
};

export const useDeleteCoroacao = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id }: { id: string; pessoa_id: string }) => {
      const { error } = await supabase.from("coroacoes").delete().eq("id", id);
      if (error) throw error;
      return pessoa_id;
    },
    onSuccess: (pessoaId) => qc.invalidateQueries({ queryKey: ["coroacoes", pessoaId] }),
  });
};

// ---- Entidades ----
export const useEntidades = (pessoaId: string | undefined) =>
  useQuery({
    queryKey: ["entidades", pessoaId],
    enabled: !!pessoaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entidades")
        .select("*")
        .eq("pessoa_id", pessoaId!)
        .eq("ativa", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateEntidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; nome_entidade?: string | null; linha?: string | null; observacao?: string | null; data_manifestacao?: string | null }) => {
      const { data, error } = await supabase.from("entidades").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["entidades", v.pessoa_id] }),
  });
};

export const useUpdateEntidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id, ...payload }: { id: string; pessoa_id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("entidades").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return { ...data, pessoa_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["entidades", d.pessoa_id] }),
  });
};

// Soft-delete: set ativa = false instead of physical delete
export const useDeleteEntidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id }: { id: string; pessoa_id: string }) => {
      const { error } = await supabase.from("entidades").update({ ativa: false }).eq("id", id);
      if (error) throw error;
      return pessoa_id;
    },
    onSuccess: (pessoaId) => qc.invalidateQueries({ queryKey: ["entidades", pessoaId] }),
  });
};

// ---- Histórico Religioso ----
export const useHistoricoReligioso = (pessoaId: string | undefined) =>
  useQuery({
    queryKey: ["historico_religioso", pessoaId],
    enabled: !!pessoaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historico_religioso")
        .select("*")
        .eq("pessoa_id", pessoaId!)
        .order("data_evento", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateHistoricoReligioso = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; tipo_evento?: string | null; data_evento?: string | null; descricao?: string | null }) => {
      const { data, error } = await supabase.from("historico_religioso").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["historico_religioso", v.pessoa_id] }),
  });
};

export const useDeleteHistoricoReligioso = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id }: { id: string; pessoa_id: string }) => {
      const { error } = await supabase.from("historico_religioso").delete().eq("id", id);
      if (error) throw error;
      return pessoa_id;
    },
    onSuccess: (pessoaId) => qc.invalidateQueries({ queryKey: ["historico_religioso", pessoaId] }),
  });
};

// ---- Observações Internas ----
export const useObservacoesInternas = (pessoaId: string | undefined) =>
  useQuery({
    queryKey: ["observacoes_internas", pessoaId],
    enabled: !!pessoaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("observacoes_internas")
        .select("*")
        .eq("pessoa_id", pessoaId!)
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateObservacaoInterna = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; data?: string; autor?: string | null; observacao: string }) => {
      const { data, error } = await supabase.from("observacoes_internas").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["observacoes_internas", v.pessoa_id] }),
  });
};

export const useDeleteObservacaoInterna = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id }: { id: string; pessoa_id: string }) => {
      const { error } = await supabase.from("observacoes_internas").delete().eq("id", id);
      if (error) throw error;
      return pessoa_id;
    },
    onSuccess: (pessoaId) => qc.invalidateQueries({ queryKey: ["observacoes_internas", pessoaId] }),
  });
};
