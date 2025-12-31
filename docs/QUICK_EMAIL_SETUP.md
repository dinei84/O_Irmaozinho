# ⚡ Configuração Rápida - Verificação de Email

## 🚀 Setup em 3 Passos

### 1. Firebase Console (2 minutos)

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em **Authentication** > **Templates**
4. Clique em **Email address verification**
5. Personalize o template (opcional):
   - Assunto: "Verifique seu email - O Irmãozinho"
   - Corpo: Use `%LINK%` para o link de verificação

### 2. Configurar Action URL (1 minuto)

No template, configure:
- **Action URL:** `https://seu-dominio.com/verify-email`
- Para desenvolvimento: `http://localhost:5173/verify-email` (já vem por padrão)

### 3. Testar (1 minuto)

1. Faça cadastro em `/signup`
2. Verifique seu email
3. Clique no link
4. Volte e clique em "Já verifiquei"

**Pronto!** ✅

---

## ✅ O que já está funcionando

- ✅ Email enviado automaticamente no cadastro
- ✅ Página `/verify-email` criada
- ✅ Botão "Reenviar email" funcionando
- ✅ Botão "Já verifiquei" funcionando
- ✅ Validação automática

---

## ❓ Perguntas Frequentes

**P: Preciso configurar algo no código?**  
R: Não! Tudo já está implementado. Só precisa configurar o template no Firebase Console.

**P: Posso usar EmailJS?**  
R: Sim, mas é mais complexo. Firebase Auth já faz tudo automaticamente. EmailJS é melhor para outros tipos de email (boletins, etc).

**P: O email não chegou?**  
R: Verifique spam, aguarde alguns minutos, ou use "Reenviar email".

**P: Posso personalizar o email?**  
R: Sim! No Firebase Console > Authentication > Templates. Use HTML básico.

---

**Para mais detalhes, veja [EMAIL_VERIFICATION.md](./EMAIL_VERIFICATION.md)**

