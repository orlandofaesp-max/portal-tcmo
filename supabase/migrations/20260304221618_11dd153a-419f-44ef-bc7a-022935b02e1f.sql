CREATE TABLE public.fundo_reserva (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_movimento date NOT NULL,
  descricao text NOT NULL,
  entrada numeric NOT NULL DEFAULT 0,
  saida numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fundo_reserva_data ON public.fundo_reserva (data_movimento);

ALTER TABLE public.fundo_reserva ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tesouraria e Congal podem visualizar fundo_reserva"
  ON public.fundo_reserva FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'tesouraria'::app_perfil) OR has_perfil(auth.uid(), 'congal'::app_perfil));

CREATE POLICY "Tesouraria pode inserir fundo_reserva"
  ON public.fundo_reserva FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'tesouraria'::app_perfil));

CREATE POLICY "Tesouraria pode atualizar fundo_reserva"
  ON public.fundo_reserva FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'tesouraria'::app_perfil));

CREATE OR REPLACE FUNCTION public.validate_fundo_reserva()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.entrada > 0 AND NEW.saida > 0 THEN
    RAISE EXCEPTION 'Entrada e saída não podem ter valores ao mesmo tempo';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_fundo_reserva
  BEFORE INSERT OR UPDATE ON public.fundo_reserva
  FOR EACH ROW EXECUTE FUNCTION public.validate_fundo_reserva();