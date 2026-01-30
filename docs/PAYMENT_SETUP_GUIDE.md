# 💳 Guia de Configuração: Sistema de Pagamento PIX (MVP)

## ✅ O que foi implementado

### **Frontend:**
- ✅ Formulário de dados do cliente (`CustomerDataForm.jsx`)
- ✅ Formulário de endereço de entrega (`ShippingAddressForm.jsx`)
- ✅ Seletor de método de pagamento (`PaymentMethodSelector.jsx`)
- ✅ Formulário de pagamento PIX (`PixPaymentForm.jsx`) com QR Code
- ✅ Página de confirmação (`OrderConfirmation.jsx`)
- ✅ Checkout completo (`Checkout.jsx`) com fluxo em etapas

### **Backend:**
- ✅ Serviço de pedidos (`orderService.js`)
- ✅ Serviço de pagamentos (`paymentService.js`)
- ✅ Cloud Functions:
  - `createPaymentIntent` - Cria pagamento PIX
  - `checkPaymentStatus` - Verifica status do pagamento
  - `handlePaymentWebhook` - Recebe webhooks do Mercado Pago

### **Segurança:**
- ✅ Firestore Rules atualizadas com validações
- ✅ Validações server-side nas Cloud Functions
- ✅ Processamento seguro de pagamentos (dados sensíveis no backend)

---

## 🚀 Passos para Configurar

### **1. Configurar Credenciais do Mercado Pago**

As credenciais já foram adicionadas ao `.env`:
```bash
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-a23d81b3-3e57-4ed5-983e-7152db3da54b
```

**IMPORTANTE**: O Access Token (`APP_USR-6100227058561724-112512-f41f80b6d106f4b806b344bc2aef4316-3015030772`) deve ser configurado apenas nas Cloud Functions (não no frontend).

### **2. Instalar Dependências das Cloud Functions**

```bash
cd functions
npm install
```

Isso instalará:
- `firebase-admin` - Admin SDK do Firebase
- `firebase-functions` - SDK das Cloud Functions
- `mercadopago` - SDK oficial do Mercado Pago

### **3. Configurar Access Token do Mercado Pago nas Cloud Functions**

**⚠️ IMPORTANTE:** Secrets do Firebase requerem plano Blaze (pago). Para plano gratuito, use uma das opções abaixo:

**Opção A: Token no código (MVP - Temporário)** ⚠️

Para começar rapidamente, o token já está configurado diretamente no código (`functions/index.js`). 
**Isso funciona, mas não é ideal para produção.** Use apenas para testes/MVP.

**Opção B: Via Firebase Console (Plano Gratuito)** ⭐ **RECOMENDADO**

1. Acesse: https://console.firebase.google.com/project/admoirmaozinho/functions/config
2. Clique em **"Adicionar variável"**
3. Nome: `MERCADOPAGO_ACCESS_TOKEN`
4. Valor: `APP_USR-6100227058561724-112512-f41f80b6d106f4b806b344bc2aef4316-3015030772`
5. Salve

**Opção C: Via arquivo .env (para desenvolvimento local)**

O arquivo `functions/.env` já foi criado com o token. Funciona automaticamente em desenvolvimento local.

**Opção D: Upgrade para Blaze e usar Secrets (Produção final)**

Se quiser máxima segurança futuramente:
1. Faça upgrade para plano Blaze
2. Use: `firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN`

**Recomendação para agora:** 
- ✅ Desenvolvimento: use `.env` (já configurado)
- ✅ Produção MVP: deixe o token no código temporariamente (já está assim)
- ⏭️ Futuro: configure via Firebase Console ou upgrade para Blaze

### **4. Fazer Deploy das Cloud Functions**

```bash
# Deploy de todas as functions
firebase deploy --only functions

# Ou deploy de uma function específica
firebase deploy --only functions:createPaymentIntent
```

**Nota**: Na primeira vez, isso pode levar alguns minutos.

### **5. Configurar Webhook no Mercado Pago**

1. Acesse o painel do Mercado Pago: https://www.mercadopago.com.br/developers/panel
2. Vá em **Webhooks** ou **Notificações**
3. Clique em **Adicionar URL**
4. Cole a URL da sua Cloud Function:
   ```
   https://us-central1-admoirmaozinho.cloudfunctions.net/handlePaymentWebhook
   ```
   *(Substitua `admoirmaozinho` pelo seu Project ID se diferente)*
5. Selecione os eventos:
   - ✅ `payment` (criado)
   - ✅ `payment` (atualizado)
6. Salve a configuração

**IMPORTANTE**: Após configurar o webhook, teste enviando um pagamento de teste.

### **6. Fazer Deploy das Firestore Rules**

```bash
firebase deploy --only firestore:rules
```

---

## 🧪 Como Testar

### **1. Ambiente de Testes do Mercado Pago**

O Mercado Pago oferece cartões e PIX de teste. Consulte: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards

### **2. Fluxo de Teste:**

1. **Adicionar produtos ao carrinho**
   - Acesse `/store`
   - Adicione produtos ao carrinho

2. **Ir para checkout**
   - Clique em "Finalizar Compra"
   - Você será redirecionado para `/checkout`

3. **Preencher dados do cliente**
   - Nome, Email, Telefone, CPF/CNPJ
   - Clique em "Continuar"

4. **Preencher endereço de entrega**
   - CEP (busca automática via ViaCEP)
   - Rua, Número, Bairro, Cidade, Estado
   - Selecione método de pagamento (PIX)
   - Clique em "Finalizar Pedido"

5. **Pagamento PIX**
   - QR Code será exibido
   - Use o app do seu banco para pagar
   - Status será atualizado automaticamente via webhook

### **3. Verificar Pedidos:**

Os pedidos ficam armazenados na coleção `orders` do Firestore. Você pode visualizar:
- No painel do Firebase Console
- Ou criar uma página de "Meus Pedidos" (futuro)

---

## 📋 Estrutura de Dados

### **Pedido (orders/{orderId}):**

```javascript
{
  userId: "user_abc",
  items: [
    {
      productId: "prod_123",
      name: "Produto X",
      price: 29.90,
      quantity: 2,
      subtotal: 59.80,
      supplierId: null,
      supplierName: null
    }
  ],
  subtotal: 59.80,
  shipping: 0,
  discount: 0,
  finalTotal: 59.80,
  customer: {
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    document: "123.456.789-00"
  },
  shippingAddress: {
    street: "Rua X, 123",
    complement: "",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    country: "Brasil"
  },
  payment: {
    method: "pix",
    status: "pending" | "approved" | "rejected",
    gateway: "mercadopago",
    gatewayTransactionId: "123456789",
    gatewayPaymentId: "123456789",
    pix: {
      qrCode: "...",
      qrCodeBase64: "...",
      expiresAt: Timestamp
    },
    createdAt: Timestamp,
    approvedAt: Timestamp | null
  },
  orderStatus: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled",
  statusHistory: [...],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔒 Segurança

### **Boas Práticas Implementadas:**

✅ **Dados sensíveis nunca no frontend**
- Access Token do Mercado Pago apenas nas Cloud Functions
- Dados de pagamento processados no servidor

✅ **Validações server-side**
- Totais recalculados no servidor
- Validação de estoque (futuro)
- Validação de dados do cliente

✅ **Firestore Rules**
- Usuários só leem seus próprios pedidos
- Apenas usuários autenticados criam pedidos
- Admins podem ler todos os pedidos

✅ **Webhooks verificados**
- URLs HTTPS obrigatórias
- Processamento seguro de eventos

---

## 🐛 Troubleshooting

### **Erro: "Functions not found"**
- Verifique se as functions foram deployadas
- Execute: `firebase deploy --only functions`

### **Erro: "MERCADOPAGO_ACCESS_TOKEN não configurado"**
- Configure o token via `firebase functions:config:set`
- Ou crie arquivo `.env.local` em `functions/`

### **QR Code não aparece**
- Verifique logs das Cloud Functions: `firebase functions:log`
- Verifique se o Access Token está correto
- Verifique se o valor do pagamento está correto (> 0)

### **Webhook não atualiza status**
- Verifique se o webhook está configurado no Mercado Pago
- Verifique logs: `firebase functions:log`
- Verifique se a URL do webhook está correta

### **Pedido não aparece**
- Verifique Firestore Rules foram deployadas
- Verifique se o usuário está autenticado
- Verifique logs do console do navegador

---

## 📈 Próximos Passos

### **Melhorias Futuras:**

1. **Validação de Estoque**
   - Verificar disponibilidade antes de criar pedido
   - Reservar estoque durante checkout

2. **Cálculo de Frete**
   - Integração com API de frete
   - Múltiplas opções de entrega

3. **Página "Meus Pedidos"**
   - Lista de pedidos do usuário
   - Acompanhamento de status
   - Rastreamento de entrega

4. **Pagamento com Cartão**
   - Integração com cartão de crédito/débito
   - Parcelamento

5. **Boleto Bancário**
   - Geração de boleto
   - Link para download

6. **Dashboard Admin**
   - Lista de todos os pedidos
   - Filtros e busca
   - Atualização de status manual

7. **Notificações por Email**
   - Confirmação de pedido
   - Notificação de pagamento aprovado
   - Notificação de envio

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs das Cloud Functions
2. Verifique o console do navegador
3. Verifique o Firebase Console
4. Consulte a documentação do Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs

---

**Documento criado em**: 2024
**Última atualização**: 2024
