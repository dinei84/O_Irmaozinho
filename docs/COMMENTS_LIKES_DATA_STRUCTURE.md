# 📊 Estrutura de Dados: Comentários e Curtidas

## 🗄️ Diagrama da Estrutura do Firestore

```
Firestore/
│
├── content/{contentId}                    # Coleção existente (Artigos/Crônicas)
│   ├── title: string
│   ├── body: string
│   ├── category: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   ├── likesCount: number                 # ⭐ NOVO: Contador agregado
│   └── commentsCount: number              # ⭐ NOVO: Contador agregado
│
├── likes/{likeId}                         # ⭐ NOVA: Curtidas em artigos
│   ├── contentId: string                  # Referência ao artigo
│   ├── userId: string                     # UID do usuário que curtiu
│   └── createdAt: timestamp
│   └── [ID = contentId_userId]            # ID único por artigo+usuário
│
├── comments/{commentId}                   # ⭐ NOVA: Comentários
│   ├── contentId: string                  # Referência ao artigo
│   ├── userId: string                     # UID do autor
│   ├── userDisplayName: string            # Nome do autor (cache)
│   ├── userPhotoURL: string               # Foto do autor (cache)
│   ├── text: string                       # Texto do comentário (max 2000)
│   ├── likesCount: number                 # Curtidas no comentário
│   ├── edited: boolean                    # Se foi editado
│   ├── parentId: string | null            # Para replies (futuro)
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── deletedAt: timestamp | null        # Soft delete
│
├── comment_likes/{likeId}                 # ⭐ NOVA: Curtidas em comentários
│   ├── commentId: string                  # Referência ao comentário
│   ├── userId: string                     # UID do usuário que curtiu
│   └── createdAt: timestamp
│   └── [ID = commentId_userId]            # ID único por comentário+usuário
│
└── users/{userId}                         # Coleção existente (Perfis)
    └── preferences: {                     # ⭐ NOVO: Preferências do usuário
        ├── categories: {
        │   "Artigos": {
        │     likes: number,
        │     comments: number,
        │     lastInteraction: timestamp
        │   },
        │   "Crônicas": { ... }
        │ },
        ├── totalLikes: number
        ├── totalComments: number
        ├── preferredCategory: string
        └── updatedAt: timestamp
    }
```

---

## 🔗 Relacionamentos

```
content/{contentId}
    │
    ├─── (1:N) ──> likes/{likeId}
    │               ├─ contentId → content/{id}
    │               └─ userId → users/{id}
    │
    ├─── (1:N) ──> comments/{commentId}
    │               ├─ contentId → content/{id}
    │               ├─ userId → users/{id}
    │               └─ likesCount (agregado de comment_likes)
    │
    └─── (1:1) ──> likesCount, commentsCount (campos agregados)

comments/{commentId}
    │
    └─── (1:N) ──> comment_likes/{likeId}
                    ├─ commentId → comments/{id}
                    └─ userId → users/{id}
```

---

## 📋 Índices Compostos Necessários

### 1. Coleção: `likes`
```json
{
  "collectionGroup": "likes",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "contentId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "likes",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### 2. Coleção: `comments`
```json
{
  "collectionGroup": "comments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "contentId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "comments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "contentId", "order": "ASCENDING" },
    { "fieldPath": "likesCount", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "comments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### 3. Coleção: `comment_likes`
```json
{
  "collectionGroup": "comment_likes",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "commentId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

## 🔄 Fluxo de Dados

### Curtir Artigo

```
1. Usuário clica "Curtir"
   ↓
2. Verificar: exists(likes/{contentId}_{userId})
   ↓
3a. Se NÃO existe:
    - Criar: likes/{contentId}_{userId}
    - Incrementar: content/{contentId}.likesCount += 1
    - Atualizar: users/{userId}.preferences
    ↓
3b. Se existe:
    - Deletar: likes/{contentId}_{userId}
    - Decrementar: content/{contentId}.likesCount -= 1
    - Atualizar: users/{userId}.preferences
```

### Comentar Artigo

```
1. Usuário digita comentário e clica "Publicar"
   ↓
2. Validar texto (client-side)
   ↓
3. Criar: comments/{commentId}
   ├─ contentId: string
   ├─ userId: string
   ├─ text: string
   ├─ likesCount: 0
   └─ createdAt: timestamp
   ↓
4. Incrementar: content/{contentId}.commentsCount += 1
   ↓
5. Atualizar: users/{userId}.preferences
```

### Buscar Recomendações

```
1. Buscar: users/{userId}.preferences
   ↓
2. Extrair categorias mais interagidas
   ↓
3. Buscar artigos:
   - collection('content')
   - where('category', 'in', [preferredCategories])
   - orderBy('likesCount', 'desc')
   - limit(20)
   ↓
4. Filtrar:
   - Remover artigos já curtidos (verificar likes/)
   - Remover artigos já visualizados (opcional)
   ↓
5. Calcular score de relevância:
   score = (
     categoryMatch * 0.4 +
     popularityScore * 0.3 +
     recencyScore * 0.2 +
     similarityScore * 0.1
   )
   ↓
6. Ordenar por score e retornar top N
```

---

## ⚠️ Considerações de Performance

### 1. Contadores Agregados

**Problema**: Contar todos os likes/comentários a cada query é custoso.

**Solução**: Manter contadores no documento `content/`:
- ✅ Leitura rápida (um documento)
- ✅ Atualização via Cloud Functions (recomendado)
- ⚠️ Ou atualização direta (menos seguro, mas funcional)

### 2. Verificação de Curtida

**Problema**: Verificar se usuário curtiu pode exigir query.

**Solução**: Usar ID composto `${contentId}_${userId}`:
- ✅ Verificação O(1) com `getDoc()`
- ✅ Não precisa query

### 3. Paginação de Comentários

**Problema**: Carregar todos os comentários de uma vez.

**Solução**: Paginar com `limit()` e cursor:
- ✅ Carregar 10-20 por vez
- ✅ Usar `startAfter()` para próxima página

---

## 🔐 Validações

### Regras de Negócio

#### Curtidas
- ✅ Apenas usuários logados podem curtir
- ✅ Um usuário pode curtir apenas uma vez por artigo
- ✅ Usuário pode descurtir (deletar própria curtida)

#### Comentários
- ✅ Apenas usuários logados podem comentar
- ✅ Tamanho máximo: 2000 caracteres
- ✅ Tamanho mínimo: 1 caractere
- ✅ Edição permitida apenas dentro de 1 hora após criação
- ✅ Usuário pode deletar apenas próprios comentários
- ✅ Admins podem deletar qualquer comentário

#### Preferências
- ✅ Atualizar automaticamente ao curtir/comentar
- ✅ Recálculo periódico (opcional, via Cloud Function)

---

## 📊 Exemplo de Queries

### Verificar se usuário curtiu artigo
```javascript
const likeId = `${contentId}_${userId}`;
const likeDoc = await getDoc(doc(db, 'likes', likeId));
const hasLiked = likeDoc.exists();
```

### Buscar comentários de um artigo (ordenados por data)
```javascript
const q = query(
  collection(db, 'comments'),
  where('contentId', '==', contentId),
  where('deletedAt', '==', null),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const snapshot = await getDocs(q);
```

### Buscar comentários de um artigo (ordenados por popularidade)
```javascript
const q = query(
  collection(db, 'comments'),
  where('contentId', '==', contentId),
  where('deletedAt', '==', null),
  orderBy('likesCount', 'desc'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

### Buscar artigos mais curtidos
```javascript
const q = query(
  collection(db, 'content'),
  orderBy('likesCount', 'desc'),
  limit(10)
);
```

### Buscar preferências do usuário
```javascript
const userPrefsDoc = await getDoc(doc(db, 'users', userId));
const preferences = userPrefsDoc.data()?.preferences || {};
const topCategory = preferences.preferredCategory || 'Artigos';
```

---

## 🚀 Próximos Passos

1. ✅ Revisar estrutura de dados
2. ✅ Definir índices compostos
3. ✅ Implementar regras de segurança
4. ✅ Criar serviços de API
5. ✅ Implementar componentes React
