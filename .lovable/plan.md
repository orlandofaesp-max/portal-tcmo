

## Plano: Modulo Biblioteca Completo com Emprestimo Automatico e Indices

### 1. Migracao SQL

Criar 5 tabelas, indices otimizados e RLS. Adicionar policy SELECT na tabela `pessoas` para perfil `biblioteca`.

**Tabelas:**

```sql
-- autores
CREATE TABLE public.autores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- categorias_biblioteca
CREATE TABLE public.categorias_biblioteca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

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

-- exemplares
CREATE TABLE public.exemplares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  codigo text UNIQUE,
  localizacao text,
  disponivel boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

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
```

**Indices (conforme solicitado):**

```sql
CREATE INDEX idx_exemplares_obra ON public.exemplares (obra_id);
CREATE INDEX idx_emprestimos_exemplar ON public.emprestimos (exemplar_id);
CREATE INDEX idx_emprestimos_pessoa ON public.emprestimos (pessoa_id);
CREATE INDEX idx_emprestimos_devolucao ON public.emprestimos (data_devolucao, data_prevista_devolucao);
```

**RLS:** Todas as tabelas com RLS ativo. SELECT para todos autenticados. INSERT/UPDATE/DELETE para `biblioteca`. Excecao: `emprestimos` INSERT aberto para todos autenticados.

**Policy adicional em `pessoas`:**
```sql
CREATE POLICY "Biblioteca pode visualizar pessoas"
  ON public.pessoas FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'biblioteca'::app_perfil));
```

### 2. Hooks (`src/hooks/useBiblioteca.ts`)

Novo arquivo com:
- CRUD para autores, categorias_biblioteca, obras, exemplares
- `useObras()` — select com join em autores e categorias_biblioteca
- `useExemplares(obraId)` — lista exemplares da obra
- `useEmprestimos()` — select com joins em exemplares->obras e pessoas
- `useEmprestarExemplarAutomatico()` — logica com protecao contra concorrencia:
  1. `SELECT id FROM exemplares WHERE obra_id = ? AND disponivel = true ORDER BY created_at LIMIT 1`
  2. `UPDATE exemplares SET disponivel = false WHERE id = ? AND disponivel = true` — verifica rowCount
  3. Se rowCount = 0, lanca erro "Exemplar ja emprestado, tente novamente"
  4. Se sucesso, insere emprestimo
- `useRegistrarDevolucao()` — update data_devolucao, devolucao_aprovada = false
- `useAprovarDevolucao()` — update devolucao_aprovada = true + exemplar.disponivel = true
- `useBibliotecaDashboard()` — contagens para indicadores

### 3. Paginas

| Pagina | Rota |
|---|---|
| `BibliotecaDashboard.tsx` | `/biblioteca/dashboard` |
| `Obras.tsx` | `/biblioteca/obras` |
| `Autores.tsx` | `/biblioteca/autores` |
| `CategoriasBiblioteca.tsx` | `/biblioteca/categorias` |
| `Emprestimos.tsx` | `/biblioteca/emprestimos` |

**Pagina Obras:**
- Tabela: Titulo, Autor, Categoria, **Disponíveis / Total** (ex: "3 / 5")
- Busca por titulo, autor, categoria
- Botao "Emprestar" (perfil biblioteca): abre Dialog com Select de pessoa + DatePicker data prevista
- Ao confirmar: hook automatico busca exemplar disponivel, registra emprestimo
- Se nenhum disponivel: toast de erro
- Click na obra expande detalhes com exemplares (codigo, localizacao, status)

**Pagina Emprestimos:**
- Tabela: Obra, Exemplar, Pessoa, Data emprestimo, Status
- Status calculado: Emprestado / Atrasado / Aguardando aprovacao / Devolvido
- Botao "Registrar devolucao" (todos) e "Aprovar devolucao" (so biblioteca)

**Dashboard:**
- Disponiveis, emprestados, atrasados, emprestimos do mes, devolucoes do mes

### 4. Sidebar e Rotas

**AppSidebar.tsx** — substituir item unico por 5 subitens: Dashboard, Obras, Autores, Categorias, Emprestimos

**App.tsx** — adicionar 5 rotas `ModuleRoute perfil="biblioteca"`, remover placeholder

### Arquivos impactados

| Arquivo | Acao |
|---|---|
| Migration SQL | 5 tabelas + RLS + 4 indices + policy pessoas |
| `src/hooks/useBiblioteca.ts` | Novo |
| `src/pages/biblioteca/*.tsx` | 5 novas paginas |
| `src/components/AppSidebar.tsx` | Atualizar items biblioteca |
| `src/App.tsx` | Adicionar 5 rotas |

