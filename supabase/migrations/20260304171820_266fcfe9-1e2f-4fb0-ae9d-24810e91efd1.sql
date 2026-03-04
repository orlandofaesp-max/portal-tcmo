
-- =============================================
-- Módulo Secretaria — Tabelas, RLS e Índices
-- =============================================

-- 1) Tabela pessoas
CREATE TABLE public.pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  data_nascimento date,
  telefone text,
  email text,
  tipo_vinculo text,
  situacao text NOT NULL DEFAULT 'Ativo',
  possui_mensalidade boolean NOT NULL DEFAULT false,
  data_ingresso_corrente date,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Tabela cruzamentos
CREATE TABLE public.cruzamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  titulo text NOT NULL DEFAULT 'Cruzamento de Linha',
  linha text,
  data_cruzamento date,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Tabela coroacoes
CREATE TABLE public.coroacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  titulo text NOT NULL DEFAULT 'Coroações',
  tipo_coroacao text,
  data_coroacao date,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Tabela entidades
CREATE TABLE public.entidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  nome_entidade text,
  linha text,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Tabela historico_religioso
CREATE TABLE public.historico_religioso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo_evento text,
  data_evento date,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- RLS — Habilitar e criar políticas
-- =============================================

ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cruzamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coroacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_religioso ENABLE ROW LEVEL SECURITY;

-- Macro para as 5 tabelas: SELECT para secretaria+congal, INSERT/UPDATE/DELETE para secretaria
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['pessoas','cruzamentos','coroacoes','entidades','historico_religioso'])
  LOOP
    EXECUTE format(
      'CREATE POLICY "Secretaria e Congal podem visualizar %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.has_perfil(auth.uid(), ''secretaria''::app_perfil) OR public.has_perfil(auth.uid(), ''congal''::app_perfil))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Secretaria pode inserir %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.has_perfil(auth.uid(), ''secretaria''::app_perfil))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Secretaria pode atualizar %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.has_perfil(auth.uid(), ''secretaria''::app_perfil))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Secretaria pode deletar %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.has_perfil(auth.uid(), ''secretaria''::app_perfil))',
      tbl
    );
  END LOOP;
END;
$$;

-- =============================================
-- Índices de desempenho
-- =============================================

CREATE INDEX idx_cruzamentos_pessoa_id ON public.cruzamentos(pessoa_id);
CREATE INDEX idx_coroacoes_pessoa_id ON public.coroacoes(pessoa_id);
CREATE INDEX idx_entidades_pessoa_id ON public.entidades(pessoa_id);
CREATE INDEX idx_historico_religioso_pessoa_id ON public.historico_religioso(pessoa_id);
