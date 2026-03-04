
-- Add columns to entidades
ALTER TABLE public.entidades ADD COLUMN IF NOT EXISTS data_manifestacao date;
ALTER TABLE public.entidades ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;

-- Drop DELETE policy on entidades (soft-delete instead)
DROP POLICY IF EXISTS "Secretaria pode deletar entidades" ON public.entidades;

-- Create observacoes_internas table
CREATE TABLE IF NOT EXISTS public.observacoes_internas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,
  autor text,
  observacao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_observacoes_pessoa_id ON public.observacoes_internas (pessoa_id);

ALTER TABLE public.observacoes_internas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Secretaria e Congal podem visualizar observacoes_internas"
  ON public.observacoes_internas FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));

CREATE POLICY "Secretaria pode inserir observacoes_internas"
  ON public.observacoes_internas FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'secretaria'::app_perfil));

CREATE POLICY "Secretaria pode atualizar observacoes_internas"
  ON public.observacoes_internas FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil));

CREATE POLICY "Secretaria pode deletar observacoes_internas"
  ON public.observacoes_internas FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil));
