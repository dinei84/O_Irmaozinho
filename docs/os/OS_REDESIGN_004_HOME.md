# OS_REDESIGN_004 — Home

**Status:** ✅ Implementada, verificada e aprovada pelo CTO em 2026-07-22 (com remoção de
abstração morta `CATEGORY_BADGES` aplicada na revisão)
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Relatório de execução:** [`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_004.md`](../execution-reports/EXECUTION_REPORT_OS_REDESIGN_004.md)
**Depende de:** OS_REDESIGN_001 (tokens), OS_REDESIGN_003 (header)

## Escopo (`PROJECT_SPEC.md` §5.4, mockup do deck slide 04)

- Redesenhar `src/pages/Home.jsx`:
  - Hero dividido: badge "fé, esperança e alegria", título grande, resumo, CTA
    primário "Ler o destaque →" + botão secundário "História".
  - Grade de "últimos conteúdos" usando o card de conteúdo do spec §5.3: imagem 16:9,
    badge de categoria (`.badge-categoria`, criada na OS_REDESIGN_001) → título → resumo
    → "Ler mais →" + contador de curtidas.
- Grade responsiva: 3 colunas desktop → 2 tablet → 1 mobile (spec §6.1).

## Definition of Done

- [x] Grade responsiva nos 3 breakpoints
- [x] Comparação visual com o mockup do deck (slide 04)
- [x] `npx vitest run` sem novas falhas
- [x] `npx vite build` limpo
- [x] **`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_004.md` gerado** seguindo o
      template de `AGENTS.md` §6.3 — sem esse relatório a OS não está concluída

## Arquivos a alterar

- `src/pages/Home.jsx`
