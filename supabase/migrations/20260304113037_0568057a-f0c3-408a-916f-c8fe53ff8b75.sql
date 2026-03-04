
-- Drop all existing restrictive policies on usuarios
DROP POLICY IF EXISTS "Congal ou primeiro usuario pode inserir" ON public.usuarios;
DROP POLICY IF EXISTS "Congal pode atualizar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Congal pode deletar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários visíveis para autenticados" ON public.usuarios;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Usuarios visiveis para autenticados"
  ON public.usuarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Congal ou primeiro usuario pode inserir"
  ON public.usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    has_perfil(auth.uid(), 'congal'::app_perfil)
    OR NOT EXISTS (SELECT 1 FROM public.usuarios)
  );

CREATE POLICY "Congal pode atualizar usuarios"
  ON public.usuarios FOR UPDATE
  TO authenticated
  USING (has_perfil(auth.uid(), 'congal'::app_perfil));

CREATE POLICY "Congal pode deletar usuarios"
  ON public.usuarios FOR DELETE
  TO authenticated
  USING (has_perfil(auth.uid(), 'congal'::app_perfil));

-- Drop all existing restrictive policies on perfis
DROP POLICY IF EXISTS "Perfis visíveis para autenticados" ON public.perfis;
DROP POLICY IF EXISTS "Congal pode inserir perfis" ON public.perfis;
DROP POLICY IF EXISTS "Congal pode atualizar perfis" ON public.perfis;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Perfis visiveis para autenticados"
  ON public.perfis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Congal pode inserir perfis"
  ON public.perfis FOR INSERT
  TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'congal'::app_perfil));

CREATE POLICY "Congal pode atualizar perfis"
  ON public.perfis FOR UPDATE
  TO authenticated
  USING (has_perfil(auth.uid(), 'congal'::app_perfil));
