
CREATE OR REPLACE FUNCTION public.count_usuarios()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.usuarios;
$$;
