# 🔧 Correção de Erro de CORS - Cloud Functions

## 🐛 Problema

Erro de CORS ao chamar `createPaymentIntent`:
```
Access to fetch at 'https://us-central1-admoirmaozinho.cloudfunctions.net/createPaymentIntent' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## ✅ Solução

### **Problema 1: Cloud Function não está deployada ou falhou**

As Cloud Functions `onCall` já lidam com CORS automaticamente. Se você está recebendo erro de CORS, é porque:

1. **A função não foi deployada** - Faça deploy:
   ```bash
   firebase deploy --only functions:createPaymentIntent
   ```

2. **A função está falhando internamente** - Verifique logs:
   ```bash
   firebase functions:log --only createPaymentIntent
   ```

### **Problema 2: Timestamp dentro de arrays**

Corrigido: `serverTimestamp()` não pode ser usado dentro de arrays ou objetos aninhados.

**Antes:**
```javascript
statusHistory: [{
    timestamp: serverTimestamp() // ❌ ERRO
}]
```

**Depois:**
```javascript
statusHistory: [{
    timestamp: new Date() // ✅ CORRETO - será convertido automaticamente
}]
```

### **Problema 3: Erro interno não tratado**

Melhorado tratamento de erros para fornecer mensagens mais detalhadas nos logs.

## 📋 Checklist de Verificação

1. **Verificar se a função está deployada:**
   ```bash
   firebase functions:list
   ```
   
2. **Ver logs da função:**
   ```bash
   firebase functions:log --only createPaymentIntent
   ```

3. **Verificar se o projeto está correto:**
   ```bash
   firebase projects:list
   firebase use <project-id>
   ```

4. **Fazer deploy novamente:**
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions:createPaymentIntent
   ```

## 🔍 Debug

Se o erro persistir:

1. Abra o Console do Firebase: https://console.firebase.google.com/project/admoirmaozinho/functions
2. Verifique se `createPaymentIntent` aparece na lista
3. Clique na função e veja os logs em tempo real
4. Verifique se há erros de deployment

## ✅ Correções Aplicadas

1. ✅ `payment.createdAt` - Mudado de `serverTimestamp()` para `new Date()`
2. ✅ `statusHistory[].timestamp` - Usando `new Date()` ou `Timestamp.now()`
3. ✅ Melhorado tratamento de erros do Mercado Pago
4. ✅ Logs mais detalhados para debug
