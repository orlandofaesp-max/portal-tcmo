
-- Drop existing policy and recreate with bootstrap logic
DROP POLICY IF EXISTS "Congal pode inserir usuários" ON public.usuarios;

CREATE POLICY "Congal ou primeiro usuario pode inserir"
  ON public.usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_perfil(auth.uid(), 'congal')
    OR NOT EXISTS (SELECT 1 FROM public.usuarios)
  );
