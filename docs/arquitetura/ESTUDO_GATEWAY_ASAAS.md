# Estudo — Adoção da Asaas como gateway de pagamento

**Versão:** 1.0 | **Data:** 2026-08-17
**Autor:** CTO (Claude LLM) | **Decisão pertence a:** Product Owner (Dinei) — ver `PROJECT_CONTEXT.md` §3
**Status:** Estudo para decisão. Nenhum código alterado.

---

## 1. Pergunta e veredito

> "Qual a possibilidade de usarmos uma aplicação ou gateway de pagamento como a Asaas, e o que isso implicaria no projeto?"

**Possibilidade: alta.** A arquitetura de pagamento já foi construída para isso — `functions/gateways/` tem
`BaseGateway` (contrato de 4 métodos), `GatewayFactory` (troca por variável de ambiente) e
`payment.config.js` (`PAYMENT_GATEWAY`). Trocar o *backend* de pagamento é, de fato, escrever uma classe nova.

**Mas a implicação principal não está no backend.** Está em três pontos que a abstração atual não cobre:

| # | Implicação | Gravidade |
|---|---|---|
| 1 | **Cartão de crédito**: a Asaas não tem SDK de tokenização no frontend. Os dados do cartão passariam a trafegar pelo nosso servidor, o que **coloca nossa infraestrutura no escopo do PCI-DSS** (a própria Asaas indica SAQ D nesse cenário). Hoje, com o Mercado Pago, o cartão nunca toca nosso código. | 🔴 **ALTA** |
| 2 | **Custo**: para o perfil provável desta loja (ticket baixo, PIX predominante), a Asaas sai **mais cara**, não mais barata — o PIX dela é tarifa fixa (R$ 1,99) contra percentual do MP (0,99%). O ponto de equilíbrio é ~R$ 201 de ticket. | 🟠 MÉDIA |
| 3 | **Modelo de dados**: a Asaas é *customer-first* (exige um `customer` cadastrado antes da cobrança); o MP é *payment-first*. Isso adiciona uma entidade e um passo de sincronização ao fluxo. | 🟡 BAIXA/MÉDIA |

**Recomendação resumida:** não migrar agora por custo ou por conveniência de API — os números não sustentam,
e o cartão piora nossa postura de conformidade. **Migrar (ou coexistir) faz sentido se e quando** o
marketplace multi-fornecedor sair do papel (split nativo) ou se houver assinatura/doação recorrente.
Detalhes em §9.

---

## 2. Ponto de partida: o que o projeto já tem

O plano de modularização (`MODULARIZACAO_PAGAMENTO_PLAN.md`) foi executado e entregou uma abstração real:

```
functions/
├── config/payment.config.js    ← activeGateway = process.env.PAYMENT_GATEWAY || 'mercadopago'
└── gateways/
    ├── BaseGateway.js          ← contrato: createPayment, getPaymentStatus, processWebhook, normalizeStatus
    ├── GatewayFactory.js       ← switch(gatewayName) — já tem o comentário "// Futuro: StripeGateway"
    └── MercadoPagoGateway.js   ← implementação atual
```

E o mais importante: **a resposta do gateway já é normalizada**. `formatPaymentResponse()`
([MercadoPagoGateway.js:179](functions/gateways/MercadoPagoGateway.js#L179)) devolve sempre o mesmo formato
(`{ gatewayPaymentId, status, pix, boleto, card }`), e `createPaymentIntent` grava esse formato no Firestore.

**Consequência prática, e é uma boa notícia:** `PixPaymentForm.jsx` e `BoletoPaymentForm.jsx` consomem
`payment.pix.qrCode` / `payment.boleto.pdfUrl` — formatos nossos, não do Mercado Pago. **Esses dois
componentes de frontend não mudariam uma linha numa migração.** O mesmo vale para `paymentService.js`,
`orderService.js` e as Firestore Rules.

---

## 3. Onde a abstração vaza (o trabalho real)

Seis pontos onde "Mercado Pago" escapou para fora de `functions/gateways/`:

| # | Local | O que vaza | Esforço p/ corrigir |
|---|---|---|---|
| V1 | [`src/hooks/useMercadoPago.js:3`](src/hooks/useMercadoPago.js#L3) | Carrega `https://sdk.mercadopago.com/js/v2` e chama `mp.createCardToken()`. **Não tem equivalente na Asaas.** | 🔴 Alto — ver §5 |
| V2 | [`src/components/checkout/CardPaymentForm.jsx:14`](src/components/checkout/CardPaymentForm.jsx#L14) | `VITE_MERCADOPAGO_PUBLIC_KEY` e todo o fluxo de token no cliente | 🔴 Alto |
| V3 | [`functions/index.js:253`](functions/index.js#L253) | `gateway: 'mercadopago'` **hardcoded** no `createOrder` — o pedido nasce marcado com o gateway errado se a env mudar | 🟢 Trivial (1 linha) |
| V4 | [`functions/index.js:301,505,577`](functions/index.js#L301) | `runWith({ secrets: ['MERCADOPAGO_ACCESS_TOKEN'] })` em 3 functions — o nome do secret é específico do provedor | 🟢 Baixo |
| V5 | [`functions/index.js:592`](functions/index.js#L592) | O webhook desestrutura `{ type, data }` — formato do MP — **antes** de delegar ao gateway. A Asaas envia `{ event, payment }`. | 🟡 Médio |
| V6 | [`MercadoPagoGateway.js:144`](functions/gateways/MercadoPagoGateway.js#L144) | Correlação pedido↔pagamento via `payment.metadata.order_id`. Na Asaas o campo é `externalReference`. | 🟢 Baixo (fica dentro do gateway novo) |

V3, V4 e V5 são dívidas da abstração que valem ser corrigidas **independentemente** desta decisão — são o
que impede o `PAYMENT_GATEWAY` de funcionar como promete hoje.

---

## 4. Diferenças de modelo: Asaas × Mercado Pago

| Aspecto | Mercado Pago (hoje) | Asaas | Impacto |
|---|---|---|---|
| Criação de cobrança | 1 chamada, `payer` inline | Exige `customer` **pré-cadastrado** (`POST /v3/customers`), depois `POST /v3/payments` com `customer` id | Novo campo `asaasCustomerId` em `users`, com dedupe por CPF |
| Campos obrigatórios | `transaction_amount`, `payment_method_id`, `payer` | `customer`, `billingType`, `value`, **`dueDate`** | `dueDate` é obrigatório **até para PIX e cartão** — hoje só o boleto tem vencimento |
| Correlação c/ pedido | `metadata.order_id` | `externalReference` | Mapeamento direto |
| Método de pagamento | `payment_method_id: 'pix' \| 'bolbradesco' \| 'credit_card'` | `billingType: 'PIX' \| 'BOLETO' \| 'CREDIT_CARD' \| 'UNDEFINED'` | Mapeamento direto |
| QR Code do PIX | Vem **inline** na resposta (`point_of_interaction.transaction_data`) | **Segunda chamada**: `GET /v3/payments/{id}/pixQrCode` → `{ encodedImage, payload, expirationDate }` | +1 round-trip no `createPayment` |
| Tokenização de cartão | **SDK JS no frontend** — cartão vai do browser direto ao MP | **Server-to-server** — `creditCard` + `creditCardHolderInfo` + `remoteIp` (IP do *pagador*, não do servidor) | 🔴 Ver §5 |
| Status | `approved`, `pending`, `rejected`, `in_process`… | `PENDING`, `CONFIRMED`, `RECEIVED`, `OVERDUE`, `REFUNDED`, `CHARGEBACK_REQUESTED`… (30+ eventos) | Novo `normalizeStatus` + **uma decisão de negócio** (abaixo) |
| Webhook — payload | `{ type, data: { id } }` → exige re-fetch do pagamento | `{ event, payment: {…} }` — objeto **completo** no corpo | Mais simples; mas exige validar, não confiar |
| Webhook — autenticação | HMAC `x-signature` (**ainda não implementado** — R-10 / `PLANO_DE_ACAO.md` 0.4) | Header `asaas-access-token` — segredo compartilhado configurado no painel | 🟢 **Ganho**: resolve R-10 com muito menos código |
| Natureza do produto | Gateway + conta | **Conta digital PJ completa** (sem mensalidade) + gateway + emissão de NF + régua de cobrança | Ganho operacional para quem não tem PJ estruturada |

### Decisão de negócio que a Asaas força

A Asaas separa **`CONFIRMED`** (pagamento autorizado, dinheiro ainda não disponível) de **`RECEIVED`**
(valor disponível na conta). Nosso modelo tem só `approved`. É preciso decidir explicitamente:

- **`CONFIRMED` → `approved`** (libera o pedido na autorização): melhor experiência, é o padrão de e-commerce.
- **`RECEIVED` → `approved`** (só libera com dinheiro em conta): mais conservador, mas segura o cliente dias.

Recomendo `CONFIRMED → approved` para cartão e `RECEIVED → approved` para boleto/PIX. Isso precisa ir
explícito no `normalizeStatus` do gateway novo, com comentário — é exatamente o tipo de decisão que se
perde e vira bug meses depois.

---

## 5. A implicação séria: PCI-DSS e os dados do cartão

Esta é a razão pela qual este estudo **não** recomenda uma migração simples.

**Hoje (Mercado Pago):**
```
Browser --[dados do cartão]--> sdk.mercadopago.com --> token
Browser --[apenas o token]--> nossa Cloud Function --> MP
```
O número do cartão **nunca passa** pelo nosso código, nossos logs ou nossa infraestrutura.
Isso é o que mantém o projeto no regime mais leve de PCI (tipicamente SAQ A-EP).

**Com Asaas via API:**
```
Browser --[dados do cartão]--> nossa Cloud Function --> Asaas
```
A [documentação de PCI-DSS da própria Asaas](https://docs.asaas.com/docs/pci-dss-1) é explícita: quando os
dados trafegam pela API, *"sua infraestrutura permanece no escopo"*, e o questionário aplicável é
**tipicamente o SAQ D** — o mais extenso. A Asaas atribui ao integrador: *"coleta dos dados do cartão;
transmissão das informações ao Asaas; controle de acessos; proteção da infraestrutura; armazenamento de
logs; correção de vulnerabilidades; treinamento das pessoas envolvidas"*.

Para um projeto que **acabou de fechar 4 vulnerabilidades críticas** e ainda tem itens abertos (App Check,
assinatura de webhook, idempotência), assumir escopo PCI-DSS SAQ D é um salto de responsabilidade
desproporcional ao ganho.

### As três saídas

| Saída | Como funciona | Escopo PCI | UX |
|---|---|---|---|
| **A. API direta** | Cartão passa pela nossa Function | 🔴 SAQ D | Checkout transparente (melhor) |
| **B. Asaas Checkout / Link de Pagamento** | Redireciona para página hospedada pela Asaas | 🟢 Reduzido | Sai do nosso site — perde o checkout transparente que o `PROJECT_SPEC.md` desenhou |
| **C. Híbrido** | PIX e boleto pela API da Asaas (sem dado de cartão); **cartão continua no Mercado Pago** | 🟢 Mantém o atual | Preservada |

A **saída C é tecnicamente possível** justamente porque a `GatewayFactory` existe — bastaria escolher o
gateway por `paymentMethod`, não por env global. Mas dobra a superfície operacional (duas contas, duas
conciliações, dois webhooks, dois painéis) e, como mostra §6, o ganho financeiro seria negativo.

> ⚠️ Ponto adicional: a tokenização da Asaas (`creditCardToken`) **vem habilitada só em Sandbox** — em
> produção exige aprovação do gerente de contas. Não é um obstáculo grande, mas é uma dependência externa
> de prazo que precisa ser resolvida *antes* de qualquer cronograma.

---

## 6. Custo — a conta que muda o veredito

Tarifas públicas coletadas em 2026-08-17 (**precisam ser confirmadas no contrato** — ambas as empresas
praticam condições negociadas, e a Asaas anuncia preço promocional nos 3 primeiros meses):

| Método | Mercado Pago | Asaas |
|---|---|---|
| PIX | **0,99%** (recebimento imediato) | **R$ 1,99 fixo** por cobrança |
| Cartão de crédito | 3,98% (30 dias) a **4,98%** (imediato) | **2,99% + R$ 0,49** (após promoção de 1,99% + R$ 0,49) |
| Boleto | *a verificar* | **R$ 1,99** (R$ 0,99 nos 3 primeiros meses) |
| Mensalidade | R$ 0 | R$ 0 |

### O ponto de equilíbrio do PIX

A tarifa fixa da Asaas só compensa acima de:

```
0,0099 × Ticket = R$ 1,99  →  Ticket ≈ R$ 201
```

**Abaixo de ~R$ 201 de ticket, o PIX do Mercado Pago é mais barato.** Numa loja de livros/produtos
cristãos, o ticket médio está muito abaixo disso.

### Simulação — 100 pedidos/mês, ticket médio R$ 70, mix 70% PIX / 20% cartão / 10% boleto

| Método | Volume | Mercado Pago | Asaas |
|---|---|---|---|
| PIX (70 pedidos, R$ 4.900) | R$ 4.900 | R$ 48,51 | R$ 139,30 |
| Cartão (20 pedidos, R$ 1.400) | R$ 1.400 | R$ 69,72 | R$ 51,66 |
| Boleto (10 pedidos) | — | *a verificar* | R$ 19,90 |
| **Total (sem boleto)** | | **R$ 118,23** | **R$ 190,96** |

**A Asaas sairia ~R$ 73/mês mais cara neste perfil** — o barateamento no cartão não compensa o
encarecimento no PIX. O quadro só se inverte se o ticket médio subir bem acima de R$ 200 ou se o mix
migrar fortemente para cartão.

---

## 7. O que a Asaas traz que o Mercado Pago não traz (bem)

Nada disto é urgente hoje, mas define **quando** a conversa muda:

1. **Split de pagamento nativo e simples.** `MARKETPLACE_PAYMENT_ANALYSIS.md` descreve a ambição de
   marketplace multi-fornecedor com repasse a editoras/fornecedores. O split da Asaas é um array `split`
   no próprio payload da cobrança, com a coleção `suppliers` mapeando para wallets. **Este é o argumento
   mais forte a favor da Asaas** — e é o gatilho que deve reabrir este estudo.
2. **Assinaturas e recorrência** (`/v3/subscriptions` + PIX Automático). Se o blog for oferecer apoio
   mensal / doação recorrente / clube de leitura, isso na Asaas é um endpoint; no MP é bem mais trabalhoso.
3. **Conta digital PJ completa**, sem mensalidade — emissão de nota fiscal, régua de cobrança, notificação
   automática por e-mail/WhatsApp para boleto vencido. Valor operacional real para uma operação enxuta.
4. **Webhook com autenticação trivial** (`asaas-access-token`) contra o HMAC do MP, que ainda é uma dívida
   aberta (R-10). Resolveria um item do `PLANO_DE_ACAO.md` de graça.

### O que se perderia

- **Antifraude do Mercado Livre.** O MP decide aprovação de cartão com dados do maior e-commerce da
  América Latina. Taxa de aprovação é receita: uma queda de 3 pontos percentuais custa mais do que toda a
  economia de tarifa calculada em §6. **Isso não é estimável em papel** — só medindo em produção.
- **Reconhecimento da marca no checkout.** "Mercado Pago" tem confiança do consumidor brasileiro no
  momento de digitar o cartão.
- **Toda a bagagem já testada.** 343 testes verdes, incluindo `Checkout.integration.test.jsx`, escritos
  contra o comportamento atual.

---

## 8. Escopo de trabalho, se a decisão for migrar

Dimensionado em OS, no formato do `AGENTS.md`. **Pré-requisito de todas:** conta Asaas aberta (KYC PJ) e
tokenização liberada em produção pelo gerente de contas.

| OS | Escopo | Arquivos | Porte |
|---|---|---|---|
| **A** — *Selar a abstração* | Corrigir V3/V4/V5: `gateway` dinâmico no `createOrder`, secrets por gateway, webhook delegando o payload cru ao gateway. **Vale fazer mesmo sem migrar.** | `functions/index.js`, `payment.config.js`, `GatewayFactory.js` | P |
| **B** — *AsaasGateway (PIX + boleto)* | `AsaasGateway.js` novo: cliente HTTP, `ensureCustomer()`, `createPayment`, 2ª chamada do `pixQrCode`, `normalizeStatus` com a decisão CONFIRMED/RECEIVED, `processWebhook` validando `asaas-access-token` + idempotência | `functions/gateways/AsaasGateway.js` (novo, ~350 linhas), `payment.config.js`, `GatewayFactory.js` | **M/G** |
| **C** — *Endpoint de webhook Asaas* | `handleAsaasWebhook` separado (o payload difere; a URL é configurada em painel próprio). **Roteamento por pedido**: pedidos antigos pagos via MP continuam sendo resolvidos pelo webhook do MP — ver §9. | `functions/index.js` | P/M |
| **D** — *Cartão* | Depende da saída escolhida em §5. Saída A: remover `useMercadoPago`, reescrever `CardPaymentForm` para enviar dados ao backend + `remoteIp`, **e abrir frente de conformidade PCI**. Saída B: substituir por redirect. Saída C: não fazer nada. | `src/hooks/useMercadoPago.js`, `CardPaymentForm.jsx`, `paymentService.js` | **G** (saída A) |
| **E** — *Modelo de dados* | `asaasCustomerId` em `users`, dedupe por CPF, migração dos usuários existentes (lazy, na primeira compra) | `functions/index.js`, `firestore.rules`, `userService.js` | P/M |
| **F** — *Testes e docs* | Testes do gateway novo, atualizar `paymentService.test.js`, `CardPaymentForm.test.jsx`, `Checkout.integration.test.jsx`; atualizar `PROJECT_CONTEXT.md` §2, `PLANO_DE_ACAO.md`, `PROJECT_STATE.md` | `src/**/__tests__/`, docs | M |

**Sem o cartão (saída C ou B), o trabalho é moderado: OS A, B, C, E, F.** Com cartão via API (saída A), a
OS D não é a maior parte do custo — a conformidade PCI-DSS que ela desencadeia é, e essa não é uma OS de
engenharia.

---

## 9. Estratégia recomendada, se houver migração

**Coexistir, não substituir.** A `GatewayFactory` permite, mas há uma armadilha:

> ⚠️ Hoje o webhook chama `GatewayFactory.create()`, que lê a env **global**. No dia em que
> `PAYMENT_GATEWAY` virar `asaas`, todo pedido antigo com pagamento pendente no Mercado Pago passaria a ser
> processado pelo gateway errado. O roteamento tem que ser **por pedido** (`order.payment.gateway`), não
> por env — e é por isso que a OS A (corrigir V3, o `gateway: 'mercadopago'` hardcoded) é
> **pré-requisito**, não opcional.

Ordem segura:

1. OS A (selar a abstração) — **independente da decisão**.
2. OS B + C + E em sandbox (`sandbox.asaas.com`), com `PAYMENT_GATEWAY=mercadopago` ainda em produção.
3. Teste manual real de ponta a ponta em sandbox — `AGENTS.md` §9.5 proíbe marcar checkout como verificado
   só com teste automatizado.
4. Virada só de PIX e boleto, cartão permanecendo no MP (saída C), por 30 dias, medindo tarifa real e
   taxa de conversão.
5. Decidir sobre cartão **com dados**, não com estimativa.

---

## 10. Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Escopo PCI-DSS SAQ D ao trazer cartão para o servidor | Alta (se saída A) | Saída B ou C; consultar QSA antes de qualquer código |
| Queda na taxa de aprovação de cartão sem o antifraude do MP | Média | Manter cartão no MP; medir antes de mover |
| Aumento de custo por tarifa fixa de PIX em ticket baixo | **Alta** (§6) | Renegociar tarifa antes de migrar; ou não migrar PIX |
| Tokenização não liberada em produção pela Asaas | Média | Resolver com gerente de contas **antes** do cronograma |
| Webhook: comportamento de fila/reenvio da Asaas não confirmado | Média | **Não verificado neste estudo** — validar em sandbox antes de desenhar a idempotência |
| Pedidos em trânsito na virada de gateway | Alta se OS A for pulada | Roteamento por pedido (§9) |
| Regressão nos 343 testes verdes | Média | OS F com TDD, conforme `AGENTS.md` |

---

## 11. Conclusão

A **capacidade técnica de adotar a Asaas já existe** — foi construída de propósito na modularização de
pagamento, e o trabalho de backend é uma classe nova de ~350 linhas mais três correções de vazamento da
abstração.

O que **não** sustenta a migração hoje:
- **Custo**: no perfil provável desta loja, a Asaas é mais cara (§6).
- **Cartão**: a ausência de tokenização no frontend transfere risco de conformidade para nós (§5).
- **Prioridade**: o `PROJECT_STATE.md` lista deploy do Sprint 0, R-10, App Check e testes de Functions
  como próximas ações. Trocar gateway com essas pendências abertas troca uma superfície conhecida e testada
  por uma nova e não testada.

O que **sustentaria** a migração, no futuro:
- Marketplace multi-fornecedor com repasse automático (split nativo) — **o gatilho principal**.
- Assinatura / apoio recorrente ao blog.
- Ticket médio subindo consistentemente acima de ~R$ 200.

**Proposta ao PO:** aprovar apenas a **OS A** (selar a abstração — V3/V4/V5). Ela é barata, corrige dívidas
reais que existem independentemente desta decisão, e deixa a porta da Asaas destrancada para o dia em que
o marketplace justificar abri-la.

---

## Fontes

Consultadas em 2026-08-17. Tarifas e políticas mudam — reconfirmar antes de qualquer decisão financeira.

- [Asaas — Introdução à API](https://docs.asaas.com/docs/visao-geral)
- [Asaas — Criar nova cobrança (referência)](https://docs.asaas.com/reference/criar-nova-cobranca)
- [Asaas — Cobranças via cartão de crédito](https://docs.asaas.com/docs/cobrancas-via-cartao-de-credito)
- [Asaas — Obter QR Code para pagamentos via Pix](https://docs.asaas.com/reference/obter-qr-code-para-pagamentos-via-pix)
- [Asaas — Eventos de webhook para cobranças](https://docs.asaas.com/docs/webhook-para-cobrancas)
- [Asaas — Dúvidas frequentes sobre webhooks](https://docs.asaas.com/docs/duvidas-frequentes-webhooks)
- [Asaas — PCI-DSS e responsabilidade compartilhada](https://docs.asaas.com/docs/pci-dss-1)
- [Asaas — Preços e taxas](https://www.asaas.com/precos-e-taxas)
- [Mercado Pago — tabela de taxas 2026 (fonte terceira)](https://www.calculadoradetaxas.com.br/public/mercado-pago/taxas)

### Documentos internos relacionados

- [`MODULARIZACAO_PAGAMENTO_PLAN.md`](./MODULARIZACAO_PAGAMENTO_PLAN.md) — a abstração que torna isto viável
- [`MARKETPLACE_PAYMENT_ANALYSIS.md`](./MARKETPLACE_PAYMENT_ANALYSIS.md) — o cenário que justificaria a troca
- [`ESTUDO_CASO_BOLETO_CARTAO.md`](./ESTUDO_CASO_BOLETO_CARTAO.md), [`PAYMENT_API_PLAN.md`](./PAYMENT_API_PLAN.md)
- [`../../PLANO_DE_ACAO.md`](../../PLANO_DE_ACAO.md) — itens 0.4 (assinatura de webhook) e 0.7 (idempotência)

*Fim do estudo — v1.0.*
