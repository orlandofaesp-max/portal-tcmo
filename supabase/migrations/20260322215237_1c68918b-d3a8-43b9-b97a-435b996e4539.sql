
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE IF NOT EXISTS public.staging_pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  data_nascimento date
);

CREATE TABLE IF NOT EXISTS public.de_para_pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_origem text,
  nome_destino text,
  pessoa_id_destino uuid,
  score numeric,
  revisado boolean DEFAULT false,
  aprovado boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.staging_pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.de_para_pessoas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin pode visualizar staging_pessoas" ON public.staging_pessoas
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador','congal')));

CREATE POLICY "Admin pode inserir staging_pessoas" ON public.staging_pessoas
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador','congal')));

CREATE POLICY "Admin pode deletar staging_pessoas" ON public.staging_pessoas
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador','congal')));

CREATE POLICY "Admin pode visualizar de_para_pessoas" ON public.de_para_pessoas
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador','congal')));

CREATE POLICY "Admin pode inserir de_para_pessoas" ON public.de_para_pessoas
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador','congal')));

CREATE POLICY "Admin pode atualizar de_para_pessoas" ON public.de_para_pessoas
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador','congal')));

CREATE POLICY "Admin pode deletar de_para_pessoas" ON public.de_para_pessoas
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador','congal')));
