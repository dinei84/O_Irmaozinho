# 🔧 Configurar Mercado Pago - Métodos de Pagamento

## 📋 Visão Geral

Para habilitar **PIX, Boleto e Cartão de Crédito**, você precisa configurar:

1. ✅ **Credenciais no Mercado Pago** (obter Public Key e Access Token)
2. ✅ **Variáveis de ambiente no Frontend** (`VITE_MERCADOPAGO_PUBLIC_KEY`)
3. ✅ **Secrets no Firebase Functions** (`MERCADOPAGO_ACCESS_TOKEN`)
4. ✅ **Habilitar métodos na conta do Mercado Pago**

---

## 🎯 Passo 1: Obter Credenciais no Mercado Pago

### **1.1 Acessar Painel de Desenvolvedores**

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Faça login com sua conta do Mercado Pago
3. Selecione sua aplicação ou crie uma nova

### **1.2 Obter Credenciais de Produção**

⚠️ **IMPORTANTE:** Use sempre as credenciais de **PRODUÇÃO** (não teste) para pagamentos reais.

1. No painel, vá em **"Suas integrações"** > **"Credenciais"**
2. Clique na aba **"Produtivas"** (não "Teste")
3. Você verá:
   - **Public Key** (começa com `APP_USR-...`)
   - **Access Token** (está mascarado: `............`)

### **1.3 Revelar e Copiar Credenciais**

1. **Public Key:**
   - Já está visível
   - Copie o valor completo (ex: `APP_USR-479d2b30-7b32-44a0-b8f3-b2b52ae31c87`)

2. **Access Token:**
   - Clique no **ícone de olho** 👁️ para revelar
   - Clique no **ícone de copiar** 📋
   - Salve em local seguro (ex: `APP_USR-4455998573983950-112511-dad71f8e74f1bfcb357c85cbd1b96aa5-15105017`)

---

## 🎯 Passo 2: Habilitar Métodos de Pagamento na Conta

### **2.1 Acessar Configurações de Pagamento**

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Vá em **"Configurações"** > **"Métodos de pagamento"**

### **2.2 Habilitar Métodos**

Certifique-se de que os seguintes métodos estão **habilitados**:

- ✅ **PIX** - Geralmente já vem habilitado
- ✅ **Boleto Bancário** - Pode precisar de ativação
- ✅ **Cartão de Crédito** - Pode precisar de ativação

### **2.3 Verificar Status da Conta**

Alguns métodos podem exigir:
- ✅ **Verificação de identidade** completa
- ✅ **Documentação** aprovada
- ✅ **Conta verificada** (não apenas em teste)

Se algum método não estiver disponível, entre em contato com o suporte do Mercado Pago.

---

## 🎯 Passo 3: Configurar Frontend (Variável de Ambiente)

### **3.1 Criar Arquivo `.env` na Raiz do Projeto**

Crie o arquivo `.env` na raiz do projeto (mesmo nível do `package.json`):

```env
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-479d2b30-7b32-44a0-b8f3-b2b52ae31c87
```

⚠️ **Substitua** `APP_USR-479d2b30-7b32-44a0-b8f3-b2b52ae31c87` pela sua Public Key real.

### **3.2 Adicionar ao `.gitignore`**

Certifique-se de que `.env` está no `.gitignore`:

```gitignore
.env
.env.local
.env.production
```

### **3.3 Reiniciar Servidor de Desenvolvimento**

Após criar/editar o `.env`:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### **3.4 Para Produção (Vercel/Netlify/etc)**

Configure a variável de ambiente no painel do seu provedor:

- **Nome:** `VITE_MERCADOPAGO_PUBLIC_KEY`
- **Valor:** Sua Public Key do Mercado Pago

---

## 🎯 Passo 4: Configurar Backend (Firebase Functions)

### **4.1 Método Recomendado: Firebase Secrets**

```bash
# Configurar Access Token
firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
```

Quando solicitado, cole o Access Token de produção:
```
APP_USR-4455998573983950-112511-dad71f8e74f1bfcb357c85cbd1b96aa5-15105017
```

⚠️ **Substitua** pelo seu Access Token real.

### **4.2 Verificar se Foi Configurado**

```bash
firebase functions:secrets:access MERCADOPAGO_ACCESS_TOKEN
```

### **4.3 Fazer Deploy das Functions**

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

---

## 🎯 Passo 5: Verificar Configuração

### **5.1 Verificar Frontend**

1. Abra o console do navegador (F12)
2. Verifique se não há erros relacionados a `VITE_MERCADOPAGO_PUBLIC_KEY`
3. Tente acessar a página de checkout
4. O formulário de cartão deve aparecer (não a mensagem de erro)

### **5.2 Verificar Backend**

1. Teste criar um pagamento PIX
2. Se funcionar, o backend está configurado corretamente
3. Teste criar um boleto
4. Teste criar um pagamento com cartão

---

## 📋 Resumo das Variáveis Necessárias

### **Frontend (`.env`):**
```env
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-479d2b30-7b32-44a0-b8f3-b2b52ae31c87
```

### **Backend (Firebase Secrets):**
```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR-4455998573983950-112511-dad71f8e74f1bfcb357c85cbd1b96aa5-15105017
```

---

## ⚠️ Troubleshooting

### **Erro: "Chave pública não configurada"**

**Causa:** `VITE_MERCADOPAGO_PUBLIC_KEY` não está definida no frontend.

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique se a variável está escrita corretamente (sem espaços)
3. Reinicie o servidor de desenvolvimento (`npm run dev`)

### **Erro: "Unauthorized use of live credentials"**

**Causa:** Access Token incorreto ou de teste sendo usado em produção.

**Solução:**
1. Verifique se está usando o Access Token de **PRODUÇÃO** (começa com `APP_USR-`)
2. Verifique se o token não foi revogado no painel do Mercado Pago
3. Reconfigure o secret no Firebase

### **Erro: "Método de pagamento não disponível"**

**Causa:** Método não habilitado na conta do Mercado Pago.

**Solução:**
1. Acesse o painel do Mercado Pago
2. Vá em **"Configurações"** > **"Métodos de pagamento"**
3. Habilite o método desejado
4. Verifique se sua conta está totalmente verificada

### **Cartão de Crédito não aparece**

**Causa:** `VITE_MERCADOPAGO_PUBLIC_KEY` não configurada ou inválida.

**Solução:**
1. Verifique se a Public Key está correta no `.env`
2. Verifique se começa com `APP_USR-` (produção)
3. Reinicie o servidor de desenvolvimento

---

## 🔒 Segurança

### **✅ Boas Práticas:**

1. ✅ **NUNCA** commite o arquivo `.env` no Git
2. ✅ **NUNCA** exponha o Access Token no frontend
3. ✅ Use sempre credenciais de **PRODUÇÃO** em produção
4. ✅ Use credenciais de **TESTE** apenas em desenvolvimento local
5. ✅ Rotacione as credenciais periodicamente

### **❌ O que NÃO fazer:**

1. ❌ Colocar Access Token no código fonte
2. ❌ Compartilhar credenciais em mensagens/chats
3. ❌ Usar credenciais de teste em produção
4. ❌ Expor credenciais em logs ou console

---

## 📚 Referências

- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)
- [Firebase Secrets](https://firebase.google.com/docs/functions/config-env)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ Checklist Final

- [ ] Credenciais obtidas do Mercado Pago (Public Key e Access Token)
- [ ] Métodos de pagamento habilitados na conta do Mercado Pago
- [ ] Arquivo `.env` criado com `VITE_MERCADOPAGO_PUBLIC_KEY`
- [ ] Firebase Secret configurado com `MERCADOPAGO_ACCESS_TOKEN`
- [ ] Functions deployadas com sucesso
- [ ] Testado pagamento PIX
- [ ] Testado pagamento Boleto
- [ ] Testado pagamento Cartão de Crédito

---

**Pronto!** Após seguir todos os passos, seus métodos de pagamento devem estar funcionando. 🎉
