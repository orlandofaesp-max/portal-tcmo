import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---- Correntes ----
export const useCorrentes = () =>
  useQuery({
    queryKey: ["correntes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("correntes").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

export const useCreateCorrente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nome: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("correntes").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["correntes"] }),
  });
};

export const useUpdateCorrente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; nome?: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("correntes").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["correntes"] }),
  });
};

export const useDeleteCorrente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("correntes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["correntes"] }),
  });
};

// ---- Pessoas x Correntes ----
export const usePessoasCorrentes = (correnteId?: string) =>
  useQuery({
    queryKey: ["pessoas_correntes", correnteId],
    queryFn: async () => {
      let query = supabase.from("pessoas_correntes").select("*, pessoas(id, nome, situacao, tipo_vinculo_umbanda, ativo_espiritual), correntes(id, nome)");
      if (correnteId) query = query.eq("corrente_id", correnteId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useCorrentesDaPessoa = (pessoaId?: string) =>
  useQuery({
    queryKey: ["correntes_da_pessoa", pessoaId],
    enabled: !!pessoaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas_correntes")
        .select("*, correntes(id, nome)")
        .eq("pessoa_id", pessoaId!);
      if (error) throw error;
      return data;
    },
  });

export const useVincularPessoaCorrente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; corrente_id: string }) => {
      const { data, error } = await supabase.from("pessoas_correntes").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["pessoas_correntes"] });
      qc.invalidateQueries({ queryKey: ["correntes_da_pessoa", v.pessoa_id] });
    },
  });
};

export const useDesvincularPessoaCorrente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pessoa_id }: { id: string; pessoa_id: string }) => {
      const { error } = await supabase.from("pessoas_correntes").delete().eq("id", id);
      if (error) throw error;
      return pessoa_id;
    },
    onSuccess: (pessoaId) => {
      qc.invalidateQueries({ queryKey: ["pessoas_correntes"] });
      qc.invalidateQueries({ queryKey: ["correntes_da_pessoa", pessoaId] });
    },
  });
};

// ---- Pai/Mãe x Correntes ----
export const usePaiMaeCorrentes = () =>
  useQuery({
    queryKey: ["pai_mae_correntes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pai_mae_correntes").select("*, usuarios(id, nome), correntes(id, nome)");
      if (error) throw error;
      return data;
    },
  });

export const useVincularPaiMaeCorrente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { usuario_id: string; corrente_id: string }) => {
      const { data, error } = await supabase.from("pai_mae_correntes").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pai_mae_correntes"] }),
  });
};

export const useDesvincularPaiMaeCorrente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pai_mae_correntes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pai_mae_correntes"] }),
  });
};

// ---- Cruzamentos Linha (complementar) ----
const LINHAS_ORDEM = ["OXUM", "OGUM", "OXÓSSI", "XANGÔ", "IEMANJÁ", "COSME E DAMIÃO", "PRETO VELHO"];

export const useCruzamentosLinha = (pessoaId?: string) =>
  useQuery({
    queryKey: ["cruzamentos_linha", pessoaId],
    enabled: !!pessoaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cruzamentos_linha")
        .select("*")
        .eq("pessoa_id", pessoaId!)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });

export const useUpsertCruzamentoLinha = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; linha: string; data_cruzamento?: string | null; ordem?: number }) => {
      const { data, error } = await supabase
        .from("cruzamentos_linha")
        .upsert(payload, { onConflict: "pessoa_id,linha" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["cruzamentos_linha", v.pessoa_id] }),
  });
};

// ---- Agenda ----
export const useAgendaCorrente = (correnteId?: string) =>
  useQuery({
    queryKey: ["agenda_corrente", correnteId],
    queryFn: async () => {
      let query = supabase.from("agenda_corrente").select("*, correntes(id, nome)").order("data", { ascending: false });
      if (correnteId) query = query.eq("corrente_id", correnteId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useCreateAgenda = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { corrente_id: string; data: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("agenda_corrente").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda_corrente"] }),
  });
};

export const useDeleteAgenda = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_corrente").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda_corrente"] }),
  });
};

// ---- Frequência ----
export const useFrequencia = (correnteId?: string, data?: string) =>
  useQuery({
    queryKey: ["frequencia_mediuns", correnteId, data],
    enabled: !!correnteId && !!data,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("frequencia_mediuns")
        .select("*, pessoas(id, nome)")
        .eq("corrente_id", correnteId!)
        .eq("data", data!);
      if (error) throw error;
      return rows;
    },
  });

export const useUpsertFrequencia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pessoa_id: string; corrente_id: string; data: string; presente: boolean }) => {
      const { data, error } = await supabase
        .from("frequencia_mediuns")
        .upsert(payload, { onConflict: "pessoa_id,corrente_id,data" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["frequencia_mediuns", v.corrente_id, v.data] }),
  });
};

export { LINHAS_ORDEM };
