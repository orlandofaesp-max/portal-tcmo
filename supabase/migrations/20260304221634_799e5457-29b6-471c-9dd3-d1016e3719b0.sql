CREATE OR REPLACE FUNCTION public.validate_fundo_reserva()
RETURNS trigger LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.entrada > 0 AND NEW.saida > 0 THEN
    RAISE EXCEPTION 'Entrada e saída não podem ter valores ao mesmo tempo';
  END IF;
  RETURN NEW;
END;
$$;