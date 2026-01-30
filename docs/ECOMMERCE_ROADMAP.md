# 🛒 E-COMMERCE ROADMAP - Análise Profissional

## 📊 **STATUS ATUAL DO PROJETO**

### ✅ **O QUE JÁ ESTÁ IMPLEMENTADO**

#### **1. Fluxo de Compra (Frontend)**
- ✅ Catálogo de produtos com filtros
- ✅ Carrinho de compras funcional
- ✅ Checkout em 3 etapas (Dados → Endereço → Pagamento)
- ✅ Integração com Mercado Pago (PIX, Boleto, Cartão)
- ✅ Validação de formulários
- ✅ Cálculo de totais

#### **2. Pagamentos**
- ✅ Criação de pagamentos PIX/Boleto/Cartão
- ✅ Webhook do Mercado Pago configurado
- ✅ Atualização automática de status via webhook
- ✅ Segurança: status forçado como 'pending' para PIX/Boleto

#### **3. Segurança**
- ✅ Firestore Rules robustas para pedidos
- ✅ Autenticação Firebase
- ✅ Validação de dados no backend
- ✅ Proteção contra manipulação de status de pagamento

#### **4. Administração**
- ✅ Dashboard admin
- ✅ Gerenciamento de produtos
- ✅ Gerenciamento de fornecedores
- ✅ Sistema de permissões (admin/user)

---

## ❌ **O QUE ESTÁ FALTANDO (CRÍTICO)**

### 🚨 **PRIORIDADE MÁXIMA**

#### **1. Página "Meus Pedidos" (Cliente)**
**Status:** ✅ IMPLEMENTADO  
**Arquivo:** `src/pages/Orders.jsx`  
**Funcionalidades:**
- ✅ Lista de pedidos do cliente
- ✅ Filtros por status (Todos, Pendentes, Pagos, Processando, Enviados, Entregues, Cancelados)
- ✅ Cards de pedido com informações básicas
- ✅ Navegação para detalhes do pedido

**O que falta:**
- ⚠️ Melhorar visualização de status (badge mais destacado)
- ⚠️ Adicionar busca por número do pedido
- ⚠️ Ordenação por data/valor

**Página de Detalhes:** ✅ IMPLEMENTADO (`src/pages/OrderDetail.jsx`)
- ✅ Informações completas do pedido
- ✅ Status de pagamento
- ✅ Itens comprados
- ✅ Endereço de entrega
- ✅ Timeline de status
- ✅ Botão "Cancelar Pedido" (apenas para pedidos pendentes)

---

#### **2. Dashboard de Pedidos (Admin)**
**Status:** ✅ PARCIALMENTE IMPLEMENTADO  
**Arquivo:** `src/pages/admin/OrdersManager.jsx`  
**Funcionalidades Implementadas:**
- ✅ Lista de todos os pedidos
- ✅ Filtros por status
- ✅ Estatísticas básicas (Total, Receita, Pendentes)
- ✅ Cards de pedido

**O que falta:**
- ❌ Página de detalhes do pedido para admin (`/admin/orders/:orderId`)
- ❌ Filtros avançados (por data, cliente, método de pagamento)
- ❌ Ações em massa (marcar múltiplos pedidos)
- ❌ Atualizar status manualmente
- ❌ Adicionar código de rastreio
- ❌ Adicionar notas internas
- ❌ Exportar relatórios (CSV/PDF)
- ❌ Busca por número do pedido ou cliente

---

#### **3. Automação de Pedidos**
**Status:** ⚠️ PARCIAL  
**Impacto:** ALTO - Processos manuais demorados

**O que já está implementado:**
- ✅ Redução automática de estoque quando pagamento aprovado (no webhook)
- ✅ Atualização automática de status do pedido para 'paid'
- ✅ Adição automática ao histórico de status
- ✅ Função `reduceProductStock()` implementada em `functions/index.js`

**O que falta:**

##### **A) Cloud Function: Processar Pedido Pago (Separada)**
**Status:** ⚠️ Código está no webhook, mas não é uma função separada
**Recomendação:** Criar função `onUpdate` separada para melhor organização e manutenção

##### **B) Cloud Function: Enviar Emails**
**Status:** ❌ NÃO IMPLEMENTADO
**Impacto:** ALTO - Cliente não recebe confirmações

**O que precisa:**
- Configurar SendGrid, Mailgun ou Firebase Extensions
- Templates de email:
  - Pedido criado
  - Pagamento aprovado
  - Pedido enviado (com código de rastreio)
  - Pedido entregue
- Integrar no webhook quando pagamento aprovado

##### **C) Cloud Function: Notificar Fornecedores**
**Status:** ❌ NÃO IMPLEMENTADO
**Impacto:** MÉDIO - Fornecedores não são notificados automaticamente

**O que precisa:**
- Agrupar itens por fornecedor
- Enviar email/API para cada fornecedor quando pedido pago
- Integrar no webhook quando pagamento aprovado

---

#### **4. Sistema de Notificações**
**Status:** ❌ NÃO IMPLEMENTADO  
**Impacto:** MÉDIO - Cliente não recebe atualizações

**O que precisa:**
- ❌ Email de confirmação de pedido
- ❌ Email de pagamento aprovado
- ❌ Email de pedido enviado (com código de rastreio)
- ❌ Email de pedido entregue
- ❌ Notificações in-app (opcional)

---

#### **5. Gestão de Estoque Automática**
**Status:** ✅ PARCIALMENTE IMPLEMENTADO  
**Impacto:** ALTO - Risco de vender produto sem estoque

**O que já está implementado:**
- ✅ Redução automática de estoque quando pagamento aprovado
- ✅ Validação de estoque insuficiente (não reduz se não tiver estoque)
- ✅ Função `reduceProductStock()` com tratamento de erros

**O que falta:**
- ❌ Bloquear produto automaticamente se estoque = 0
- ❌ Alertar admin se estoque baixo (< 5 unidades)
- ❌ Reverter estoque automaticamente se pedido cancelado
- ❌ Verificar estoque antes de permitir adicionar ao carrinho

---

#### **6. Rastreamento de Pedidos**
**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO  
**Impacto:** MÉDIO - Cliente não sabe onde está o pedido

**O que já está implementado:**
- ✅ Campo `tracking` no modelo de pedido
- ✅ Exibição do código de rastreio na página de detalhes (se existir)
- ✅ Timeline visual de status (`OrderTimeline` component)

**O que falta:**
- ❌ UI para admin adicionar código de rastreio
- ❌ Atualizar status automaticamente quando código adicionado
- ❌ Integração com Correios/transportadora (opcional)
- ❌ Link direto para rastreamento nos Correios

---

#### **7. Sistema de Cancelamento**
**Status:** ✅ IMPLEMENTADO (PARCIAL)  
**Arquivo:** `src/services/orderService.js` - função `cancelOrder()`  
**Impacto:** MÉDIO - Funcionalidade básica existe

**O que já está implementado:**
- ✅ Botão "Cancelar Pedido" na página de detalhes (`OrderDetail.jsx`)
- ✅ Validação: só pode cancelar se status = 'pending'
- ✅ Modal de confirmação
- ✅ Atualização de status e histórico

**O que falta:**
- ❌ Reverter estoque automaticamente ao cancelar
- ❌ Permitir cancelamento para status 'paid' (com reembolso)
- ❌ Notificar admin sobre cancelamento
- ❌ Processar reembolso via Mercado Pago (se já pago)
- ❌ Cancelamento pelo admin

---

#### **8. Relatórios e Analytics**
**Status:** ⚠️ PARCIALMENTE IMPLEMENTADO  
**Arquivo:** `src/services/orderService.js` - função `getOrderStats()`  
**Impacto:** ALTO - Admin não tem visão completa do negócio

**O que já está implementado:**
- ✅ Estatísticas básicas no `OrdersManager`:
  - Total de pedidos
  - Receita total
  - Receita confirmada
  - Pedidos pendentes
- ✅ Contagem de pedidos por status

**O que falta:**
- ❌ Total de vendas por período (hoje, semana, mês)
- ❌ Produtos mais vendidos
- ❌ Métodos de pagamento mais usados
- ❌ Gráficos de vendas ao longo do tempo
- ❌ Receita por fornecedor
- ❌ Exportar relatórios (CSV/PDF)
- ❌ Filtros por período de data

---

## 📋 **ROADMAP DE IMPLEMENTAÇÃO**

### **FASE 1: ESSENCIAL (1-2 semanas)**
**Objetivo:** Tornar o e-commerce funcional para clientes e admin

#### **Sprint 1.1: Página de Pedidos (Cliente)** ✅ COMPLETO
- [x] Criar página `/orders` (lista de pedidos)
- [x] Criar página `/orders/:orderId` (detalhes)
- [x] Adicionar rota no `App.jsx`
- [x] Criar serviço `orderService.js` com:
  - [x] `getUserOrders(userId)`
  - [x] `getOrderById(orderId)` → `getOrder(orderId)`
  - [x] `cancelOrder(orderId)`
- [x] Componentes:
  - [x] `Orders.jsx` (lista)
  - [x] `OrderCard.jsx`
  - [x] `OrderDetail.jsx`
  - [x] `OrderTimeline.jsx`
  - [x] `OrderStatusBadge.jsx`

#### **Sprint 1.2: Dashboard de Pedidos (Admin)** ⚠️ PARCIAL
- [x] Criar página `/admin/orders` (lista)
- [ ] Criar página `/admin/orders/:orderId` (detalhes admin)
- [x] Adicionar rota protegida no `App.jsx`
- [x] Criar `OrdersManager.jsx` (admin)
- [ ] Criar `OrderEditor.jsx` (admin)
- [ ] Ações admin:
  - [ ] Atualizar status manualmente
  - [ ] Adicionar código de rastreio
  - [ ] Adicionar notas internas
  - [ ] Cancelar/reembolsar

#### **Sprint 1.3: Automação Básica** ⚠️ PARCIAL
- [x] Redução de estoque ao pagar (implementado no webhook)
- [ ] Cloud Function separada: `processOrder` (melhor organização)
- [ ] Cloud Function: `sendOrderEmails` (confirmação)
- [ ] Integrar envio de emails no webhook

---

### **FASE 2: MELHORIAS (2-3 semanas)**
**Objetivo:** Adicionar funcionalidades avançadas

#### **Sprint 2.1: Sistema de Notificações**
- [ ] Configurar SendGrid ou Mailgun
- [ ] Templates de email:
  - Pedido criado
  - Pagamento aprovado
  - Pedido enviado
  - Pedido entregue
- [ ] Notificações in-app (opcional)

#### **Sprint 2.2: Gestão de Estoque**
- [ ] Reduzir estoque automaticamente ao pagar
- [ ] Reverter estoque ao cancelar
- [ ] Alertas de estoque baixo
- [ ] Bloquear produtos sem estoque

#### **Sprint 2.3: Rastreamento**
- [ ] Adicionar campo `trackingCode` no pedido
- [ ] UI para admin adicionar código
- [ ] Mostrar código para cliente
- [ ] Integração com Correios (opcional)

---

### **FASE 3: OTIMIZAÇÃO (1-2 semanas)**
**Objetivo:** Analytics e relatórios

#### **Sprint 3.1: Relatórios**
- [ ] Dashboard com métricas
- [ ] Gráficos de vendas
- [ ] Exportar relatórios (CSV/PDF)
- [ ] Filtros avançados

#### **Sprint 3.2: Melhorias de UX**
- [ ] Loading states
- [ ] Mensagens de erro amigáveis
- [ ] Animações
- [ ] Responsividade mobile

---

## 🎯 **PRIORIDADES IMEDIATAS**

### **1. ✅ PÁGINA "MEUS PEDIDOS" (Cliente)** - COMPLETO
**Status:** Implementado e funcional

### **2. ⚠️ DASHBOARD DE PEDIDOS (Admin)** - PARCIAL
**Tempo estimado:** 2-3 dias  
**Impacto:** CRÍTICO
**O que falta:**
- Página de detalhes do pedido para admin
- Ações para atualizar status, adicionar rastreio, etc.

### **3. ✅ AUTOMAÇÃO: REDUZIR ESTOQUE AO PAGAR** - COMPLETO
**Status:** Implementado no webhook

### **4. ❌ EMAILS DE CONFIRMAÇÃO** - NÃO IMPLEMENTADO
**Tempo estimado:** 2-3 dias  
**Impacto:** ALTO
**O que precisa:**
- Configurar SendGrid/Mailgun
- Criar templates de email
- Integrar no webhook

### **5. ❌ PÁGINA DE DETALHES DO PEDIDO (Admin)**
**Tempo estimado:** 1-2 dias  
**Impacto:** CRÍTICO
**O que precisa:**
- Criar `/admin/orders/:orderId`
- Ações admin: atualizar status, adicionar rastreio, notas internas

---

## 📝 **ESTRUTURA DE DADOS RECOMENDADA**

### **Pedido (Order)**
```javascript
{
  id: "ORDER123",
  userId: "USER_ID",
  orderNumber: "2024-001", // Número sequencial
  
  // Itens
  items: [
    {
      productId: "PROD_ID",
      name: "Produto X",
      price: 100.00,
      quantity: 2,
      supplierId: "SUPPLIER_ID",
      supplierName: "Fornecedor Y"
    }
  ],
  
  // Valores
  subtotal: 200.00,
  shipping: 0,
  discount: 0,
  finalTotal: 200.00,
  
  // Cliente
  customer: {
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    document: "123.456.789-00"
  },
  
  // Endereço
  shippingAddress: {
    street: "Rua X, 123",
    complement: "Apto 45",
    neighborhood: "Bairro Y",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  },
  
  // Pagamento
  payment: {
    method: "pix", // pix, boleto, credit_card
    status: "approved", // pending, approved, rejected
    gateway: "mercadopago",
    transactionId: "MP_TRANSACTION_ID",
    paidAt: Timestamp
  },
  
  // Status do pedido
  orderStatus: "paid", // pending, paid, processing, shipped, delivered, cancelled
  
  // Rastreamento
  trackingCode: "BR123456789",
  
  // Notas
  customerNotes: "Entregar após 18h",
  internalNotes: "Cliente VIP", // Apenas admin vê
  
  // Histórico
  statusHistory: [
    { status: "pending", timestamp: Timestamp, updatedBy: "system" },
    { status: "paid", timestamp: Timestamp, updatedBy: "webhook" },
    { status: "processing", timestamp: Timestamp, updatedBy: "admin_id" }
  ],
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  paidAt: Timestamp,
  shippedAt: Timestamp,
  deliveredAt: Timestamp,
  cancelledAt: Timestamp
}
```

---

## 🔧 **FERRAMENTAS RECOMENDADAS**

### **Emails**
- **SendGrid** (gratuito até 100 emails/dia)
- **Mailgun** (gratuito até 5.000 emails/mês)
- **Firebase Extensions: Trigger Email** (mais fácil de configurar)

### **Relatórios**
- **Chart.js** ou **Recharts** (gráficos)
- **jsPDF** (exportar PDF)
- **Papa Parse** (exportar CSV)

### **Rastreamento**
- **API Correios** (gratuita)
- **Melhor Envio** (integração com várias transportadoras)

---

## ✅ **CHECKLIST FINAL**

### **Para Cliente:**
- [ ] Ver lista de pedidos
- [ ] Ver detalhes de cada pedido
- [ ] Acompanhar status em tempo real
- [ ] Cancelar pedido (se permitido)
- [ ] Ver código de rastreio
- [ ] Receber emails de confirmação

### **Para Admin:**
- [ ] Ver todos os pedidos
- [ ] Filtrar e buscar pedidos
- [ ] Atualizar status manualmente
- [ ] Adicionar código de rastreio
- [ ] Ver relatórios de vendas
- [ ] Gerenciar estoque automaticamente
- [ ] Notificar fornecedores

### **Automação:**
- [ ] Reduzir estoque ao pagar
- [ ] Enviar emails automaticamente
- [ ] Notificar fornecedores
- [ ] Reverter estoque ao cancelar
- [ ] Criar logs de auditoria

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Decidir prioridades** com base no impacto
2. **Começar pela Fase 1** (essencial)
3. **Testar cada feature** antes de avançar
4. **Deploy incremental** (não esperar tudo pronto)
5. **Coletar feedback** dos usuários

---

**Documentação criada em:** ${new Date().toLocaleDateString('pt-BR')}  
**Versão:** 1.0  
**Status:** 🟡 Em Desenvolvimento
