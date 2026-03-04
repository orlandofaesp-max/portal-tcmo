

## Plano Ajustado: Fundo de Reserva

### 1. Migração SQL

Criar tabela `fundo_reserva` **sem coluna `saldo`** — saldo será calculado dinamicamente no frontend via acumulação ordenada.

```sql
CREATE TABLE public.fundo_reserva (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_movimento date NOT NULL,
  descricao text NOT NULL,
  entrada numeric NOT NULL DEFAULT 0,
  saida numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas por data
CREATE INDEX idx_fundo_reserva_data ON public.fundo_reserva (data_movimento);

ALTER TABLE public.fundo_reserva ENABLE ROW LEVEL SECURITY;

-- SELECT: tesouraria e congal
CREATE POLICY "Tesouraria e Congal podem visualizar fundo_reserva"
  ON public.fundo_reserva FOR SELECT TO authenticated
  USING (has_perfil(auth.uid(), 'tesouraria') OR has_perfil(auth.uid(), 'congal'));

-- INSERT: somente tesouraria
CREATE POLICY "Tesouraria pode inserir fundo_reserva"
  ON public.fundo_reserva FOR INSERT TO authenticated
  WITH CHECK (has_perfil(auth.uid(), 'tesouraria'));

-- UPDATE: somente tesouraria
CREATE POLICY "Tesouraria pode atualizar fundo_reserva"
  ON public.fundo_reserva FOR UPDATE TO authenticated
  USING (has_perfil(auth.uid(), 'tesouraria'));

-- Trigger: entrada e saída não podem ambos ser > 0
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
```

### 2. Hooks (`useFinanceiro.ts`)

- `useFundoReserva()` — query ordenada por `data_movimento, created_at` (sem coluna saldo)
- `useCreateFundoReserva()` — insert sem saldo; invalidar queries
- Saldo calculado no frontend via `reduce` acumulativo sobre os registros ordenados

### 3. Nova página `src/pages/tesouraria/FundoReserva.tsx`

- `MonthFilter` no topo
- Tabela: Data | Descrição | Entrada | Saída | Saldo (calculado dinamicamente)
- Botão "Novo Lançamento" (oculto para perfil `congal`)
- Dialog com formulário: Data, Descrição, Entrada, Saída

### 4. Rota e Sidebar

- **App.tsx**: rota `/tesouraria/fundo-reserva` usando `ModuleRoute perfil="tesouraria"` — o `ModuleRoute` já permite acesso ao `congal` via `isPerfil()` (linha 31: `isPerfil` retorna `true` para `congal`)
- **AppSidebar.tsx**: novo item no módulo Tesouraria com ícone `Shield` e label "Fundo de Reserva"

### 5. Dashboard (`Dashboard.tsx`)

Substituir cálculo placeholder por dados reais da tabela `fundo_reserva`:
- Saldo atual = acumulação total de entrada - saída
- Rendimentos = soma de entradas com descrição contendo "rendimento" no mês filtrado
- Capital = saldo - rendimentos
- Gráfico de pizza: Capital vs Rendimentos

### Arquivos impactados

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar tabela + índice + RLS + trigger |
| `src/hooks/useFinanceiro.ts` | Adicionar hooks |
| `src/pages/tesouraria/FundoReserva.tsx` | Criar página |
| `src/App.tsx` | Adicionar rota |
| `src/components/AppSidebar.tsx` | Adicionar menu |
| `src/pages/Dashboard.tsx` | Buscar dados reais |

