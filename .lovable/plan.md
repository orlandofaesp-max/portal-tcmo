

## Plano: Exibir perfil "administrador" para usuários congal

### Problema

Na linha 63 de `GerenciarUsuarios.tsx`, o filtro restringe a opção "administrador" apenas a quem ja tem `perfil === "administrador"`. Usuarios com perfil `congal` (que tambem sao admins do sistema) nao conseguem ver essa opcao.

### Correcao

Alterar a condicao na linha 63 para permitir que tanto `administrador` quanto `congal` vejam a opcao:

```tsx
if (p === "administrador" && !["administrador", "congal"].includes(usuario?.perfil || "")) return false;
```

### Arquivo impactado

| Arquivo | Acao |
|---|---|
| `src/pages/admin/GerenciarUsuarios.tsx` | Linha 63 — ajustar filtro |

