# 🔧 Troubleshooting - Verificação de Email

## ❌ Problema: Email não está sendo enviado

### Verificações Necessárias

#### 1. Verificar Console do Navegador

Abra o DevTools (F12) e verifique:

**Erros comuns:**
- `auth/too-many-requests` - Muitas tentativas, aguarde
- `auth/network-request-failed` - Problema de conexão
- `auth/invalid-action-code` - Link inválido
- Sem erro visível - Pode ser configuração do Firebase

#### 2. Verificar Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Vá em **Authentication** > **Users**
3. Verifique se o usuário foi criado
4. Verifique se há algum erro na aba "Usage"

#### 3. Verificar Configuração de Email

1. Firebase Console > **Authentication** > **Templates**
2. Verifique se **Email address verification** está ativo
3. Verifique se o template está configurado

#### 4. Verificar Quotas do Firebase

1. Firebase Console > **Usage and billing**
2. Verifique se não excedeu o limite de emails
3. Plano gratuito: 100 emails/dia

---

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar se a função está sendo chamada

No console do navegador, você deve ver:
```
📝 Iniciando cadastro...
✅ Email de verificação enviado com sucesso
✅ Cadastro concluído, redirecionando...
```

**Se não aparecer:**
- Verifique se há erros antes
- Verifique se o cadastro está sendo concluído

### Passo 2: Verificar erros específicos

**Erro: `auth/too-many-requests`**
- **Causa:** Muitas tentativas de envio
- **Solução:** Aguarde 1 hora ou use outro email

**Erro: `auth/network-request-failed`**
- **Causa:** Problema de conexão
- **Solução:** Verifique sua internet

**Erro: `auth/invalid-action-code`**
- **Causa:** Link expirado ou inválido
- **Solução:** Reenvie o email

**Sem erro, mas email não chega:**
- Verifique pasta de spam
- Aguarde alguns minutos
- Verifique se o email está correto
- Verifique quotas do Firebase

---

## ✅ Soluções Comuns

### Solução 1: Verificar Pasta de Spam

1. Abra sua caixa de entrada
2. Verifique pasta de spam/lixo eletrônico
3. Procure por emails do Firebase

### Solução 2: Aguardar

- Emails podem demorar alguns minutos
- Firebase pode ter delay de 1-5 minutos
- Aguarde e verifique novamente

### Solução 3: Reenviar Email

1. Acesse `/verify-email`
2. Clique em "Reenviar email"
3. Aguarde e verifique novamente

### Solução 4: Verificar Configuração do Firebase

1. Firebase Console > **Authentication** > **Settings**
2. Verifique se **Email/Password** está habilitado
3. Verifique se **Email link (passwordless sign-in)** está configurado (opcional)

### Solução 5: Verificar Domínios Autorizados

1. Firebase Console > **Authentication** > **Settings** > **Authorized domains**
2. Verifique se seu domínio está listado
3. Para desenvolvimento: `localhost` já vem por padrão

---

## 🧪 Teste Manual

### Teste 1: Verificar se Firebase Auth está funcionando

```javascript
// No console do navegador
import { auth } from './lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

// Se estiver logado
const user = auth.currentUser;
if (user) {
  sendEmailVerification(user)
    .then(() => console.log('✅ Email enviado'))
    .catch(err => console.error('❌ Erro:', err));
}
```

### Teste 2: Verificar Status do Usuário

```javascript
// No console do navegador
const user = auth.currentUser;
console.log('Email:', user?.email);
console.log('Email verificado:', user?.emailVerified);
console.log('UID:', user?.uid);
```

---

## 📋 Checklist de Verificação

- [ ] Console do navegador não mostra erros
- [ ] Firebase Console > Authentication > Users mostra o usuário
- [ ] Firebase Console > Authentication > Templates está configurado
- [ ] Email não está na pasta de spam
- [ ] Aguardou alguns minutos
- [ ] Tentou reenviar o email
- [ ] Verificou quotas do Firebase
- [ ] Domínios autorizados estão corretos

---

## 🆘 Se Nada Funcionar

### Opção 1: Verificar Logs do Firebase

1. Firebase Console > **Functions** > **Logs**
2. Verifique se há erros relacionados

### Opção 2: Testar com Outro Email

1. Tente com um email diferente
2. Verifique se o problema é específico do email

### Opção 3: Verificar Configuração do Projeto

1. Verifique se o projeto Firebase está correto
2. Verifique se as credenciais estão corretas no `.env`
3. Verifique se o Firebase está ativo

### Opção 4: Contatar Suporte Firebase

Se nada funcionar, pode ser um problema do Firebase:
- Verifique status: https://status.firebase.google.com/
- Consulte documentação: https://firebase.google.com/docs/auth

---

## 💡 Dicas

1. **Sempre verifique o console** - Erros aparecem lá
2. **Aguarde alguns minutos** - Emails podem demorar
3. **Verifique spam** - Primeiro lugar a verificar
4. **Use reenvio** - Funciona na maioria dos casos
5. **Verifique quotas** - Plano gratuito tem limite

---

**Se o problema persistir, compartilhe:**
- Erros do console
- Código de erro (se houver)
- O que aparece no Firebase Console

