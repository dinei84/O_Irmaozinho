# 📋 Estudo de Caso: Boleto Bancário e Cartão de Crédito

## 🎯 Objetivo

Mapear **tudo o que precisa ser ajustado no código** para implementar **boleto bancário** e **cartão de crédito**, mantendo a arquitetura modular atual e o fluxo existente do PIX.

---

## 📊 Situação Atual (apenas PIX)

### Fluxo PIX hoje

```
1. Checkout (step 2): usuário escolhe PIX → "Confirmar pedido"
2. createOrder() → pedido criado no Firestore (payment.method = 'pix')
3. createPixPaymentIntent(orderId, total) → Cloud Function
4. MercadoPagoGateway.createPayment({ paymentMethod: 'pix', ... })
5. Backend retorna: { qrCode, qrCodeBase64, expiresAt }
6. Checkout mostra PixPaymentForm (QR Code + copia e cola)
7. Usuário paga → Webhook → Firestore atualizado → onSnapshot detecta → OrderConfirmation
```

### O que já existe pronto

| Camada | Arquivo | Estado |
|--------|---------|--------|
| **UI** | `PaymentMethodSelector` | PIX ativo; boleto e cartão com `comingSoon: true` |
| **UI** | `PixPaymentForm` | Só PIX (QR Code, timer, status) |
| **Checkout** | `Checkout.jsx` | Só trata `paymentMethod === 'pix'` após criar pedido |
| **Serviço** | `paymentService.js` | Apenas `createPixPaymentIntent` e `checkPaymentStatus` |
| **Backend** | `createPaymentIntent` | Valida `paymentMethod === 'pix'` e rejeita outros |
| **Gateway** | `MercadoPagoGateway` | `createPayment` só aceita `pix` |
| **Pedido** | `orderService` | `payment.boleto`, `payment.card` já existem (null) |
| **Confirmação** | `OrderConfirmation` | Mensagem específica para PIX |

---

## 🔄 Fluxos comparados (resumo)

```
PIX:     [Checkout] → criar pedido → createPixPaymentIntent → [PixPaymentForm: QR Code]
         → usuário paga → webhook → Firestore → onSnapshot → [OrderConfirmation]

BOLETO:  [Checkout] → criar pedido → createBoletoPaymentIntent → [BoletoPaymentForm: PDF + código]
         → usuário paga (1–2 dias) → webhook → Firestore → onSnapshot → [OrderConfirmation]

CARTÃO:  [Checkout] → criar pedido → [CardPaymentForm: dados → token] → createCardPaymentIntent(token)
         → aprovação imediata → [OrderConfirmation]
         (ou falha → mensagem de erro, pedido já criado)
```

---

## 🔄 Diferenças entre os três métodos

| Aspecto | PIX | Boleto | Cartão |
|---------|-----|--------|--------|
| **Criação** | Backend gera QR Code | Backend gera boleto (código de barras, PDF) | Frontend coleta dados → token → Backend processa |
| **Dados sensíveis** | Nenhum no front | Nenhum no front | **Token apenas** (nunca número do cartão) |
| **Resposta** | QR + código copia-cola | Link PDF, código barras, vencimento | Aprovação/recusa na hora |
| **Confirmação** | Webhook | Webhook (1–2 dias úteis) | Imediata + webhook |
| **Tela pós-pedido** | PixPaymentForm (QR) | BoletoPaymentForm (PDF, código) | CardPaymentForm OU já vai para confirmação |
| **Expiração** | ~30 min | Data de vencimento (ex: 3 dias) | N/A |

---

## 📐 Ajustes por camada

---

### 1. Backend (Cloud Functions + Gateway)

#### 1.1. `functions/index.js` – `createPaymentIntent`

**Hoje:**  
- Valida `paymentMethod === 'pix'` e retorna erro para outros.

**Ajustes:**

- Aceitar `paymentMethod` em `['pix', 'boleto', 'credit_card']`.
- Manter validações de `orderId`, `amount`, auth, etc.
- Para **cartão**: aceitar `data.token` (e, se houver, `installments`) e repassar ao gateway.
- Resposta já é genérica (`success`, `paymentId`, `pix`? `boleto`? `card`?); padronizar **estrutura única** com campos opcionais por método.

**Exemplo de payload para cartão:**

```js
// Frontend envia:
{ orderId, paymentMethod: 'credit_card', amount, token, installments?: 1 }
```

---

#### 1.2. `MercadoPagoGateway.js` – `createPayment`

**Hoje:**  
- Só implementa `payment_method_id: 'pix'`.

**Ajustes:**

**a) Boleto (`payment_method_id: 'bolbradesco'`)**

- Montar `body` com:
  - `transaction_amount`, `description`, `payer` (email, nome, CPF), `metadata` (order_id, etc.)
  - `payment_method_id: 'bolbradesco'`
  - `date_of_expiration`: vencimento (ex: hoje + 3 dias, formato ISO).
- Chamar `paymentClient.create({ body })`.
- Resposta do MP:
  - `transaction_details.external_resource_url` → link do PDF
  - `transaction_details.financial_institution`  
  - Código de barras em `transaction_details` ou `point_of_interaction` (ver documentação MP).
- Retornar no **formato padrão** algo como:

```js
{
  gatewayPaymentId,
  gatewayTransactionId,
  status: 'pending',
  boleto: {
    pdfUrl,
    barcode,
    dueDate,
    barcodeFormatted  // 47 dígitos formatado, se aplicável
  },
  pix: null
}
```

**b) Cartão (`payment_method_id: 'credit_card'` ou `'debit_card'`)**

- Receber `data.token` (e opcionalmente `installments`).
- Montar `body`:
  - `transaction_amount`, `token`, `description`, `installments` (ex: 1 para à vista)
  - `payment_method_id: 'credit_card'` (ou débito)
  - `payer`: email, identificação (CPF)
  - `metadata`.
- Nunca receber número de cartão, apenas **token**.
- Chamar `paymentClient.create({ body })`.
- Resposta: aprovação/recusa imediata. Mapear para `status`: `approved` / `rejected` / `pending`.
- Retornar:

```js
{
  gatewayPaymentId,
  gatewayTransactionId,
  status: 'approved' | 'rejected' | 'pending',
  card: { status, statusDetail } || null,
  pix: null,
  boleto: null
}
```

**c) Atualizar `formatPaymentResponse`**

- Tratar três tipos de resposta: `pix`, `boleto`, `card`, e preencher só o que existir, deixando o resto `null`.

---

#### 1.3. `functions/index.js` – Atualizar pedido no Firestore após criar pagamento

**Hoje:**  
- Escreve `payment.pix`, `gatewayPaymentId`, etc.

**Ajustes:**

- Se `paymentResult.boleto` existir → preencher `payment.boleto` (pdfUrl, barcode, dueDate, etc.).
- Se `paymentResult.card` existir → preencher `payment.card` (ex.: status, statusDetail).
- Manter `payment.pix` como hoje quando for PIX.
- Garantir que `payment.status` e `payment.gatewayPaymentId` / `gatewayTransactionId` sejam sempre preenchidos.

---

#### 1.4. Webhook e `processWebhook`

**Hoje:**  
- Evento `payment` já é genérico; usa `metadata.order_id` para achar o pedido.

**Ajustes:**

- Boleto e cartão também usam o mesmo `payment` no MP; **não é obrigatório** mudar o webhook.
- Garantir que `normalizeStatus` considere todos os status relevantes para boleto (ex.: `pending`, `approved`, `cancelled`) e cartão (`approved`, `rejected`, etc.).

---

### 2. Frontend – Serviço de pagamento

#### 2.1. `paymentService.js`

**Hoje:**  
- Só `createPixPaymentIntent(orderId, amount)`.

**Ajustes:**

- **`createBoletoPaymentIntent(orderId, amount)`**  
  - Chama `createPaymentIntent` com `paymentMethod: 'boleto'`.  
  - Retorna `{ pdfUrl, barcode, dueDate, barcodeFormatted }` (ou o que o backend padronizar).

- **`createCardPaymentIntent(orderId, amount, token, installments?)`**  
  - Chama `createPaymentIntent` com `paymentMethod: 'credit_card'`, `token`, `installments`.  
  - Retorna `{ success, status, paymentId }` (e possivelmente `card.statusDetail` para mensagens de erro).

- Manter `createPixPaymentIntent` como está (ou extrair uso genérico de `createPaymentIntent` para evitar duplicação).

- Reutilizar `checkPaymentStatus(orderId)` para os três métodos.

---

### 3. Frontend – Checkout e componentes

#### 3.1. `PaymentMethodSelector.jsx`

**Hoje:**  
- `availableMethods = ['pix']`; boleto e cartão com `comingSoon: true`.

**Ajustes:**

- Passar `availableMethods={['pix', 'boleto', 'credit_card']}` (ou via config).
- Remover `comingSoon` de boleto e cartão quando forem liberados.
- Manter a mesma API: `selectedMethod`, `onSelect`.

---

#### 3.2. `Checkout.jsx`

**Hoje:**  
- Cria pedido → se `paymentMethod === 'pix'` → chama `createPixPaymentIntent` → mostra `PixPaymentForm`.
- Para outros métodos, não há fluxo específico.

**Ajustes:**

- **Boleto:**  
  - Após criar pedido, se `paymentMethod === 'boleto'`:  
    - Chamar `createBoletoPaymentIntent(orderId, finalTotal)`.  
    - Guardar `boletoData` (pdfUrl, barcode, dueDate, etc.).  
  - Ir para step “pagamento boleto” e renderizar **`BoletoPaymentForm`** (ver abaixo).

- **Cartão:**  
  - Duas abordagens possíveis:

  **Opção A – Cartão antes do pedido (menos mudança no backend):**  
  - Step “pagamento”: mostrar `CardPaymentForm` (coleta dados, gera token).  
  - Ao confirmar: criar pedido **e** já enviar token para `createCardPaymentIntent`.  
  - Se sucesso → ir para OrderConfirmation; se falha → mostrar erro, manter carrinho.

  **Opção B – Cartão depois do pedido (igual PIX/boleto):**  
  - Criar pedido primeiro.  
  - Step “pagamento cartão”: `CardPaymentForm` com token → `createCardPaymentIntent`.  
  - Conforme resposta, ir para confirmação ou exibir erro.

- **Estado:**  
  - Adicionar `boletoData`, `cardResult` (ou similar) além de `pixData`.  
  - `handleCreateOrder` (ou equivalente) deve bifurcar por `paymentMethod` e chamar o intent correto.

- **Step 3:**  
  - Romper o “só PIX”:  
    - `pix` → `PixPaymentForm`  
    - `boleto` → `BoletoPaymentForm`  
    - `credit_card` → `CardPaymentForm` (e depois lógica de sucesso/erro).

---

#### 3.3. Novos componentes

**a) `BoletoPaymentForm.jsx`**

- Props: `orderId`, `boletoData` (pdfUrl, barcode, dueDate, barcodeFormatted).
- Exibir:
  - Link “Ver / Baixar boleto” (abre PDF).
  - Código de barras (numérico e, se possível, representação visual).
  - Data de vencimento e instruções (“Pague em qualquer banco ou app até…”).
- Usar `onSnapshot` no documento do pedido (como no PIX) para:
  - Atualizar status quando o webhook marcar como pago.
  - Chamar `onPaymentApproved(order)` e então ir para confirmação.
- Opcional: botão “Copiar código” para o código de barras.

**b) `CardPaymentForm.jsx`**

- Props: `orderId`, `amount`, `onSuccess`, `onError`.
- Coletar:
  - Número do cartão, validade, CVV, nome, CPF (conforme MP).
- Usar **Mercado Pago SDK no frontend** (ex.: CardPayment ou Checkout Pro / Cardform) para:
  - Gerar **token** a partir dos dados do cartão.  
  - Nunca enviar número de cartão para o nosso backend.
- Ao submeter:
  - Criar token → chamar `createCardPaymentIntent(orderId, amount, token, installments)`.
  - Em sucesso → `onSuccess(order)` e navegar para confirmação.
  - Em falha → `onError(message)` e exibir mensagem (ex.: `status_detail` do MP).
- Parcelamento: selector de 1x até Nx (regras de parcela mínima conforme MP).
- **Segurança:**  
  - SDK do MP no frontend; somente token e metadados (orderId, amount, installments) para o backend.

---

#### 3.4. `OrderConfirmation.jsx`

**Hoje:**  
- Mensagem específica para `payment?.method === 'pix'`.

**Ajustes:**

- Se `payment?.method === 'boleto'`:  
  - “Pague o boleto até [data]. Envie o comprovante se necessário. Você será notificado quando o pagamento for confirmado.”

- Se `payment?.method === 'credit_card'`:  
  - “Pagamento com cartão processado. Você receberá um email de confirmação.”

- Manter texto do PIX como está.

---

### 4. Mercado Pago no frontend (cartão)

- Incluir script ou SDK do Mercado Pago (ex.: `@mercadopago/sdk-react` ou script global) na aplicação.
- Usar **Public Key** (nunca Access Token) no frontend.
- Documentar que a Public Key pode vir de env (ex.: `VITE_MERCADOPAGO_PUBLIC_KEY`).

---

### 5. Dados e validações

#### 5.1. `orderService` / modelo de pedido

- `payment.boleto` e `payment.card` já existem; apenas garantir que o backend preencha conforme o que for retornado pelo gateway.
- Validar em `createOrder` que `paymentMethod` está em `['pix','boleto','credit_card']` se quiser restringir no client também.

#### 5.2. Firestore rules

- Regras atuais de `orders` **não precisam mudar**.
- `isValidOrder` exige `payment.method`, `payment.status`, `payment.gateway`; não restringe o **valor** de `method`.
- `pix`, `boleto`, `credit_card` são aceitos.
- Novos campos (`payment.boleto`, `payment.card`) são opcionais; as regras não validam chaves adicionais em `payment`.

---

### 6. Configuração e ambiente

- **Backend:**  
  - Manter `MERCADOPAGO_ACCESS_TOKEN` em Secrets.  
  - Nenhuma nova variável obrigatória para boleto/cartão no backend.

- **Frontend:**  
  - `VITE_MERCADOPAGO_PUBLIC_KEY` para o SDK de tokenização do cartão.

---

## 📋 Checklist de implementação

### Backend

- [ ] `createPaymentIntent`: aceitar `pix` | `boleto` | `credit_card` e, no caso de cartão, `token` (e `installments`).
- [ ] `MercadoPagoGateway.createPayment`:
  - [ ] Implementar boleto (`bolbradesco`).
  - [ ] Implementar cartão (`credit_card` + token).
  - [ ] Padronizar retorno (`pix`, `boleto`, `card`) e `formatPaymentResponse`.
- [ ] Atualizar escrita no Firestore após criar pagamento (`payment.boleto`, `payment.card`).
- [ ] Revisar `normalizeStatus` e webhook para boleto/cartão (se necessário).

### Frontend – serviços

- [ ] `createBoletoPaymentIntent(orderId, amount)` em `paymentService`.
- [ ] `createCardPaymentIntent(orderId, amount, token, installments?)` em `paymentService`.
- [ ] Manter `checkPaymentStatus` para os três métodos.

### Frontend – UI

- [ ] `PaymentMethodSelector`: liberar boleto e cartão (`availableMethods`, remover `comingSoon`).
- [ ] `Checkout.jsx`: fluxo para boleto e cartão (intent + step de pagamento).
- [ ] Criar `BoletoPaymentForm.jsx`.
- [ ] Criar `CardPaymentForm.jsx` (tokenização via SDK MP).
- [ ] `OrderConfirmation`: mensagens para boleto e cartão.

### Infra e config

- [ ] Adicionar SDK/script do Mercado Pago no frontend (cartão).
- [ ] Configurar `VITE_MERCADOPAGO_PUBLIC_KEY`.

### Testes

- [ ] Testes unitários para `createPayment` com boleto e cartão (mock do SDK).
- [ ] Testes de integração do fluxo de checkout para os três métodos.
- [ ] Testes manuais com contas de teste do Mercado Pago (PIX, boleto, cartão).

---

## 📚 Referências úteis

- [Mercado Pago – Pagamentos via API](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/card/integrate-via-cardform)
- [Mercado Pago – Boleto](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/boleto)
- [Mercado Pago – Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- SDK Node: `mercadopago` (já em uso); Frontend: `@mercadopago/sdk-react` ou Cardform via script.

---

## 🗂 Resumo dos arquivos a alterar ou criar

| Arquivo | Ação |
|---------|------|
| `functions/index.js` | Alterar |
| `functions/gateways/MercadoPagoGateway.js` | Alterar |
| `src/services/paymentService.js` | Alterar |
| `src/components/checkout/PaymentMethodSelector.jsx` | Alterar |
| `src/components/checkout/BoletoPaymentForm.jsx` | **Criar** |
| `src/components/checkout/CardPaymentForm.jsx` | **Criar** |
| `src/pages/Checkout.jsx` | Alterar |
| `src/components/checkout/OrderConfirmation.jsx` | Alterar |
| `index.html` ou entrada do app | Incluir SDK MP (cartão) |
| `.env.example` | Documentar `VITE_MERCADOPAGO_PUBLIC_KEY` |

---

## ✅ Implementação concluída

A implementação de **boleto** e **cartão de crédito** foi feita conforme este estudo.

### Configuração necessária

**Cartão de crédito (tokenização no frontend):**

- No `.env` do projeto (raiz), adicione:
  ```bash
  VITE_MERCADOPAGO_PUBLIC_KEY=YOUR_PUBLIC_KEY  # Chave pública do Mercado Pago (painel Developers)
  ```
- Sem essa variável, o pagamento por cartão aparece como “indisponível” no checkout.

**Boleto e PIX:**  
- Continuam usando apenas o **Access Token** nas Cloud Functions (Secrets). Nada novo no frontend.

### O que foi implementado

- **Backend:** `MercadoPagoGateway` com `pix`, `boleto` e `credit_card`; `createPaymentIntent` aceita os três métodos e `token`/`installments` para cartão.
- **Frontend:** `createBoletoPaymentIntent`, `createCardPaymentIntent`; `BoletoPaymentForm`, `CardPaymentForm`; `useMercadoPago` para tokenização; Checkout e OrderConfirmation atualizados para os três fluxos.
