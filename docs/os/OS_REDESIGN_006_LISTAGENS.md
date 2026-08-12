# OS_REDESIGN_006 — Listagens (Artigos, Crônicas)

**Status:** ✅ Implementada, verificada e aprovada pelo CTO em 2026-08-12 (executada por
CLI Agent via subagente; decisão de manter `LikeButton` interativo validada)
**Relatório de execução:** [`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_006.md`](../execution-reports/EXECUTION_REPORT_OS_REDESIGN_006.md)
**Branch:** criar `feature/os-006-listagens` a partir de `develop` — nunca em `main`
(ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_004 (mesmo card de conteúdo da Home)

## Escopo

- Aplicar o mesmo card de conteúdo criado na OS_REDESIGN_004 em `src/pages/Articles.jsx`
  e `src/pages/Chronicles.jsx`.
- Grade responsiva 3/2/1 colunas (spec §6.1).

## Definition of Done

- [x] Conferência visual — herdada do card já validado ao vivo na OS_004 (Firebase de
      placeholder impede navegação real neste ambiente; ver relatório), sem regressão de testes
- [x] `npx vitest run` sem novas falhas
- [x] `npx vite build` limpo
- [x] **`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_006.md` gerado** seguindo o
      template de `AGENTS.md` §6.3 — sem esse relatório a OS não está concluída

## Arquivos a alterar

- `src/pages/Articles.jsx`
- `src/pages/Chronicles.jsx`
