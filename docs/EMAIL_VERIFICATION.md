# 📧 Verificação de Email - Guia Completo

## ✅ O que foi implementado

O sistema de verificação de email foi implementado usando **Firebase Authentication nativo**, que é mais simples e confiável do que usar EmailJS.

---

## 🚀 Como Funciona

### Fluxo Completo:

```
1. Usuário se cadastra
   ↓
2. Conta é criada no Firebase Auth
   ↓
3. Email de verificação é enviado automaticamente
   ↓
4. Usuário é redirecionado para /verify-email
   ↓
5. Usuário clica no link no email
   ↓
6. Firebase verifica o email
   ↓
7. Usuário volta e clica em "Já verifiquei"
   ↓
8. Sistema verifica e permite acesso completo
```

---

## ⚙️ Configuração no Firebase Console

### 1. Configurar Template de Email

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Authentication** > **Templates**
4. Clique em **Email address verification**
5. Personalize o template:

**Campos importantes:**
- **Subject:** Assunto do email (ex: "Verifique seu email - O Irmãozinho")
- **Body:** Corpo do email (HTML permitido)
- **Action URL:** URL para onde o usuário será redirecionado após clicar no link

**Exemplo de template:**

```
Assunto: Verifique seu email - O Irmãozinho

Corpo:
Olá!

Clique no link abaixo para verificar seu email:

%LINK%

Se você não criou esta conta, ignore este email.

Atenciosamente,
Equipe O Irmãozinho
```

### 2. Configurar URL de Redirecionamento

No template, configure a **Action URL** para:
```
https://seu-dominio.com/verify-email
```

Ou para desenvolvimento local (após configurar no Firebase):
```
http://localhost:5173/verify-email
```

**⚠️ IMPORTANTE:** Para usar `localhost` em desenvolvimento, você precisa adicionar autorizado no Firebase Console:

1. Vá em **Authentication** > **Settings** > **Authorized domains**
2. Clique em **Add domain**
3. Adicione `localhost` (já vem por padrão em desenvolvimento)

---

## 📝 Páginas Criadas

### 1. Página de Verificação (`/verify-email`)

**Funcionalidades:**
- ✅ Mostra mensagem explicativa
- ✅ Exibe o email que recebeu o link
- ✅ Botão "Já verifiquei" para checar status
- ✅ Botão "Reenviar email"
- ✅ Link para voltar ao login
- ✅ Instruções claras

**Arquivo:** `src/pages/VerifyEmail.jsx`

### 2. Função no AuthContext

**Funções adicionadas:**
- `resendVerificationEmail()` - Reenvia email de verificação
- `signup()` atualizado para enviar email automaticamente

---

## 🔧 Como Usar no Código

### Enviar Email de Verificação (Automático)

O email é enviado automaticamente durante o cadastro:

```javascript
// Em src/contexts/AuthContext.jsx
await signup(email, password, additionalData);
// Email é enviado automaticamente
```

### Reenviar Email de Verificação

```javascript
const { resendVerificationEmail } = useAuth();

try {
  await resendVerificationEmail();
  // Email reenviado
} catch (error) {
  // Tratar erro
}
```

### Verificar se Email foi Verificado

```javascript
const { currentUser } = useAuth();

if (currentUser?.emailVerified) {
  // Email verificado
} else {
  // Email não verificado
}
```

---

## 🎨 Personalização do Email

### Opções de Personalização no Firebase Console:

1. **Assunto do Email**
   - Padrão: "Verify your email"
   - Você pode personalizar

2. **Corpo do Email**
   - Suporta HTML básico
   - Variável `%LINK%` é substituída pelo link de verificação
   - Variável `%DISPLAY_NAME%` é substituída pelo nome do usuário

3. **Aparência**
   - Firebase usa um template padrão
   - Para mais controle, você pode usar Cloud Functions com SendGrid, Mailgun, etc.

---

## 🔒 Segurança

### O que o Firebase garante:

- ✅ Link único para cada verificação
- ✅ Link expira após certo tempo (configurável)
- ✅ Link só pode ser usado uma vez
- ✅ Validação server-side automática
- ✅ Proteção contra ataques

### Boas Práticas:

1. **Sempre verificar `emailVerified`** antes de permitir ações sensíveis
2. **Não confiar apenas no client-side** - sempre validar no servidor
3. **Limitar tentativas** de reenvio (Firebase já faz isso)

---

## 🧪 Testando

### 1. Teste de Cadastro

1. Acesse `/signup`
2. Preencha o formulário
3. Crie a conta
4. Verifique se foi redirecionado para `/verify-email`
5. Verifique sua caixa de entrada

### 2. Teste de Verificação

1. Clique no link no email
2. Volte para `/verify-email`
3. Clique em "Já verifiquei"
4. Verifique se foi redirecionado para home

### 3. Teste de Reenvio

1. Na página `/verify-email`
2. Clique em "Reenviar email"
3. Verifique se recebeu novo email

---

## 📊 Verificação no Firestore

O campo `emailVerified` é sincronizado automaticamente no documento `users/{uid}`:

```javascript
{
  email: "user@example.com",
  emailVerified: true,  // Atualizado automaticamente
  // ... outros campos
}
```

---

## ⚠️ Troubleshooting

### Problema: Email não chega

**Soluções:**
1. Verifique pasta de spam
2. Aguarde alguns minutos (pode demorar)
3. Tente reenviar
4. Verifique se o email está correto
5. Verifique configurações do Firebase (quotas, etc)

### Problema: Link não funciona

**Soluções:**
1. Verifique se copiou o link completo
2. Link pode ter expirado (tente reenviar)
3. Verifique se o domínio está autorizado no Firebase

### Problema: Email já verificado, mas sistema não reconhece

**Solução:**
- O usuário precisa fazer logout e login novamente
- Ou usar `currentUser.reload()` para atualizar

---

## 💡 Dicas

### 1. EmailJS vs Firebase Auth

**Firebase Auth (Recomendado para verificação):**
- ✅ Já está configurado
- ✅ Mais seguro (validação server-side)
- ✅ Templates personalizáveis
- ✅ Gratuito (até certo limite)

**EmailJS (Melhor para outros casos):**
- ✅ Bom para emails transacionais (boletins, notificações)
- ✅ Mais controle sobre design
- ⚠️ Precisa implementar validação manual
- ⚠️ Mais complexo

**Recomendação:** Use Firebase Auth para verificação de email. Use EmailJS para outros tipos de email (se necessário).

### 2. Customização Avançada

Se precisar de mais controle sobre os emails, você pode:

1. **Cloud Functions** + SendGrid/Mailgun
2. **Cloud Functions** + EmailJS (para templates customizados)
3. Manter Firebase Auth + adicionar emails transacionais com EmailJS

---

## 📋 Checklist de Configuração

- [ ] Firebase Console > Authentication > Templates configurado
- [ ] Template de email personalizado
- [ ] Action URL configurada
- [ ] Domínios autorizados configurados
- [ ] Teste de envio funcionando
- [ ] Teste de verificação funcionando
- [ ] Teste de reenvio funcionando

---

## 🎯 Próximos Passos (Opcional)

1. **Restringir funcionalidades** até email ser verificado
2. **Página de boas-vindas** após verificação
3. **Notificações** quando email for verificado
4. **Emails transacionais** (boletins, notificações) usando EmailJS se necessário

---

**Pronto!** Sistema de verificação de email implementado! 🚀

