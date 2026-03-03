
-- Enum para perfis do sistema
CREATE TYPE public.app_perfil AS ENUM ('congal', 'tesouraria', 'secretaria', 'biblioteca', 'almoxarifado', 'acervo');

-- Tabela de perfis (descrição dos perfis)
CREATE TABLE public.perfis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome public.app_perfil NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de usuários do sistema
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  perfil public.app_perfil NOT NULL DEFAULT 'tesouraria',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Função security definer para verificar perfil do usuário
CREATE OR REPLACE FUNCTION public.has_perfil(_user_id UUID, _perfil public.app_perfil)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE user_id = _user_id
      AND perfil = _perfil
      AND ativo = true
  )
$$;

-- Função para verificar se o usuário está ativo
CREATE OR REPLACE FUNCTION public.is_usuario_ativo(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE user_id = _user_id
      AND ativo = true
  )
$$;

-- Políticas para perfis (todos autenticados podem ler)
CREATE POLICY "Perfis visíveis para autenticados"
  ON public.perfis FOR SELECT
  TO authenticated
  USING (true);

-- Apenas Congal pode gerenciar perfis
CREATE POLICY "Congal pode inserir perfis"
  ON public.perfis FOR INSERT
  TO authenticated
  WITH CHECK (public.has_perfil(auth.uid(), 'congal'));

CREATE POLICY "Congal pode atualizar perfis"
  ON public.perfis FOR UPDATE
  TO authenticated
  USING (public.has_perfil(auth.uid(), 'congal'));

-- Políticas para usuários
CREATE POLICY "Usuários visíveis para autenticados"
  ON public.usuarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Congal pode inserir usuários"
  ON public.usuarios FOR INSERT
  TO authenticated
  WITH CHECK (public.has_perfil(auth.uid(), 'congal'));

CREATE POLICY "Congal pode atualizar usuários"
  ON public.usuarios FOR UPDATE
  TO authenticated
  USING (public.has_perfil(auth.uid(), 'congal'));

CREATE POLICY "Congal pode deletar usuários"
  ON public.usuarios FOR DELETE
  TO authenticated
  USING (public.has_perfil(auth.uid(), 'congal'));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir perfis iniciais
INSERT INTO public.perfis (nome, descricao) VALUES
  ('congal', 'Conselho Geral - Administração total do sistema'),
  ('tesouraria', 'Acesso ao módulo financeiro (Mensalidades, Livro Caixa, Demonstrações)'),
  ('secretaria', 'Acesso ao módulo de Secretaria'),
  ('biblioteca', 'Acesso ao módulo de Biblioteca'),
  ('almoxarifado', 'Acesso ao módulo de Almoxarifado'),
  ('acervo', 'Acesso ao módulo de Acervo Histórico');
