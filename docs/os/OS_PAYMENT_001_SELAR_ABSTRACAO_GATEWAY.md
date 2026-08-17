# OS_PAYMENT_001 — Selar a abstração de gateway de pagamento

**Status:** 🔲 Não iniciada
**Branch:** criar `feature/os-payment-001-selar-abstracao` a partir de `develop` — nunca em
`main` (`AGENTS.md` §9.7). **Passo zero, antes de qualquer edição.**
**Porte:** P/M
**Fonte:** `docs/arquitetura/ESTUDO_GATEWAY_ASAAS.md` §3 (vazamentos V3/V4/V5) e §9
(estratégia de coexistência). Aprovada pelo PO como "OS A".

---

## Contexto e motivação

O projeto tem uma abstração de gateway (`functions/gateways/` — `BaseGateway`,
`GatewayFactory`, `payment.config.js`) que **promete** trocar de provedor por variável de
ambiente (`PAYMENT_GATEWAY`). O estudo da Asaas mostrou que **essa promessa não se cumpre
hoje**: três pontos de "Mercado Pago" vazaram para fora de `functions/gateways/`.

**Esta OS não adota a Asaas nem troca de gateway.** Ela conserta a abstração para que a
troca — quando e se for decidida — seja de fato uma classe nova, e não uma cirurgia. As três
correções são dívida técnica real e valem por si, independentemente daquela decisão.

> ⚠️ **O item mais importante é o V3.** Sem ele, no dia em que `PAYMENT_GATEWAY` mudar,
> **todo pedido antigo com pagamento pendente no gateway anterior seria processado pelo
> gateway errado** — o webhook resolveria com o provedor errado e o pedido nunca sairia de
> `pending`. Isso é perda de venda e trabalho manual de conciliação. É a razão de esta OS
> existir antes de qualquer migração, não depois.

---

## Escopo

### V3 — `gateway` hardcoded no pedido *(o crítico)*

**Problema:** [`functions/index.js:253`](../../functions/index.js#L253) grava
`gateway: 'mercadopago'` fixo no `createOrder`. O pedido nasce marcado com um gateway que
pode não ser o que vai processá-lo.

**Correção:**
1. Gravar `gateway: paymentConfig.activeGateway` — o pedido registra **qual gateway o
   criou**, que é o que ele de fato usará.
2. **Roteamento por pedido:** `createPaymentIntent` e `checkPaymentStatus` devem instanciar
   o gateway a partir de `order.payment.gateway`, **não** da env global. Adicionar
   `GatewayFactory.createFor(gatewayName)` e fazer `create()` delegar a ele com o
   `activeGateway`. Se o pedido não tiver `gateway` (pedidos anteriores a esta OS), usar
   `'mercadopago'` como fallback explícito e comentado — é a verdade histórica deles.

### V4 — Secret específico do provedor em 3 functions

**Problema:** `runWith({ secrets: ['MERCADOPAGO_ACCESS_TOKEN'] })` aparece hardcoded em
[`functions/index.js:301`](../../functions/index.js#L301), `:505` e `:577`. Um gateway novo
exige um secret novo, e o nome está espalhado pelo arquivo.

**Correção:** centralizar em `payment.config.js` — exportar `getRequiredSecrets()`
devolvendo a lista de secrets de **todos** os gateways suportados (não só o ativo; as
functions precisam declarar tudo que podem vir a usar por roteamento por pedido). As 3
functions passam a usar `runWith({ secrets: paymentConfig.getRequiredSecrets() })`.

### V5 — Webhook conhece o formato do Mercado Pago

**Problema:** [`functions/index.js:592`](../../functions/index.js#L592) desestrutura
`const { type, data } = req.body` e checa `type === 'payment'` **antes** de delegar ao
gateway — formato do MP dentro do `index.js`. Além disso, `paymentId` é extraído ali e
usado só para log/validação, duplicando o que `processWebhook` já faz.

**Correção:** o handler entrega o `req.body` **cru** ao gateway e trabalha apenas com o
resultado normalizado (`{ processed, paymentId, status, orderId }`). Toda decisão sobre o
formato do payload passa a viver dentro do gateway. O `BaseGateway` ganha, no JSDoc de
`processWebhook`, o contrato explícito desse retorno.

**Fora do escopo:** assinatura/autenticação do webhook (R-10) e idempotência continuam
abertas — são a `PLANO_DE_ACAO.md` 0.4 e 0.7, com OS própria. Esta OS **não** as resolve e
não deve fingir que resolveu.

---

## Restrições

- **Nenhuma mudança de comportamento observável.** O fluxo com Mercado Pago tem de funcionar
  exatamente como antes. Esta é uma OS de refatoração estrutural.
- **Não** criar `AsaasGateway.js`. Não é esta OS.
- **Não** tocar em `src/` (frontend). Os vazamentos V1/V2 (SDK do MP no frontend) são
  deliberadamente deixados de fora — dependem da decisão sobre cartão (estudo §5).
- Manter `functions/` sem config de ESLint (DT-08) — não é esta OS.

---

## Definition of Done

- [ ] `git branch --show-current` = `feature/os-payment-001-selar-abstracao` antes da 1ª edição
- [ ] V3: `gateway` gravado a partir da config; `createPaymentIntent` e `checkPaymentStatus`
      roteando por `order.payment.gateway`, com fallback comentado para pedidos antigos
- [ ] V4: `getRequiredSecrets()` em `payment.config.js`; as 3 functions sem nome de secret hardcoded
- [ ] V5: handler do webhook sem `type`/`data` do MP; `BaseGateway.processWebhook` com contrato documentado
- [ ] `npx vitest run` — **343/343**, sem regressão
- [ ] `npm run lint` — 0 erros (warnings na baseline de 61 são aceitáveis)
- [ ] `npx vite build` — limpo
- [ ] `PROJECT_STATE.md` atualizado (§1 e §2)
- [ ] Commits separados por intenção lógica (`AGENTS.md`)

### Prova exigida no report

Para cada vazamento (V3/V4/V5), o report precisa de **prova reexecutável**:
- O `grep` que mostra que o vazamento **sumiu** — ex.: `grep -n "MERCADOPAGO_ACCESS_TOKEN" functions/index.js`
  deve voltar **vazio**; `grep -n "'mercadopago'" functions/index.js` deve voltar apenas a
  linha do fallback histórico comentado.
- Output literal de `npx vitest run` (343/343).

### Limite honesto desta OS

Os testes automatizados **não cobrem** as Cloud Functions (DT-07 — não há
`firebase-functions-test`). Portanto a prova aqui é **leitura de código + grep + suíte de
frontend sem regressão**, e o report deve dizer isso com todas as letras. Um checkout real
em sandbox continua sendo a única prova de ponta a ponta (`AGENTS.md` §9.5) e **não** é
exigido nesta OS, porque a loja está fora do ar (página de construção) e nenhum pedido novo
é criado em produção enquanto ela estiver assim.

---

*Emitida pelo CTO em 2026-08-17.*
