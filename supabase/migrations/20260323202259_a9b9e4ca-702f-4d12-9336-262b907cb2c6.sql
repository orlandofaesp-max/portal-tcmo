
-- 1. Correntes
CREATE TABLE IF NOT EXISTS public.correntes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.correntes ENABLE ROW LEVEL SECURITY;

-- 2. Pessoas x Correntes
CREATE TABLE IF NOT EXISTS public.pessoas_correntes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  corrente_id uuid NOT NULL REFERENCES public.correntes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pessoa_id, corrente_id)
);
ALTER TABLE public.pessoas_correntes ENABLE ROW LEVEL SECURITY;

-- 3. Pai/Mãe x Correntes
CREATE TABLE IF NOT EXISTS public.pai_mae_correntes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  corrente_id uuid NOT NULL REFERENCES public.correntes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, corrente_id)
);
ALTER TABLE public.pai_mae_correntes ENABLE ROW LEVEL SECURITY;

-- 4. Cruzamentos por Linha (complementar)
CREATE TABLE IF NOT EXISTS public.cruzamentos_linha (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  linha text NOT NULL,
  data_cruzamento date,
  ordem integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pessoa_id, linha)
);
ALTER TABLE public.cruzamentos_linha ENABLE ROW LEVEL SECURITY;

-- 5. Agenda por Corrente
CREATE TABLE IF NOT EXISTS public.agenda_corrente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corrente_id uuid NOT NULL REFERENCES public.correntes(id) ON DELETE CASCADE,
  data date NOT NULL,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agenda_corrente ENABLE ROW LEVEL SECURITY;

-- 6. Frequência de Médiuns
CREATE TABLE IF NOT EXISTS public.frequencia_mediuns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  corrente_id uuid NOT NULL REFERENCES public.correntes(id) ON DELETE CASCADE,
  data date NOT NULL,
  presente boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pessoa_id, corrente_id, data)
);
ALTER TABLE public.frequencia_mediuns ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_pessoas_correntes_pessoa ON public.pessoas_correntes (pessoa_id);
CREATE INDEX idx_pessoas_correntes_corrente ON public.pessoas_correntes (corrente_id);
CREATE INDEX idx_pai_mae_correntes_usuario ON public.pai_mae_correntes (usuario_id);
CREATE INDEX idx_cruzamentos_linha_pessoa ON public.cruzamentos_linha (pessoa_id);
CREATE INDEX idx_agenda_corrente_data ON public.agenda_corrente (data);
CREATE INDEX idx_frequencia_data ON public.frequencia_mediuns (data);

-- RLS: correntes (leitura pai_mae_de_santo + congal, escrita pai_mae_de_santo)
CREATE POLICY "Prontuario leitura correntes" ON public.correntes FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita correntes" ON public.correntes FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update correntes" ON public.correntes FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete correntes" ON public.correntes FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

-- RLS: pessoas_correntes
CREATE POLICY "Prontuario leitura pessoas_correntes" ON public.pessoas_correntes FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita pessoas_correntes" ON public.pessoas_correntes FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete pessoas_correntes" ON public.pessoas_correntes FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

-- RLS: pai_mae_correntes
CREATE POLICY "Prontuario leitura pai_mae_correntes" ON public.pai_mae_correntes FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita pai_mae_correntes" ON public.pai_mae_correntes FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete pai_mae_correntes" ON public.pai_mae_correntes FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

-- RLS: cruzamentos_linha
CREATE POLICY "Prontuario leitura cruzamentos_linha" ON public.cruzamentos_linha FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita cruzamentos_linha" ON public.cruzamentos_linha FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update cruzamentos_linha" ON public.cruzamentos_linha FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete cruzamentos_linha" ON public.cruzamentos_linha FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

-- RLS: agenda_corrente
CREATE POLICY "Prontuario leitura agenda_corrente" ON public.agenda_corrente FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita agenda_corrente" ON public.agenda_corrente FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update agenda_corrente" ON public.agenda_corrente FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete agenda_corrente" ON public.agenda_corrente FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));

-- RLS: frequencia_mediuns
CREATE POLICY "Prontuario leitura frequencia_mediuns" ON public.frequencia_mediuns FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));
CREATE POLICY "Prontuario escrita frequencia_mediuns" ON public.frequencia_mediuns FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario update frequencia_mediuns" ON public.frequencia_mediuns FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
CREATE POLICY "Prontuario delete frequencia_mediuns" ON public.frequencia_mediuns FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'pai_mae_de_santo'::app_perfil));
