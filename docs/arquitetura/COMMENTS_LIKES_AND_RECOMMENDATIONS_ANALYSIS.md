# 📊 Análise Técnica: Comentários, Curtidas e Sistema de Recomendações

## 🎯 Objetivo

Adicionar funcionalidades de **comentários** e **curtidas** nos artigos/crônicas, utilizando esses dados para criar um **sistema de recomendação personalizado** que entrega conteúdo baseado nas preferências do usuário.

---

## 📋 Índice

1. [Análise de Requisitos](#análise-de-requisitos)
2. [Estrutura de Dados (Firestore)](#estrutura-de-dados-firestore)
3. [Segurança (Firestore Rules)](#segurança-firestore-rules)
4. [Arquitetura da Solução](#arquitetura-da-solução)
5. [Componentes Necessários](#componentes-necessários)
6. [Serviços e API](#serviços-e-api)
7. [Sistema de Recomendação](#sistema-de-recomendação)
8. [Impacto no Código Existente](#impacto-no-código-existente)
9. [Considerações de Performance](#considerações-de-performance)
10. [Plano de Implementação](#plano-de-implementação)
11. [Métricas e Analytics](#métricas-e-analytics)

---

## 🔍 Análise de Requisitos

### Funcionalidades Core

#### 1. Sistema de Curtidas
- ✅ Usuários logados podem curtir/descurtir artigos
- ✅ Exibir contagem de curtidas em tempo real
- ✅ Indicar se o usuário atual curtiu o artigo
- ✅ Apenas uma curtida por usuário por artigo

#### 2. Sistema de Comentários
- ✅ Usuários logados podem comentar em artigos
- ✅ Editar próprios comentários (dentro de um período)
- ✅ Deletar próprios comentários
- ✅ Respostas a comentários (threading - opcional na Fase 1)
- ✅ Paginação de comentários
- ✅ Ordenação (mais recentes, mais curtidos)
- ✅ Moderação de comentários (admins podem deletar)

#### 3. Sistema de Recomendação
- ✅ Baseado em histórico de curtidas
- ✅ Baseado em categorias mais interagidas
- ✅ Baseado em artigos mais populares
- ✅ Página de "Para Você" personalizada
- ✅ Recomendações em tempo real

---

## 🗄️ Estrutura de Dados (Firestore)

### 1. Coleção: `likes`

Armazena curtidas dos usuários em artigos.

```
likes/{likeId}
├── contentId: string        // ID do artigo
├── userId: string           // UID do usuário
├── createdAt: timestamp     // Data da curtida
└── [índice composto]: contentId + userId (único)
```

**Estratégia**: Document ID = `${contentId}_${userId}` para garantir unicidade.

**Vantagens**:
- Evita duplicação de curtidas
- Busca rápida (check if liked)
- Delete simples

### 2. Coleção: `comments`

Armazena comentários dos usuários.

```
comments/{commentId}
├── contentId: string        // ID do artigo comentado
├── userId: string           // UID do autor
├── userDisplayName: string  // Nome do autor (cache)
├── userPhotoURL: string     // Foto do autor (cache)
├── text: string             // Texto do comentário (max 2000 chars)
├── likesCount: number       // Contagem de curtidas no comentário
├── edited: boolean          // Se foi editado
├── createdAt: timestamp     // Data de criação
├── updatedAt: timestamp     // Data de última atualização
├── deletedAt: timestamp     // Soft delete (opcional)
└── parentId: string         // Para replies (null = comentário principal)
```

**Índices necessários**:
- `contentId` + `createdAt` (desc)
- `contentId` + `likesCount` (desc)
- `userId` + `createdAt` (desc)

### 3. Coleção: `comment_likes`

Curtidas em comentários (separado para evitar conflitos).

```
comment_likes/{likeId}
├── commentId: string
├── userId: string
├── createdAt: timestamp
└── [índice composto]: commentId + userId (único)
```

### 4. Subcoleção alternativa (para contadores agregados)

**Opção A: Contadores no documento do artigo**

Adicionar ao `content/{contentId}`:
```
content/{contentId}
├── ... (campos existentes)
├── likesCount: number       // Contador agregado
└── commentsCount: number    // Contador agregado
```

**Opção B: Documento separado para estatísticas**

```
content_stats/{contentId}
├── contentId: string
├── likesCount: number
├── commentsCount: number
├── lastLikedAt: timestamp
└── lastCommentedAt: timestamp
```

**Recomendação**: Usar **Opção A** para simplificar queries.

---

## 🔒 Segurança (Firestore Rules)

### Regras para `likes`

```javascript
match /likes/{likeId} {
  // Qualquer um pode ler curtidas
  allow read: if true;
  
  // Apenas usuários autenticados podem criar curtidas
  // Validar que userId corresponde ao usuário logado
  allow create: if isAuthenticated() &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.contentId is string &&
                   request.resource.data.contentId.size() > 0 &&
                   request.resource.data.createdAt == request.time;
  
  // Usuários podem deletar apenas suas próprias curtidas
  allow delete: if isAuthenticated() &&
                  resource.data.userId == request.auth.uid;
  
  // Não permitir atualizações
  allow update: if false;
}
```

### Regras para `comments`

```javascript
match /comments/{commentId} {
  // Qualquer um pode ler comentários
  allow read: if true;
  
  // Apenas usuários autenticados podem criar comentários
  allow create: if isAuthenticated() &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.contentId is string &&
                   request.resource.data.text is string &&
                   request.resource.data.text.size() > 0 &&
                   request.resource.data.text.size() <= 2000 &&
                   request.resource.data.createdAt == request.time;
  
  // Usuários podem editar apenas seus próprios comentários
  // Apenas dentro de 1 hora após criação
  allow update: if isAuthenticated() &&
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.text.size() <= 2000 &&
                   request.resource.data.updatedAt == request.time &&
                   (request.time.seconds - resource.data.createdAt.seconds) <= 3600;
  
  // Usuários podem deletar seus próprios comentários
  // Admins podem deletar qualquer comentário
  allow delete: if isAuthenticated() &&
                  (resource.data.userId == request.auth.uid || isAdmin());
}
```

### Regras para `comment_likes`

```javascript
match /comment_likes/{likeId} {
  allow read: if true;
  allow create: if isAuthenticated() &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.commentId is string &&
                   request.resource.data.createdAt == request.time;
  allow delete: if isAuthenticated() &&
                  resource.data.userId == request.auth.uid;
  allow update: if false;
}
```

### Atualização das regras de `content`

Adicionar atualização de contadores:

```javascript
match /content/{contentId} {
  // ... regras existentes ...
  
  // Permitir atualização apenas de contadores (via Cloud Function)
  // Ou validar que apenas Cloud Function pode atualizar contadores
  allow update: if isAdmin() || 
                  (request.resource.data.diff(resource.data).affectedKeys()
                   .hasOnly(['likesCount', 'commentsCount']) &&
                   request.resource.data.likesCount is number &&
                   request.resource.data.commentsCount is number);
}
```

**Nota**: Para atualizar contadores de forma segura, recomenda-se usar **Cloud Functions** com triggers.

---

## 🏗️ Arquitetura da Solução

### Fluxo de Curtida

```
1. Usuário clica em "Curtir"
   ↓
2. Verificar se já curtiu (query likes/{contentId}_{userId})
   ↓
3. Se não curtiu:
   - Criar documento em likes/
   - Incrementar likesCount no content/
   - Atualizar preferências do usuário
   ↓
4. Se já curtiu:
   - Deletar documento em likes/
   - Decrementar likesCount no content/
```

### Fluxo de Comentário

```
1. Usuário digita comentário e clica "Publicar"
   ↓
2. Validar texto (client-side)
   ↓
3. Criar documento em comments/
   ↓
4. Incrementar commentsCount no content/
   ↓
5. Atualizar preferências do usuário (categoria do artigo)
```

### Fluxo de Recomendação

```
1. Buscar histórico de curtidas do usuário
   ↓
2. Extrair categorias mais curtidas
   ↓
3. Buscar artigos nessas categorias (mais curtidos/populares)
   ↓
4. Filtrar artigos já curtidos/vistos
   ↓
5. Ordenar por relevância (score)
   ↓
6. Retornar top N recomendações
```

---

## 🧩 Componentes Necessários

### 1. `LikeButton.jsx`

Componente para curtir/descurtir artigos.

**Props**:
- `contentId`: string
- `initialLiked`: boolean
- `initialCount`: number
- `onLike`: function (callback)

**Estado**:
- `isLiked`: boolean
- `likesCount`: number
- `loading`: boolean

**Funcionalidades**:
- Toggle de curtida
- Animação de feedback
- Loading state
- Tratamento de erro

### 2. `CommentsSection.jsx`

Seção completa de comentários.

**Props**:
- `contentId`: string
- `maxComments`: number (default: 10)

**Estado**:
- `comments`: array
- `loading`: boolean
- `sortBy`: 'recent' | 'popular'
- `showMore`: boolean

**Funcionalidades**:
- Listar comentários
- Paginação
- Ordenação
- Formulário de novo comentário
- Edição/deleção de comentários próprios

### 3. `Comment.jsx`

Componente individual de comentário.

**Props**:
- `comment`: object
- `currentUserId`: string
- `onEdit`: function
- `onDelete`: function
- `onLike`: function

**Funcionalidades**:
- Exibir comentário
- Ações (editar, deletar, curtir)
- Indicador de editado
- Formulário de edição inline

### 4. `CommentForm.jsx`

Formulário para criar/editar comentários.

**Props**:
- `onSubmit`: function
- `initialText`: string (para edição)
- `onCancel`: function (para edição)

**Funcionalidades**:
- Textarea com contador de caracteres
- Validação client-side
- Loading state
- Submit on Enter (Ctrl+Enter)

### 5. `RecommendedArticles.jsx`

Seção de artigos recomendados.

**Props**:
- `limit`: number (default: 6)

**Funcionalidades**:
- Buscar recomendações personalizadas
- Exibir grid de artigos
- Loading state
- Fallback para artigos populares

### 6. `UserPreferences.jsx` (Hook/Context)

Gerenciar preferências do usuário (categorias, etc).

**Estado**:
- `preferredCategories`: array
- `likedArticles`: array
- `commentedArticles`: array

---

## 🔧 Serviços e API

### 1. `likeService.js`

```javascript
// src/services/likeService.js

export async function toggleLike(contentId, userId)
export async function getLikesCount(contentId)
export async function hasUserLiked(contentId, userId)
export async function getUserLikes(userId, limit = 50)
export async function getMostLikedArticles(category, limit = 10)
```

**Funções**:
- `toggleLike`: Cria/deleta curtida e atualiza contador
- `getLikesCount`: Retorna contagem (usa cache do content/)
- `hasUserLiked`: Verifica se usuário curtiu
- `getUserLikes`: Lista artigos curtidos pelo usuário
- `getMostLikedArticles`: Artigos mais curtidos por categoria

### 2. `commentService.js`

```javascript
// src/services/commentService.js

export async function createComment(contentId, userId, text, userData)
export async function updateComment(commentId, text)
export async function deleteComment(commentId)
export async function getComments(contentId, options = {})
export async function likeComment(commentId, userId)
export async function getCommentLikes(commentId)
```

**Funções**:
- `createComment`: Cria comentário e atualiza contador
- `updateComment`: Edita comentário (dentro de 1h)
- `deleteComment`: Soft delete do comentário
- `getComments`: Lista comentários com paginação/ordenação
- `likeComment`: Curte comentário
- `getCommentLikes`: Contagem de curtidas no comentário

### 3. `recommendationService.js`

```javascript
// src/services/recommendationService.js

export async function getRecommendedArticles(userId, limit = 6)
export async function getUserPreferences(userId)
export async function updateUserPreferences(userId, preferences)
export async function calculateRelevanceScore(article, userPreferences)
```

**Algoritmo de Recomendação**:

1. **Análise de Preferências**:
   - Categorias mais curtidas pelo usuário
   - Frequência de interação
   - Tempo desde última interação

2. **Score de Relevância**:
   ```
   score = (
     categoryMatch * 0.4 +        // Usuário curte essa categoria
     popularityScore * 0.3 +      // Artigo popular
     recencyScore * 0.2 +         // Artigo recente
     similarityScore * 0.1        // Similar a artigos curtidos
   )
   ```

3. **Filtros**:
   - Remover artigos já curtidos
   - Remover artigos já visualizados (opcional)
   - Limitar por categoria

---

## 📊 Sistema de Recomendação

### Estratégias de Recomendação

#### 1. Baseada em Conteúdo (Content-Based)
- **Categorias**: Usuário curte "Artigos", recomendar mais "Artigos"
- **Tags**: (futuro) Analisar palavras-chave dos artigos curtidos

#### 2. Baseada em Popularidade
- Artigos mais curtidos
- Artigos mais comentados
- Artigos mais recentes (trending)

#### 3. Colaborativa (Futuro)
- "Usuários que curtiram isso também curtiram..."
- Requer mais dados

### Estrutura de Preferências do Usuário

```javascript
users/{userId}/preferences
├── categories: {
│     "Artigos": { likes: 5, comments: 2, lastInteraction: timestamp },
│     "Crônicas": { likes: 3, comments: 1, lastInteraction: timestamp }
│   }
├── totalLikes: number
├── totalComments: number
├── preferredCategory: string        // Categoria mais interagida
├── updatedAt: timestamp
└── lastRecommendationUpdate: timestamp
```

**Atualização**: Atualizar preferências sempre que:
- Usuário curte um artigo
- Usuário comenta em um artigo
- Usuário visualiza um artigo (opcional)

---

## 🔄 Impacto no Código Existente

### Arquivos a Modificar

#### 1. `src/pages/ArticleDetail.jsx`
- Adicionar `LikeButton`
- Adicionar `CommentsSection`
- Buscar contadores de likes/comentários
- Exibir seção de recomendações

#### 2. `src/pages/Articles.jsx` e `Chronicles.jsx`
- Mostrar contagem de curtidas em cada card
- Mostrar contagem de comentários
- Ordenar por popularidade (opção)

#### 3. `src/pages/Home.jsx`
- Adicionar seção "Para Você" (se usuário logado)
- Mostrar artigos mais populares
- Mostrar artigos mais curtidos

#### 4. `firestore.rules`
- Adicionar regras para `likes`, `comments`, `comment_likes`
- Atualizar regras de `content` para permitir atualização de contadores

#### 5. `firestore.indexes.json`
- Adicionar índices compostos:
  - `likes`: `contentId` + `createdAt`
  - `comments`: `contentId` + `createdAt`
  - `comments`: `contentId` + `likesCount`
  - `comment_likes`: `commentId` + `userId`

#### 6. `src/lib/validators.js`
- Adicionar `validateComment(data)`
- Adicionar `normalizeComment(data)`

#### 7. `src/services/auditService.js`
- Adicionar ações: `COMMENT_CREATED`, `COMMENT_DELETED`, `LIKE_CREATED`, `LIKE_REMOVED`

### Novos Arquivos

- `src/components/features/comments/` (pasta)
  - `CommentsSection.jsx`
  - `Comment.jsx`
  - `CommentForm.jsx`
- `src/components/features/likes/`
  - `LikeButton.jsx`
- `src/services/likeService.js`
- `src/services/commentService.js`
- `src/services/recommendationService.js`
- `src/hooks/useRecommendations.js` (custom hook)
- `src/hooks/useUserPreferences.js` (custom hook)

---

## ⚡ Considerações de Performance

### 1. Contadores Agregados

**Problema**: Contar likes/comentários em tempo real pode ser custoso.

**Solução**: Manter contadores no documento `content/`:
- Atualizar via **Cloud Functions** (recomendado)
- Ou atualizar diretamente via cliente (menos seguro, mas funcional)

### 2. Queries Otimizadas

- Usar índices compostos
- Limitar resultados com `limit()`
- Paginar comentários (10-20 por página)

### 3. Cache de Preferências

- Armazenar preferências em `localStorage` (opcional)
- Atualizar preferências em batch (não a cada interação)
- Cache de recomendações (atualizar a cada X minutos)

### 4. Otimização de Leitura

- Usar `getDocs` com `limit()` para comentários
- Buscar apenas likes do usuário atual (não todos)
- Usar `onSnapshot` apenas quando necessário (real-time)

### 5. Otimização de Escrita

- Batch writes para atualizar múltiplos documentos
- Transações para garantir consistência de contadores

---

## 📅 Plano de Implementação

### Fase 1: Sistema de Curtidas (1-2 semanas)

1. **Backend**:
   - [ ] Criar estrutura `likes/` no Firestore
   - [ ] Adicionar regras de segurança
   - [ ] Criar índices necessários
   - [ ] Implementar `likeService.js`
   - [ ] Adicionar `likesCount` ao `content/`

2. **Frontend**:
   - [ ] Criar componente `LikeButton.jsx`
   - [ ] Integrar em `ArticleDetail.jsx`
   - [ ] Mostrar contagem em cards de artigos
   - [ ] Testes unitários

3. **Validação**:
   - [ ] Testar criação/deleção de curtidas
   - [ ] Validar contadores atualizados
   - [ ] Validar regras de segurança

### Fase 2: Sistema de Comentários (2-3 semanas)

1. **Backend**:
   - [ ] Criar estrutura `comments/` no Firestore
   - [ ] Criar estrutura `comment_likes/` no Firestore
   - [ ] Adicionar regras de segurança
   - [ ] Criar índices necessários
   - [ ] Implementar `commentService.js`
   - [ ] Adicionar `commentsCount` ao `content/`

2. **Frontend**:
   - [ ] Criar `CommentsSection.jsx`
   - [ ] Criar `Comment.jsx`
   - [ ] Criar `CommentForm.jsx`
   - [ ] Integrar em `ArticleDetail.jsx`
   - [ ] Implementar paginação
   - [ ] Implementar ordenação
   - [ ] Testes unitários

3. **Validação**:
   - [ ] Testar CRUD de comentários
   - [ ] Validar edição (dentro de 1h)
   - [ ] Validar moderação (admins)

### Fase 3: Sistema de Recomendações (2-3 semanas)

1. **Backend**:
   - [ ] Criar estrutura de preferências em `users/`
   - [ ] Implementar `recommendationService.js`
   - [ ] Implementar algoritmo de score
   - [ ] Criar hook `useRecommendations.js`

2. **Frontend**:
   - [ ] Criar `RecommendedArticles.jsx`
   - [ ] Adicionar página/seção "Para Você"
   - [ ] Integrar em `Home.jsx`
   - [ ] Mostrar recomendações em `ArticleDetail.jsx`
   - [ ] Testes unitários

3. **Validação**:
   - [ ] Validar precisão das recomendações
   - [ ] Validar performance de queries
   - [ ] A/B testing (opcional)

### Fase 4: Melhorias e Otimizações (1-2 semanas)

1. **Performance**:
   - [ ] Implementar Cloud Functions para contadores
   - [ ] Cache de preferências
   - [ ] Otimizar queries

2. **UX**:
   - [ ] Notificações de novas respostas (futuro)
   - [ ] Markdown em comentários (opcional)
   - [ ] Emojis em comentários (opcional)

3. **Analytics**:
   - [ ] Tracking de interações
   - [ ] Dashboard de métricas (admins)

---

## 📈 Métricas e Analytics

### Métricas a Coletar

#### Engajamento
- Taxa de curtidas por artigo
- Taxa de comentários por artigo
- Tempo médio de leitura
- Taxa de cliques em recomendações

#### Recomendações
- Taxa de cliques em recomendações
- Taxa de conversão (curtida após recomendação)
- Precisão das recomendações (feedback implícito)

#### Usuários
- Categorias mais populares
- Artigos mais populares
- Usuários mais engajados

### Estrutura de Analytics (Futuro)

```javascript
analytics/{eventId}
├── type: 'like' | 'comment' | 'view' | 'recommendation_click'
├── userId: string
├── contentId: string
├── metadata: object
├── timestamp: timestamp
└── userAgent: string
```

---

## 🎓 Pontos de Atenção

### Segurança
1. ✅ Validar sempre server-side (Firestore Rules)
2. ✅ Limitar tamanho de comentários (2000 chars)
3. ✅ Rate limiting (prevenir spam)
4. ✅ Sanitização de texto (prevenir XSS)
5. ✅ Moderação de conteúdo (admins)

### Escalabilidade
1. ⚠️ Contadores agregados (evitar count queries)
2. ⚠️ Paginação obrigatória para comentários
3. ⚠️ Índices bem definidos
4. ⚠️ Cloud Functions para operações pesadas

### UX
1. ✅ Feedback visual imediato
2. ✅ Loading states
3. ✅ Tratamento de erros claro
4. ✅ Optimistic updates (opcional)
5. ✅ Notificações (futuro)

---

## 🚀 Próximos Passos

1. **Revisar** este documento com a equipe
2. **Validar** requisitos de negócio
3. **Priorizar** funcionalidades (MVP vs completo)
4. **Criar** tickets/issues no projeto
5. **Iniciar** Fase 1 (Sistema de Curtidas)

---

## 📚 Referências

- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Content-Based Filtering](https://en.wikipedia.org/wiki/Content-based_filtering)
- [Collaborative Filtering](https://en.wikipedia.org/wiki/Collaborative_filtering)

---

**Documento criado em**: {{ data atual }}
**Versão**: 1.0
**Status**: 📝 Rascunho para Revisão
