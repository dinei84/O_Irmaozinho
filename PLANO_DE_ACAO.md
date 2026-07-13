# PLANO_DE_ACAO.md — O Irmãozinho · Profissionalização

Documento de planejamento para transformar o projeto em uma aplicação profissional: segura, em conformidade com a LGPD, com e-commerce completo e o novo design do `PROJECT_SPEC.md`.

**Stack atual**: React 18 + Vite 5 + Tailwind 3 · Firebase (Auth, Firestore, Hosting) · Cloud Functions Node 20 (firebase-functions v4, API v1) · Mercado Pago (PIX, Boleto, Cartão).

**Ordem de execução**: as fases estão em ordem de prioridade. A Fase 0 corrige vulnerabilidades exploráveis hoje e deve ser feita **antes de qualquer outra coisa** — inclusive antes do redesign.

---

## FASE 0 — Correções de segurança emergenciais (1–3 dias)

Vulnerabilidades confirmadas no código atual, em ordem de gravidade.

> 📄 **A auditoria completa está em [`docs/seguranca/AUDITORIA_SEGURANCA.md`](docs/seguranca/AUDITORIA_SEGURANCA.md)** (14 vulnerabilidades, com prova de conceito e impacto) e o **passo a passo executável em [`docs/seguranca/PLANO_REMEDIACAO.md`](docs/seguranca/PLANO_REMEDIACAO.md)** (19 passos, com código e verificação). Esta seção é o resumo; trabalhe a partir do plano de remediação.
>
> ✅ **Credenciais do Mercado Pago revogadas em 13/07/2026** — a aplicação do MP foi excluída, invalidando os tokens que estavam expostos no histórico do git.

### 0.1 CRÍTICO — Manipulação de valor do pagamento (price tampering)
- **Onde**: `functions/index.js` (`createPaymentIntent`) recebe `amount` do cliente e o envia direto ao Mercado Pago (`MercadoPagoGateway.createPayment` → `transaction_amount: Number(amount)`).
- **Ataque**: qualquer usuário autenticado chama a function com `amount: 0.01` para um pedido de R$ 500. O webhook aprova e o pedido vira `paid`.
- **Correção**:
  1. Ignorar o `amount` do cliente. Ler `order.finalTotal` do Firestore dentro da function e usar esse valor.
  2. Ainda melhor: **criar o pedido no servidor**. Nova callable `createOrder` que recebe apenas `items: [{productId, quantity}]` + dados de entrega, busca os preços reais na coleção `products`, calcula subtotal/frete/total no servidor e grava o pedido. O cliente nunca envia preço.
  3. Remover os parâmetros `amount` de `src/services/paymentService.js`.

### 0.2 CRÍTICO — Brecha nas rules de `orders`
- **Onde**: `firestore.rules` (~linha 271): a última cláusula do `allow update` de `/orders/{orderId}` permite update para **qualquer usuário autenticado** desde que `updatedAt == request.time`.
- **Ataque**: qualquer usuário logado edita qualquer pedido de qualquer pessoa — inclusive marcar o próprio pedido como `paid` sem pagar.
- **Correção**: remover essa cláusula inteira. Webhooks e Cloud Functions usam o Admin SDK, que **não passa pelas rules** — a cláusula é desnecessária. Manter apenas: admin pode tudo; dono pode apenas cancelar (com `affectedKeys` restrito, como já está).

### 0.3 CRÍTICO — XSS armazenado no corpo dos artigos
- **Onde**: `src/components/features/textToSpeech/HighlightableText.jsx:116` renderiza `article.body` com `dangerouslySetInnerHTML` **sem nenhuma sanitização** (não há DOMPurify no projeto).
- **Agravante**: `firestore.rules` (~linha 138) tem regra marcada como "TEMPORÁRIO" permitindo que **qualquer usuário autenticado crie artigos**. Combinação: qualquer usuário cria um "artigo" com `<img onerror=...>` e executa JS no navegador de todos os visitantes e do admin (roubo de sessão de admin).
- **Correção**:
  1. `npm i dompurify` e sanitizar **na renderização** (`DOMPurify.sanitize(body, {ALLOWED_TAGS: [...]})`) em todo lugar que usa `dangerouslySetInnerHTML` ou `innerHTML` com dados do Firestore (`HighlightableText`, `ArticleEditor`, `stripHtml`).
  2. Restaurar `allow create: if isAdmin()` na coleção `content`.
  3. Sanitizar também na escrita (ArticleEditor) — defesa em profundidade.

### 0.4 ALTO — Webhook do Mercado Pago sem validação de assinatura
- **Onde**: `handlePaymentWebhook` em `functions/index.js` aceita qualquer POST. Hoje há mitigação parcial (busca o pagamento na API do MP pelo ID), mas nada impede replay/enumeração de IDs de pagamento.
- **Correção**: validar o header `x-signature` (HMAC-SHA256 com o secret do webhook do painel MP) + `x-request-id`, conforme documentação oficial do MP. Rejeitar com 401 se inválido. Guardar o secret como secret do Functions (`MERCADOPAGO_WEBHOOK_SECRET`).

### 0.5 ALTO — Rules de `comments` permitem alterar campos arbitrários
- **Onde**: primeiro `allow update` de `/comments/{commentId}` não restringe `affectedKeys` — o dono pode alterar `userName`, `articleId`, `createdAt`, etc. O limite de 1h de edição está desativado ("DESATIVADO TEMPORARIAMENTE PARA DEBUG").
- **Correção**: restringir com `diff().affectedKeys().hasOnly(['content', 'updatedAt'])` e reativar o limite de tempo.

### 0.6 MÉDIO — Headers de segurança no Hosting
- **Onde**: `firebase.json` não define nenhum header.
- **Correção**: adicionar em `hosting.headers`:
  - `Content-Security-Policy` (script-src restrito ao próprio domínio + SDK do MP; sem `unsafe-inline` em script)
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` / `frame-ancestors 'none'`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` mínima

### 0.7 MÉDIO — Idempotency key fixa no gateway
- **Onde**: `MercadoPagoGateway.js:17` — `idempotencyKey: 'abc'` (hardcoded).
- **Risco**: pagamentos diferentes tratados como duplicados pelo MP.
- **Correção**: gerar por requisição (ex.: `orderId + paymentMethod` ou UUID) e passar por chamada, não no construtor.

**Checklist de saída da Fase 0**: deploy das rules corrigidas, deploy das functions corrigidas, teste manual de checkout completo, tentativa de exploit dos itens 0.1–0.3 falhando.

---

## FASE 1 — Hardening estrutural (1–2 semanas)

### 1.1 Firebase App Check
- Ativar App Check com reCAPTCHA Enterprise/v3 no Firestore, Functions e Auth. Bloqueia chamadas fora do app (scripts, bots).
- `enforce` só após período de monitoramento (métricas no console).

### 1.2 Migrar Functions para API v2 (`firebase-functions/v2`)
- v1 está em caminho de depreciação. Na migração, aproveitar:
  - `onCall` v2 com `enforceAppCheck: true`
  - Limites de instância (`maxInstances`) — proteção de custo contra abuso/DoS
  - Secrets via `defineSecret`
- Configurar região `southamerica-east1` (latência + dados no Brasil ajuda LGPD).

### 1.3 Transações reais no estoque
- **Onde**: `reduceProductStock` em `functions/index.js` usa read-then-batch (condição de corrida: dois webhooks simultâneos vendem o mesmo último item).
- **Correção**: `db.runTransaction()` com leitura e decremento atômicos. Considerar **reserva de estoque** na criação do pedido (decrementa em `pending`, devolve se cancelar/expirar) para não vender item sem estoque.

### 1.4 Idempotência do webhook
- Registrar eventos processados (coleção `webhook_events` com o `x-request-id`/payment id) e ignorar duplicados — MP reenvia webhooks. Hoje o `statusHistory` pode receber entradas duplicadas.

### 1.5 Verificação de e-mail obrigatória
- `AuthContext` não chama `sendEmailVerification`. Enviar no cadastro e exigir `emailVerified` para: comentar, curtir e comprar (checar também nas rules: `request.auth.token.email_verified == true`).

### 1.6 Validação de pedido nas rules
- `isValidOrder` não valida consistência de `items` (preço, quantidade) nem que `finalTotal` bate com a soma. Com a criação de pedido movida para o servidor (0.1), restringir `allow create` de orders a admin/nada (só via function).

### 1.7 Higiene de repositório e dependências
- Remover `dist/` do repositório (está commitado); garantir no `.gitignore`.
- Remover arquivos de troubleshooting Windows da raiz (`fix-windows-block.ps1`, etc.) → `docs/arquivo/` ou deletar.
- `npm audit` + atualização das dependências (Firebase SDK 10→12, Vite 5→atual, firebase-admin, mercadopago).
- Verificar histórico do git por secrets commitados (`git log -p -- .env*`, procurar API keys). Se houver, rotacionar credenciais.
- Rotacionar o access token do MP se ele já apareceu em algum doc/commit.

### 1.8 Regras de rate limiting / anti-abuso
- Comentários e likes: limitar frequência via rules (comparar `request.time` com último doc) ou via function. Evita spam.
- Login: o Firebase Auth já tem proteção básica; ativar **proteção contra enumeração de e-mail** no console.

---

## FASE 2 — LGPD + Newsletter (1–2 semanas)

A funcionalidade de e-mails para inscritos **deve nascer em conformidade** — é mais barato do que adequar depois.

### 2.1 Base legal e documentos
- Criar páginas: **Política de Privacidade** e **Termos de Uso** (rotas `/privacidade`, `/termos`), com versão e data.
- Mapear dados coletados e base legal (art. 7º LGPD):
  | Dado | Onde | Base legal | Retenção |
  |---|---|---|---|
  | Nome, e-mail (conta) | `users` | Execução de contrato | Enquanto a conta existir |
  | CPF/CNPJ, endereço | `orders` | Execução de contrato + obrigação legal (fiscal) | 5 anos (prazo fiscal) |
  | E-mail newsletter | `newsletter_subscribers` | **Consentimento** | Até revogação |
  | Comentários/curtidas | `comments`/`likes` | Legítimo interesse | Enquanto a conta existir |
- Definir encarregado (DPO) — pode ser o próprio titular do projeto — com e-mail de contato na política.
- Nota de transferência internacional (Firebase/Google — art. 33): citar na política; preferir região `southamerica-east1` para Firestore/Functions em projetos novos.

### 2.2 Newsletter com consentimento (double opt-in)
- **Coleção** `newsletter_subscribers`: `{ email, status: 'pending'|'confirmed'|'unsubscribed', consentAt, consentPolicyVersion, confirmToken, unsubscribeToken, source }`.
- **Fluxo**: formulário → grava `pending` + envia e-mail com link de confirmação (double opt-in) → link confirma via function → `confirmed`.
- **Todo e-mail enviado** deve ter link de descadastro de 1 clique (token único, sem login).
- **Registro de consentimento**: guardar timestamp e versão da política aceita (prova de consentimento, art. 8º §2º).
- **Provedor de envio**: usar um provedor transacional (Resend, Brevo ou SendGrid — Resend é o mais simples; Brevo tem plano grátis generoso e servidores com DPA). Nunca enviar SMTP direto do Functions com Gmail.
- **Domínio**: configurar SPF, DKIM e DMARC no DNS do domínio para entregabilidade.
- **Envio em massa**: function agendada/fila (Cloud Tasks ou lotes com backoff) — respeitar rate limits do provedor.
- Rules: `newsletter_subscribers` sem leitura pública; escrita apenas via functions (Admin SDK); `allow read, write: if false` no cliente, exceto talvez `create` do próprio e-mail com App Check.

### 2.3 Direitos dos titulares (arts. 18–20)
- **Exclusão de conta**: função `deleteMyAccount` (callable) que: apaga `users/{uid}`, anonimiza comentários (`userName: 'Usuário removido'`), remove likes, **anonimiza** pedidos (mantém dados fiscais obrigatórios: itens/valores; remove/mascara nome, e-mail se possível — registrar justificativa de retenção fiscal), remove da newsletter, apaga a conta do Auth.
- **Exportação de dados**: função que gera JSON com todos os dados do usuário (portabilidade).
- Botões na página de perfil/conta para ambos.

### 2.4 Minimização e proteção do CPF
- CPF só é exigido pelo MP para boleto (e nota fiscal). Não coletar quando desnecessário (PIX de baixo valor pode dispensar? verificar exigência do MP — se obrigatório, ok, é execução de contrato).
- Nunca logar CPF nos `console.log` das functions (revisar logs atuais — `createPayment` loga o objeto).
- Acesso: já restrito nas rules (dono + admin). Manter.

### 2.5 Cookies e analytics
- Hoje não há analytics. Se adicionar (GA4/Plausible), preferir opção sem cookies (Plausible/Umami) — dispensa banner. Se GA4: banner de consentimento antes de carregar.

---

## FASE 3 — E-commerce completo (2–4 semanas)

### 3.1 Pedido criado no servidor (concluir o iniciado na Fase 0)
- Callable `createOrder`: valida estoque, preços do banco, calcula frete, cria pedido `pending` com reserva de estoque e TTL (pedido não pago em X horas → cancela e devolve estoque via function agendada).

### 3.2 Frete
- Integração de cálculo: **Melhor Envio** (agrega Correios + transportadoras, API boa e gratuita) ou SuperFrete. Callable `calculateShipping(zipCode, items)`.
- Guardar o frete cotado no pedido (servidor), nunca aceitar valor do cliente.

### 3.3 E-mails transacionais (mesmo provedor da newsletter)
- Confirmação de pedido, pagamento aprovado, pedido enviado (com rastreio), pedido entregue, pedido cancelado.
- Disparados por trigger do Firestore (`onDocumentUpdated` em orders, comparando status) — não pelo cliente.

### 3.4 Ciclo de vida do pedido
- Estorno/cancelamento pós-pagamento: integrar API de refund do MP (callable admin-only `refundOrder`).
- Tela admin: anexar código de rastreio; mudança de status dispara e-mail.
- Política de troca/devolução (obrigatória pelo CDC — art. 49, direito de arrependimento em 7 dias) — página `/trocas-e-devolucoes`.

### 3.5 Imagens de produtos
- Hoje `imageUrl` é URL externa. Migrar para **Firebase Storage** com rules próprias (upload só admin, limite de tamanho/tipo), servindo via CDN do Firebase. Redimensionar com a extensão *Resize Images*.

### 3.6 Dados obrigatórios de loja (legislação brasileira)
- Rodapé com CNPJ/CPF do vendedor, endereço e contato (Decreto do E-commerce 7.962/2013).

---

## FASE 4 — Redesign + PWA (seguir PROJECT_SPEC.md) (3–5 semanas)

O `PROJECT_SPEC.md` já é a fonte de verdade do design. Plano de implementação:

### 4.1 Fundação do design system (1ª semana)
- Tokens no `tailwind.config.js`: paleta terrosa completa (terracota `#B65E38`, oliva `#47533F`, dourado, papel, areia, pêssego, tinta, neutro) substituindo azul/navy.
- Fontes Spectral + Mulish **self-hosted** (`@fontsource/spectral`, `@fontsource/mulish`) — evita request ao Google Fonts (privacidade/LGPD + performance) — com `font-display: swap`.
- Refatorar `Button.jsx`, `Card.jsx`, badges conforme seção 5 do spec (pill, alvos de toque 44px).

### 4.2 Páginas (2ª–3ª semanas)
- Ordem: Header/nav (+ bottom tab bar mobile) → Home (hero + grade de cards) → página de artigo (barra de progresso, capitular, blockquotes, player TTS redesenhado, comentários) → listagens (Artigos/Crônicas) → Loja/checkout → páginas restantes.
- Mobile-first estrito (spec 6.2).

### 4.3 Marca
- Gerar o símbolo (dois círculos) em SVG + exportações: favicon 16/32, touch icon 180, ícones PWA 192/512 maskable.

### 4.4 PWA (4ª semana)
- `vite-plugin-pwa`: manifest conforme spec 6.3, service worker com precache do shell + `staleWhileRevalidate` para artigos (leitura offline).
- Prompt de instalação customizado (spec 5.7) com fallback iOS.
- `theme-color` dinâmico por tela.
- **Atenção**: SW + CSP precisam ser configurados juntos (a CSP da Fase 0.6 deve permitir o SW).

### 4.5 Performance
- Lazy-load de rotas (`React.lazy`) e imagens (`loading="lazy"`, `srcset`).
- Meta: Lighthouse ≥ 90 em Performance/Accessibility/Best Practices/SEO em mobile.
- SEO: como é SPA com conteúdo público (blog), avaliar pre-render (vite-plugin-ssr/prerender das rotas de artigos) ou pelo menos meta tags dinâmicas + sitemap.xml gerado por function.

---

## FASE 5 — Qualidade contínua e operação (paralelo às fases 3–4)

### 5.1 CI/CD (GitHub Actions)
- Pipeline em PR: `lint` → `vitest run` → `build` → **testes de rules com emulador** (`@firebase/rules-unit-testing` — crítico: as rules são o perímetro de segurança e hoje não têm teste).
- Deploy: merge em `main` → deploy automático de hosting; functions e rules com aprovação manual.
- Proibir push direto na `main` (branch protection).

### 5.2 Testes que faltam
- Testes das Firestore rules (emulador) — cobrir os exploits da Fase 0 como regressão.
- Testes das functions com emulador (createOrder, webhook com assinatura inválida, idempotência).
- E2E básico do checkout (Playwright) contra emuladores.

### 5.3 Observabilidade
- **Sentry** no front (erros de runtime dos usuários reais).
- Alertas de orçamento no Google Cloud Billing (Blaze sem alerta = risco financeiro).
- Alertas de erro das functions (Cloud Monitoring → e-mail).

### 5.4 Backup e recuperação
- Agendar export diário do Firestore para um bucket (retenção 30 dias). Point-in-time recovery (PITR) ativado.

### 5.5 Documentação
- Consolidar os ~50 arquivos de `docs/` (muitos são troubleshooting pontual, obsoletos) em: `README.md` (visão geral + setup), `SECURITY.md`, `PRIVACY-OPS.md` (procedimentos LGPD), `docs/arquivo/` para o histórico.
- Criar `CLAUDE.md` com convenções do projeto.

### 5.6 TypeScript (opcional, recomendado)
- Migração gradual: `allowJs`, novos arquivos em `.tsx`, começando por `services/` e `lib/`. Reduz classe inteira de bugs em código de pagamento.

---

## Resumo de priorização

| Fase | Conteúdo | Urgência | Esforço |
|---|---|---|---|
| 0 | Exploits ativos: price tampering, rules de orders, XSS, webhook, headers | **Imediata** | 1–3 dias |
| 1 | App Check, Functions v2, transações, e-mail verificado, higiene | Alta | 1–2 sem |
| 2 | LGPD (política, direitos, exclusão) + newsletter double opt-in | Alta | 1–2 sem |
| 3 | Pedido server-side completo, frete, e-mails transacionais, refund, Storage | Média | 2–4 sem |
| 4 | Redesign PROJECT_SPEC + PWA | Média | 3–5 sem |
| 5 | CI/CD, testes de rules, Sentry, backup, docs | Contínua | paralelo |

**Regra de ouro**: nenhuma feature nova (newsletter, redesign) entra em produção antes da Fase 0 concluída — as vulnerabilidades 0.1–0.3 são exploráveis por qualquer usuário cadastrado hoje.
