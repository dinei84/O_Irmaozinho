# OS_REDESIGN_006 — Listagens (Artigos, Crônicas)

**Status:** 🔲 Não iniciada
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_004 (mesmo card de conteúdo da Home)

## Escopo

- Aplicar o mesmo card de conteúdo criado na OS_REDESIGN_004 em `src/pages/Articles.jsx`
  e `src/pages/Chronicles.jsx`.
- Grade responsiva 3/2/1 colunas (spec §6.1).

## Definition of Done

- [ ] Conferência visual manual, sem regressão de testes existentes dessas páginas
- [ ] `npx vitest run` sem novas falhas
- [ ] `npx vite build` limpo

## Arquivos a alterar

- `src/pages/Articles.jsx`
- `src/pages/Chronicles.jsx`
