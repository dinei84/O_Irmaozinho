# 🔍 Debug - Email não está sendo enviado

## 📋 Checklist de Diagnóstico

### 1. Verificar Console do Navegador

Após tentar cadastrar, você deve ver no console:

**Se funcionar:**
```
📝 Iniciando cadastro...
✅ Email de verificação enviado com sucesso
✅ Cadastro concluído, redirecionando...
```

**Se houver erro:**
```
❌ Erro ao enviar email de verificação: [erro aqui]
Código do erro: [código]
Mensagem do erro: [mensagem]
```

### 2. Verificar Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Vá em **Authentication** > **Users**
3. Verifique se o usuário foi criado
4. Se o usuário existe, o problema é apenas no envio do email

### 3. Verificar Configuração

#### A. Email/Password está habilitado?

1. Firebase Console > **Authentication** > **Sign-in method**
2. Verifique se **Email/Password** está **Enabled**
3. Se não estiver, habilite e salve

#### B. Template de email está configurado?

1. Firebase Console > **Authentication** > **Templates**
2. Verifique se **Email address verification** existe
3. Se não existir, o Firebase cria automaticamente, mas pode demorar

#### C. Quotas não excedidas?

1. Firebase Console > **Usage and billing**
2. Verifique se não excedeu o limite de emails
3. Plano gratuito: **100 emails/dia**

---

## 🔧 Soluções Comuns

### Solução 1: Habilitar Email/Password

Se não estiver habilitado:

1. Firebase Console > **Authentication** > **Sign-in method**
2. Clique em **Email/Password**
3. Ative **Enable**
4. Clique em **Save**

### Solução 2: Verificar se Email está sendo enviado (mas não chega)

**Possíveis causas:**
- Email na pasta de spam
- Delay do Firebase (pode demorar 1-5 minutos)
- Email incorreto

**Solução:**
1. Verifique pasta de spam
2. Aguarde alguns minutos
3. Use "Reenviar email" na página `/verify-email`

### Solução 3: Verificar Erro Específico

**Erro: `auth/too-many-requests`**
- Muitas tentativas
- Aguarde 1 hora ou use outro email

**Erro: `auth/network-request-failed`**
- Problema de conexão
- Verifique sua internet

**Erro: `auth/invalid-action-code`**
- Link inválido
- Reenvie o email

**Sem erro, mas email não chega:**
- Verifique spam
- Aguarde alguns minutos
- Verifique quotas

---

## 🧪 Teste Manual

### Teste 1: Verificar se Firebase Auth funciona

Abra o console do navegador e execute:

```javascript
// Verificar se auth está funcionando
import { auth } from './src/lib/firebase';
console.log('Auth configurado:', !!auth);
console.log('App:', auth.app.name);
```

### Teste 2: Tentar enviar email manualmente

Se você já tem um usuário logado:

```javascript
import { auth } from './src/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

const user = auth.currentUser;
if (user && !user.emailVerified) {
  sendEmailVerification(user)
    .then(() => console.log('✅ Email enviado!'))
    .catch(err => {
      console.error('❌ Erro:', err);
      console.error('Código:', err.code);
      console.error('Mensagem:', err.message);
    });
} else {
  console.log('Usuário não encontrado ou email já verificado');
}
```

---

## 📊 Informações para Debug

Quando reportar o problema, inclua:

1. **Console do navegador:**
   - Todos os erros (copie e cole)
   - Mensagens de log (📝, ✅, ❌)

2. **Firebase Console:**
   - Authentication > Users (usuário foi criado?)
   - Authentication > Sign-in method (Email/Password habilitado?)
   - Usage and billing (quotas excedidas?)

3. **O que aconteceu:**
   - Cadastro foi concluído?
   - Foi redirecionado para `/verify-email`?
   - Apareceu algum erro na tela?

---

## ⚠️ Problemas Conhecidos

### Problema 1: Firebase não envia email em desenvolvimento local

**Causa:** Alguns provedores bloqueiam emails do Firebase em desenvolvimento

**Solução:** 
- Use um email real (Gmail, Outlook, etc)
- Verifique spam
- Aguarde alguns minutos

### Problema 2: Email chega, mas link não funciona

**Causa:** URL de redirecionamento não configurada

**Solução:**
1. Firebase Console > Authentication > Templates
2. Configure **Action URL**: `http://localhost:5173/verify-email` (dev) ou seu domínio (prod)

### Problema 3: Quota excedida

**Causa:** Plano gratuito tem limite de 100 emails/dia

**Solução:**
- Aguarde até o próximo dia
- Ou faça upgrade do plano

---

**Compartilhe os logs do console para diagnóstico mais preciso!**

