# 👥 Guia Profissional: Sistema de Roles e Usuários

## 🎯 Como Funciona em Projetos Profissionais

### Arquitetura Atual vs. Profissional

#### ✅ O que já temos (Boa Base)

1. **Custom Claims no Firebase Auth**
   - ✅ Já implementado
   - ✅ Seguro (server-side)
   - ✅ Escalável

2. **Verificação de Roles**
   - ✅ Client-side (UX)
   - ✅ Server-side (Firestore Rules)

3. **Proteção de Rotas**
   - ✅ ProtectedRoute com verificação de admin

---

## 🏗️ Arquitetura Profissional de Roles

### 1. Tipos de Usuários (Hierarquia)

Em projetos profissionais, geralmente temos:

```
Super Admin (Root)
    ↓
Admin (Gerenciamento completo)
    ↓
Moderator (Gerenciamento limitado)
    ↓
User (Usuário comum - padrão)
    ↓
Guest (Não autenticado - apenas leitura)
```

### 2. Custom Claims (Firebase) - RECOMENDADO ✅

**O que já implementamos!** Esta é a forma profissional.

#### Vantagens:
- ✅ Seguro (definido server-side)
- ✅ Escalável (fácil adicionar novos roles)
- ✅ Performance (vem no token JWT)
- ✅ Integrado com Firestore Rules

#### Como funciona:
```javascript
// Backend (Cloud Functions ou Admin SDK)
await admin.auth().setCustomUserClaims(uid, {
  role: 'admin',
  permissions: ['read', 'write', 'delete']  // Opcional: permissões granulares
});

// Client-side
const token = await user.getIdTokenResult();
const role = token.claims.role; // 'admin' ou 'user'
```

#### Estrutura Profissional Sugerida:

```javascript
// Custom Claims podem ter:
{
  role: 'admin' | 'moderator' | 'user',
  permissions: {
    articles: ['read', 'write', 'delete'],
    products: ['read', 'write'],
    users: ['read']
  },
  // Opcional: data de expiração
  expiresAt: timestamp
}
```

---

## 🆚 Alternativas (Comparação)

### Opção 1: Custom Claims (Atual) ✅ RECOMENDADO

**Prós:**
- ✅ Mais seguro (server-side)
- ✅ Performance (no token)
- ✅ Integrado com Firestore
- ✅ Não precisa query adicional
- ✅ Escalável

**Contras:**
- ⚠️ Precisa refresh token quando atualizado
- ⚠️ Limitado em tamanho (token tem limite)

**Uso:** Projetos Firebase, apps modernos, projetos pequenos/médios

---

### Opção 2: Coleção `users` no Firestore

**Como funciona:**
```javascript
// Coleção: users/{uid}
{
  email: "user@example.com",
  role: "admin",
  createdAt: timestamp,
  profile: { ... }
}

// Verificação:
const userDoc = await getDoc(doc(db, 'users', uid));
const role = userDoc.data().role;
```

**Prós:**
- ✅ Flexível (pode adicionar muitos campos)
- ✅ Fácil de atualizar
- ✅ Pode ter histórico
- ✅ Permissões granulares fáceis

**Contras:**
- ⚠️ Requer query adicional (mais lento)
- ⚠️ Precisa sincronizar com Auth
- ⚠️ Pode ficar desincronizado

**Uso:** Quando precisa de muitos dados do usuário, histórico, perfis complexos

---

### Opção 3: Híbrido (Custom Claims + Coleção users) ⭐ IDEAL

**Como funciona:**
- Custom Claims para **roles básicos** (rápido, seguro)
- Coleção `users` para **dados adicionais** (flexível)

**Exemplo:**
```javascript
// Custom Claim (rápido)
role: 'admin'

// Coleção users/{uid} (detalhado)
{
  email: "user@example.com",
  role: "admin",  // Sincronizado com claim
  profile: {
    name: "João Silva",
    avatar: "url",
    bio: "..."
  },
  preferences: {
    newsletter: true,
    notifications: true
  },
  createdAt: timestamp,
  lastLogin: timestamp
}
```

**Prós:**
- ✅ Melhor dos dois mundos
- ✅ Performance + Flexibilidade
- ✅ Segurança + Dados detalhados

**Contras:**
- ⚠️ Precisa manter sincronizado
- ⚠️ Mais complexo

**Uso:** Projetos profissionais, produção, quando precisa de perfis completos

---

## 💼 Recomendação para Seu Projeto

### Fase 1: Melhorar Custom Claims (Curto Prazo)

Manter Custom Claims, mas melhorar a estrutura:

```javascript
// Custom Claims melhorados
{
  role: 'admin' | 'user',
  verified: true,  // Email verificado
  // Futuro: permissions granulares
}
```

### Fase 2: Adicionar Coleção users (Médio Prazo)

Adicionar coleção `users` para dados adicionais:

```javascript
// users/{uid}
{
  email: string,
  displayName: string,
  photoURL: string,
  role: 'admin' | 'user',  // Sincronizado com claim
  profile: {
    bio: string,
    preferences: {
      newsletter: boolean,
      notifications: boolean
    }
  },
  stats: {
    articlesRead: number,
    commentsCount: number
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

---

## 🚀 Implementação: Sistema de Cadastro

### Fluxo Profissional de Cadastro

```
1. Usuário preenche formulário de cadastro
   ↓
2. Criar conta no Firebase Auth (email/password)
   ↓
3. Criar documento na coleção users/
   ↓
4. Enviar email de verificação (opcional)
   ↓
5. Definir Custom Claim (role: 'user' - padrão)
   ↓
6. Redirecionar para página de boas-vindas
```

---

## 📋 Checklist de Implementação

### O que precisa ser feito:

- [ ] **Página de Cadastro (SignUp)**
  - Formulário de cadastro
  - Validação de email/senha
  - Termos de uso (checkboxes)

- [ ] **Integração com Firebase Auth**
  - `createUserWithEmailAndPassword`
  - Envio de email de verificação (opcional)

- [ ] **Coleção users no Firestore**
  - Criar documento após cadastro
  - Sincronizar com Auth

- [ ] **Custom Claims**
  - Definir `role: 'user'` por padrão
  - Script para atualizar roles

- [ ] **Regras do Firestore**
  - Usuários podem ler/atualizar próprio perfil
  - Admins podem ler todos os perfis

- [ ] **UI/UX**
  - Página de cadastro
  - Confirmação de email
  - Página de perfil do usuário

---

## 🎨 Estrutura de Dados Sugerida

### Coleção: `users/{uid}`

```typescript
interface User {
  // Dados básicos (do Auth)
  email: string;
  emailVerified: boolean;
  
  // Dados do perfil
  displayName?: string;
  photoURL?: string;
  bio?: string;
  
  // Role (sincronizado com Custom Claim)
  role: 'admin' | 'user';
  
  // Preferências
  preferences: {
    newsletter: boolean;
    emailNotifications: boolean;
    theme?: 'light' | 'dark';
  };
  
  // Estatísticas
  stats: {
    articlesRead: number;
    commentsCount: number;
    lastActivityAt: timestamp;
  };
  
  // Metadados
  createdAt: timestamp;
  updatedAt: timestamp;
  lastLoginAt: timestamp;
}
```

---

## 🔒 Regras do Firestore para Users

```javascript
match /users/{userId} {
  // Usuários podem ler apenas seu próprio perfil
  // Admins podem ler todos
  allow read: if isOwner(userId) || isAdmin();
  
  // Usuários podem criar/atualizar apenas seu próprio perfil
  // Admins podem atualizar qualquer perfil
  allow create: if isOwner(userId) && 
                   request.resource.data.userId == userId &&
                   request.resource.data.role == 'user';  // Não pode criar admin
  
  allow update: if (isOwner(userId) || isAdmin()) &&
                   request.resource.data.userId == userId &&
                   // Não pode mudar role (apenas admin via script)
                   (!request.resource.data.diff(request.resource.data).affectedKeys().hasAny(['role']));
  
  // Apenas admins podem deletar
  allow delete: if isAdmin();
}
```

---

## 📝 Próximos Passos Recomendados

### Prioridade Alta

1. **Implementar página de cadastro**
   - Formulário de SignUp
   - Validação robusta
   - Integração com Firebase Auth

2. **Coleção users**
   - Criar documento após cadastro
   - Sincronizar dados básicos

3. **Atualizar regras do Firestore**
   - Adicionar regras para coleção `users`
   - Permitir que usuários gerenciem próprio perfil

### Prioridade Média

4. **Página de Perfil**
   - Visualizar/editar perfil
   - Preferências
   - Estatísticas

5. **Email de Verificação**
   - Enviar email após cadastro
   - Verificar email antes de permitir ações

### Prioridade Baixa

6. **Permissões Granulares**
   - Sistema de permissões por recurso
   - Roles intermediários (moderator, editor)

---

## 💡 Boas Práticas Profissionais

### 1. Sempre Validar no Server-Side

✅ Custom Claims (já temos)
✅ Firestore Rules (já temos)

### 2. Nunca Confiar apenas no Client-Side

❌ **ERRADO:**
```javascript
if (user.role === 'admin') {
  // Permitir ação
}
```

✅ **CORRETO:**
```javascript
// Client-side: para UX
if (isAdmin) {
  showAdminButton();
}

// Server-side: para segurança
// Firestore Rules bloqueiam se não for admin
```

### 3. Logs de Auditoria

✅ Já implementamos!
- Registrar todas as mudanças de role
- Registrar ações administrativas

### 4. Sincronização Auth ↔ Firestore

Sempre manter sincronizado:
- Quando criar usuário no Auth → criar em `users`
- Quando deletar do Auth → deletar de `users`
- Quando atualizar role → atualizar em ambos

---

## 🎓 Resumo

### Para seu projeto:

1. **Mantenha Custom Claims** (já está bom!)
2. **Adicione coleção users** (para dados adicionais)
3. **Mantenha sincronizados** (Auth ↔ Firestore)
4. **Use regras do Firestore** (segurança)
5. **Implemente cadastro** (formulário + integração)

### Estrutura Final Recomendada:

```
Custom Claims (rápido, seguro)
    +
Coleção users (flexível, dados detalhados)
    +
Firestore Rules (segurança)
    +
Auditoria (rastreabilidade)
```

---

Esta é a arquitetura profissional! 🚀

Quer que eu implemente alguma parte específica? Posso começar com:
1. Página de cadastro
2. Coleção users e integração
3. Atualização das regras do Firestore

