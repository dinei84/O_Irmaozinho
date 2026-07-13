# 🔄 Guia: Migrar de Conta Pessoal para Conta Empresa (Mercado Pago)

## 🎯 Objetivo

Migrar o sistema de pagamento da conta **pessoal** para a conta da **empresa** do Mercado Pago sem modificar código, apenas alterando configurações.

---

## ✅ Vantagens da Arquitetura Modular

Com a modularização implementada, você pode:

1. ✅ **Trocar credenciais** apenas atualizando Secrets
2. ✅ **Trocar gateway** apenas mudando variável de ambiente
3. ✅ **Manter múltiplas contas** (teste/produção)
4. ✅ **Sem alterar código** - tudo é configuração

---

## 📋 Passo a Passo: Migrar para Conta Empresa

### **Passo 1: Obter Credenciais da Conta Empresa**

1. **Acesse o painel do Mercado Pago da empresa:**
   - https://www.mercadopago.com.br/developers/panel
   - Faça login com a conta da **empresa** (não pessoal)

2. **Copie as credenciais de produção:**
   - Vá em **Credenciais** > **Produtivas**
   - Copie o **Access Token** (começa com `APP_USR-`)
   - Copie o **Public Key** (opcional, mas recomendado)

---

### **Passo 2: Configurar Novas Credenciais no Firebase**

#### **Opção A: Atualizar Secret Existente (Recomendado)**

```bash
# Atualizar Access Token da conta empresa
echo "NOVO_ACCESS_TOKEN_DA_EMPRESA" | firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
```

#### **Opção B: Criar Secret Separado (Para Múltiplas Contas)**

Se quiser manter ambas as contas:

```bash
# Secret para conta empresa
echo "TOKEN_EMPRESA" | firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN_EMPRESA

# Secret para conta pessoal (backup)
echo "TOKEN_PESSOAL" | firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN_PESSOAL
```

Depois atualizar `payment.config.js` para usar o secret correto.

---

### **Passo 3: Fazer Deploy das Functions**

Após configurar o secret:

```bash
firebase deploy --only functions
```

**Pronto!** O sistema agora usa as credenciais da conta empresa.

---

### **Passo 4: Verificar Funcionamento**

1. **Teste criar um pagamento:**
   - Adicione produtos ao carrinho
   - Vá para checkout
   - Crie um pagamento PIX

2. **Verifique logs:**
   ```bash
   firebase functions:log --only createPaymentIntent
   ```

3. **Verifique no painel do Mercado Pago da empresa:**
   - O pagamento deve aparecer na conta da empresa
   - Não deve aparecer na conta pessoal

---

## 🔄 Cenários de Uso

### **Cenário 1: Migração Completa (Descontinuar Conta Pessoal)**

**Passo único:**
1. Atualizar secret com token da empresa
2. Fazer deploy
3. ✅ Pronto!

---

### **Cenário 2: Manter Ambas as Contas (Ambiente de Teste)**

**Configurar múltiplos secrets:**

1. **Criar secrets separados:**
   ```bash
   echo "TOKEN_PESSOAL" | firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN_TEST
   echo "TOKEN_EMPRESA" | firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN_PROD
   ```

2. **Atualizar `payment.config.js`:**
   ```javascript
   mercadopago: {
       accessToken: process.env.NODE_ENV === 'production' 
           ? process.env.MERCADOPAGO_ACCESS_TOKEN_PROD
           : process.env.MERCADOPAGO_ACCESS_TOKEN_TEST
   }
   ```

3. **Fazer deploy:**
   ```bash
   firebase deploy --only functions
   ```

---

### **Cenário 3: Alternar Entre Contas Rapidamente**

Se precisar alternar entre contas:

1. **Criar variável de ambiente no Firebase Console:**
   - `MERCADOPAGO_ACCOUNT_TYPE=empresa` ou `pessoal`

2. **Atualizar `payment.config.js`:**
   ```javascript
   const accountType = process.env.MERCADOPAGO_ACCOUNT_TYPE || 'empresa';
   
   mercadopago: {
       accessToken: accountType === 'empresa'
           ? process.env.MERCADOPAGO_ACCESS_TOKEN_EMPRESA
           : process.env.MERCADOPAGO_ACCESS_TOKEN_PESSOAL
   }
   ```

3. **Mudar via Firebase Console:**
   - Acesse: https://console.firebase.google.com/project/admoirmaozinho/functions/config
   - Altere `MERCADOPAGO_ACCOUNT_TYPE`
   - ✅ Sem redeploy necessário!

---

## 📊 Comparação: Antes vs Depois

### **❌ Antes (Acoplado):**
- Mudar código em múltiplos lugares
- Risco de quebrar funcionalidades
- Difícil manter múltiplas contas
- Código duplicado

### **✅ Depois (Modular):**
- ✅ Apenas atualizar Secret
- ✅ Sem risco (código não muda)
- ✅ Fácil alternar entre contas
- ✅ Código limpo e organizado

---

## 🔒 Segurança

### **Proteções Mantidas:**
- ✅ Credenciais ainda em Secrets (não expostas)
- ✅ Validações server-side mantidas
- ✅ Autenticação obrigatória
- ✅ Firestore Rules ativas

### **Boas Práticas:**
- ✅ Use Secrets para todas as credenciais
- ✅ Não hardcode tokens no código
- ✅ Valide credenciais antes de usar
- ✅ Logs não expõem tokens completos

---

## ✅ Checklist de Migração

- [ ] Credenciais da conta empresa obtidas
- [ ] Secret atualizado no Firebase
- [ ] Deploy realizado
- [ ] Teste de pagamento realizado
- [ ] Verificação nos logs
- [ ] Pagamentos aparecem na conta empresa
- [ ] Webhook configurado para conta empresa

---

## 🆘 Problemas Comuns

### **Problema: Pagamentos ainda na conta pessoal**

**Solução:**
1. Verificar qual secret está sendo usado
2. Verificar logs: `firebase functions:log`
3. Confirmar que o secret foi atualizado

### **Problema: Erro "Access Token não configurado"**

**Solução:**
1. Verificar se o secret foi configurado: `firebase functions:secrets:access MERCADOPAGO_ACCESS_TOKEN`
2. Fazer deploy novamente
3. Aguardar alguns minutos para sincronização

---

## 📝 Resumo

Com a modularização, **migrar de conta é simples**:

1. ✅ Obter credenciais da conta empresa
2. ✅ Atualizar secret: `firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN`
3. ✅ Fazer deploy: `firebase deploy --only functions`
4. ✅ Pronto! Sistema usando conta empresa

**Sem modificar código!** 🎉
