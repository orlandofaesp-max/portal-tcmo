
-- autores
CREATE TABLE public.autores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.autores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem visualizar autores"
  ON public.autores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Biblioteca pode inserir autores"
  ON public.autores FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode atualizar autores"
  ON public.autores FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode deletar autores"
  ON public.autores FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));

-- categorias_biblioteca
CREATE TABLE public.categorias_biblioteca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categorias_biblioteca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem visualizar categorias_biblioteca"
  ON public.categorias_biblioteca FOR SELECT TO authenticated USING (true);
CREATE POLICY "Biblioteca pode inserir categorias_biblioteca"
  ON public.categorias_biblioteca FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode atualizar categorias_biblioteca"
  ON public.categorias_biblioteca FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode deletar categorias_biblioteca"
  ON public.categorias_biblioteca FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));

-- obras
CREATE TABLE public.obras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  autor_id uuid REFERENCES public.autores(id),
  categoria_id uuid REFERENCES public.categorias_biblioteca(id),
  tipo text,
  arquivo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_obras_titulo_autor ON public.obras (titulo, autor_id);
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem visualizar obras"
  ON public.obras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Biblioteca pode inserir obras"
  ON public.obras FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode atualizar obras"
  ON public.obras FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode deletar obras"
  ON public.obras FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));

-- exemplares
CREATE TABLE public.exemplares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  codigo text UNIQUE,
  localizacao text,
  disponivel boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_exemplares_obra ON public.exemplares (obra_id);
ALTER TABLE public.exemplares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem visualizar exemplares"
  ON public.exemplares FOR SELECT TO authenticated USING (true);
CREATE POLICY "Biblioteca pode inserir exemplares"
  ON public.exemplares FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode atualizar exemplares"
  ON public.exemplares FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode deletar exemplares"
  ON public.exemplares FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));

-- emprestimos
CREATE TABLE public.emprestimos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exemplar_id uuid NOT NULL REFERENCES public.exemplares(id),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id),
  data_emprestimo date NOT NULL DEFAULT CURRENT_DATE,
  data_prevista_devolucao date,
  data_devolucao date,
  devolucao_aprovada boolean NOT NULL DEFAULT false,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_emprestimos_exemplar ON public.emprestimos (exemplar_id);
CREATE INDEX idx_emprestimos_pessoa ON public.emprestimos (pessoa_id);
CREATE INDEX idx_emprestimos_devolucao ON public.emprestimos (data_devolucao, data_prevista_devolucao);
ALTER TABLE public.emprestimos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem visualizar emprestimos"
  ON public.emprestimos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticados podem inserir emprestimos"
  ON public.emprestimos FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Biblioteca pode atualizar emprestimos"
  ON public.emprestimos FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
CREATE POLICY "Biblioteca pode deletar emprestimos"
  ON public.emprestimos FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));

-- Policy adicional em pessoas para biblioteca
CREATE POLICY "Biblioteca pode visualizar pessoas"
  ON public.pessoas FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
