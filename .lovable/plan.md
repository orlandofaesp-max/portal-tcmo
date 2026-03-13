

## Plano Revisado: Fase 1 — Reestruturação com Ajustes Solicitados

Incorpora os 4 ajustes e 2 melhorias estrategicas solicitados.

---

### 1. Migração SQL

**1.1 Enum `app_perfil`:**
- Adicionar `pai_mae_de_santo`

**1.2 Novos campos na tabela `pessoas`:**
- `numero_associado` text
- `nacionalidade` text
- `naturalidade` text
- `estado_civil` text
- `rg` text
- `cpf` text
- `nome_pai` text
- `nome_mae` text
- `data_admissao` date
- `data_emissao_ficha` date
- `data_demissao` date
- `tipo_vinculo_umbanda` text (Filho de Corrente, Filho Coroado, Pai/Mae Pequeno, Pai/Mae de Santo)
- `ativo_espiritual` boolean default true

**1.3 Novas tabelas:**

`ficha_corrente`:
- `id` uuid PK, `pessoa_id` uuid ref pessoas, `ingresso_umbanda` date, `batizado_umbanda` date, `casamento_umbanda` date, `padrinho_espiritual` text, `padrinho_material` text, `created_at`
- Campos singulares conforme Ajuste 2

`ocorrencias_mediunicas`:
- `id`, `pessoa_id` ref pessoas, `data` date, `descricao` text, `responsavel` text, `created_at`

`linhagem_espiritual`:
- `id`, `pessoa_id` ref pessoas, `mentor_id` ref pessoas, `tipo_vinculo` text
- Trigger de validacao: tipo_vinculo IN ('pai_de_santo','mae_de_santo','filho_de_santo','neto_de_santo') — conforme Ajuste 1

`timeline_eventos`:
- `id`, `titulo`, `descricao`, `data_evento` date, `tipo_evento` text, `origem_modulo` text, `registro_id` uuid — conforme Ajuste 3
- `created_at`

`atas`:
- `id`, `titulo`, `tipo_reuniao` text, `data_reuniao` date, `conteudo` text, `arquivo_original` text, `arquivo_assinado` text, `status` text default 'rascunho', `created_at`

`assinaturas_ata`:
- `id`, `ata_id` ref atas, `nome_assinante`, `email_assinante`, `status_assinatura` text default 'pendente', `data_assinatura` timestamptz, `created_at`

**1.4 RLS — conforme Ajuste 4:**

Tabelas espirituais (`ficha_corrente`, `ocorrencias_mediunicas`, `linhagem_espiritual`, `cruzamentos`, `coroacoes`, `entidades`, `historico_religioso`):
- SELECT: `pai_mae_de_santo` + `congal` (leitura)
- INSERT/UPDATE/DELETE: `pai_mae_de_santo`

`observacoes_internas`: manter `secretaria` com acesso total (administrativo)

`pessoas`: adicionar SELECT para `pai_mae_de_santo`; manter INSERT/UPDATE para `secretaria` (Ajuste 4 — secretaria pode registrar ingresso e atualizar dados administrativos)

`timeline_eventos`: SELECT todos autenticados; INSERT para admin/congal/pai_mae_de_santo/secretaria

`atas`, `assinaturas_ata`: CRUD para `secretaria` e `congal`

**1.5 Atualizar RLS existentes das tabelas espirituais:**
- Dropar politicas atuais que davam escrita para `secretaria` em cruzamentos/coroacoes/entidades/historico_religioso
- Recriar com `pai_mae_de_santo` como perfil de escrita

**1.6 Storage:** criar bucket `atas` (privado)

**1.7 Registrar perfil e funcionalidades:**
- INSERT perfil `pai_mae_de_santo` na tabela `perfis`
- INSERT funcionalidades do Prontuario Mediunico e Atas na tabela `funcionalidades`

---

### 2. Frontend

**2.1 AuthContext:** reconhecer `pai_mae_de_santo` em `isPerfil`, adicionar display name no sidebar

**2.2 Sidebar — reorganizar:**
- Secretaria: Pessoas, Ficha de Admissao, Atas
- Novo modulo Prontuario Mediunico (perfil `pai_mae_de_santo`): Mediuns, Ficha de Corrente, Cruzamentos, Entidades, Coroacoes, Historico, Ocorrencias, Arvore Espiritual, Mapa Espiritual, Linha do Tempo, Dashboard Espiritual

**2.3 Refatorar `PessoaPerfil.tsx`:**
- Remover abas espirituais (Cruzamentos, Coroacoes, Entidades, Historico Religioso)
- Expandir aba Dados Pessoais com novos campos (numero_associado, cpf, rg, etc.)
- Adicionar botoes Exportar PDF / Imprimir (via `window.print()` + CSS `@media print`)

**2.4 Mover hooks espirituais de `useSecretaria.ts` para `useProntuario.ts`:**
- cruzamentos, coroacoes, entidades, historico_religioso
- Adicionar hooks para ficha_corrente, ocorrencias_mediunicas, linhagem_espiritual, timeline_eventos

**2.5 Criar `useAtas.ts`:** hooks para atas e assinaturas_ata

**2.6 Novas paginas:**

| Pagina | Rota |
|---|---|
| `FichaAdmissao.tsx` | `/secretaria/ficha-admissao` |
| `Atas.tsx` | `/secretaria/atas` |
| `AtaEditor.tsx` | `/secretaria/atas/nova` |
| `DashboardEspiritual.tsx` | `/prontuario/dashboard` |
| `MediunsProntuario.tsx` | `/prontuario/mediuns` |
| `FichaCorrente.tsx` | `/prontuario/mediuns/:id` |
| `Ocorrencias.tsx` | `/prontuario/ocorrencias` |
| `ArvoreEspiritual.tsx` | `/prontuario/arvore` |
| `MapaEspiritual.tsx` | `/prontuario/mapa` |
| `LinhaDoTempo.tsx` | `/prontuario/timeline` |

**2.7 Rotas em `App.tsx`:** adicionar todas as rotas acima com `ModuleRoute` adequado (`secretaria` ou `pai_mae_de_santo`)

---

### 3. Resumo dos ajustes incorporados

| Ajuste | Mudanca |
|---|---|
| 1 — linhagem_espiritual | `tipo_vinculo` com validation trigger (pai/mae/filho/neto_de_santo) |
| 2 — ficha_corrente | Campos singulares: `padrinho_espiritual` text, `padrinho_material` text |
| 3 — timeline_eventos | `registro_id` uuid em vez de text |
| 4 — acesso secretaria | Secretaria mantem leitura + insercao/edicao administrativa em `pessoas`; sem acesso de escrita em dados espirituais |
| Melhoria 1 | Campo `tipo_vinculo_umbanda` em `pessoas` |
| Melhoria 2 | Campo `ativo_espiritual` boolean em `pessoas` |

