import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---- Categorias Acervo ----
export const useCategoriasAcervo = () =>
  useQuery({
    queryKey: ["categorias_acervo"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias_acervo").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

export const useCreateCategoriaAcervo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nome: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("categorias_acervo").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_acervo"] }),
  });
};

export const useUpdateCategoriaAcervo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; nome?: string; descricao?: string | null }) => {
      const { data, error } = await supabase.from("categorias_acervo").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_acervo"] }),
  });
};

export const useDeleteCategoriaAcervo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias_acervo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias_acervo"] }),
  });
};

// ---- Registros Acervo ----
export const useRegistrosAcervo = () =>
  useQuery({
    queryKey: ["registros_acervo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros_acervo")
        .select("*, pessoas(nome), categorias_acervo(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useRegistroAcervo = (id: string | undefined) =>
  useQuery({
    queryKey: ["registro_acervo", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros_acervo")
        .select("*, pessoas(nome), categorias_acervo(nome), arquivos_acervo(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

export const useCreateRegistroAcervo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      titulo: string;
      descricao?: string | null;
      tipo: string;
      data_evento?: string | null;
      pessoa_id?: string | null;
      categoria_id?: string | null;
    }) => {
      const { data, error } = await supabase.from("registros_acervo").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros_acervo"] });
      qc.invalidateQueries({ queryKey: ["acervo_dashboard"] });
    },
  });
};

export const useUpdateRegistroAcervo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: {
      id: string;
      titulo?: string;
      descricao?: string | null;
      tipo?: string;
      data_evento?: string | null;
      pessoa_id?: string | null;
      categoria_id?: string | null;
    }) => {
      const { data, error } = await supabase.from("registros_acervo").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["registros_acervo"] });
      qc.invalidateQueries({ queryKey: ["registro_acervo", vars.id] });
      qc.invalidateQueries({ queryKey: ["acervo_dashboard"] });
    },
  });
};

export const useDeleteRegistroAcervo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registros_acervo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros_acervo"] });
      qc.invalidateQueries({ queryKey: ["acervo_dashboard"] });
    },
  });
};

// ---- Arquivos ----
export const useArquivosRegistro = (registroId: string | undefined) =>
  useQuery({
    queryKey: ["arquivos_acervo", registroId],
    enabled: !!registroId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("arquivos_acervo")
        .select("*")
        .eq("registro_id", registroId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useUploadArquivoAcervo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ registroId, file }: { registroId: string; file: File }) => {
      const filePath = `${registroId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("acervo").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("acervo").getPublicUrl(filePath);

      const { data, error } = await supabase.from("arquivos_acervo").insert({
        registro_id: registroId,
        nome_arquivo: file.name,
        url: urlData.publicUrl,
        tipo_arquivo: file.type || null,
        tamanho: file.size,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["arquivos_acervo", data.registro_id] });
      qc.invalidateQueries({ queryKey: ["registro_acervo", data.registro_id] });
    },
  });
};

export const useDeleteArquivoAcervo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, url, registroId }: { id: string; url: string; registroId: string }) => {
      // Extract path from URL
      const bucketUrl = supabase.storage.from("acervo").getPublicUrl("").data.publicUrl;
      const filePath = url.replace(bucketUrl, "");
      if (filePath) {
        await supabase.storage.from("acervo").remove([filePath]);
      }
      const { error } = await supabase.from("arquivos_acervo").delete().eq("id", id);
      if (error) throw error;
      return { registroId };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["arquivos_acervo", result.registroId] });
      qc.invalidateQueries({ queryKey: ["registro_acervo", result.registroId] });
    },
  });
};

// ---- Pessoas (for selects) ----
export const usePessoasAcervo = () =>
  useQuery({
    queryKey: ["pessoas_acervo"],
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

// ---- Eventos Históricos ----
export const useEventosHistoricos = () =>
  useQuery({
    queryKey: ["eventos_historicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eventos_historicos")
        .select("*, registros_acervo(titulo)")
        .order("data_evento", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCreateEventoHistorico = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      titulo: string;
      descricao?: string | null;
      data_evento: string;
      registro_id?: string | null;
    }) => {
      const { data, error } = await supabase.from("eventos_historicos").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eventos_historicos"] });
      qc.invalidateQueries({ queryKey: ["acervo_dashboard"] });
    },
  });
};

export const useUpdateEventoHistorico = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: {
      id: string;
      titulo?: string;
      descricao?: string | null;
      data_evento?: string;
      registro_id?: string | null;
    }) => {
      const { data, error } = await supabase.from("eventos_historicos").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eventos_historicos"] });
      qc.invalidateQueries({ queryKey: ["acervo_dashboard"] });
    },
  });
};

export const useDeleteEventoHistorico = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("eventos_historicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eventos_historicos"] });
      qc.invalidateQueries({ queryKey: ["acervo_dashboard"] });
    },
  });
};

// ---- Dashboard ----
export const useAcervoDashboard = () =>
  useQuery({
    queryKey: ["acervo_dashboard"],
    queryFn: async () => {
      const [registrosRes, eventosRes] = await Promise.all([
        supabase.from("registros_acervo").select("id, tipo"),
        supabase.from("eventos_historicos").select("id"),
      ]);

      if (registrosRes.error) throw registrosRes.error;
      if (eventosRes.error) throw eventosRes.error;

      const registros = registrosRes.data || [];
      const totalRegistros = registros.length;
      const entrevistas = registros.filter((r) => r.tipo === "entrevista").length;
      const documentos = registros.filter((r) => r.tipo === "documento").length;
      const totalEventos = (eventosRes.data || []).length;

      return { totalRegistros, entrevistas, documentos, totalEventos };
    },
  });
