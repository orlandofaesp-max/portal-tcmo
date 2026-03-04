
-- Create trigger to auto-create first usuario as congal on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only auto-create if no usuarios exist (first user setup)
  IF NOT EXISTS (SELECT 1 FROM public.usuarios) THEN
    INSERT INTO public.usuarios (user_id, nome, email, perfil, ativo)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
      NEW.email,
      'congal'::app_perfil,
      true
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
