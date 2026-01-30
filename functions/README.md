# Cloud Functions - O Irmaozinho

## Configuração

### 1. Instalar dependências

```bash
cd functions
npm install
```

### 2. Configurar credenciais do Mercado Pago

**Opção A: Via Firebase Functions Config (Recomendado)**

```bash
firebase functions:config:set mercadopago.access_token="YOUR_ACCESS_TOKEN"
```

**Opção B: Via variáveis de ambiente**

Criar arquivo `.env.local`:
```
MERCADOPAGO_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
```

### 3. Deploy das Functions

```bash
# Deploy de todas as functions
firebase deploy --only functions

# Deploy de uma function específica
firebase deploy --only functions:createPaymentIntent
```

### 4. Configurar Webhook no Mercado Pago

1. Acesse o painel do Mercado Pago
2. Vá em Webhooks
3. Adicione a URL:
   ```
   https://us-central1-admoirmaozinho.cloudfunctions.net/handlePaymentWebhook
   ```
4. Selecione os eventos: `payment` (criado, atualizado)

## Functions Disponíveis

### `createPaymentIntent`
Cria uma intenção de pagamento PIX no Mercado Pago.

**Chamada:**
```javascript
const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
const result = await createPaymentIntent({
  orderId: 'order_123',
  paymentMethod: 'pix',
  amount: 100.00
});
```

### `checkPaymentStatus`
Verifica o status de um pagamento.

**Chamada:**
```javascript
const checkPaymentStatus = httpsCallable(functions, 'checkPaymentStatus');
const result = await checkPaymentStatus({ orderId: 'order_123' });
```

### `handlePaymentWebhook`
Endpoint HTTP para receber webhooks do Mercado Pago (não chamar diretamente do frontend).

## Desenvolvimento Local

```bash
# Iniciar emulador local
npm run serve
```

## Logs

```bash
# Ver logs das functions
firebase functions:log
```
