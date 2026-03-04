

## Plano Ajustado: Prontuario Mediunico Completo

Tres ajustes incorporados ao plano aprovado anteriormente:

### 1. Migracao SQL

**Adicionar colunas na tabela `entidades`:**
```sql
ALTER TABLE public.entidades ADD COLUMN IF NOT EXISTS data_manifestacao date;
ALTER TABLE public.entidades ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;
```

**Criar tabela `observacoes_internas` com FK e indice:**
```sql
CREATE TABLE public.observacoes_internas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,
  autor text,
  observacao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_observacoes_pessoa_id ON public.observacoes_internas (pessoa_id);

ALTER TABLE public.observacoes_internas ENABLE ROW LEVEL SECURITY;
-- RLS: SELECT para secretaria e congal; INSERT/UPDATE/DELETE para secretaria
```

**Entidades — remover exclusao fisica:**
- Remover a RLS policy de DELETE da tabela `entidades`
- No frontend, "remover" entidade passa a fazer `UPDATE ... SET ativa = false`
- Queries filtram por `ativa = true`

### 2. Hooks (`useSecretaria.ts`)

- Adicionar `useObservacoesInternas(pessoaId)`, `useCreateObservacaoInterna()`, `useDeleteObservacaoInterna()`
- Alterar `useEntidades` para filtrar `.eq("ativa", true)`
- Alterar `useDeleteEntidade` para fazer `.update({ ativa: false })` em vez de `.delete()`

### 3. Reescrever `PessoaPerfil.tsx`

**Indicadores no topo:**
- Cruzamentos realizados: X / 42
- Linhas desenvolvidas: X / 6
- Tempo de corrente: calculado de `data_ingresso_corrente`

**6 abas:**
1. Dados Pessoais — manter
2. Cruzamentos — grid existente, manter
3. Coroacoes — Select com opcoes fixas (Coroa de Ere, Pai/Mae Pequeno(a), Deka, Pai/Mae de Santo)
4. Entidades — refatorar: cada celula mostra TODAS as entidades da linha (`.filter`), click abre dialog de gerenciamento com lista + adicionar/editar. "Remover" faz soft-delete (`ativa=false`)
5. Historico Religioso — Select com tipos pre-definidos
6. Observacoes da Casa — nova aba, lista cronologica + botao adicionar

**TODO comment:** `// TODO: integrar pessoa_id com associado_id da Tesouraria`

### Arquivos impactados

| Arquivo | Acao |
|---|---|
| Migration SQL | Alterar entidades + criar observacoes_internas (com FK + indice) + drop DELETE policy entidades |
| `src/hooks/useSecretaria.ts` | Hooks observacoes, soft-delete entidades, filtro ativa=true |
| `src/pages/secretaria/PessoaPerfil.tsx` | Indicadores, multi-entidades, nova aba observacoes, selects |

