# 📧 Email não está chegando - Guia de Solução

## ✅ Status: Firebase está enviando corretamente

Se você vê no console:
```
✅ Email de verificação enviado com sucesso
```

Isso significa que o **Firebase recebeu o pedido e está processando**. O problema é que o email não está chegando na sua caixa de entrada.

---

## 🔍 Verificações Imediatas

### 1. Verificar Pasta de Spam/Lixo Eletrônico

**Ação mais comum:**
- O email pode estar na pasta de spam
- Procure por emails do **Firebase** ou **noreply**
- Assunto geralmente é: "Verify your email" ou similar

### 2. Aguardar alguns minutos

**Delay comum:**
- Firebase pode levar 1-5 minutos para enviar
- Alguns provedores de email têm delay adicional
- Aguarde e verifique novamente

### 3. Verificar Email Correto

**Certifique-se:**
- O email digitado está correto
- Você tem acesso a esse email
- Não digitou erros comuns (gmail.com vs gmail.co)

---

## 🔧 Soluções

### Solução 1: Usar "Reenviar Email"

1. Acesse `/verify-email`
2. Clique em **"Reenviar email"**
3. Aguarde alguns minutos
4. Verifique spam novamente

### Solução 2: Verificar Configuração do Firebase

1. Firebase Console > **Authentication** > **Templates**
2. Verifique **Email address verification**
3. Verifique se o template está ativo
4. Verifique **Action URL** configurada

### Solução 3: Verificar Quotas

1. Firebase Console > **Usage and billing**
2. Verifique se não excedeu **100 emails/dia** (plano gratuito)
3. Se excedeu, aguarde até o próximo dia

---

## 📋 Checklist Completo

- [ ] Verificou pasta de spam?
- [ ] Aguardou pelo menos 5 minutos?
- [ ] Verificou se o email está correto?
- [ ] Tentou "Reenviar email"?
- [ ] Verificou quotas no Firebase?
- [ ] Verificou configuração do template?

---

## 🧪 Teste: Verificar se Email foi realmente enviado

### No Firebase Console:

1. Acesse: https://console.firebase.google.com/
2. Vá em **Authentication** > **Users**
3. Encontre seu usuário
4. Veja se há alguma informação sobre emails enviados

### Verificar Status do Usuário:

No console do navegador, execute:

```javascript
// Se estiver logado
import { auth } from './src/lib/firebase';

const user = auth.currentUser;
if (user) {
  console.log('Email:', user.email);
  console.log('Email verificado:', user.emailVerified);
  console.log('UID:', user.uid);
}
```

---

## 💡 Causas Comuns

### 1. Provedor de Email Bloqueando

**Gmail/Outlook/Hotmail:**
- Geralmente funcionam bem
- Verifique spam

**Emails corporativos:**
- Podem ter firewall bloqueando
- Tente com email pessoal (Gmail) para teste

**Emails temporários:**
- Serviços como 10minutemail podem não receber
- Use email real

### 2. Delay do Firebase

**Normal:**
- Primeiro email: pode levar 1-5 minutos
- Emails subsequentes: geralmente mais rápido

**Solução:**
- Aguarde e verifique

### 3. Template não configurado

**Verificar:**
- Firebase Console > Authentication > Templates
- Se "Email address verification" existe e está configurado

**Solução:**
- O Firebase cria automaticamente, mas pode demorar
- Verifique se está ativo

---

## 🆘 Se Nada Funcionar

### Opção 1: Verificar Logs do Firebase

1. Firebase Console > **Functions** > **Logs**
2. Verifique se há erros relacionados a email

### Opção 2: Testar com Outro Email

1. Tente cadastrar com outro email (Gmail recomendado)
2. Verifique se o problema é específico do email

### Opção 3: Verificar Status do Firebase

1. Acesse: https://status.firebase.google.com/
2. Verifique se há problemas reportados

---

## 📊 Próximos Passos Recomendados

1. **Agora:** Verifique spam, aguarde, use "Reenviar email"
2. **Se não funcionar:** Tente com outro email (Gmail)
3. **Se ainda não funcionar:** Verifique configuração do Firebase Console

---

## ✅ Resumo

**O código está funcionando corretamente!** O Firebase está enviando o email.

O problema é:
- Email na spam (mais comum)
- Delay do Firebase (normal)
- Configuração do provedor de email

**Ação imediata:** Verifique spam e aguarde alguns minutos!

