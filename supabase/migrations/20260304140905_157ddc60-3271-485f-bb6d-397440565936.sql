
-- Enums
CREATE TYPE public.tipo_financeiro AS ENUM ('entrada', 'saida');
CREATE TYPE public.origem_lancamento AS ENUM ('manual', 'extrato');
CREATE TYPE public.status_mensalidade AS ENUM ('pago', 'em_aberto');

-- Categorias financeiras
CREATE TABLE public.categorias_financeiras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo tipo_financeiro NOT NULL,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Associados
CREATE TABLE public.associados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text,
  nome text NOT NULL,
  mensalidade_valor numeric NOT NULL DEFAULT 30,
  saldo_anterior numeric NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Lancamentos
CREATE TABLE public.lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  tipo tipo_financeiro NOT NULL,
  valor numeric NOT NULL,
  categoria_id uuid NOT NULL REFERENCES public.categorias_financeiras(id),
  associado_id uuid REFERENCES public.associados(id),
  origem origem_lancamento NOT NULL DEFAULT 'manual',
  responsavel text,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Mensalidades
CREATE TABLE public.mensalidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  associado_id uuid NOT NULL REFERENCES public.associados(id),
  competencia text NOT NULL,
  valor numeric NOT NULL,
  status status_mensalidade NOT NULL DEFAULT 'em_aberto',
  data_pagamento date,
  lancamento_id uuid REFERENCES public.lancamentos(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Configuracoes (sem acento)
CREATE TABLE public.configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text NOT NULL UNIQUE,
  valor text NOT NULL
);

-- Índices
CREATE INDEX idx_lancamentos_data ON public.lancamentos(data);
CREATE INDEX idx_lancamentos_categoria_id ON public.lancamentos(categoria_id);
CREATE INDEX idx_mensalidades_competencia ON public.mensalidades(competencia);
CREATE INDEX idx_mensalidades_associado_id ON public.mensalidades(associado_id);

-- RLS
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- SELECT: tesouraria e congal
CREATE POLICY "Tesouraria e Congal podem visualizar categorias"
  ON public.categorias_financeiras FOR SELECT TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria') OR public.has_perfil(auth.uid(), 'congal'));

CREATE POLICY "Tesouraria e Congal podem visualizar associados"
  ON public.associados FOR SELECT TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria') OR public.has_perfil(auth.uid(), 'congal'));

CREATE POLICY "Tesouraria e Congal podem visualizar lancamentos"
  ON public.lancamentos FOR SELECT TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria') OR public.has_perfil(auth.uid(), 'congal'));

CREATE POLICY "Tesouraria e Congal podem visualizar mensalidades"
  ON public.mensalidades FOR SELECT TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria') OR public.has_perfil(auth.uid(), 'congal'));

CREATE POLICY "Tesouraria e Congal podem visualizar configuracoes"
  ON public.configuracoes FOR SELECT TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria') OR public.has_perfil(auth.uid(), 'congal'));

-- INSERT: apenas tesouraria
CREATE POLICY "Tesouraria pode inserir categorias"
  ON public.categorias_financeiras FOR INSERT TO authenticated
  WITH CHECK (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode inserir associados"
  ON public.associados FOR INSERT TO authenticated
  WITH CHECK (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode inserir lancamentos"
  ON public.lancamentos FOR INSERT TO authenticated
  WITH CHECK (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode inserir mensalidades"
  ON public.mensalidades FOR INSERT TO authenticated
  WITH CHECK (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode inserir configuracoes"
  ON public.configuracoes FOR INSERT TO authenticated
  WITH CHECK (public.has_perfil(auth.uid(), 'tesouraria'));

-- UPDATE: apenas tesouraria
CREATE POLICY "Tesouraria pode atualizar categorias"
  ON public.categorias_financeiras FOR UPDATE TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode atualizar associados"
  ON public.associados FOR UPDATE TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode atualizar lancamentos"
  ON public.lancamentos FOR UPDATE TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode atualizar mensalidades"
  ON public.mensalidades FOR UPDATE TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode atualizar configuracoes"
  ON public.configuracoes FOR UPDATE TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria'));

-- SEM política de DELETE em tabelas financeiras (lancamentos, mensalidades)
-- DELETE apenas em categorias, associados e configuracoes (para gestão)
CREATE POLICY "Tesouraria pode deletar categorias"
  ON public.categorias_financeiras FOR DELETE TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode deletar associados"
  ON public.associados FOR DELETE TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria'));

CREATE POLICY "Tesouraria pode deletar configuracoes"
  ON public.configuracoes FOR DELETE TO authenticated
  USING (public.has_perfil(auth.uid(), 'tesouraria'));

-- Seed: categorias iniciais
INSERT INTO public.categorias_financeiras (nome, tipo) VALUES
  ('Mensalidade', 'entrada'),
  ('Doação', 'entrada'),
  ('Contribuição', 'entrada'),
  ('Água', 'saida'),
  ('Energia', 'saida'),
  ('Material', 'saida'),
  ('Manutenção', 'saida'),
  ('Tarifa Bancária', 'saida');

-- Seed: valor padrão mensalidade
INSERT INTO public.configuracoes (chave, valor) VALUES
  ('valor_padrao_mensalidade', '30');
