
-- 1. Add administrador to enum
ALTER TYPE public.app_perfil ADD VALUE IF NOT EXISTS 'administrador';

-- 2. Add perfil_pai to perfis for inheritance
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS perfil_pai uuid REFERENCES public.perfis(id) ON DELETE SET NULL;

-- 3. Add deve_trocar_senha to usuarios
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS deve_trocar_senha boolean NOT NULL DEFAULT false;

-- 4. Create funcionalidades table
CREATE TABLE IF NOT EXISTS public.funcionalidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo text NOT NULL,
  nome_funcionalidade text NOT NULL,
  rota text,
  ativo boolean NOT NULL DEFAULT true,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.funcionalidades ENABLE ROW LEVEL SECURITY;

-- 5. Create permissoes table (use text for perfil to avoid enum issue)
CREATE TABLE IF NOT EXISTS public.permissoes_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil text NOT NULL,
  funcionalidade_id uuid NOT NULL REFERENCES public.funcionalidades(id) ON DELETE CASCADE,
  visualizar boolean NOT NULL DEFAULT false,
  editar boolean NOT NULL DEFAULT false,
  excluir boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(perfil, funcionalidade_id)
);
ALTER TABLE public.permissoes_config ENABLE ROW LEVEL SECURITY;

-- 6. Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  perfil text,
  funcionalidade text,
  operacao text NOT NULL,
  registro_id text,
  dados_anteriores jsonb,
  dados_novos jsonb,
  data_evento timestamptz NOT NULL DEFAULT now(),
  ip_usuario text
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 7. Update has_perfil using text cast to avoid enum literal issue
CREATE OR REPLACE FUNCTION public.has_perfil(_user_id uuid, _perfil app_perfil)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE user_id = _user_id
      AND ativo = true
      AND (perfil = _perfil OR perfil::text = 'administrador')
  )
$$;

-- 8. RLS for funcionalidades
CREATE POLICY "Autenticados podem visualizar funcionalidades" ON public.funcionalidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin pode inserir funcionalidades" ON public.funcionalidades FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador', 'congal'))
);
CREATE POLICY "Admin pode atualizar funcionalidades" ON public.funcionalidades FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador', 'congal'))
);
CREATE POLICY "Admin pode deletar funcionalidades" ON public.funcionalidades FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador', 'congal'))
);

-- 9. RLS for permissoes_config
CREATE POLICY "Autenticados podem visualizar permissoes_config" ON public.permissoes_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin pode inserir permissoes_config" ON public.permissoes_config FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador', 'congal'))
);
CREATE POLICY "Admin pode atualizar permissoes_config" ON public.permissoes_config FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador', 'congal'))
);
CREATE POLICY "Admin pode deletar permissoes_config" ON public.permissoes_config FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador', 'congal'))
);

-- 10. RLS for audit_log
CREATE POLICY "Admin pode visualizar audit_log" ON public.audit_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE user_id = auth.uid() AND ativo = true AND perfil::text IN ('administrador', 'congal'))
);
CREATE POLICY "Autenticados podem inserir audit_log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- 11. Prevent deleting last admin
CREATE OR REPLACE FUNCTION public.prevent_last_admin_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.perfil::text IN ('administrador', 'congal') THEN
    IF (SELECT COUNT(*) FROM public.usuarios WHERE perfil::text IN ('administrador', 'congal') AND ativo = true AND id != OLD.id) = 0 THEN
      RAISE EXCEPTION 'Não é possível remover o último administrador do sistema';
    END IF;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER tr_prevent_last_admin_delete
  BEFORE DELETE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_admin_delete();

-- 12. Prevent deactivating last admin
CREATE OR REPLACE FUNCTION public.prevent_last_admin_deactivate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ativo = false AND OLD.perfil::text IN ('administrador', 'congal') THEN
    IF (SELECT COUNT(*) FROM public.usuarios WHERE perfil::text IN ('administrador', 'congal') AND ativo = true AND id != OLD.id) = 0 THEN
      RAISE EXCEPTION 'Não é possível desativar o último administrador do sistema';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_prevent_last_admin_deactivate
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_admin_deactivate();

-- 13. Indices
CREATE INDEX IF NOT EXISTS idx_funcionalidades_modulo ON public.funcionalidades (modulo);
CREATE INDEX IF NOT EXISTS idx_permissoes_config_perfil ON public.permissoes_config (perfil);
CREATE INDEX IF NOT EXISTS idx_permissoes_config_func ON public.permissoes_config (funcionalidade_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_data ON public.audit_log (data_evento);
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario ON public.audit_log (usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_operacao ON public.audit_log (operacao);
