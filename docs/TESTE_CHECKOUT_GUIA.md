# 🧪 Guia de Teste do Checkout

## ✅ Checklist Pré-Teste

Antes de começar, verifique:

- [ ] Você está **logado** na aplicação
- [ ] Há **produtos cadastrados** na loja
- [ ] As **Cloud Functions estão deployadas** e funcionando
- [ ] O servidor de desenvolvimento está rodando (`npm run dev`)

---

## 🚀 Passo a Passo do Teste

### **1. Adicionar Produtos ao Carrinho**

1. Acesse a página da **Loja** (`/store`)
2. Adicione alguns produtos ao carrinho
3. Clique no ícone do carrinho no header
4. Verifique se os produtos aparecem corretamente

### **2. Ir para o Checkout**

1. No carrinho, clique em **"Finalizar Compra"** ou **"Ir para Checkout"**
2. Ou acesse diretamente: `/checkout`

### **3. Preencher Dados do Cliente (Passo 1)**

Preencha o formulário com:

- **Nome completo**
- **Email** (será preenchido automaticamente se você estiver logado)
- **CPF** (opcional, mas recomendado para PIX)
- **Telefone**

Clique em **"Próximo"**

### **4. Preencher Endereço de Entrega (Passo 2)**

Preencha:

- **CEP** (pode usar um CEP de teste: `01310-100`)
- **Endereço** (será preenchido automaticamente se o CEP for válido)
- **Número**
- **Complemento** (opcional)
- **Bairro**
- **Cidade**
- **Estado**

Clique em **"Próximo"**

### **5. Selecionar Método de Pagamento (Passo 3)**

1. Selecione **"PIX"** como método de pagamento
2. Revise o resumo do pedido:
   - Produtos
   - Subtotal
   - Frete (se aplicável)
   - Total
3. Clique em **"Confirmar Pedido"**

### **6. Processar Pagamento PIX**

Após confirmar:

1. **O sistema irá:**
   - Criar o pedido no Firestore
   - Chamar a Cloud Function `createPaymentIntent`
   - Criar o pagamento PIX no Mercado Pago
   - Retornar o QR Code

2. **Você deve ver:**
   - QR Code do PIX na tela
   - Código PIX copiável
   - Timer de expiração (geralmente 30 minutos)
   - Botão para copiar o código

### **7. Verificar Status do Pagamento**

O sistema irá verificar automaticamente o status do pagamento a cada poucos segundos.

---

## ✅ O que deve funcionar

### **Sucesso:**

- ✅ Pedido criado no Firestore
- ✅ QR Code PIX aparece na tela
- ✅ Código PIX pode ser copiado
- ✅ Sem erros no console do navegador
- ✅ Sem erros de CORS

### **Verificações no Firestore:**

Acesse: https://console.firebase.google.com/project/admoirmaozinho/firestore

Verifique se foi criado um documento na coleção `orders` com:
- `userId`: seu ID de usuário
- `orderStatus`: `"pending"`
- `payment.status`: `"pending"`
- `payment.pix.qrCode`: código PIX
- `payment.pix.qrCodeBase64`: QR Code em base64

---

## 🐛 Problemas Comuns e Soluções

### **Problema: Erro de CORS**

**Sintoma:**
```
Access to fetch at 'https://us-central1-admoirmaozinho.cloudfunctions.net/createPaymentIntent' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solução:**
- ✅ Verificar se as functions estão deployadas
- ✅ Verificar logs: `firebase functions:log --only createPaymentIntent`

### **Problema: "Erro ao criar pagamento PIX"**

**Possíveis causas:**
1. Token do Mercado Pago inválido
2. Dados do pedido inválidos
3. Erro na Cloud Function

**Solução:**
1. Verificar logs das functions:
   ```bash
   firebase functions:log --only createPaymentIntent
   ```
2. Verificar console do navegador (F12) para erros específicos
3. Verificar se o pedido foi criado (mesmo com erro de pagamento)

### **Problema: QR Code não aparece**

**Solução:**
1. Verificar se o pagamento foi criado no Mercado Pago
2. Verificar logs da function
3. Verificar console do navegador para erros

### **Problema: "Pedido não encontrado"**

**Solução:**
- Verificar se o pedido foi criado no Firestore
- Verificar se o `orderId` está sendo passado corretamente

---

## 📊 Verificações Técnicas

### **1. Verificar Logs das Functions**

```bash
firebase functions:log --only createPaymentIntent
```

Você deve ver logs como:
- ✅ "Criando pagamento no Mercado Pago..."
- ✅ "Pagamento criado com sucesso: [ID]"

### **2. Verificar Console do Navegador**

Abra o Console do navegador (F12) e verifique:

- ❌ Sem erros vermelhos
- ✅ Mensagens de sucesso (se houver)
- ✅ Network tab mostra chamada para `createPaymentIntent` com status 200

### **3. Verificar Firestore**

Acesse o Firestore Console e verifique:

- ✅ Coleção `orders` tem um novo documento
- ✅ Campo `payment.pix.qrCode` está preenchido
- ✅ Campo `payment.status` está como `"pending"`

---

## 🎯 Teste Completo Bem-Sucedido

Se tudo funcionou:

1. ✅ Pedido criado no Firestore
2. ✅ QR Code PIX aparece na tela
3. ✅ Código PIX pode ser copiado
4. ✅ Sem erros no console
5. ✅ Sem erros de CORS
6. ✅ Logs das functions mostram sucesso

---

## 📝 Próximos Passos Após Teste

Se o teste foi bem-sucedido:

1. **Testar pagamento real (opcional):**
   - Use o app do Mercado Pago para escanear o QR Code
   - Ou copie o código PIX e faça um pagamento de teste

2. **Configurar Webhook (futuro):**
   - Quando estiver pronto para produção
   - Configure no Mercado Pago para receber notificações automáticas

3. **Monitorar uso:**
   - Verificar logs regularmente
   - Monitorar custos no Firebase Console

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs: `firebase functions:log`
2. Verifique o console do navegador (F12)
3. Verifique o Firestore Console
4. Compartilhe os erros específicos para análise
