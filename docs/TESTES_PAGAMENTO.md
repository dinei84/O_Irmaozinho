# 🧪 Testes de Pagamento - PIX, Boleto e Cartão

## 📋 Resumo

Foram criados testes unitários e de integração para os métodos de pagamento implementados.

## ✅ Testes Implementados

### 1. **Testes Unitários - `paymentService`** ✅
**Arquivo:** `src/services/__tests__/paymentService.test.js`

**Cobertura:**
- ✅ `createPixPaymentIntent` - Criação de pagamento PIX
  - Sucesso com dados completos
  - Erro quando resposta não contém pix
  - Tratamento de erros (autenticação, não encontrado)
- ✅ `createBoletoPaymentIntent` - Criação de pagamento Boleto
  - Sucesso com dados completos
  - Erro quando resposta não contém boleto
  - Tratamento de erros (argumento inválido)
- ✅ `createCardPaymentIntent` - Criação de pagamento Cartão
  - Sucesso com dados completos
  - Parcelas padrão (1x)
  - Limitação de parcelas (1-12)
  - Tratamento de erros (já existe, genérico)
- ✅ `checkPaymentStatus` - Verificação de status
  - Sucesso
  - Propagação de erros

**Status:** ✅ 14 testes passando

---

### 2. **Testes de Componentes - `BoletoPaymentForm`** ✅
**Arquivo:** `src/components/checkout/__tests__/BoletoPaymentForm.test.jsx`

**Cobertura:**
- ✅ Exibição de loading quando dados não disponíveis
- ✅ Exibição de dados do boleto (PDF, código de barras, vencimento)
- ✅ Link do PDF com atributos corretos
- ✅ Cópia de código de barras
- ✅ Formatação de data de vencimento (número, Timestamp, etc)
- ✅ Monitoramento via `onSnapshot`
- ✅ Callback `onPaymentApproved` quando status muda
- ✅ Exibição de status (pending, approved, rejected)
- ✅ Cleanup do `onSnapshot`

**Status:** ✅ 12 testes implementados

---

### 3. **Testes de Componentes - `CardPaymentForm`** ✅
**Arquivo:** `src/components/checkout/__tests__/CardPaymentForm.test.jsx`

**Cobertura:**
- ✅ Exibição de loading quando SDK carregando
- ✅ Exibição de erro quando SDK indisponível
- ✅ Renderização do formulário
- ✅ Preenchimento automático de nome e CPF
- ✅ Formatação de número do cartão
- ✅ Formatação de data de validade
- ✅ Validação de campos obrigatórios
- ✅ Validação de data no passado
- ✅ Processamento de pagamento com sucesso
- ✅ Tratamento de erro de tokenização
- ✅ Tratamento de pagamento rejeitado
- ✅ Seleção de parcelas
- ✅ Exibição de valor formatado
- ✅ Loading durante processamento

**Status:** ✅ 14 testes implementados

---

### 4. **Testes de Integração - `Checkout`** ✅
**Arquivo:** `src/pages/__tests__/Checkout.integration.test.jsx`

**Cobertura:**
- ✅ Fluxo completo PIX
  - Preenchimento de dados do cliente
  - Preenchimento de endereço
  - Seleção de método de pagamento
  - Criação do pedido
  - Criação do pagamento PIX
  - Exibição do QR Code
- ✅ Fluxo completo Boleto
  - Mesmo fluxo acima, mas com boleto
- ✅ Validações
  - Campos obrigatórios
  - Formato de email
  - Formato de CEP
- ✅ Tratamento de erros
  - Erro na criação do pedido
  - Erro no pagamento (botão "Tentar Novamente")

**Status:** ✅ 7 testes de integração implementados

---

## 📊 Cobertura Total

| Categoria | Testes | Status |
|-----------|--------|--------|
| **Unitários - Services** | 14 | ✅ Passando |
| **Componentes - Boleto** | 12 | ✅ Implementados |
| **Componentes - Cartão** | 14 | ✅ Implementados |
| **Integração - Checkout** | 7 | ✅ Implementados |
| **TOTAL** | **47** | ✅ |

---

## 🚀 Como Executar

### Todos os testes
```bash
npm test
```

### Apenas testes de pagamento
```bash
npm test -- paymentService
npm test -- BoletoPaymentForm
npm test -- CardPaymentForm
npm test -- Checkout.integration
```

### Com cobertura
```bash
npm run test:coverage
```

### Modo watch
```bash
npm test -- --watch
```

---

## 📝 Notas

### Mocks Utilizados

1. **Firebase Functions:**
   - `httpsCallable` mockado para simular chamadas às Cloud Functions
   - Retornos simulados para sucesso e erro

2. **Firebase Firestore:**
   - `onSnapshot`, `doc` mockados para simular real-time updates
   - Callbacks simulados para testar mudanças de status

3. **Hooks:**
   - `useMercadoPago` mockado para simular SDK do Mercado Pago
   - `useCart`, `useAuth` mockados para simular contextos

4. **Services:**
   - `createOrder`, `createPixPaymentIntent`, `createBoletoPaymentIntent` mockados

### Limitações

- **MercadoPagoGateway:** Testes unitários diretos não foram criados pois está em `functions/` (Node.js). Seria necessário configurar ambiente Node.js separado.
- **Testes E2E:** Não foram criados testes end-to-end completos (requerem ambiente de teste do Mercado Pago).

---

## 🔄 Próximos Passos

1. ✅ Testes unitários de services - **CONCLUÍDO**
2. ✅ Testes de componentes - **CONCLUÍDO**
3. ✅ Testes de integração - **CONCLUÍDO**
4. ⚠️ Testes do MercadoPagoGateway (Node.js) - **PENDENTE** (requer setup separado)
5. ⚠️ Testes E2E com Mercado Pago Sandbox - **PENDENTE** (requer credenciais de teste)

---

## 📚 Estrutura de Arquivos

```
src/
├── services/
│   └── __tests__/
│       └── paymentService.test.js          ✅
├── components/
│   └── checkout/
│       └── __tests__/
│           ├── BoletoPaymentForm.test.jsx  ✅
│           └── CardPaymentForm.test.jsx    ✅
└── pages/
    └── __tests__/
        └── Checkout.integration.test.jsx   ✅
```

---

## ✅ Checklist de Validação

- [x] Testes unitários de `paymentService` cobrindo todos os métodos
- [x] Testes de componentes `BoletoPaymentForm` cobrindo UI e interações
- [x] Testes de componentes `CardPaymentForm` cobrindo formulário e validações
- [x] Testes de integração do fluxo completo de checkout
- [x] Tratamento de erros testado
- [x] Validações de formulário testadas
- [ ] Testes do `MercadoPagoGateway` (Node.js) - **PENDENTE**
- [ ] Testes E2E com Mercado Pago Sandbox - **PENDENTE**
