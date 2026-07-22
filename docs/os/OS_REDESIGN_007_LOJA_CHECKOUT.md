# OS_REDESIGN_007 — Loja e Checkout

**Status:** 🔲 Não iniciada
**Branch:** criar `feature/os-007-loja-checkout` a partir de `develop` — nunca em `main`
(ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_001 (tokens)

## Escopo

Aplicar paleta/tipografia/botões/cards novos em `src/pages/Store.jsx`,
`src/pages/Checkout.jsx` e nos componentes de `src/components/checkout/*`.

**Restrição inegociável (`AGENTS.md` §4.4):** **não alterar** nenhuma lógica de
pagamento, cálculo de valor/total/frete ou fluxo de submissão — só classes visuais.
Qualquer teste de `checkout/__tests__/*` que falhar após esta OS é sinal de que lógica
foi tocada por engano, não de "falha esperada".

## Definition of Done

- [ ] `npx vitest run` sem novas falhas em `checkout/__tests__/*`
- [ ] Nenhuma mudança em `src/services/paymentService.js`, `src/hooks/useMercadoPago.js`
      ou em qualquer cálculo de valor
- [ ] Conferência visual manual do fluxo de checkout completo (sem finalizar pagamento
      real)
- [ ] `npx vite build` limpo
- [ ] **`docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_007.md` gerado** seguindo o
      template de `AGENTS.md` §6.3 — sem esse relatório a OS não está concluída

## Arquivos a alterar

- `src/pages/Store.jsx`
- `src/pages/Checkout.jsx`
- `src/components/checkout/*.jsx` (visual apenas)
