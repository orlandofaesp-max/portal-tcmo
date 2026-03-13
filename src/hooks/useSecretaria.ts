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

// ---- Observações Internas (administrativo — permanece na Secretaria) ----
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
