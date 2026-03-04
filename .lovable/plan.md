

## Plano: Modulo Almoxarifado (com 3 ajustes adicionais)

Incorpora os 3 ajustes solicitados ao plano ja aprovado.

### 1. Migracao SQL

```sql
-- categorias_almoxarifado
CREATE TABLE public.categorias_almoxarifado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categorias_almoxarifado ENABLE ROW LEVEL SECURITY;

-- itens_almoxarifado
CREATE TABLE public.itens_almoxarifado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria_id uuid NOT NULL REFERENCES public.categorias_almoxarifado(id) ON DELETE RESTRICT,
  unidade_medida text NOT NULL,
  estoque_minimo numeric NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.itens_almoxarifado ENABLE ROW LEVEL SECURITY;

-- movimentacoes_almoxarifado
CREATE TABLE public.movimentacoes_almoxarifado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.itens_almoxarifado(id) ON DELETE RESTRICT,
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE RESTRICT,
  tipo text NOT NULL CHECK (tipo IN ('entrada','saida','ajuste')),
  quantidade numeric NOT NULL CHECK (quantidade > 0),
  data_movimento date NOT NULL DEFAULT CURRENT_DATE,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.movimentacoes_almoxarifado ENABLE ROW LEVEL SECURITY;

-- Indices (6 total)
CREATE INDEX idx_itens_categoria ON public.itens_almoxarifado (categoria_id);
CREATE INDEX idx_movimentacoes_item ON public.movimentacoes_almoxarifado (item_id);
CREATE INDEX idx_movimentacoes_data ON public.movimentacoes_almoxarifado (data_movimento);
CREATE INDEX idx_movimentacoes_pessoa ON public.movimentacoes_almoxarifado (pessoa_id);
CREATE INDEX idx_movimentacoes_item_tipo ON public.movimentacoes_almoxarifado (item_id, tipo);
CREATE INDEX idx_movimentacoes_data_item ON public.movimentacoes_almoxarifado (data_movimento, item_id);
```

**Ajustes incorporados:**
1. `idx_movimentacoes_data_item` — indice composto para dashboard mensal
2. `estoque_minimo numeric NOT NULL CHECK (>= 0)` — impede valor negativo
3. `categoria_id uuid NOT NULL` — categoria obrigatoria

**RLS:** SELECT todos auth. INSERT/UPDATE/DELETE para `almoxarifado`. Excecao: `movimentacoes` INSERT aberto para todos auth.

**Policy em `pessoas`:**
```sql
CREATE POLICY "Almoxarifado pode visualizar pessoas"
  ON public.pessoas FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'almoxarifado'::app_perfil));
```

### 2. Hooks (`src/hooks/useAlmoxarifado.ts`)

- CRUD categorias e itens
- `useItensAlmoxarifado()` — join categorias + calculo saldo via movimentacoes
- `useMovimentacoesAlmoxarifado()` — join itens e pessoas
- `useCreateMovimentacao()` — insert movimentacao
- `useAlmoxarifadoDashboard()` — total itens, abaixo do minimo, entradas/saidas do mes

### 3. Paginas

| Pagina | Rota |
|---|---|
| `AlmoxarifadoDashboard.tsx` | `/almoxarifado/dashboard` |
| `ItensAlmoxarifado.tsx` | `/almoxarifado/itens` |
| `CategoriasAlmoxarifado.tsx` | `/almoxarifado/categorias` |
| `Movimentacoes.tsx` | `/almoxarifado/movimentacoes` |

**Itens:** Tabela com nome, categoria, unidade, estoque atual, estoque minimo, diferenca, status (Normal / Abaixo do minimo)

### 4. Sidebar e Rotas

Substituir placeholder Almoxarifado por 4 subitens. Adicionar 4 rotas `ModuleRoute perfil="almoxarifado"`.

### Arquivos impactados

| Arquivo | Acao |
|---|---|
| Migration SQL | 3 tabelas + RLS + 6 indices + CHECK + policy pessoas |
| `src/hooks/useAlmoxarifado.ts` | Novo |
| `src/pages/almoxarifado/*.tsx` | 4 novas paginas |
| `src/components/AppSidebar.tsx` | Atualizar items almoxarifado |
| `src/App.tsx` | Adicionar 4 rotas |

