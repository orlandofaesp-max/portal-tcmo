

## Plano: Modulo Acervo Historico (versao final com todos os ajustes)

### 1. Migracao SQL

4 tabelas, 7 indices, bucket privado, 16 RLS policies expliciteas para tabelas + 2 storage policies + 1 policy em pessoas.

```sql
-- categorias_acervo
CREATE TABLE public.categorias_acervo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categorias_acervo ENABLE ROW LEVEL SECURITY;

-- registros_acervo
CREATE TABLE public.registros_acervo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL CHECK (tipo IN ('entrevista','documento','evento','foto','video')),
  data_evento date,
  pessoa_id uuid REFERENCES public.pessoas(id) ON DELETE SET NULL,
  categoria_id uuid REFERENCES public.categorias_acervo(id) ON DELETE SET NULL,
  criado_por uuid REFERENCES public.usuarios(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.registros_acervo ENABLE ROW LEVEL SECURITY;

-- arquivos_acervo
CREATE TABLE public.arquivos_acervo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id uuid NOT NULL REFERENCES public.registros_acervo(id) ON DELETE CASCADE,
  nome_arquivo text NOT NULL,
  url text NOT NULL,
  tipo_arquivo text,
  tamanho bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.arquivos_acervo ENABLE ROW LEVEL SECURITY;

-- eventos_historicos (registro_id opcional)
CREATE TABLE public.eventos_historicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  data_evento date NOT NULL,
  registro_id uuid REFERENCES public.registros_acervo(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eventos_historicos ENABLE ROW LEVEL SECURITY;

-- Indices (7)
CREATE INDEX idx_registros_tipo ON public.registros_acervo (tipo);
CREATE INDEX idx_registros_categoria ON public.registros_acervo (categoria_id);
CREATE INDEX idx_registros_pessoa ON public.registros_acervo (pessoa_id);
CREATE INDEX idx_registros_data_evento ON public.registros_acervo (data_evento);
CREATE INDEX idx_registros_categoria_data ON public.registros_acervo (categoria_id, data_evento);
CREATE INDEX idx_eventos_data ON public.eventos_historicos (data_evento);
CREATE INDEX idx_arquivos_registro ON public.arquivos_acervo (registro_id);

-- Storage bucket (privado, idempotente)
INSERT INTO storage.buckets (id, name, public)
VALUES ('acervo', 'acervo', false)
ON CONFLICT (id) DO NOTHING;
```

**16 RLS policies explicitas** (4 por tabela x 4 tabelas):

```sql
-- Pattern repeated for: categorias_acervo, registros_acervo, arquivos_acervo, eventos_historicos
CREATE POLICY "Acervo leitura <tabela>" ON public.<tabela>
  FOR SELECT TO authenticated
  USING (
    has_perfil(auth.uid(), 'acervo'::app_perfil)
    OR has_perfil(auth.uid(), 'secretaria'::app_perfil)
    OR has_perfil(auth.uid(), 'congal'::app_perfil)
  );

CREATE POLICY "Acervo escrita <tabela>" ON public.<tabela>
  FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'acervo'::app_perfil));

CREATE POLICY "Acervo update <tabela>" ON public.<tabela>
  FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));

CREATE POLICY "Acervo delete <tabela>" ON public.<tabela>
  FOR DELETE TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));
```

**Storage RLS (storage.objects):**

```sql
CREATE POLICY "Acervo leitura storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'acervo' AND (
    has_perfil(auth.uid(), 'acervo'::app_perfil)
    OR has_perfil(auth.uid(), 'secretaria'::app_perfil)
    OR has_perfil(auth.uid(), 'congal'::app_perfil)
  ));

CREATE POLICY "Acervo upload storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'acervo' AND has_perfil(auth.uid(), 'acervo'::app_perfil));

CREATE POLICY "Acervo delete storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'acervo' AND has_perfil(auth.uid(), 'acervo'::app_perfil));
```

**Policy em pessoas:**

```sql
CREATE POLICY "Acervo pode visualizar pessoas" ON public.pessoas
  FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'acervo'::app_perfil));
```

### 2. Hooks (`src/hooks/useAcervo.ts`)

Following the same pattern as `useAlmoxarifado.ts`:

- CRUD categorias_acervo
- CRUD registros_acervo (join pessoas, categorias_acervo, usuarios)
- `useRegistroAcervo(id)` — single record with arquivos
- `useArquivosRegistro(registroId)` — list files
- `useUploadArquivoAcervo()` — upload to private bucket + insert (with tamanho)
- `useDeleteArquivoAcervo()` — remove from storage + delete row
- `usePessoasAcervo()` — select pessoas
- CRUD eventos_historicos (join optional registros_acervo)
- `useAcervoDashboard()` — total registros, entrevistas, documentos, eventos

### 3. Pages

| Page | Route |
|---|---|
| `AcervoDashboard.tsx` | `/acervo/dashboard` |
| `RegistrosAcervo.tsx` | `/acervo/registros` |
| `RegistroDetalhe.tsx` | `/acervo/registros/:id` |
| `EventosHistoricos.tsx` | `/acervo/eventos` |

Following the same UI pattern as Almoxarifado (StatCard, PageHeader, table with search, Dialog for CRUD).

### 4. Sidebar and Routes

**AppSidebar.tsx** — replace single Acervo item (line 80-82) with 3 sub-items: Dashboard, Registros, Eventos.

**App.tsx** — replace placeholder route (line 100) with 4 `ModuleRoute perfil="acervo"` routes.

### Files impacted

| File | Action |
|---|---|
| Migration SQL | 4 tables + 20 RLS policies + 7 indices + storage bucket + storage RLS |
| `src/hooks/useAcervo.ts` | New |
| `src/pages/acervo/AcervoDashboard.tsx` | New |
| `src/pages/acervo/RegistrosAcervo.tsx` | New |
| `src/pages/acervo/RegistroDetalhe.tsx` | New |
| `src/pages/acervo/EventosHistoricos.tsx` | New |
| `src/components/AppSidebar.tsx` | Update acervo items |
| `src/App.tsx` | Replace placeholder, add 4 routes |

