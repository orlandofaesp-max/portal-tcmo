import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAtas = () =>
  useQuery({
    queryKey: ["atas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("atas")
        .select("*")
        .order("data_reuniao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useAta = (id: string | undefined) =>
  useQuery({
    queryKey: ["atas", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("atas").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

export const useCreateAta = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      titulo: string;
      tipo_reuniao?: string | null;
      data_reuniao?: string | null;
      conteudo?: string | null;
      arquivo_original?: string | null;
      status?: string;
    }) => {
      const { data, error } = await supabase.from("atas").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["atas"] }),
  });
};

export const useUpdateAta = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("atas").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["atas"] }),
  });
};

export const useDeleteAta = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("atas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["atas"] }),
  });
};

// ---- Assinaturas ----
export const useAssinaturasAta = (ataId: string | undefined) =>
  useQuery({
    queryKey: ["assinaturas_ata", ataId],
    enabled: !!ataId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assinaturas_ata")
        .select("*")
        .eq("ata_id", ataId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

export const useCreateAssinatura = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { ata_id: string; nome_assinante: string; email_assinante?: string | null }) => {
      const { data, error } = await supabase.from("assinaturas_ata").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["assinaturas_ata", v.ata_id] }),
  });
};

export const useUpdateAssinatura = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ata_id, ...payload }: { id: string; ata_id: string; [key: string]: any }) => {
      const { data, error } = await supabase.from("assinaturas_ata").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return { ...data, ata_id };
    },
    onSuccess: (d) => qc.invalidateQueries({ queryKey: ["assinaturas_ata", d.ata_id] }),
  });
};
