# 🔧 Configurar Mercado Pago - Passo a Passo

## 📋 Situação Atual

Você está no painel do Mercado Pago e pode ver:
- ✅ Aba **"Teste"** (credenciais de teste)
- ✅ Aba **"Produtivas"** (credenciais de produção)
- ⚠️ O erro indica uso incorreto de credenciais

## 🎯 Entendendo os Ambientes

### **Credenciais de Teste:**
- Começam com `TEST-`
- Para desenvolvimento e testes
- Não processam pagamentos reais
- **Use para:** Desenvolvimento local e testes

### **Credenciais de Produção:**
- Começam com `APP_USR-`
- Para pagamentos reais
- Processa dinheiro de verdade
- **Use para:** Produção e ambiente real

## ✅ Passo a Passo: Configurar Credenciais de Produção

### **Passo 1: Copiar Access Token de Produção**

1. **Na tela do Mercado Pago que você está vendo:**
   - Clique na aba **"Produtivas"** (não "Teste")
   - Você verá:
     - **Public Key** (começa com `APP_USR-`)
     - **Access Token** (está mascarado: `............`)

2. **Revelar o Access Token:**
   - Clique no **ícone de olho** 👁️ ao lado do Access Token
   - O token será revelado

3. **Copiar o Access Token:**
   - Clique no **ícone de copiar** 📋 ao lado do Access Token
   - Salve em um lugar seguro (você vai precisar agora)

### **Passo 2: Verificar se o Token Está Correto**

O Access Token de produção deve:
- ✅ Começar com `APP_USR-`
- ✅ Ter cerca de 80-90 caracteres
- ✅ Estar na aba **"Produtivas"** (não "Teste")

### **Passo 3: Configurar no Firebase Console**

1. **Acesse o Firebase Console:**
   ```
   https://console.firebase.google.com/project/admoirmaozinho/functions/config
   ```

2. **Adicionar Variável de Ambiente:**
   - Clique em **"Adicionar variável"** ou **"Add Variable"**
   - **Nome da variável:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Valor:** Cole o Access Token que você copiou do Mercado Pago (da aba "Produtivas")
   - Clique em **"Salvar"**

3. **Verificar se foi salvo:**
   - A variável deve aparecer na lista de variáveis de ambiente
   - Certifique-se de que o nome está exatamente: `MERCADOPAGO_ACCESS_TOKEN`

### **Passo 4: Verificar se a Conta Está Aprovada**

⚠️ **IMPORTANTE:** O erro "Unauthorized use of live credentials" pode acontecer se:

1. **Conta não está totalmente verificada:**
   - Acesse: https://www.mercadopago.com.br/developers/panel
   - Verifique se há alguma pendência de verificação
   - Complete todos os dados necessários

2. **Aplicação não está configurada:**
   - No painel do Mercado Pago, verifique se a aplicação está **ativa**
   - Verifique se não há restrições na conta

### **Passo 5: Testar Novamente**

Após configurar:

1. **Não precisa fazer redeploy** - O Firebase pega variáveis de ambiente automaticamente
2. **Aguarde 1-2 minutos** para a variável ser sincronizada
3. **Teste o checkout novamente**

## 🔄 Alternativa: Usar Credenciais de Teste (Para Desenvolvimento)

Se você quer **testar sem processar pagamentos reais**:

### **Passo 1: Copiar Access Token de Teste**

1. No painel do Mercado Pago, certifique-se de estar na aba **"Teste"**
2. Clique no ícone de olho 👁️ para revelar o Access Token
3. Copie o token (começa com `TEST-`)

### **Passo 2: Atualizar o Código Temporariamente**

Em `functions/index.js`, linha 22, substitua:

```javascript
|| 'SEU_TOKEN_DE_TESTE_AQUI'; // Token de teste
```

⚠️ **Nota:** Isso é apenas para desenvolvimento. Para produção, use credenciais de produção via Firebase Console.

### **Passo 3: Fazer Redeploy**

```bash
firebase deploy --only functions:createPaymentIntent
```

## 🎯 Recomendação

Para **produção real**, use:
- ✅ Credenciais de **Produção** (aba "Produtivas")
- ✅ Configure via **Firebase Console** (variável de ambiente)
- ✅ Não hardcode no código

Para **desenvolvimento/testes**, você pode:
- ✅ Usar credenciais de **Teste** (aba "Teste")
- ✅ Hardcode temporariamente no código (apenas para testes)

## 📝 Checklist de Configuração

- [ ] Copiou o Access Token da aba **"Produtivas"** (não "Teste")
- [ ] Verificou que o token começa com `APP_USR-`
- [ ] Configurou a variável `MERCADOPAGO_ACCESS_TOKEN` no Firebase Console
- [ ] Verificou se a conta do Mercado Pago está aprovada e ativa
- [ ] Aguardou 1-2 minutos após configurar
- [ ] Testou o checkout novamente

## 🆘 Se Ainda Der Erro

1. **Verifique os logs novamente:**
   ```bash
   firebase functions:log --only createPaymentIntent
   ```

2. **Verifique se a variável está configurada:**
   - Acesse: https://console.firebase.google.com/project/admoirmaozinho/functions/config
   - Verifique se `MERCADOPAGO_ACCESS_TOKEN` aparece na lista

3. **Verifique a conta do Mercado Pago:**
   - Certifique-se de que está completa
   - Verifique se não há pendências de verificação

4. **Tente gerar um novo Access Token:**
   - No painel do Mercado Pago
   - Gere um novo token de produção
   - Configure novamente no Firebase Console

## ✅ Próximos Passos Após Configurar

1. ✅ Configure o Access Token de produção no Firebase Console
2. ✅ Aguarde 1-2 minutos
3. ✅ Teste o checkout novamente
4. ✅ Verifique os logs se ainda houver erro
