# OS_REDESIGN_008 — Páginas restantes + limpeza de cores cruas

**Status:** 🔲 Não iniciada
**Branch:** criar `feature/os-008-paginas-restantes` a partir de `develop` — nunca em
`main` (ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_001 a 007 (a maioria dos componentes genéricos já deve estar
atualizada antes desta varredura final)

## Escopo

- Reskin simples de `About.jsx`, `Login.jsx`, `SignUp.jsx`, `Orders.jsx`,
  `OrderDetail.jsx` — herdando os tokens/componentes já atualizados (`Button`, `Card`,
  badges), sem redesenho estrutural dedicado (o `PROJECT_SPEC.md` não detalha essas
  telas).
- Varrer os arquivos que ainda usam cor crua do Tailwind (`gray-*`, `blue-*`, `indigo-*`)
  não tocados pelas OS anteriores, substituindo por `borda`/`areia`/`neutro` conforme o
  contexto de cada uso — **revisão caso a caso, não find-and-replace mecânico**.
- `pages/admin/*` — **fora de escopo de redesenho dedicado**; herdam os tokens
  automaticamente via `Button`/`Card` atualizados, sem OS própria.

## Definition of Done

- [ ] `npx vitest run` sem novas falhas
- [ ] Verificação de que nenhum `gray-*`/`blue-*`/`indigo-*` restou fora de `pages/admin/*`
      (`grep -rl "gray-\|blue-\|indigo-" src --include="*.jsx"` restrito a fora de admin)
- [ ] `npx vite build` limpo
- [ ] **`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_008.md` gerado** seguindo o
      template de `AGENTS.md` §6.3 — sem esse relatório a OS não está concluída

## Arquivos a alterar

- `src/pages/About.jsx`, `src/pages/Login.jsx`, `src/pages/SignUp.jsx`,
  `src/pages/Orders.jsx`, `src/pages/OrderDetail.jsx`
- Demais arquivos com cor crua identificados pelo grep acima
