# Índices do Firestore - O Irmãozinho

## 🚨 Problema Resolvido

O erro "The query requires an index" foi resolvido modificando as queries para não precisar de índices compostos.

## 📊 Índices Necessários (Opcional)

Se quiser usar queries mais complexas no futuro, você pode criar estes índices:

### 1. Índice para Artigos Publicados
```
Coleção: content
Campos:
- type (Ascending)
- status (Ascending) 
- timestamp (Descending)
```

### 2. Índice para Crônicas Publicadas
```
Coleção: content
Campos:
- type (Ascending)
- status (Ascending)
- timestamp (Descending)
```

## 🔧 Como Criar Índices

### Opção 1: Automática (Recomendada)
1. Execute uma query que precisa do índice
2. O Firebase mostrará um link no console
3. Clique no link para criar automaticamente

### Opção 2: Manual
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Projeto: `admoirmaozinho`
3. **Firestore Database** > **Indexes**
4. Clique **Create Index**
5. Configure os campos conforme necessário

## 📋 Queries Atuais (Sem Índices)

### Artigos
```javascript
// Busca apenas por tipo (sem orderBy para evitar índices)
db.collection('content')
  .where('type', '==', 'artigo')
  .get()
  .then(snapshot => {
    const artigos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filtra por status no JavaScript
      if (data.status === 'publicado') {
        artigos.push({ id: doc.id, ...data });
      }
    });
    // Ordena por timestamp no JavaScript
    artigos.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  });
```

### Crônicas
```javascript
// Busca apenas por tipo (sem orderBy para evitar índices)
db.collection('content')
  .where('type', '==', 'cronica')
  .get()
  .then(snapshot => {
    const cronicas = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filtra por status no JavaScript
      if (data.status === 'publicado') {
        cronicas.push({ id: doc.id, ...data });
      }
    });
    // Ordena por timestamp no JavaScript
    cronicas.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  });
```

## ✅ Vantagens da Abordagem Atual

- **Sem índices necessários** - funciona imediatamente
- **Menos complexidade** - não precisa configurar índices
- **Flexibilidade** - pode filtrar por qualquer campo no JavaScript
- **Performance adequada** - para pequenas/médias quantidades de dados

## ⚠️ Limitações

- **Performance** - pode ser mais lenta com muitos documentos
- **Custo** - lê todos os documentos do tipo antes de filtrar
- **Escalabilidade** - não ideal para milhares de documentos

## 🚀 Para Produção

Se o site crescer muito, considere:
1. Criar os índices compostos
2. Usar queries mais específicas
3. Implementar paginação
4. Usar cache local
