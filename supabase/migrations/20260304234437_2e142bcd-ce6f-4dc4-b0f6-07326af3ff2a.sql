
-- categorias_almoxarifado
CREATE TABLE public.categorias_almoxarifado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categorias_almoxarifado ENABLE ROW LEVEL SECURITY;

-- itens_almoxarifado
CREATE TABLE public.itens_almoxarifado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria_id uuid NOT NULL REFERENCES public.categorias_almoxarifado(id) ON DELETE RESTRICT,
  unidade_medida text NOT NULL,
  estoque_minimo numeric NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.itens_almoxarifado ENABLE ROW LEVEL SECURITY;

-- movimentacoes_almoxarifado
CREATE TABLE public.movimentacoes_almoxarifado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.itens_almoxarifado(id) ON DELETE RESTRICT,
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE RESTRICT,
  tipo text NOT NULL CHECK (tipo IN ('entrada','saida','ajuste')),
  quantidade numeric NOT NULL CHECK (quantidade > 0),
  data_movimento date NOT NULL DEFAULT CURRENT_DATE,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.movimentacoes_almoxarifado ENABLE ROW LEVEL SECURITY;

-- Indices (6 total)
CREATE INDEX idx_itens_categoria ON public.itens_almoxarifado (categoria_id);
CREATE INDEX idx_movimentacoes_item ON public.movimentacoes_almoxarifado (item_id);
CREATE INDEX idx_movimentacoes_data ON public.movimentacoes_almoxarifado (data_movimento);
CREATE INDEX idx_movimentacoes_pessoa ON public.movimentacoes_almoxarifado (pessoa_id);
CREATE INDEX idx_movimentacoes_item_tipo ON public.movimentacoes_almoxarifado (item_id, tipo);
CREATE INDEX idx_movimentacoes_data_item ON public.movimentacoes_almoxarifado (data_movimento, item_id);

-- RLS policies: categorias_almoxarifado
CREATE POLICY "Autenticados podem visualizar categorias_almoxarifado"
  ON public.categorias_almoxarifado FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Almoxarifado pode inserir categorias_almoxarifado"
  ON public.categorias_almoxarifado FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));

CREATE POLICY "Almoxarifado pode atualizar categorias_almoxarifado"
  ON public.categorias_almoxarifado FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));

CREATE POLICY "Almoxarifado pode deletar categorias_almoxarifado"
  ON public.categorias_almoxarifado FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));

-- RLS policies: itens_almoxarifado
CREATE POLICY "Autenticados podem visualizar itens_almoxarifado"
  ON public.itens_almoxarifado FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Almoxarifado pode inserir itens_almoxarifado"
  ON public.itens_almoxarifado FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));

CREATE POLICY "Almoxarifado pode atualizar itens_almoxarifado"
  ON public.itens_almoxarifado FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));

CREATE POLICY "Almoxarifado pode deletar itens_almoxarifado"
  ON public.itens_almoxarifado FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));

-- RLS policies: movimentacoes_almoxarifado
CREATE POLICY "Autenticados podem visualizar movimentacoes_almoxarifado"
  ON public.movimentacoes_almoxarifado FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem inserir movimentacoes_almoxarifado"
  ON public.movimentacoes_almoxarifado FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Almoxarifado pode atualizar movimentacoes_almoxarifado"
  ON public.movimentacoes_almoxarifado FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));

CREATE POLICY "Almoxarifado pode deletar movimentacoes_almoxarifado"
  ON public.movimentacoes_almoxarifado FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));

-- Policy em pessoas para almoxarifado
CREATE POLICY "Almoxarifado pode visualizar pessoas"
  ON public.pessoas FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));
