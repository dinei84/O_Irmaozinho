# 🔧 Configuração do Projeto Firebase

## 📋 Situação Atual

Você tem **dois projetos Firebase**:

1. **`admoirmaozinho`** (email pessoal: claudinei.trompete@gmail.com)
   - ⚠️ Projeto atual configurado no código
   - ❌ Sem Cloud Functions deployadas

2. **`oirmaozinho`** (email projeto: projetoirmaozinho@gmail.com)
   - ✅ Projeto correto do projeto
   - ✅ Com Cloud Functions deployadas
   - ✅ Plano Blaze ativo

## 🎯 Objetivo

Configurar o projeto para usar **`oirmaozinho`** (projeto correto) em vez de `admoirmaozinho`.

## 🔍 Passo 1: Verificar qual projeto está logado no Firebase CLI

```bash
firebase projects:list
```

Isso mostrará todos os projetos que você tem acesso.

## 🔄 Passo 2: Mudar para o projeto correto

### Opção A: Se o projeto `oirmaozinho` aparece na lista

```bash
firebase use oirmaozinho
```

Isso atualizará o arquivo `.firebaserc` automaticamente.

### Opção B: Se o projeto `oirmaozinho` não aparece (precisa fazer login com outro email)

1. **Fazer login com o email do projeto:**
   ```bash
   firebase login
   ```
   - Isso abrirá o navegador
   - Faça login com: **projetoirmaozinho@gmail.com**

2. **Depois, mudar para o projeto correto:**
   ```bash
   firebase use oirmaozinho
   ```

### Opção C: Adicionar ambos os projetos

Você pode ter múltiplos projetos configurados:

```bash
# Adicionar projeto correto
firebase use --add oirmaozinho

# Quando perguntado, dê um alias (ex: "production" ou "projeto")
# Depois defina como padrão:
firebase use oirmaozinho
```

## ✅ Passo 3: Verificar a configuração

Após mudar o projeto, verifique:

```bash
firebase use
```

Deve mostrar: `oirmaozinho`

E o arquivo `.firebaserc` deve ficar assim:
```json
{
  "projects": {
    "default": "oirmaozinho"
  }
}
```

## 🔐 Passo 4: Atualizar credenciais do Firebase no `.env`

**IMPORTANTE:** Você precisa das credenciais do projeto **`oirmaozinho`** (não do `admoirmaozinho`).

### Como obter as credenciais do projeto `oirmaozinho`:

1. Acesse: https://console.firebase.google.com/project/oirmaozinho/settings/general
2. Faça login com: **projetoirmaozinho@gmail.com**
3. Vá em **Configurações do projeto** > **Seus apps**
4. Se não tiver um app web criado, clique em **"</>" Adicionar app**
5. Copie as credenciais e atualize o arquivo `.env`:

```env
VITE_FIREBASE_API_KEY=<API_KEY_DO_OIRMAOZINHO>
VITE_FIREBASE_AUTH_DOMAIN=oirmaozinho.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=oirmaozinho
VITE_FIREBASE_STORAGE_BUCKET=oirmaozinho.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<SENDER_ID_DO_OIRMAOZINHO>
VITE_FIREBASE_APP_ID=<APP_ID_DO_OIRMAOZINHO>
VITE_FIREBASE_MEASUREMENT_ID=<MEASUREMENT_ID_DO_OIRMAOZINHO>
```

⚠️ **ATENÇÃO:** Substitua todos os valores pelas credenciais do projeto **`oirmaozinho`**, não do `admoirmaozinho`!

## 🚀 Passo 5: Verificar se as Functions já estão deployadas

1. Acesse: https://console.firebase.google.com/project/oirmaozinho/functions
2. Faça login com: **projetoirmaozinho@gmail.com**
3. Verifique se aparecem as functions:
   - ✅ `createPaymentIntent`
   - ✅ `checkPaymentStatus`
   - ✅ `handlePaymentWebhook`

Se não aparecerem, você precisa fazer deploy (veja Passo 6).

## 📦 Passo 6: Fazer Deploy das Functions (se necessário)

Se as functions não estiverem deployadas no projeto `oirmaozinho`:

1. **Certifique-se de estar usando o projeto correto:**
   ```bash
   firebase use oirmaozinho
   ```

2. **Instalar dependências das functions:**
   ```bash
   cd functions
   npm install
   cd ..
   ```

3. **Configurar o Access Token do Mercado Pago (se necessário):**
   
   Criar arquivo `functions/.env`:
   ```env
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-6100227058561724-112512-f41f80b6d106f4b806b344bc2aef4316-3015030772
   ```

   Ou configurar via Firebase Console:
   - Acesse: https://console.firebase.google.com/project/oirmaozinho/functions/config
   - Adicione variável: `MERCADOPAGO_ACCESS_TOKEN`

4. **Fazer deploy:**
   ```bash
   firebase deploy --only functions
   ```

## ✅ Passo 7: Verificar se está tudo funcionando

1. **Testar localmente:**
   ```bash
   npm run dev
   ```

2. **Tentar fazer um checkout:**
   - Adicione produtos ao carrinho
   - Vá para checkout
   - Tente criar um pedido

3. **Verificar logs:**
   ```bash
   firebase functions:log --only createPaymentIntent
   ```

## 🔍 Verificações Finais

### Checklist:

- [ ] Firebase CLI está usando o projeto `oirmaozinho`
- [ ] Arquivo `.firebaserc` tem `"default": "oirmaozinho"`
- [ ] Arquivo `.env` tem as credenciais do projeto `oirmaozinho`
- [ ] Functions estão deployadas no projeto `oirmaozinho`
- [ ] Access Token do Mercado Pago está configurado
- [ ] Teste de checkout funciona sem erro de CORS

## 🆘 Problemas Comuns

### Problema: "Project not found" ao fazer `firebase use oirmaozinho`

**Solução:**
1. Certifique-se de estar logado com o email correto:
   ```bash
   firebase login
   ```
   Use: **projetoirmaozinho@gmail.com**

2. Verifique se o Project ID está correto:
   ```bash
   firebase projects:list
   ```

### Problema: Ainda recebe erro de CORS

**Possíveis causas:**
1. O `.env` ainda tem credenciais do `admoirmaozinho` (projeto errado)
2. As functions não foram deployadas no projeto `oirmaozinho`
3. O projeto `oirmaozinho` não tem as functions

**Solução:**
1. Verifique o `.env` - deve ter credenciais do `oirmaozinho`
2. Verifique se as functions estão deployadas: https://console.firebase.google.com/project/oirmaozinho/functions
3. Faça deploy novamente se necessário

### Problema: Não consigo acessar o projeto `oirmaozinho`

**Solução:**
1. Certifique-se de estar logado com o email correto no Firebase Console
2. Se não tiver acesso, peça para alguém com acesso adicionar você ao projeto

## 📝 Resumo

1. ✅ Mudar Firebase CLI para projeto `oirmaozinho`
2. ✅ Atualizar `.env` com credenciais do `oirmaozinho`
3. ✅ Verificar/Deploy das functions no `oirmaozinho`
4. ✅ Testar checkout

## 🎯 Próximos Passos

Após configurar corretamente, você pode:

1. Fazer deploy das Firestore Rules no projeto correto:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Fazer deploy do hosting (se necessário):
   ```bash
   firebase deploy --only hosting
   ```
