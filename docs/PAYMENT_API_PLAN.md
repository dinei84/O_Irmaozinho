# 💳 Plano de Implementação: API de Pagamento

## 📋 Situação Atual

### ✅ O que já temos:
- **Carrinho funcional**: `CartContext` gerencia produtos
- **Página de Checkout**: estrutura básica criada
- **Firestore Rules**: regras básicas para `orders` já definidas
- **Autenticação**: sistema de login e roles funcionando
- **Backend Firebase**: Firestore configurado

### ❌ O que falta:
- Serviço de criação de pedidos
- Integração com gateway de pagamento
- Processamento de pagamentos
- Atualização de status de pedidos
- Notificações de pagamento (webhooks)
- Gestão de múltiplos métodos de pagamento

---

## 🎯 Objetivo

Criar um sistema de pagamento que suporte **múltiplos métodos de pagamento** de forma profissional, segura e escalável.

---

## 🏗️ Arquitetura de Pagamento: Opções e Análise

### **OPÇÃO 1: Firebase + Gateway de Pagamento (Recomendada para seu caso)**

#### Arquitetura:
```
Frontend (React) 
    ↓
Firebase Cloud Functions (Backend seguro)
    ↓
Gateway de Pagamento (Stripe, Mercado Pago, etc)
    ↓
Firestore (armazenar pedidos)
```

#### **Como funciona:**
1. **Frontend**: Usuário seleciona método de pagamento
2. **Cloud Function**: Cria intenção de pagamento no gateway
3. **Gateway**: Processa pagamento (cartão, PIX, boleto, etc)
4. **Webhook**: Gateway notifica Firebase sobre status
5. **Firestore**: Pedido criado/atualizado automaticamente

#### **✅ Vantagens:**
- **Segurança**: Dados de pagamento nunca passam pelo frontend
- **Conformidade**: Gateway lida com PCI-DSS (dados de cartão)
- **Escalável**: Firebase Functions escala automaticamente
- **Múltiplos métodos**: Gateway oferece várias opções
- **Webhooks**: Notificações automáticas de status
- **Idioma BR**: Mercado Pago tem excelente suporte para Brasil

#### **❌ Desvantagens:**
- Requer Firebase Functions (pode ter custos)
- Configuração inicial mais complexa
- Dependência do gateway escolhido

---

### **OPÇÃO 2: API Backend Proprietária (Node.js/Express + Firebase)**

#### Arquitetura:
```
Frontend (React)
    ↓
Backend API (Node.js + Express)
    ↓
Gateway de Pagamento
    ↓
Firestore
```

#### **✅ Vantagens:**
- Mais controle sobre o fluxo
- Pode rodar em servidor próprio
- Flexibilidade total

#### **❌ Desvantagens:**
- Mais infraestrutura para gerenciar
- Você precisa lidar com segurança (PCI-DSS)
- Mais complexo de manter
- Não escala automaticamente

---

### **OPÇÃO 3: SDK Frontend (NÃO RECOMENDADO para produção)**

#### **❌ Por que NÃO usar:**
- Dados sensíveis expostos no frontend
- Risco de segurança alto
- Não atende PCI-DSS
- Problemas de conformidade

---

## 🌐 Gateways de Pagamento no Brasil

### **1. Mercado Pago** ⭐ (Recomendado para BR)

#### **Métodos suportados:**
- 💳 Cartão de Crédito/Débito
- 📱 PIX (instantâneo)
- 🧾 Boleto Bancário
- 💰 Mercado Pago (saldo)
- 🔄 Parcelamento

#### **✅ Vantagens:**
- **Melhor para Brasil**: Documentação em PT-BR
- **Facilidade**: SDK bem documentado
- **Custos**: Transparentes (taxa por transação)
- **Sandbox**: Ambiente de testes gratuito
- **Webhooks**: Suporte nativo
- **PIX**: Integração simples

#### **💰 Custos:**
- ~4.99% + R$ 0.39 por transação (cartão)
- PIX: ~0.99% (mais barato)
- Boleto: Taxa específica

---

### **2. Stripe**

#### **Métodos suportados:**
- 💳 Cartão de Crédito/Débito
- 📱 PIX (recentemente adicionado)
- 🔄 Parcelamento

#### **✅ Vantagens:**
- **Global**: Melhor para vendas internacionais
- **Tecnologia**: Muito robusto e confiável
- **Documentação**: Excelente

#### **❌ Desvantagens:**
- **Brasil**: Menos métodos que Mercado Pago
- **Documentação**: Principalmente em inglês
- **Custos**: Similar ao Mercado Pago

---

### **3. PagSeguro**

#### **✅ Vantagens:**
- Brasileiro (UOL)
- Múltiplos métodos

#### **❌ Desvantagens:**
- API menos moderna
- Documentação pode ser confusa

---

## 📦 Estrutura de Dados Necessária

### **1. Coleção `orders` (Firestore)**

```javascript
{
  id: "order_123",
  userId: "user_abc",
  items: [
    {
      productId: "prod_1",
      name: "Produto X",
      price: 29.90,
      quantity: 2,
      subtotal: 59.80
    }
  ],
  total: 59.80,
  shipping: 10.00,
  finalTotal: 69.80,
  
  // Dados do cliente
  customer: {
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999"
  },
  
  // Endereço de entrega
  shippingAddress: {
    street: "Rua X, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  },
  
  // Pagamento
  payment: {
    method: "pix" | "credit_card" | "boleto" | "debit_card",
    status: "pending" | "approved" | "rejected" | "refunded",
    gateway: "mercadopago",
    gatewayTransactionId: "mp_123456789",
    gatewayPaymentId: "payment_123",
    installments: 1, // Para cartão
    createdAt: Timestamp,
    approvedAt: Timestamp | null
  },
  
  // Status do pedido
  orderStatus: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled",
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **2. Coleção `payment_intents` (opcional, para rastreamento)**

```javascript
{
  id: "intent_123",
  orderId: "order_123",
  userId: "user_abc",
  amount: 69.80,
  method: "pix",
  gateway: "mercadopago",
  gatewayIntentId: "mp_intent_123",
  status: "pending" | "succeeded" | "failed",
  createdAt: Timestamp
}
```

---

## 🛠️ Componentes a Desenvolver

### **1. Serviço de Pagamento (`paymentService.js`)**

**Responsabilidades:**
- Criar intenção de pagamento
- Processar diferentes métodos
- Validar dados de pagamento
- Integrar com gateway escolhido

**Funções principais:**
```javascript
// Criar intenção de pagamento
createPaymentIntent(orderData, paymentMethod)

// Processar pagamento PIX
processPixPayment(intentId)

// Processar pagamento cartão
processCardPayment(intentId, cardData)

// Verificar status de pagamento
checkPaymentStatus(paymentId)

// Processar webhook do gateway
handleWebhook(event, signature)
```

---

### **2. Serviço de Pedidos (`orderService.js`)**

**Responsabilidades:**
- Criar pedido no Firestore
- Atualizar status de pedido
- Validar estoque
- Calcular totais

**Funções principais:**
```javascript
// Criar pedido
createOrder(cartItems, customerData, shippingAddress)

// Atualizar status
updateOrderStatus(orderId, newStatus)

// Buscar pedidos do usuário
getUserOrders(userId)

// Buscar pedido específico
getOrder(orderId)
```

---

### **3. Cloud Functions (Firebase Functions)**

**Necessário para:**
- Processar pagamentos com segurança
- Receber webhooks do gateway
- Atualizar status automaticamente
- Validações server-side

**Functions a criar:**
```javascript
// Criar intenção de pagamento
functions.https.onCall(createPaymentIntent)

// Processar webhook do gateway
functions.https.onRequest(handlePaymentWebhook)

// Verificar pagamentos pendentes (cron job)
functions.pubsub.schedule('every 5 minutes').onRun(checkPendingPayments)
```

---

### **4. Componentes React**

#### **`PaymentMethodSelector.jsx`**
- Seleção de método de pagamento
- Campos específicos por método

#### **`PaymentForm.jsx`**
- Formulário de dados de pagamento
- Validação client-side
- Integração com gateway SDK (se necessário)

#### **`OrderConfirmation.jsx`**
- Confirmação de pedido
- QR Code PIX (se aplicável)
- Link de boleto (se aplicável)

---

## 🔐 Segurança e Validações

### **Client-Side (Frontend):**
- ✅ Validação de formulários
- ✅ Sanitização de inputs
- ✅ Validação de valores
- ❌ NUNCA processar dados sensíveis diretamente

### **Server-Side (Cloud Functions):**
- ✅ Validação de todos os dados
- ✅ Verificação de autenticação
- ✅ Verificação de estoque
- ✅ Cálculo de totais (nunca confiar no frontend)
- ✅ Processamento seguro de pagamentos

### **Firestore Rules:**
- ✅ Usuários só leem seus próprios pedidos
- ✅ Apenas Cloud Functions podem criar/atualizar pedidos
- ✅ Admins podem ler todos os pedidos

---

## 📊 Fluxo Completo de Pagamento

### **Fluxo 1: PIX**

```
1. Usuário seleciona "PIX" no checkout
2. Frontend chama Cloud Function: createPaymentIntent
3. Cloud Function:
   - Cria pedido no Firestore (status: pending)
   - Cria pagamento no Mercado Pago
   - Obtém QR Code PIX
4. Frontend exibe QR Code para usuário
5. Usuário paga via app bancário
6. Mercado Pago envia webhook para Cloud Function
7. Cloud Function atualiza pedido (status: paid)
8. Frontend recebe atualização em tempo real (Firestore listener)
9. Usuário vê confirmação
```

---

### **Fluxo 2: Cartão de Crédito**

```
1. Usuário seleciona "Cartão de Crédito"
2. Frontend exibe formulário de cartão
3. Usuário preenche dados
4. Frontend chama Cloud Function: createPaymentIntent
5. Cloud Function:
   - Valida dados
   - Cria pedido (status: pending)
   - Processa pagamento no Mercado Pago
6. Mercado Pago processa cartão
7. Webhook atualiza pedido (status: paid ou rejected)
8. Frontend mostra resultado
```

---

### **Fluxo 3: Boleto**

```
1. Usuário seleciona "Boleto"
2. Cloud Function cria boleto no gateway
3. Frontend exibe link/PDF do boleto
4. Usuário imprime e paga
5. Gateway detecta pagamento (pode levar até 2 dias úteis)
6. Webhook atualiza pedido
```

---

## 🔄 Atualizações de Status em Tempo Real

### **Usando Firestore Listeners:**

```javascript
// No frontend
const orderRef = doc(db, 'orders', orderId);
onSnapshot(orderRef, (snap) => {
  const order = snap.data();
  // Atualizar UI quando status mudar
  if (order.payment.status === 'approved') {
    showSuccess();
  }
});
```

---

## 🧪 Ambiente de Testes

### **Sandbox/Test Mode:**
- Todos os gateways oferecem ambiente de teste
- Cartões de teste fornecidos
- PIX de teste disponível
- **IMPORTANTE**: Nunca processar pagamentos reais em desenvolvimento

---

## 📈 Métricas e Monitoramento

### **O que monitorar:**
- Taxa de sucesso de pagamentos
- Tempo médio de processamento
- Método de pagamento mais usado
- Taxa de abandono no checkout
- Erros e falhas

---

## 🚀 Roadmap de Implementação

### **Fase 1: Fundação** (Essencial)
1. ✅ Estrutura de dados (`orders` collection)
2. ✅ Atualizar Firestore Rules
3. ✅ Criar `orderService.js`
4. ✅ Atualizar `Checkout.jsx` (coletar dados do cliente)

### **Fase 2: Gateway Básico** (MVP)
5. ✅ Escolher gateway (recomendo Mercado Pago)
6. ✅ Configurar conta sandbox
7. ✅ Criar Cloud Function básica
8. ✅ Implementar 1 método (PIX ou Cartão)

### **Fase 3: Múltiplos Métodos**
9. ✅ Adicionar PIX
10. ✅ Adicionar Cartão
11. ✅ Adicionar Boleto (opcional)
12. ✅ Seletor de métodos

### **Fase 4: Webhooks e Automação**
13. ✅ Implementar webhooks
14. ✅ Atualização automática de status
15. ✅ Notificações em tempo real

### **Fase 5: Melhorias**
16. ✅ Gestão de estoque
17. ✅ Cálculo de frete
18. ✅ Cupons de desconto
19. ✅ Histórico de pedidos
20. ✅ Dashboard admin de pedidos

---

## 💡 Decisões Importantes

### **1. Qual gateway escolher?**
**Recomendação: Mercado Pago**
- Melhor para Brasil
- Suporta PIX, cartão, boleto
- Documentação em PT-BR
- Fácil integração

### **2. Firebase Functions ou Backend próprio?**
**Recomendação: Firebase Functions**
- Já está usando Firebase
- Escala automaticamente
- Menos infraestrutura para gerenciar
- Seguro por padrão

### **3. Qual método implementar primeiro?**
**Recomendação: PIX**
- Mais simples
- Processamento instantâneo
- Popular no Brasil
- Sem dados sensíveis de cartão

---

## ❓ Perguntas para Você Responder

Antes de começarmos a implementação, preciso saber:

1. **Qual gateway prefere?** (Mercado Pago, Stripe, ou outro?)
2. **Quais métodos são prioritários?** (PIX, Cartão, Boleto?)
3. **Tem conta no gateway?** (precisa criar conta sandbox)
4. **Precisa de cálculo de frete?** (integração com Correios?)
5. **Tem gestão de estoque?** (precisa validar disponibilidade?)

---

## 📚 Próximos Passos

1. **Decidir gateway e métodos**
2. **Criar estrutura de dados (`orders`)**
3. **Atualizar Firestore Rules**
4. **Implementar `orderService.js`**
5. **Configurar Cloud Functions (se necessário)**
6. **Implementar primeiro método de pagamento**
7. **Testar em sandbox**
8. **Adicionar métodos adicionais**

---

**Aguardando suas respostas para começarmos a implementação! 🚀**
