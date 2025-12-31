# ⚡ Como Tornar um Usuário Admin (Rápido)

## 📋 Resumo Rápido

### Fluxo Completo:

```
1. Usuário se cadastra no site
   ↓
   Role padrão: 'user' ✅
   
2. Admin (você) quer promover para admin
   ↓
   Execute: npm run admin:set <uid>
   ↓
   Custom Claim atualizado: role: 'admin' ✅
   
3. Usuário faz logout e login
   ↓
   Novo token com role: 'admin' ✅
```

---

## 🎯 Passo a Passo Detalhado

### 1️⃣ Usuário se Cadastra

**O que acontece:**
- Usuário preenche formulário de cadastro
- Conta é criada no Firebase Auth
- **Por padrão:** `role: 'user'` (ou nenhum role = user por padrão)
- Documento criado em `users/{uid}` com `role: 'user'`

**Resultado:**
- ✅ Usuário pode fazer login
- ✅ Acesso apenas às páginas públicas
- ❌ **NÃO** pode acessar `/admin`

---

### 2️⃣ Promover para Admin

**Você (admin) quer dar acesso administrativo a esse usuário:**

#### Opção A: Via Script (RECOMENDADO - que já temos!)

```bash
# 1. Pegar o UID do usuário
# No Firebase Console: Authentication > Users > copiar UID

# 2. Executar script
npm run admin:set abc123xyz456

# Onde abc123xyz456 é o UID do usuário
```

**O que o script faz:**
1. ✅ Verifica se usuário existe
2. ✅ Define Custom Claim: `role: 'admin'`
3. ✅ Cria registro na coleção `admins/{uid}` (para Firestore Rules)
4. ✅ Mostra confirmação

**Importante:** O usuário precisa fazer **logout e login** novamente!

---

### 3️⃣ Usuário Faz Logout e Login

**Por quê?**
- Custom Claims vêm no token JWT
- Token antigo não tem o novo role
- Novo token (após login) tem `role: 'admin'`

**Resultado:**
- ✅ Usuário pode acessar `/admin`
- ✅ Pode criar/editar/deletar artigos
- ✅ Pode gerenciar produtos

---

## 📊 Comparação Visual

### Antes de Promover:

```
Firebase Auth:
  User { uid: "abc123", email: "user@example.com" }
  Custom Claims: { role: 'user' } ou { }

Firestore:
  users/abc123: { role: 'user', ... }
```

### Depois de Promover:

```
Firebase Auth:
  User { uid: "abc123", email: "user@example.com" }
  Custom Claims: { role: 'admin' } ✅

Firestore:
  users/abc123: { role: 'admin', ... } ✅
  admins/abc123: { email: "...", createdAt: ... } ✅
```

---

## 🔒 Segurança: Por que não no Cadastro?

### ❌ NÃO fazer assim:

```javascript
// ERRADO - NUNCA fazer isso no client-side
createUserWithEmailAndPassword(auth, email, password)
  .then(() => {
    // ERRADO: Tentar definir admin no client
    setCustomUserClaims(uid, { role: 'admin' }); // ❌ Não funciona!
  });
```

**Por quê?**
- Custom Claims só podem ser definidos **server-side**
- Client-side não tem permissão
- Seria uma vulnerabilidade de segurança

---

### ✅ FAZER assim (Seguro):

```javascript
// 1. Cliente: Cadastro normal
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Role padrão: 'user' (ou nenhum = user)
    // Não precisa fazer nada aqui
  });

// 2. Servidor (script): Promover para admin
npm run admin:set <uid>  // ✅ Seguro!
```

---

## 🎓 Resumo em 3 Pontos

1. **Cadastro = User padrão**
   - Qualquer um que se cadastra vira `user` automaticamente
   - Não pode acessar área admin

2. **Promover = Script admin**
   - Apenas você (que já é admin) pode executar
   - Usa: `npm run admin:set <uid>`
   - Altera Custom Claim: `role: 'admin'`

3. **Ativar = Logout/Login**
   - Usuário precisa fazer logout
   - Fazer login novamente
   - Novo token tem o role atualizado

---

## 💡 Exemplo Prático

### Cenário:

João se cadastrou no site. Agora você quer que ele seja admin.

**Passos:**

```bash
# 1. Pegar UID do João
# Firebase Console > Authentication > Users
# Encontrar: joao@example.com
# Copiar UID: "xyz789abc123"

# 2. Executar script
npm run admin:set xyz789abc123

# Saída esperada:
# ✅ Usuário encontrado: joao@example.com
# ✅ Role de admin configurada com sucesso!
# ⚠️  IMPORTANTE: O usuário precisa fazer LOGOUT e LOGIN novamente!

# 3. Avisar João
# "Oi João! Você foi promovido a admin. Faça logout e login novamente."
```

**João faz logout e login:**
- ✅ Agora tem acesso a `/admin`
- ✅ Pode criar artigos
- ✅ Pode gerenciar produtos

---

## 🔄 Workflow Completo

```
┌─────────────────────────────────────────────┐
│ 1. CADASTRO (Cliente faz no site)          │
└─────────────────────────────────────────────┘
         │
         ├─→ Firebase Auth: cria conta
         ├─→ Custom Claim: NENHUM (padrão = user)
         └─→ Firestore: users/{uid} com role: 'user'
         
         Resultado: Usuário comum ✅

┌─────────────────────────────────────────────┐
│ 2. PROMOÇÃO (Admin executa script)         │
└─────────────────────────────────────────────┘
         │
         ├─→ Script: npm run admin:set <uid>
         ├─→ Admin SDK: setCustomUserClaims(uid, { role: 'admin' })
         └─→ Firestore: admins/{uid} criado
         
         Resultado: Custom Claim atualizado ✅
         ⚠️  Mas token antigo ainda tem role antigo!

┌─────────────────────────────────────────────┐
│ 3. ATIVAÇÃO (Usuário faz logout/login)     │
└─────────────────────────────────────────────┘
         │
         ├─→ Logout: remove token antigo
         ├─→ Login: gera novo token
         └─→ Novo token: contém role: 'admin'
         
         Resultado: Admin ativo! ✅
```

---

## ❓ Perguntas Frequentes

### P: Por que não definir admin no cadastro?

**R:** Por segurança! Se qualquer um pudesse se cadastrar como admin, seria uma vulnerabilidade. Roles administrativos devem ser dados **apenas por quem já é admin**, via script ou Cloud Function.

### P: Posso promover alguém pelo Firebase Console?

**R:** Não diretamente. O Firebase Console não tem interface para Custom Claims. Você precisa usar:
- ✅ Script (que já temos)
- ✅ Cloud Function (mais complexo)
- ✅ Admin SDK (via código Node.js)

### P: E se esquecer de fazer logout/login?

**R:** O usuário continuará com o token antigo (role: 'user'). Ele não terá acesso admin até fazer logout/login.

### P: Posso remover admin de alguém?

**R:** Sim! Basta executar o script novamente e mudar para `role: 'user'`. Mas atualmente o script só adiciona. Podemos criar um script `removeAdmin` se precisar.

---

## ✅ Checklist

Para promover alguém a admin:

- [ ] Usuário já existe no Firebase Auth
- [ ] Você tem o UID do usuário
- [ ] Você tem `serviceAccountKey.json` na raiz
- [ ] Executou: `npm run admin:set <uid>`
- [ ] Avisou o usuário para fazer logout/login

---

**Pronto!** Agora você sabe como funciona! 🚀

