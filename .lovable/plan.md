

## Análise

A página de Mensalidades **já possui** a funcionalidade de geração de mensalidades (botão "Gerar Mensalidades", dialog com competência e associado, lógica de duplicidade). O que falta são ajustes pontuais.

## Plano de Implementação

### 1. Migração SQL — Índice de performance

Adicionar um único índice:

```sql
CREATE INDEX IF NOT EXISTS idx_lancamentos_associado_id
ON lancamentos(associado_id);
```

### 2. Ajuste na tela de Mensalidades

A funcionalidade de geração já existe. Ajustes necessários:

- **Adicionar confirmação** antes de executar a geração (AlertDialog perguntando "Deseja gerar mensalidades para a competência X?")
- **Preencher automaticamente** a competência atual (MM/AAAA) no campo ao abrir o dialog
- **Melhorar mensagem de sucesso**: "Mensalidades geradas com sucesso." em vez de "X mensalidade(s) gerada(s)!"

### 3. Comentário de preparação futura

Adicionar comentário no código da função `handleGerar` indicando o ponto de extensão para notificações via WhatsApp/e-mail.

### Arquivos alterados

- `src/pages/Mensalidades.tsx` — confirmação, competência automática, mensagem, comentário futuro
- Migração SQL — 1 índice

Nenhuma tabela será criada ou alterada. Nenhum dado existente será modificado.

