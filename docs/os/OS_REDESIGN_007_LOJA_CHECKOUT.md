# OS_REDESIGN_007 — Loja e Checkout

**Status:** 🔲 Não iniciada
**Branch:** criar `feature/os-007-loja-checkout` a partir de `develop` — nunca em `main`
(ver `AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Roadmap:** [`docs/arquitetura/PLANO_REDESIGN_VISUAL.md`](../arquitetura/PLANO_REDESIGN_VISUAL.md)
**Depende de:** OS_REDESIGN_001 (tokens), OS_REDESIGN_004 (padrão de card/botões da Home)

---

## Leitura obrigatória antes de começar (nesta ordem)

1. `AGENTS.md` (governança, disciplina de branch, DoD, sanções)
2. `PROJECT_CONTEXT.md`
3. `PROJECT_STATE.md` (baseline de testes e dívidas técnicas conhecidas)
4. Esta OS (`docs/os/OS_REDESIGN_007_LOJA_CHECKOUT.md`)
5. `PROJECT_SPEC.md` — §3 (paleta), §4 (tipografia), §5.1 (botões), §5.3 (cards)
6. Referência de implementação já aprovada: `src/pages/Home.jsx` (card/botões) e
   `src/pages/ArticleDetail.jsx` (padrões visuais pós-OS_005)

## Passo zero (obrigatório)

```bash
git checkout develop
git checkout -b feature/os-007-loja-checkout
git branch --show-current   # DEVE imprimir feature/os-007-loja-checkout
```

---

## Escopo

Reskin **estritamente visual** da Loja e do Checkout, aplicando a paleta terrosa, a
tipografia (Spectral/Mulish), os botões pill e os cards do design system nas telas:

- `src/pages/Store.jsx`
- `src/pages/Checkout.jsx`
- `src/components/checkout/*.jsx` — todos os 7:
  `BoletoPaymentForm.jsx`, `CardPaymentForm.jsx`, `CustomerDataForm.jsx`,
  `OrderConfirmation.jsx`, `PaymentMethodSelector.jsx`, `PixPaymentForm.jsx`,
  `ShippingAddressForm.jsx`

Praticamente todos esses arquivos ainda usam cores cruas do Tailwind
(`gray-*`/`blue-*`/`slate-*`) — troque pelos tokens da paleta conforme o contexto
(`background`/`surface`/`text-primary`/`text-secondary`/`primary`/`secondary`/`borda`/
`areia`), revisando caso a caso (não é find-and-replace cego). Use `Button`/`Card` já
existentes onde fizer sentido, e a regra de contraste da spec §3 (nunca branco puro
sobre terracota/oliva; usar `#F7F1E7`).

## Restrição inegociável (`AGENTS.md` §4.4)

**NÃO alterar** nenhuma lógica de pagamento, cálculo de valor/total/frete, validação ou
fluxo de submissão — **só classes/markup visuais**. Especificamente, **não tocar**:
- `src/services/paymentService.js`
- `src/hooks/useMercadoPago.js`
- qualquer cálculo de valor, `finalTotal`, ou chamada de Cloud Function

Qualquer teste em `checkout/__tests__/*` ou `src/pages/__tests__/Checkout.integration.test.jsx`
que mude de status por causa desta OS é sinal de que lógica foi tocada por engano.

## Armadilhas conhecidas (não repita — já aconteceram em OS anteriores)

- **NÃO** crie objeto `CATEGORY_BADGES` (ou similar) com chaves no singular — já teve que
  ser removido nas OS_004 e OS_005. Use classe estática direta quando precisar de badge.
- Rode `npx vitest run` com o **servidor de dev DESLIGADO** — rodar `npm run dev` junto
  corrompe os números por contenção de recursos.
- Se `git status` mostrar `dist/index.html` alterado após o build, reverta:
  `git checkout -- dist/index.html` (artefato rastreado por engano, fora do escopo).
- **NÃO** toque em `src/lib/sanitize.js`.
- **NÃO** faça merge nem `git push` — deixe a branch pronta para o CTO revisar.

---

## Definition of Done

- [ ] Reskin visual aplicado em `Store.jsx`, `Checkout.jsx` e nos 7 componentes de
      `checkout/`, usando tokens da paleta (sem cores cruas remanescentes nesses arquivos)
- [ ] Nenhuma mudança em `paymentService.js`, `useMercadoPago.js` ou em qualquer cálculo
      de valor/fluxo de pagamento
- [ ] `npx vitest run` (2 execuções consecutivas, dev server desligado) **sem novas
      falhas** em relação à baseline conhecida (284 passando / 14 falhas pré-existentes /
      298 total — ver `PROJECT_STATE.md` §0; algumas dessas 14 já são de `checkout/`, o
      alvo é **não aumentar** o número, não zerá-lo)
- [ ] `npx vite build` limpo (o warning de chunk >500KB é pré-existente, ok)
- [ ] Conferência visual do fluxo de checkout (na medida do possível no ambiente — ver
      nota abaixo); ser honesto sobre o que não deu para verificar ao vivo
- [ ] **Arquivo de report gerado (ver seção "Entrega obrigatória" abaixo)**

> **Nota sobre verificação visual:** este ambiente normalmente não tem `.env` com
> credenciais reais do Firebase, então o app pode não montar / não carregar dados. Se
> não der para navegar de verdade, **não marque a verificação visual como concluída** —
> registre no report o que foi verificado (leitura de código, build, testes) e o que não
> foi. Nunca marque "verificação manual em navegador" tendo rodado só teste automatizado
> (regra `AGENTS.md` §9.5).

---

## Entrega obrigatória — arquivo de report para análise

Ao final da OS, o agente **DEVE** criar o arquivo:

```
docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_007.md
```

seguindo o template do `AGENTS.md` §6.3. **Sem esse arquivo de report, a OS NÃO está
concluída** — ele é o que o CTO vai ler para analisar e aprovar (ou devolver) o trabalho.
O report precisa conter, no mínimo:

- **Escopo implementado** (o que foi feito, por arquivo)
- **Arquivos alterados** (tabela)
- **Testes**: a linha de resultado (`Test Files`/`Tests`) das **2 execuções**
  consecutivas — colada literalmente, não resumida a "passou"
- **Build**: resultado do `npx vite build`
- **DoD**: cada item marcado com honestidade (`[x]` só o que foi realmente feito;
  `[ ]`/`[~]` o que não foi, com o motivo)
- **Decisões / ambiguidades resolvidas** (qualquer escolha que você teve que fazer)
- **Dívidas técnicas identificadas** (se houver)
- **Observações para o CTO**

Depois de gerar o report, faça o(s) commit(s) na branch `feature/os-007-loja-checkout`
(Conventional Commits, terminando com
`Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`) e **pare** — sem merge, sem
push. A branch fica aguardando revisão do CTO.

---

## Arquivos a alterar

- `src/pages/Store.jsx`
- `src/pages/Checkout.jsx`
- `src/components/checkout/BoletoPaymentForm.jsx`
- `src/components/checkout/CardPaymentForm.jsx`
- `src/components/checkout/CustomerDataForm.jsx`
- `src/components/checkout/OrderConfirmation.jsx`
- `src/components/checkout/PaymentMethodSelector.jsx`
- `src/components/checkout/PixPaymentForm.jsx`
- `src/components/checkout/ShippingAddressForm.jsx`
- `docs/execution-reports/EXECUTION_REPORT_OS_REDESIGN_007.md` (novo — o report)

## Fora de escopo

- Lógica de pagamento, frete, cálculo de valores (só visual).
- `LikeButton` e outros componentes compartilhados fora de `checkout/`.
- Reskin de `pages/admin/*` (herdam tokens via `Button`/`Card`, sem OS própria).
