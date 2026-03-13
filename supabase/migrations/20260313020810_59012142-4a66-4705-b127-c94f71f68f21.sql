
-- 2. Add new columns to pessoas
ALTER TABLE public.pessoas
  ADD COLUMN IF NOT EXISTS numero_associado text,
  ADD COLUMN IF NOT EXISTS nacionalidade text,
  ADD COLUMN IF NOT EXISTS naturalidade text,
  ADD COLUMN IF NOT EXISTS estado_civil text,
  ADD COLUMN IF NOT EXISTS rg text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS nome_pai text,
  ADD COLUMN IF NOT EXISTS nome_mae text,
  ADD COLUMN IF NOT EXISTS data_admissao date,
  ADD COLUMN IF NOT EXISTS data_emissao_ficha date,
  ADD COLUMN IF NOT EXISTS data_demissao date,
  ADD COLUMN IF NOT EXISTS tipo_vinculo_umbanda text,
  ADD COLUMN IF NOT EXISTS ativo_espiritual boolean DEFAULT true;

-- 3. Create ficha_corrente
CREATE TABLE IF NOT EXISTS public.ficha_corrente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  ingresso_umbanda date,
  batizado_umbanda date,
  casamento_umbanda date,
  padrinho_espiritual text,
  padrinho_material text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id)
);
ALTER TABLE public.ficha_corrente ENABLE ROW LEVEL SECURITY;

-- 4. Create ocorrencias_mediunicas
CREATE TABLE IF NOT EXISTS public.ocorrencias_mediunicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,
  descricao text,
  responsavel text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ocorrencias_mediunicas ENABLE ROW LEVEL SECURITY;

-- 5. Create linhagem_espiritual
CREATE TABLE IF NOT EXISTS public.linhagem_espiritual (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES public.pessoas(id),
  tipo_vinculo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.linhagem_espiritual ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_linhagem_tipo_vinculo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tipo_vinculo NOT IN ('pai_de_santo', 'mae_de_santo', 'filho_de_santo', 'neto_de_santo') THEN
    RAISE EXCEPTION 'tipo_vinculo inválido: %. Valores aceitos: pai_de_santo, mae_de_santo, filho_de_santo, neto_de_santo', NEW.tipo_vinculo;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_linhagem_tipo_vinculo
  BEFORE INSERT OR UPDATE ON public.linhagem_espiritual
  FOR EACH ROW EXECUTE FUNCTION public.validate_linhagem_tipo_vinculo();

-- 6. Create timeline_eventos
CREATE TABLE IF NOT EXISTS public.timeline_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  data_evento date NOT NULL,
  tipo_evento text NOT NULL,
  origem_modulo text,
  registro_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timeline_eventos ENABLE ROW LEVEL SECURITY;

-- 7. Create atas
CREATE TABLE IF NOT EXISTS public.atas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tipo_reuniao text,
  data_reuniao date,
  conteudo text,
  arquivo_original text,
  arquivo_assinado text,
  status text NOT NULL DEFAULT 'rascunho',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.atas ENABLE ROW LEVEL SECURITY;

-- 8. Create assinaturas_ata
CREATE TABLE IF NOT EXISTS public.assinaturas_ata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid NOT NULL REFERENCES public.atas(id) ON DELETE CASCADE,
  nome_assinante text NOT NULL,
  email_assinante text,
  status_assinatura text NOT NULL DEFAULT 'pendente',
  data_assinatura timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assinaturas_ata ENABLE ROW LEVEL SECURITY;

-- 9. RLS for new spiritual tables
CREATE POLICY "Prontuario leitura ficha_corrente" ON public.ficha_corrente FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita ficha_corrente" ON public.ficha_corrente FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update ficha_corrente" ON public.ficha_corrente FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete ficha_corrente" ON public.ficha_corrente FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

CREATE POLICY "Prontuario leitura ocorrencias" ON public.ocorrencias_mediunicas FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita ocorrencias" ON public.ocorrencias_mediunicas FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update ocorrencias" ON public.ocorrencias_mediunicas FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete ocorrencias" ON public.ocorrencias_mediunicas FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

CREATE POLICY "Prontuario leitura linhagem" ON public.linhagem_espiritual FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita linhagem" ON public.linhagem_espiritual FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update linhagem" ON public.linhagem_espiritual FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete linhagem" ON public.linhagem_espiritual FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

CREATE POLICY "Timeline leitura" ON public.timeline_eventos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Timeline escrita" ON public.timeline_eventos FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil) OR has_perfil(auth.uid(), 'secretaria'::app_perfil));
CREATE POLICY "Timeline update" ON public.timeline_eventos FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));

CREATE POLICY "Atas leitura" ON public.atas FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Atas escrita" ON public.atas FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'secretaria'::app_perfil));
CREATE POLICY "Atas update" ON public.atas FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil));
CREATE POLICY "Atas delete" ON public.atas FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil));

CREATE POLICY "Assinaturas leitura" ON public.assinaturas_ata FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Assinaturas escrita" ON public.assinaturas_ata FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'secretaria'::app_perfil));
CREATE POLICY "Assinaturas update" ON public.assinaturas_ata FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil));
CREATE POLICY "Assinaturas delete" ON public.assinaturas_ata FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'secretaria'::app_perfil));

-- 10. Update RLS on spiritual tables
DROP POLICY IF EXISTS "Secretaria e Congal podem visualizar cruzamentos" ON public.cruzamentos;
DROP POLICY IF EXISTS "Secretaria pode atualizar cruzamentos" ON public.cruzamentos;
DROP POLICY IF EXISTS "Secretaria pode deletar cruzamentos" ON public.cruzamentos;
DROP POLICY IF EXISTS "Secretaria pode inserir cruzamentos" ON public.cruzamentos;
CREATE POLICY "Prontuario leitura cruzamentos" ON public.cruzamentos FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita cruzamentos" ON public.cruzamentos FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update cruzamentos" ON public.cruzamentos FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete cruzamentos" ON public.cruzamentos FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

DROP POLICY IF EXISTS "Secretaria e Congal podem visualizar coroacoes" ON public.coroacoes;
DROP POLICY IF EXISTS "Secretaria pode atualizar coroacoes" ON public.coroacoes;
DROP POLICY IF EXISTS "Secretaria pode deletar coroacoes" ON public.coroacoes;
DROP POLICY IF EXISTS "Secretaria pode inserir coroacoes" ON public.coroacoes;
CREATE POLICY "Prontuario leitura coroacoes" ON public.coroacoes FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita coroacoes" ON public.coroacoes FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update coroacoes" ON public.coroacoes FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete coroacoes" ON public.coroacoes FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

DROP POLICY IF EXISTS "Secretaria e Congal podem visualizar entidades" ON public.entidades;
DROP POLICY IF EXISTS "Secretaria pode atualizar entidades" ON public.entidades;
DROP POLICY IF EXISTS "Secretaria pode inserir entidades" ON public.entidades;
CREATE POLICY "Prontuario leitura entidades" ON public.entidades FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita entidades" ON public.entidades FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update entidades" ON public.entidades FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete entidades" ON public.entidades FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

DROP POLICY IF EXISTS "Secretaria e Congal podem visualizar historico_religioso" ON public.historico_religioso;
DROP POLICY IF EXISTS "Secretaria pode atualizar historico_religioso" ON public.historico_religioso;
DROP POLICY IF EXISTS "Secretaria pode deletar historico_religioso" ON public.historico_religioso;
DROP POLICY IF EXISTS "Secretaria pode inserir historico_religioso" ON public.historico_religioso;
CREATE POLICY "Prontuario leitura historico_religioso" ON public.historico_religioso FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita historico_religioso" ON public.historico_religioso FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update historico_religioso" ON public.historico_religioso FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete historico_religioso" ON public.historico_religioso FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

-- 11. Add SELECT on pessoas for pai_mae_de_santo
CREATE POLICY "Pai mae de santo pode visualizar pessoas" ON public.pessoas FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

-- 12. Insert perfil
INSERT INTO public.perfis (nome, descricao) VALUES ('pai_mae_de_santo'::app_perfil, 'Pai/Mãe de Santo — acesso total ao Prontuário Mediúnico') ON CONFLICT DO NOTHING;

-- 13. Insert funcionalidades
INSERT INTO public.funcionalidades (modulo, nome_funcionalidade, rota, descricao) VALUES
  ('Secretaria', 'Ficha de Admissão', '/secretaria/ficha-admissao', 'Cadastro completo de associados'),
  ('Secretaria', 'Atas', '/secretaria/atas', 'Gestão de atas institucionais'),
  ('Prontuário Mediúnico', 'Médiuns', '/prontuario/mediuns', 'Lista de médiuns da casa'),
  ('Prontuário Mediúnico', 'Dashboard Espiritual', '/prontuario/dashboard', 'Indicadores espirituais'),
  ('Prontuário Mediúnico', 'Ocorrências', '/prontuario/ocorrencias', 'Registro de ocorrências mediúnicas'),
  ('Prontuário Mediúnico', 'Árvore Espiritual', '/prontuario/arvore', 'Linhagem espiritual da casa'),
  ('Prontuário Mediúnico', 'Mapa Espiritual', '/prontuario/mapa', 'Entidades por linha espiritual'),
  ('Prontuário Mediúnico', 'Linha do Tempo', '/prontuario/timeline', 'Timeline institucional');

-- 14. Storage bucket for atas
INSERT INTO storage.buckets (id, name, public) VALUES ('atas', 'atas', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Secretaria upload atas" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'atas' AND has_perfil(auth.uid(), 'secretaria'::app_perfil));
CREATE POLICY "Secretaria read atas" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'atas' AND (has_perfil(auth.uid(), 'secretaria'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil)));
CREATE POLICY "Secretaria delete atas" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'atas' AND has_perfil(auth.uid(), 'secretaria'::app_perfil));
