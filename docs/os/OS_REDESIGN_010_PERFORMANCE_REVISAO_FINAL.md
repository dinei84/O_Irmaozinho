# OS_REDESIGN_010 — Performance e revisão final

**Status:** 🔲 Não iniciada
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** todas as OS anteriores (revisão transversal)

## Escopo (`PLANO_DE_ACAO.md` 4.5)

- Lazy-load de rotas (`React.lazy`) e de imagens (`loading="lazy"`, `srcset`).
- Meta: Lighthouse ≥ 90 em Performance/Accessibility/Best Practices/SEO em mobile.
- Revisão final de contraste — nunca branco puro sobre terracota/oliva/tinta, sempre
  `#F7F1E7` (regra do spec §3) — em todas as páginas tocadas pelas OS anteriores.
- Revisão final de alvos de toque ≥44px em todas as páginas.

## Definition of Done

- [ ] Relatório Lighthouse (mobile) com as 4 métricas ≥ 90
- [ ] `npx vitest run` sem novas falhas
- [ ] `npx vite build` limpo, sem regressão de tamanho de bundle não justificada

## Arquivos a alterar

Revisão transversal — sem arquivo único; tipicamente `src/App.jsx` (lazy routes) e
pontos de `<img>` em componentes já redesenhados.
