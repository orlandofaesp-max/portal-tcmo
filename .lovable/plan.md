
Objetivo: regerar a migração do módulo Secretaria com nomenclatura 100% correta (sem acentos em nomes técnicos), mantendo a estrutura e RLS já planejadas.

1) Escopo da migração (sem alterar módulos existentes)
- Criar apenas estas tabelas:
  - `pessoas`
  - `cruzamentos`
  - `coroacoes`
  - `entidades`
  - `historico_religioso`
- Não alterar Tesouraria nem tabelas existentes.

2) Estrutura exata das tabelas (nomes confirmados)

- `pessoas`
  - `id` uuid pk
  - `nome` text not null
  - `data_nascimento` date
  - `telefone` text
  - `email` text
  - `tipo_vinculo` text
  - `situacao` text
  - `possui_mensalidade` boolean default false
  - `data_ingresso_corrente` date
  - `observacoes` text
  - `created_at` timestamptz default now()

- `cruzamentos`
  - `id` uuid pk
  - `pessoa_id` uuid fk -> `pessoas.id`
  - `titulo` text default 'Cruzamento de Linha'
  - `linha` text
  - `data_cruzamento` date
  - `observacao` text
  - `created_at` timestamptz default now()

- `coroacoes`
  - `id` uuid pk
  - `pessoa_id` uuid fk -> `pessoas.id`
  - `titulo` text default 'Coroações'
  - `tipo_coroacao` text
  - `data_coroacao` date
  - `observacao` text
  - `created_at` timestamptz default now()

- `entidades`
  - `id` uuid pk
  - `pessoa_id` uuid fk -> `pessoas.id`
  - `nome_entidade` text
  - `linha` text
  - `observacao` text
  - `created_at` timestamptz default now()

- `historico_religioso`
  - `id` uuid pk
  - `pessoa_id` uuid fk -> `pessoas.id`
  - `tipo_evento` text
  - `data_evento` date
  - `descricao` text
  - `created_at` timestamptz default now()

3) RLS (mantida conforme planejado)
- Habilitar RLS nas 5 tabelas.
- SELECT: perfis `secretaria` e `congal`.
- INSERT/UPDATE/DELETE: apenas perfil `secretaria`.
- Reutilizar função `has_perfil(auth.uid(), ...)` já existente.

4) Índices de desempenho
- Criar índices por `pessoa_id`:
  - `idx_cruzamentos_pessoa_id`
  - `idx_coroacoes_pessoa_id`
  - `idx_entidades_pessoa_id`
  - `idx_historico_religioso_pessoa_id`

5) Validação de nomenclatura (obrigatória)
- Garantir presença dos nomes corretos:
  - tabelas: `pessoas`, `cruzamentos`, `coroacoes`, `entidades`, `historico_religioso`
  - campos: `tipo_coroacao`, `data_coroacao`, `data_cruzamento`, `data_ingresso_corrente`, `possui_mensalidade`, `observacoes`
- Garantir ausência total de:
  - `rompimentos`
  - `coroas`
  - `tipo_coronavirus`
  - `dados_coronavirus`
  - `possui_mensade`
