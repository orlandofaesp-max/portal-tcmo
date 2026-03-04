
-- Fix permissive INSERT policy on emprestimos to be explicit
DROP POLICY "Autenticados podem inserir emprestimos" ON public.emprestimos;
CREATE POLICY "Autenticados podem inserir emprestimos"
  ON public.emprestimos FOR INSERT TO authenticated
  WITH CHECK (
    has_perfil(auth.uid(), 'biblioteca'::app_perfil)
    OR has_perfil(auth.uid(), 'tesouraria'::app_perfil)
    OR has_perfil(auth.uid(), 'secretaria'::app_perfil)
    OR has_perfil(auth.uid(), 'congal'::app_perfil)
    OR has_perfil(auth.uid(), 'almoxarifado'::app_perfil)
    OR has_perfil(auth.uid(), 'acervo'::app_perfil)
  );
