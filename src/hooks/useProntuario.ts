import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const useAllEntidades = () =>
  useQuery({
    queryKey: ["entidades_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entidades")
        .select("*, pessoas(nome)")
        .eq("ativa", true)
        .order("linha");
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
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["entidades", v.pessoa_id] });
      qc.invalidateQueries({ queryKey: ["entidades_all"] });
    },
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
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["entidades", d.pessoa_id] });
      qc.invalidateQueries({ queryKey: ["entidades_all"] });
    },
  });
};

export const useDeleteEntidade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id }: { id: string; pessoa_id: string }) => {
      const { error } = await supabase.from("entidades").update({ ativa: false }).eq("id", id);
      if (error) throw error;
      return pessoa_id;
    },
    onSuccess: (pessoaId) => {
      qc.invalidateQueries({ queryKey: ["entidades", pessoaId] });
      qc.invalidateQueries({ queryKey: ["entidades_all"] });
    },
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

// ---- Ficha de Corrente ----
export const useFichaCorrente = (pessoaId: string | undefined) =>
  useQuery({
    queryKey: ["ficha_corrente", pessoaId],
    enabled: !!pessoaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ficha_corrente")
        .select("*")
        .eq("pessoa_id", pessoaId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useUpsertFichaCorrente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      pessoa_id: string;
      ingresso_umbanda?: string | null;
      batizado_umbanda?: string | null;
      casamento_umbanda?: string | null;
      padrinho_espiritual?: string | null;
      padrinho_material?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("ficha_corrente")
        .upsert(payload, { onConflict: "pessoa_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["ficha_corrente", v.pessoa_id] }),
  });
};

// ---- Ocorrências Mediúnicas ----
export const useOcorrencias = (pessoaId?: string) =>
  useQuery({
    queryKey: ["ocorrencias_mediunicas", pessoaId],
    queryFn: async () => {
      let query = supabase.from("ocorrencias_mediunicas").select("*, pessoas(nome)").order("data", { ascending: false });
      if (pessoaId) query = query.eq("pessoa_id", pessoaId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useCreateOcorrencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; data?: string; descricao?: string | null; responsavel?: string | null }) => {
      const { data, error } = await supabase.from("ocorrencias_mediunicas").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ocorrencias_mediunicas"] }),
  });
};

export const useDeleteOcorrencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ocorrencias_mediunicas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ocorrencias_mediunicas"] }),
  });
};

// ---- Linhagem Espiritual ----
export const useLinhagem = () =>
  useQuery({
    queryKey: ["linhagem_espiritual"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("linhagem_espiritual")
        .select("*, pessoas!linhagem_espiritual_pessoa_id_fkey(nome), mentor:pessoas!linhagem_espiritual_mentor_id_fkey(nome)")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

export const useCreateLinhagem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; mentor_id?: string | null; tipo_vinculo: string }) => {
      const { data, error } = await supabase.from("linhagem_espiritual").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["linhagem_espiritual"] }),
  });
};

export const useDeleteLinhagem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("linhagem_espiritual").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["linhagem_espiritual"] }),
  });
};

// ---- Timeline ----
export const useTimeline = () =>
  useQuery({
    queryKey: ["timeline_eventos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timeline_eventos")
        .select("*")
        .order("data_evento", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateTimelineEvento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { titulo: string; descricao?: string | null; data_evento: string; tipo_evento: string; origem_modulo?: string | null; registro_id?: string | null }) => {
      const { data, error } = await supabase.from("timeline_eventos").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timeline_eventos"] }),
  });
};

// ---- Médiuns (pessoas com vínculo espiritual) ----
export const useMediuns = () =>
  useQuery({
    queryKey: ["mediuns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("ativo_espiritual", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
