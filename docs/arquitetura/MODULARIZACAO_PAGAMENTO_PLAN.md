# 🔄 Plano de Modularização - Sistema de Pagamento

## 📋 Objetivo

Criar uma arquitetura modular que permita:
- ✅ Trocar gateway de pagamento facilmente
- ✅ Migrar de conta pessoal para empresa sem mudar código
- ✅ Configurar chaves de API de forma centralizada
- ✅ Manter compatibilidade com código existente

---

## 🏗️ Arquitetura Proposta

### **Estrutura de Pastas:**

```
functions/
├── index.js                    # Entry point (desacoplado)
├── config/
│   └── payment.config.js       # Configuração centralizada
├── gateways/
│   ├── BaseGateway.js          # Interface base (contrato)
│   ├── MercadoPagoGateway.js   # Implementação Mercado Pago
│   └── GatewayFactory.js       # Factory para criar gateway
└── utils/
    └── paymentHelpers.js       # Funções auxiliares
```

---

## 📐 Design Pattern: Strategy + Factory

### **1. Interface Base (BaseGateway.js)**

Define o contrato que todos os gateways devem seguir:

```javascript
class BaseGateway {
    // Criar pagamento
    async createPayment(data) { throw new Error('Must implement'); }
    
    // Verificar status
    async getPaymentStatus(paymentId) { throw new Error('Must implement'); }
    
    // Processar webhook
    async processWebhook(payload) { throw new Error('Must implement'); }
    
    // Validar credenciais
    validateCredentials() { throw new Error('Must implement'); }
}
```

### **2. Implementação Mercado Pago**

```javascript
class MercadoPagoGateway extends BaseGateway {
    constructor(config) {
        this.accessToken = config.accessToken;
        this.publicKey = config.publicKey;
        // Inicializar SDK
    }
    
    async createPayment(data) {
        // Lógica específica do Mercado Pago
    }
}
```

### **3. Factory Pattern**

```javascript
class GatewayFactory {
    static create(gatewayName, config) {
        switch(gatewayName) {
            case 'mercadopago':
                return new MercadoPagoGateway(config);
            case 'stripe':
                return new StripeGateway(config); // Futuro
            default:
                throw new Error('Gateway não suportado');
        }
    }
}
```

### **4. Configuração Centralizada**

```javascript
// payment.config.js
module.exports = {
    // Gateway ativo (pode ser mudado facilmente)
    activeGateway: process.env.PAYMENT_GATEWAY || 'mercadopago',
    
    // Credenciais (via Secrets)
    mercadopago: {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        publicKey: process.env.MERCADOPAGO_PUBLIC_KEY
    },
    
    // Futuro: Stripe
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publicKey: process.env.STRIPE_PUBLIC_KEY
    }
};
```

---

## ✅ Benefícios

1. **Troca de Gateway:** Apenas mudar `PAYMENT_GATEWAY` em variável de ambiente
2. **Troca de Conta:** Apenas atualizar Secrets (mesmo gateway, outra conta)
3. **Testes:** Fácil mockar gateway para testes
4. **Manutenção:** Código organizado e separado por responsabilidade
5. **Extensibilidade:** Adicionar novos gateways sem modificar código existente

---

## 🔄 Migração de Conta (Cenário do Usuário)

**Antes (Acoplado):**
- Mudar código em múltiplos lugares
- Risco de quebrar funcionalidades
- Difícil manter duas contas

**Depois (Modular):**
1. Configurar novos Secrets da conta empresa
2. Mudar variável de ambiente (se necessário)
3. Redeploy (código não muda)

---

## 📝 Plano de Implementação

1. Criar estrutura de pastas
2. Implementar BaseGateway (interface)
3. Refatorar código Mercado Pago para MercadoPagoGateway
4. Criar GatewayFactory
5. Criar payment.config.js
6. Atualizar index.js para usar factory
7. Testar compatibilidade
8. Documentar migração
