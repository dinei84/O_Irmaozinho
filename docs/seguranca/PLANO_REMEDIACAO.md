# Plano de Remediação — O Irmãozinho

**Documento operacional.** Enquanto a [AUDITORIA_SEGURANCA.md](./AUDITORIA_SEGURANCA.md) responde *"o que está errado e por quê"*, este documento responde *"o que eu faço, em que ordem, e como sei que funcionou"*.

Cada passo tem: objetivo, arquivos afetados, o que fazer, **como verificar** e o comando de deploy. Marque o checkbox quando concluir.

**Rastreabilidade**: cada passo `R-xx` corrige uma ou mais vulnerabilidades `V-xx` da auditoria. A tabela de rastreabilidade está no final.

---

## Como usar este documento

1. Execute os passos **na ordem**. As dependências são reais: o R-03 (valor do servidor) só fica de fato seguro depois do R-09 (pedido criado no servidor) — mas o R-03 é 10 minutos de trabalho e fecha o buraco maior imediatamente, então vem antes.
2. Trabalhe numa branch: `git checkout -b security/sprint-0`.
3. Não faça deploy de um Sprint pela metade. Cada Sprint tem um deploy único no fim, com verificação.
4. Ao concluir um passo, marque `[x]` e commite. O documento é o registro do progresso.

## Pré-requisitos (fazer uma vez)

- [x] **Revogar as credenciais vazadas do Mercado Pago** — *feito em 13/07/2026: a aplicação do MP foi excluída pelo autor. As credenciais que estavam no histórico do git não têm mais validade.* ✅
- [ ] Criar a nova aplicação no painel do Mercado Pago e guardar as credenciais **fora do repositório**.
- [ ] Instalar os emuladores do Firebase (para testar rules e functions sem tocar em produção):
  ```bash
  npx firebase init emulators      # marcar: Authentication, Firestore, Functions
  npx firebase emulators:start
  ```
- [ ] Ativar **secret scanning** e **push protection** no repositório do GitHub (Settings → Code security). Impede que a próxima credencial entre no git.

---

# SPRINT 0 — Emergencial

**Objetivo**: fechar as vulnerabilidades exploráveis hoje. **Nenhuma funcionalidade nova entra antes disso.**
**Duração estimada**: 1 a 3 dias.

---

## R-01 · Configurar as novas credenciais como secrets
> Corrige: **V-06** · Esforço: 15 min

**Por quê**: credencial nunca entra em código, `.env` versionado ou documentação. Os secrets do Cloud Functions ficam criptografados no Google Secret Manager e só são expostos à função em tempo de execução.

**O que fazer**:
```bash
# Access token da nova aplicação do Mercado Pago
npx firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN

# Secret do webhook (painel MP → Webhooks → "Assinatura secreta") — usado no R-10
npx firebase functions:secrets:set MERCADOPAGO_WEBHOOK_SECRET
```
A chave **pública** do MP (`VITE_MERCADOPAGO_PUBLIC_KEY`) vai no `.env` do front-end — ela é pública por natureza (usada na tokenização do cartão no navegador) e não é segredo.

**Verificar**:
```bash
npx firebase functions:secrets:access MERCADOPAGO_ACCESS_TOKEN   # deve retornar o valor
grep -rn "APP_USR-\|TEST-" src/ functions/ docs/                 # não deve retornar NADA
```

- [ ] Concluído

---

## R-02 · Fechar a brecha de escrita em pedidos
> Corrige: **V-03** (crítica) · Esforço: 10 min · **O passo de maior impacto por minuto de trabalho**

**Por quê**: hoje qualquer usuário autenticado pode alterar o pedido de qualquer pessoa. A cláusula que permite isso foi escrita achando que os webhooks precisavam dela — não precisam: as Cloud Functions usam o Admin SDK, que **ignora completamente as Security Rules**.

**Arquivo**: `firestore.rules` (bloco `match /orders/{orderId}`, ~linha 262)

**O que fazer** — apagar a terceira cláusula do `allow update`, deixando:
```
allow update: if isAdmin() ||
               (isAuthenticated() &&
                resource.data.userId == request.auth.uid &&
                canCancelOrder(resource.data) &&
                request.resource.data.orderStatus == 'cancelled' &&
                request.resource.data.diff(resource.data).affectedKeys()
                  .hasOnly(['orderStatus', 'updatedAt', 'statusHistory']));
```
Remover por completo o trecho:
```
                     // ❌ REMOVER — permite a qualquer autenticado escrever em qualquer pedido
                     (isAuthenticated() &&
                      request.resource.data.updatedAt == request.time);
```

**Verificar** (logado como usuário comum, no console do navegador — deve falhar com `PERMISSION_DENIED`):
```js
await firebase.firestore().doc('orders/<id-de-outro-usuario>').update({
  orderStatus: 'paid',
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});
```
E o fluxo legítimo deve continuar funcionando: cancelar o próprio pedido pela interface, e o webhook aprovando um pagamento.

- [ ] Concluído

---

## R-03 · Valor do pagamento vem do servidor
> Corrige: **V-01** (crítica) · Esforço: 30 min

**Por quê**: `createPaymentIntent` recebe `amount` do cliente e repassa ao Mercado Pago sem conferir com o pedido. Dá para pagar R$ 0,01 num pedido de R$ 500.

> ⚠️ Este passo sozinho **não** elimina a fraude — o total do pedido ainda é escolhido pelo cliente (V-02). Ele fecha o caminho mais fácil e barato agora; o R-09 fecha o outro.

**Arquivos**: `functions/index.js`, `src/services/paymentService.js`

**O que fazer**:

1. Em `functions/index.js`, no `createPaymentIntent`: **remover `amount` do destructuring** de `data` e usar o valor do pedido, que já é lido logo abaixo:
```js
const { orderId, paymentMethod, token, installments } = data;   // sem `amount`
// ...
const order = orderDoc.data();
// ... validações de dono e método já existentes ...

const amount = Number(order.finalTotal);          // ✅ valor do servidor
if (!(amount > 0)) {
    throw new functions.https.HttpsError('failed-precondition', 'Pedido com valor inválido');
}

const paymentResult = await gateway.createPayment({ orderId, amount, paymentMethod, /* ... */ });
```
2. Em `src/services/paymentService.js`: remover o parâmetro `amount` das três funções (`createPixPaymentIntent`, `createBoletoPaymentIntent`, `createCardPaymentIntent`) e do payload enviado.
3. Atualizar as chamadas nos componentes de checkout (`PixPaymentForm`, `BoletoPaymentForm`, `CardPaymentForm`) e os testes correspondentes.

**Verificar**: criar um pedido de valor conhecido e chamar a function direto do console passando `amount: 0.01`. O pagamento gerado no MP deve sair com o **valor real do pedido** (o `amount` enviado é simplesmente ignorado).

- [ ] Concluído

---

## R-04 · Fechar a criação de artigos e sanitizar o HTML
> Corrige: **V-04** (crítica) · Esforço: 2–3 h

**Por quê**: qualquer usuário autenticado pode criar artigos (regra marcada como "TEMPORÁRIO") e o corpo é renderizado com `dangerouslySetInnerHTML` sem sanitização. Resultado: um usuário comum executa JavaScript no navegador do admin e herda os privilégios dele.

São duas correções independentes. **Faça as duas** — cada uma sozinha deixa um caminho aberto.

### 4a. Rules: só admin cria conteúdo
**Arquivo**: `firestore.rules` (~linha 138)
```
// ❌ ANTES: // TEMPORÁRIO: Qualquer usuário autenticado pode criar artigos para debug
//           allow create: if isAuthenticated() && ...

// ✅ DEPOIS
allow create: if isAdmin() &&
                 isValidArticle(request.resource.data) &&
                 request.resource.data.createdAt == request.time &&
                 request.resource.data.updatedAt == request.time;
```

### 4b. Sanitizar toda renderização de HTML
```bash
npm i dompurify
```
Criar `src/lib/sanitize.js` — um único ponto de sanitização, para não haver como esquecer de um:
```js
import DOMPurify from 'dompurify';

const ARTICLE_CONFIG = {
    ALLOWED_TAGS: ['p','br','strong','b','em','i','u','h2','h3','h4',
                   'blockquote','ul','ol','li','a','img','figure','figcaption'],
    ALLOWED_ATTR: ['href','src','alt','title','target','rel'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/)/i
};

/** Sanitiza HTML de artigo para renderização. Use SEMPRE antes de dangerouslySetInnerHTML. */
export function sanitizeArticleHtml(dirty) {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, ARTICLE_CONFIG);
}

/** Extrai texto puro de HTML (resumos, TTS). */
export function stripHtml(dirty) {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
```
Aplicar em **todos** os pontos que hoje injetam HTML:

| Arquivo | Linha | Ação |
|---|---|---|
| `src/components/features/textToSpeech/HighlightableText.jsx` | 116 | `dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(paragraph) }}` |
| `src/lib/stringUtils.js` | 1–6 | substituir a implementação de `stripHtml` pela de `sanitize.js` (a atual usa `innerHTML` num div temporário — **executa `onerror` de imagens**) |
| `src/pages/admin/ArticleEditor.jsx` | 41, 107, 172 | sanitizar ao carregar no editor, ao colar conteúdo e **ao salvar** (defesa em profundidade) |
| `src/components/features/textToSpeech/TextToSpeechPlayer.jsx` | 41 | usar `stripHtml` sanitizado |

**Verificar**:
1. Como usuário comum, tentar criar documento em `content` → `PERMISSION_DENIED`.
2. Como admin, publicar um artigo com o corpo abaixo e abrir a página. A imagem quebra, mas **nenhum alerta aparece**:
   ```html
   <p>teste</p><img src=x onerror="alert('XSS')"><script>alert('XSS2')</script>
   ```
3. Conferir que a formatação legítima (negrito, links, listas, citações) continua renderizando.

- [ ] 4a — rules
- [ ] 4b — sanitização

---

## R-05 · Corrigir as rules de comentários
> Corrige: **V-08** · Esforço: 45 min

**Por quê**: na edição, o dono pode alterar **qualquer campo** (não só o texto) — não há `affectedKeys`. E a janela de 1 hora está desativada com um `true` literal ("DESATIVADO TEMPORARIAMENTE PARA DEBUG"). Além disso, o `userName` vem do cliente sem validação: dá para assinar um comentário como "Administrador".

**Arquivo**: `firestore.rules` (bloco `match /comments/{commentId}`, ~linha 369)

**O que fazer** — substituir o primeiro `allow update` (o de edição) por:
```
allow update: if isAuthenticated() &&
                 resource.data.userId == request.auth.uid &&
                 resource.data.isDeleted == false &&
                 request.resource.data.content is string &&
                 request.resource.data.content.size() >= 3 &&
                 request.resource.data.content.size() <= 500 &&
                 request.resource.data.diff(resource.data).affectedKeys()
                   .hasOnly(['content', 'updatedAt']) &&
                 request.resource.data.updatedAt == request.time &&
                 (request.time.seconds - resource.data.createdAt.seconds) <= 3900;
```
E no `isValidComment` (criação), amarrar a identidade ao token:
```
data.userId == request.auth.uid &&
data.userName == request.auth.token.name
```
> Se o `request.auth.token.name` não estiver preenchido (o Firebase só o inclui quando há `displayName`), a alternativa é **remover o `userName` do documento** e resolvê-lo na leitura a partir de `users/{uid}`. Decida antes de escrever a regra — a segunda opção é mais limpa e evita nome desatualizado no comentário.

O segundo `allow update` (soft delete) já está correto: valida `affectedKeys` e o conteúdo `'[Comentário removido]'`.

**Verificar**: editar o próprio comentário alterando `userName` junto → `PERMISSION_DENIED`. Editar só o texto dentro de 1 h → funciona. Editar depois de 1 h → `PERMISSION_DENIED`.

- [ ] Concluído

---

## R-06 · Headers de segurança
> Corrige: **V-09** · Esforço: 1 h (a maior parte é ajustar a CSP até não quebrar nada)

**Por quê**: sem CSP, um XSS que escape da sanitização tem impacto total (exfiltra dados para qualquer domínio). É a rede de proteção do R-04.

**Arquivo**: `firebase.json` — adicionar dentro de `"hosting"`:
```json
"headers": [{
  "source": "**",
  "headers": [
    { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://sdk.mercadopago.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net https://api.mercadopago.com; frame-src https://sdk.mercadopago.com https://www.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
    { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=()" }
  ]
}]
```

**Cuidados**:
- Faça o deploy da CSP num **preview channel** primeiro (`npx firebase hosting:channel:deploy csp-test`) e navegue por todas as telas com o console aberto. Toda violação aparece como erro `Refused to load…`. Ajuste a diretiva correspondente.
- Se o app for servido pela **Vercel** (existe `docs/setup/VERCEL_DEPLOY.md`), replique os mesmos headers em `vercel.json` — o `firebase.json` não vale lá.
- Ao implementar o PWA (Fase 4), o service worker precisa ser permitido pela CSP (`worker-src 'self'`).

**Verificar**: `curl -I https://<seu-dominio>/` deve trazer os seis headers. Rodar o site em https://securityheaders.com — meta: nota **A**.

- [ ] Concluído

---

## 🚀 Deploy do Sprint 0

```bash
npm test                                              # testes existentes devem passar
npm run build
npx firebase deploy --only firestore:rules,functions,hosting
```

## ✅ Verificação de saída do Sprint 0

Todo item abaixo deve **falhar** (que é o resultado desejado):

| # | Tentativa de ataque | Resultado esperado |
|---|---|---|
| 1 | `createPaymentIntent({ orderId, paymentMethod:'pix', amount: 0.01 })` num pedido de R$ 500 | Pagamento gerado com R$ 500 |
| 2 | `update()` no pedido de outro usuário | `PERMISSION_DENIED` |
| 3 | Criar doc em `content` com conta comum | `PERMISSION_DENIED` |
| 4 | Artigo com `<img src=x onerror=alert(1)>` | Imagem quebrada, **sem alerta** |
| 5 | Editar comentário mudando `userName` | `PERMISSION_DENIED` |
| 6 | `curl -I` na home | 6 headers de segurança presentes |
| 7 | `grep -rn "APP_USR-" src/ functions/ docs/` | Nenhum resultado |

E o fluxo legítimo deve continuar inteiro: cadastro → login → comentar → curtir → comprar (PIX, boleto e cartão) → cancelar pedido → painel admin.

---

# SPRINT 1 — Estrutural

**Objetivo**: eliminar as causas-raiz, não só os sintomas. O Sprint 0 tapou os buracos; aqui o modelo passa a ser correto por construção.
**Duração estimada**: 1 a 2 semanas.

---

## R-07 · Migrar Cloud Functions para a API v2
> Habilita: R-08, R-10, R-12 · Esforço: 1 dia

**Por quê**: a v1 (`firebase-functions` v4, `functions.https.onCall`) está em caminho de depreciação, e recursos que vamos precisar — `enforceAppCheck`, `maxInstances`, `defineSecret` — são muito mais diretos na v2. Migrar agora evita fazer o trabalho duas vezes.

**O que fazer**:
```bash
cd functions && npm i firebase-functions@latest
```
```js
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const MP_TOKEN = defineSecret('MERCADOPAGO_ACCESS_TOKEN');

exports.createPaymentIntent = onCall({
    region: 'southamerica-east1',   // menor latência + dados no Brasil (ajuda na LGPD)
    secrets: [MP_TOKEN],
    enforceAppCheck: true,          // ativar só depois do R-12
    maxInstances: 10                // teto de custo
}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '...');
    const { orderId, paymentMethod } = request.data;   // v2: request.data / request.auth
    // ...
});
```
⚠️ **Mudança de região quebra a URL do webhook e a do callable.** Atualize a URL no painel do Mercado Pago e o `getFunctions(app, 'southamerica-east1')` em `src/lib/firebase.js`. Se preferir evitar o risco agora, mantenha `us-central1` e migre a região depois.

- [ ] Concluído

---

## R-08 · Criar o pedido no servidor
> Corrige: **V-02** (crítica), **V-12** · Esforço: 2–3 dias · **O passo mais importante do plano**

**Por quê**: hoje o cliente monta o pedido inteiro — itens, preços, subtotal e total — a partir do carrinho que vive no `localStorage`. As rules aceitam qualquer `finalTotal`. Enquanto isso for verdade, **o cliente escolhe quanto vai pagar**, e nenhuma correção no gateway resolve.

**O que fazer**:

1. **Nova Cloud Function `createOrder`**. Recebe apenas o que o cliente tem o direito de definir:
```js
exports.createOrder = onCall({ region: '...', enforceAppCheck: true }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login obrigatório');

    const { items, customer, shippingAddress, paymentMethod } = request.data;
    // items: [{ productId, quantity }]  ← SEM preço, SEM subtotal, SEM total

    return await db.runTransaction(async (tx) => {
        let subtotal = 0;
        const orderItems = [];

        for (const { productId, quantity } of items) {
            const qty = parseInt(quantity, 10);
            if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
                throw new HttpsError('invalid-argument', 'Quantidade inválida');
            }

            const snap = await tx.get(db.collection('products').doc(productId));
            if (!snap.exists) throw new HttpsError('not-found', `Produto ${productId} não existe`);

            const p = snap.data();
            if (!p.active)          throw new HttpsError('failed-precondition', `"${p.name}" indisponível`);
            if (p.stock < qty)      throw new HttpsError('failed-precondition', `"${p.name}": estoque insuficiente`);

            const price = Number(p.price);              // ✅ preço do BANCO, nunca do cliente
            subtotal += price * qty;
            orderItems.push({ productId, name: p.name, price, quantity: qty, subtotal: price * qty,
                              supplierId: p.supplierId ?? null, supplierName: p.supplierName ?? null });

            // reserva o estoque já na criação (evita vender o que não tem)
            tx.update(snap.ref, { stock: admin.firestore.FieldValue.increment(-qty) });
        }

        const shipping = await calculateShipping(shippingAddress.zipCode, orderItems); // servidor (R-14)
        const finalTotal = subtotal + shipping;

        const orderRef = db.collection('orders').doc();
        tx.set(orderRef, {
            userId: request.auth.uid,
            items: orderItems, subtotal, shipping, discount: 0, finalTotal,
            customer, shippingAddress,
            payment: { method: paymentMethod, status: 'pending', gateway: 'mercadopago', /* ... */ },
            orderStatus: 'pending',
            stockReserved: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { orderId: orderRef.id, subtotal, shipping, finalTotal };
    });
});
```
2. **Bloquear a criação de pedidos pelo cliente** — `firestore.rules`:
```
match /orders/{orderId} {
  allow create: if false;      // apenas via Cloud Function (Admin SDK ignora as rules)
  // read / update / delete permanecem como no R-02
}
```
3. **Reescrever `src/services/orderService.js`**: a função `createOrder` passa a ser um `httpsCallable`, enviando só `{productId, quantity}`. Remover todo cálculo de preço do cliente. O `Checkout.jsx` passa a exibir os totais **retornados pela function**, não os calculados localmente.
4. **Baixa de estoque no webhook**: com a reserva feita aqui, o webhook não decrementa mais nada ao aprovar — só marca `paid`. Ajustar `reduceProductStock` (ou removê-la).
5. **Devolver o estoque reservado** de pedidos que não forem pagos: função agendada (R-11).

**Verificar**:
- Adulterar o `localStorage` (`price: 0.01`) e finalizar a compra → o pedido é criado com o **preço real do banco**.
- Pedir quantidade maior que o estoque → erro claro, e **nenhum** pedido criado.
- Duas compras simultâneas do último item → uma passa, a outra falha (a transação garante).
- Criar pedido direto via SDK do cliente → `PERMISSION_DENIED`.

- [ ] Concluído

---

## R-09 · Idempotência e chave do gateway
> Corrige: **V-13**, parte de **V-12** · Esforço: 1 h

**Arquivo**: `functions/gateways/MercadoPagoGateway.js:17`

Hoje: `idempotencyKey: 'abc'` — fixa para **todas** as requisições, o oposto do propósito do mecanismo. O MP pode tratar dois pagamentos legítimos e distintos como repetição de um só.

```js
// construtor: sem idempotencyKey fixa
this.client = new MercadoPagoConfig({ accessToken: config.accessToken, options: { timeout: 5000 } });

// na criação do pagamento: uma chave por tentativa
const payment = await this.paymentClient.create({
    body,
    requestOptions: { idempotencyKey: `${orderId}-${paymentMethod}-${Date.now()}` }
});
```

- [ ] Concluído

---

## R-10 · Validar a assinatura do webhook
> Corrige: **V-05** · Esforço: 3 h

**Por quê**: o webhook é um endpoint HTTP público que aceita qualquer POST. Hoje há uma mitigação parcial (a função consulta o pagamento na API do MP em vez de confiar no corpo da requisição), mas ainda dá para forçar reprocessamento de eventos e gerar custo ilimitado de Functions.

**Arquivo**: `functions/index.js` (`handlePaymentWebhook`)

```js
const crypto = require('crypto');

function isValidSignature(req, secret) {
    const xSignature = req.headers['x-signature'];      // "ts=1704908010,v1=abc123..."
    const xRequestId = req.headers['x-request-id'];
    if (!xSignature || !xRequestId) return false;

    const parts = Object.fromEntries(
        xSignature.split(',').map(p => p.split('=').map(s => s.trim()))
    );
    const { ts, v1 } = parts;
    if (!ts || !v1) return false;

    const dataId = String(req.query['data.id'] || req.body?.data?.id || '').toLowerCase();
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(v1, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);   // comparação em tempo constante
}
```
No handler, antes de qualquer processamento:
```js
if (!isValidSignature(req, MP_WEBHOOK_SECRET.value())) {
    console.warn('Webhook com assinatura inválida', { ip: req.ip });
    return res.status(401).send('Invalid signature');
}
```
**Idempotência** (evita que o reenvio do mesmo evento duplique `statusHistory` ou baixe estoque duas vezes — o MP reenvia com frequência):
```js
const eventRef = db.collection('webhook_events').doc(String(req.headers['x-request-id']));
const seen = await eventRef.get();
if (seen.exists) return res.status(200).send('Já processado');
// ... processa ...
await eventRef.set({ processedAt: FieldValue.serverTimestamp(), orderId, status: newStatus });
```
E nas rules: `match /webhook_events/{id} { allow read, write: if false; }` (só Admin SDK).

**Verificar**:
```bash
curl -X POST https://<url-do-webhook> -d '{"type":"payment","data":{"id":"123"}}'   # → 401
```
Pagamento real de teste → webhook processa e o pedido vira `paid`. Reenviar o mesmo evento pelo painel do MP → responde 200 e **não** duplica nada.

- [ ] Concluído

---

## R-11 · Expirar pedidos não pagos e devolver o estoque
> Depende de: R-08 · Esforço: 3 h

Com a reserva de estoque no R-08, um pedido abandonado prende o produto para sempre. Função agendada:
```js
const { onSchedule } = require('firebase-functions/v2/scheduler');

exports.expirePendingOrders = onSchedule('every 30 minutes', async () => {
    const limite = admin.firestore.Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
    const vencidos = await db.collection('orders')
        .where('orderStatus', '==', 'pending')
        .where('stockReserved', '==', true)
        .where('createdAt', '<', limite)
        .get();

    for (const doc of vencidos.docs) {
        await db.runTransaction(async (tx) => {
            // devolve o estoque de cada item e marca o pedido como cancelado
        });
    }
});
```
Prazos por método: PIX expira em ~30 min, boleto em 3 dias (`BOLETO_EXPIRATION_DAYS`). Use um prazo por método, não um valor único — cancelar um boleto de 3 dias depois de 24 h cancelaria compras legítimas.

- [ ] Concluído

---

## R-12 · Ativar o Firebase App Check
> Corrige: **V-10** · Esforço: meio dia + dias de monitoramento

**Por quê**: sem App Check, Firestore e Functions aceitam requisições de qualquer origem — foi exatamente assim que todos os exploits desta auditoria foram demonstrados (chamadas diretas ao SDK, fora da interface). Não substitui as rules, mas encarece muito a automação de um ataque.

1. Console → App Check → registrar o app web com **reCAPTCHA Enterprise**.
2. No cliente (`src/lib/firebase.js`):
```js
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
});
```
3. **Rodar em modo de monitoramento por alguns dias.** Só depois ative o *enforcement* — em Firestore, Functions e Auth. Ativar direto derruba usuários legítimos se algo estiver mal configurado.
4. Com o enforcement ligado, ative `enforceAppCheck: true` nas callables (R-07).

- [ ] Registrado e monitorando
- [ ] Enforcement ativado

---

## R-13 · Verificação de e-mail
> Corrige: **V-07** · Esforço: meio dia

**Por quê**: `sendEmailVerification` **não é chamado em lugar nenhum** do código — apesar de haver seis documentos afirmando que o recurso existe (todos movidos para `garbage/`). Sem e-mail verificado não há base confiável para o consentimento da newsletter (LGPD) nem para conter spam.

1. `src/contexts/AuthContext.jsx`, no `signUp`, logo após `createUserWithEmailAndPassword`:
```js
import { sendEmailVerification } from 'firebase/auth';
await sendEmailVerification(userCredential.user);
```
2. Tela de "confirme seu e-mail", com botão de reenvio.
3. Exigir nas **rules** (não só no cliente) para comentar, curtir e comprar:
```
function isVerified() {
  return isAuthenticated() && request.auth.token.email_verified == true;
}
```
4. Console → Authentication → Settings → ativar **proteção contra enumeração de e-mail**.

⚠️ Usuários já cadastrados têm `emailVerified: false`. Decida a transição: exigir verificação só para contas novas (via `createdAt`), ou disparar um e-mail de verificação para a base existente. Não ligue a exigência de uma vez sem avisar — você bloquearia os usuários atuais.

- [ ] Concluído

---

## R-14 · Restringir a leitura de fornecedores
> Corrige: **V-11** · Esforço: 30 min

Hoje qualquer usuário logado lista todos os fornecedores — com **e-mail, telefone e taxa de comissão negociada**.

```
match /suppliers/{supplierId} {
  allow read, list: if isAdmin();      // o seletor de fornecedor só existe em tela de admin
  allow create, update, delete: if isAdmin() && isValidSupplier(request.resource.data) && ...;
}
```
Se algum dado de fornecedor precisar aparecer publicamente ("vendido por X"), use o `supplierName` que já está desnormalizado no produto — nunca leia a coleção `suppliers` do cliente público.

**Verificar**: usuário comum tentando `getDocs(collection(db,'suppliers'))` → `PERMISSION_DENIED`. Painel admin continua funcionando.

- [ ] Concluído

---

## R-15 · Contadores via trigger
> Corrige: **V-14** · Esforço: 3 h

Hoje qualquer autenticado incrementa `likesCount`/`commentsCount` em ±1 sem ter curtido nada. Move-se a responsabilidade para triggers, e o cliente perde a permissão de escrever nos contadores:
```js
const { onDocumentCreated, onDocumentDeleted } = require('firebase-functions/v2/firestore');

exports.onLikeCreated = onDocumentCreated('likes/{likeId}', async (event) => {
    const { contentId } = event.data.data();
    await db.doc(`content/${contentId}`).update({
        likesCount: admin.firestore.FieldValue.increment(1)
    });
});
// idem para onLikeDeleted (-1), onCommentCreated (+1)
```
Nas rules de `content`, remover `isValidLikesCountUpdate()` e `isValidCommentsCountUpdate()` do `allow update`. A UI otimista (`LikeButton`) continua funcionando — ela só precisa refletir a mudança localmente e deixar o número real chegar pelo listener.

- [ ] Concluído

---

## 🚀 Deploy e verificação do Sprint 1

```bash
npm test && npm run build
npx firebase deploy
```

| # | Verificação | Esperado |
|---|---|---|
| 1 | `localStorage` com `price: 0.01` → finalizar compra | Pedido criado com o preço real |
| 2 | Criar pedido direto pelo SDK do cliente | `PERMISSION_DENIED` |
| 3 | Comprar o último item em duas abas ao mesmo tempo | Só uma compra conclui |
| 4 | POST no webhook sem `x-signature` | `401` |
| 5 | Reenviar o mesmo evento de webhook | 200, sem duplicar histórico nem estoque |
| 6 | Listar `suppliers` como usuário comum | `PERMISSION_DENIED` |
| 7 | Incrementar `likesCount` direto pelo SDK | `PERMISSION_DENIED` |
| 8 | Cadastro novo | Recebe e-mail de verificação |

---

# SPRINT 2 — Garantia

**Objetivo**: impedir que estas vulnerabilidades voltem. Sem esta fase, o Sprint 0 e o 1 têm prazo de validade.
**Duração**: contínuo, começando em paralelo ao Sprint 1.

---

## R-16 · Testes das Security Rules
> Esforço: 2–3 dias · **A correção mais valiosa deste plano a longo prazo**

**Por quê**: as Firestore Rules são o perímetro de segurança da aplicação e **hoje não têm um único teste**. Foi exatamente isso que permitiu que a V-03 (escrita livre em pedidos) e a V-04 (criação livre de artigos) ficassem no código sem ninguém notar — as duas entraram como ajustes "temporários de debug" e nunca mais foram revistas.

```bash
npm i -D @firebase/rules-unit-testing
```
Criar `firestore.rules.test.js` com **um teste por vulnerabilidade da auditoria**, cada um afirmando que o ataque falha:
```js
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('orders', () => {
    it('V-03: usuário não pode alterar pedido de outro usuário', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await assertFails(
            alice.firestore().doc('orders/pedido-do-bob').update({
                orderStatus: 'paid',
                updatedAt: new Date()
            })
        );
    });

    it('V-02: cliente não pode criar pedido', async () => {
        const alice = testEnv.authenticatedContext('alice');
        await assertFails(alice.firestore().collection('orders').add({ /* ... */ }));
    });

    it('dono PODE cancelar o próprio pedido pendente', async () => {
        // o caminho legítimo também precisa de teste — senão a próxima correção quebra o produto
    });
});
```
Cobrir: V-02, V-03, V-04a, V-08, V-11, V-14 — e os fluxos legítimos correspondentes.

```bash
npx firebase emulators:exec --only firestore "npx vitest run firestore.rules.test.js"
```

- [ ] Concluído

---

## R-17 · CI que bloqueia regressão
> Esforço: meio dia

`.github/workflows/ci.yml` — em todo PR: `lint` → `vitest run` → **testes de rules no emulador** → `build`. Falhou, não faz merge.

Ativar **branch protection** na `main`: exigir PR, exigir CI verde, proibir push direto.

- [ ] Concluído

---

## R-18 · Monitoramento
> Esforço: meio dia

- **Alerta de orçamento** no Google Cloud Billing. O plano Blaze é pay-as-you-go: um endpoint público abusado (o webhook) pode gerar conta alta. Configure alerta em 50%, 90% e 100% do teto esperado.
- **Sentry** no front-end — erros reais de usuários reais.
- **Alerta de erro** nas Functions (Cloud Monitoring → e-mail) para picos de `401` no webhook (tentativa de ataque) e falhas em `createOrder`.

- [ ] Concluído

---

## R-19 · Higiene do repositório
> Esforço: 2 h

- [ ] `git rm -r --cached dist` — saída de build versionada por engano (o `.gitignore` já a cobre, mas os arquivos entraram antes).
- [ ] Remover `@rollup/rollup-win32-x64-msvc` das `optionalDependencies` — resíduo do problema de Windows já resolvido.
- [ ] `npm audit fix` e atualizar as dependências principais (Firebase SDK 10 → 12, Vite, `firebase-admin`, `mercadopago`).
- [ ] Esvaziar a pasta `garbage/` (`git rm -r garbage/`) depois de revisar — o conteúdo continua no histórico do git.
- [ ] **Opcional**: limpar o histórico do git com `git filter-repo`/BFG para remover as credenciais antigas. Como as credenciais **já foram revogadas**, isso é higiene, não urgência — e reescreve todos os hashes (exige `push --force`).

---

# Rastreabilidade

| Vulnerabilidade | Severidade | Passo | Sprint |
|---|---|---|---|
| V-01 · Valor do pagamento vem do cliente | 🔴 | R-03 | 0 |
| V-02 · Pedido montado pelo cliente | 🔴 | **R-08** | 1 |
| V-03 · Escrita livre em pedidos | 🔴 | **R-02** | 0 |
| V-04 · XSS armazenado + criação livre de artigos | 🔴 | **R-04** | 0 |
| V-05 · Webhook sem assinatura | 🟠 | R-10 | 1 |
| V-06 · Credenciais no git | 🟠 | ✅ revogadas · R-01, R-19 | 0 |
| V-07 · Sem verificação de e-mail | 🟠 | R-13 | 1 |
| V-08 · Rules de comentários permissivas | 🟠 | R-05 | 0 |
| V-09 · Sem headers de segurança | 🟡 | R-06 | 0 |
| V-10 · Sem App Check | 🟡 | R-12 | 1 |
| V-11 · Fornecedores expostos | 🟡 | R-14 | 1 |
| V-12 · Corrida na baixa de estoque | 🟡 | R-08, R-10 | 1 |
| V-13 · `idempotencyKey` fixa | 🔵 | R-09 | 1 |
| V-14 · Contadores infláveis | 🔵 | R-15 | 1 |
| *(prevenção de regressão)* | — | R-16, R-17, R-18 | 2 |

## Onde isto se encaixa no plano geral

O Sprint 0 e o Sprint 1 daqui são as **Fases 0 e 1** do [`PLANO_DE_ACAO.md`](../../PLANO_DE_ACAO.md). Concluídos os dois, o caminho segue para a Fase 2 (LGPD e newsletter), a Fase 3 (e-commerce completo) e a Fase 4 (redesign e PWA do [`PROJECT_SPEC.md`](../../PROJECT_SPEC.md)).
