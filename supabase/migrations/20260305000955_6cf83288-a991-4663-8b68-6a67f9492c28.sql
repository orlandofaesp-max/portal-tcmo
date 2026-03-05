
-- categorias_acervo
CREATE TABLE public.categorias_acervo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categorias_acervo ENABLE ROW LEVEL SECURITY;

-- registros_acervo
CREATE TABLE public.registros_acervo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL CHECK (tipo IN ('entrevista','documento','evento','foto','video')),
  data_evento date,
  pessoa_id uuid REFERENCES public.pessoas(id) ON DELETE SET NULL,
  categoria_id uuid REFERENCES public.categorias_acervo(id) ON DELETE SET NULL,
  criado_por uuid REFERENCES public.usuarios(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.registros_acervo ENABLE ROW LEVEL SECURITY;

-- arquivos_acervo
CREATE TABLE public.arquivos_acervo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id uuid NOT NULL REFERENCES public.registros_acervo(id) ON DELETE CASCADE,
  nome_arquivo text NOT NULL,
  url text NOT NULL,
  tipo_arquivo text,
  tamanho bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.arquivos_acervo ENABLE ROW LEVEL SECURITY;

-- eventos_historicos
CREATE TABLE public.eventos_historicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  data_evento date NOT NULL,
  registro_id uuid REFERENCES public.registros_acervo(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eventos_historicos ENABLE ROW LEVEL SECURITY;

-- Indices (7)
CREATE INDEX idx_registros_tipo ON public.registros_acervo (tipo);
CREATE INDEX idx_registros_categoria ON public.registros_acervo (categoria_id);
CREATE INDEX idx_registros_pessoa ON public.registros_acervo (pessoa_id);
CREATE INDEX idx_registros_data_evento ON public.registros_acervo (data_evento);
CREATE INDEX idx_registros_categoria_data ON public.registros_acervo (categoria_id, data_evento);
CREATE INDEX idx_eventos_data ON public.eventos_historicos (data_evento);
CREATE INDEX idx_arquivos_registro ON public.arquivos_acervo (registro_id);

-- Storage bucket (privado, idempotente)
INSERT INTO storage.buckets (id, name, public)
VALUES ('acervo', 'acervo', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: categorias_acervo
CREATE POLICY "Acervo leitura categorias_acervo" ON public.categorias_acervo
  FOR SELECT TO authenticated
  USING (
    has_perfil(auth.uid(), 'acervo'::app_perfil)
    OR has_perfil(auth.uid(), 'secretaria'::app_perfil)
    OR has_perfil(auth.uid(), 'congal'::app_perfil)
  );
CREATE POLICY "Acervo escrita categorias_acervo" ON public.categorias_acervo
  FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo update categorias_acervo" ON public.categorias_acervo
  FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo delete categorias_acervo" ON public.categorias_acervo
  FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));

-- RLS: registros_acervo
CREATE POLICY "Acervo leitura registros_acervo" ON public.registros_acervo
  FOR SELECT TO authenticated
  USING (
    has_perfil(auth.uid(), 'acervo'::app_perfil)
    OR has_perfil(auth.uid(), 'secretaria'::app_perfil)
    OR has_perfil(auth.uid(), 'congal'::app_perfil)
  );
CREATE POLICY "Acervo escrita registros_acervo" ON public.registros_acervo
  FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo update registros_acervo" ON public.registros_acervo
  FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo delete registros_acervo" ON public.registros_acervo
  FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));

-- RLS: arquivos_acervo
CREATE POLICY "Acervo leitura arquivos_acervo" ON public.arquivos_acervo
  FOR SELECT TO authenticated
  USING (
    has_perfil(auth.uid(), 'acervo'::app_perfil)
    OR has_perfil(auth.uid(), 'secretaria'::app_perfil)
    OR has_perfil(auth.uid(), 'congal'::app_perfil)
  );
CREATE POLICY "Acervo escrita arquivos_acervo" ON public.arquivos_acervo
  FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo update arquivos_acervo" ON public.arquivos_acervo
  FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo delete arquivos_acervo" ON public.arquivos_acervo
  FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));

-- RLS: eventos_historicos
CREATE POLICY "Acervo leitura eventos_historicos" ON public.eventos_historicos
  FOR SELECT TO authenticated
  USING (
    has_perfil(auth.uid(), 'acervo'::app_perfil)
    OR has_perfil(auth.uid(), 'secretaria'::app_perfil)
    OR has_perfil(auth.uid(), 'congal'::app_perfil)
  );
CREATE POLICY "Acervo escrita eventos_historicos" ON public.eventos_historicos
  FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo update eventos_historicos" ON public.eventos_historicos
  FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo delete eventos_historicos" ON public.eventos_historicos
  FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));

-- Storage RLS
CREATE POLICY "Acervo leitura storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'acervo' AND (
    has_perfil(auth.uid(), 'acervo'::app_perfil)
    OR has_perfil(auth.uid(), 'secretaria'::app_perfil)
    OR has_perfil(auth.uid(), 'congal'::app_perfil)
  ));
CREATE POLICY "Acervo upload storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'acervo' AND has_perfil(auth.uid(), 'acervo'::app_perfil));
CREATE POLICY "Acervo delete storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'acervo' AND has_perfil(auth.uid(), 'acervo'::app_perfil));

-- Policy em pessoas para acervo
CREATE POLICY "Acervo pode visualizar pessoas" ON public.pessoas
  FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));
