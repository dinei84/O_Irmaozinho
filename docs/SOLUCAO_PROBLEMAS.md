# Solução de Problemas - O Irmãozinho

## 🚨 Problemas Comuns e Soluções

### 1. Erro: "firebase.auth is not a function"

**Sintomas:**
- Console mostra erro ao carregar páginas
- Firebase não inicializa corretamente

**Soluções:**
1. **Teste simples**: Abra `test-simple.html` primeiro
2. **Verifique a ordem dos scripts**: Firebase deve carregar antes dos outros
3. **Aguarde o carregamento**: Pode levar alguns segundos

### 2. Erro: "Missing or insufficient permissions"

**Sintomas:**
- Páginas ficam carregando infinitamente
- Erro de permissão no console

**Soluções:**

#### Passo 1: Configure as Regras Corretas
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Projeto: `admoirmaozinho`
3. **Firestore Database** > **Rules**
4. **DELETE todas as regras existentes**
5. Cole estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /content/{document} {
      allow read: if resource.data.status == "publicado";
      allow write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. Clique **Publish**
7. **Aguarde 2-3 minutos** para propagação

#### Passo 2: Teste as Regras
1. Abra `test-simple.html`
2. Clique "Testar Firestore"
3. Se der erro, tente regras mais permissivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Páginas Ficam Carregando

**Sintomas:**
- Loading spinner infinito
- Nenhum conteúdo aparece

**Soluções:**
1. **Verifique o console** para erros
2. **Teste com `test-simple.html`** primeiro
3. **Verifique as regras** do Firestore
4. **Aguarde a propagação** das regras (até 5 minutos)

### 4. Dashboard Não Funciona

**Sintomas:**
- Login não funciona
- Erro de autenticação

**Soluções:**
1. **Crie usuários** no Firebase Console:
   - Authentication > Users > Add User
2. **Teste login** com `test-firebase.html`
3. **Verifique credenciais** no console

## 🧪 Arquivos de Teste

### `test-simple.html`
- Teste básico do Firebase
- Verifica inicialização
- Testa conexão com Firestore

### `test-firebase.html`
- Teste completo de autenticação
- Teste de escrita no Firestore
- Para verificar login

### `test-public-access.html`
- Teste de leitura pública
- Verifica regras do Firestore
- Para páginas públicas

## 📋 Checklist de Verificação

### ✅ Firebase Configurado
- [ ] Projeto criado no Firebase Console
- [ ] Firestore habilitado
- [ ] Regras configuradas e publicadas
- [ ] Usuários criados (para dashboard)

### ✅ Código Funcionando
- [ ] `test-simple.html` funciona
- [ ] `test-firebase.html` funciona
- [ ] `test-public-access.html` funciona
- [ ] Páginas públicas carregam
- [ ] Dashboard funciona

### ✅ Regras do Firestore
- [ ] Leitura pública para `status == "publicado"`
- [ ] Escrita apenas para usuários autenticados
- [ ] Rascunhos não visíveis publicamente
- [ ] Outras coleções bloqueadas

## 🔧 Comandos de Debug

### No Console do Navegador:
```javascript
// Verificar Firebase
console.log(typeof firebase);
console.log(firebase.apps);

// Verificar configuração
console.log(window.firebaseConfig);

// Testar conexão
firebase.firestore().collection('content').limit(1).get()
  .then(snapshot => console.log('Sucesso:', snapshot.size))
  .catch(error => console.error('Erro:', error));
```

## 📞 Suporte

Se ainda houver problemas:

1. **Verifique o console** do navegador
2. **Teste com arquivos simples** primeiro
3. **Aguarde propagação** das regras
4. **Verifique conexão** com internet
5. **Limpe cache** do navegador

## 🚀 Ordem de Teste Recomendada

1. `test-simple.html` - Verificar Firebase
2. `test-public-access.html` - Verificar regras
3. `pages/artigos.html` - Testar página pública
4. `test-firebase.html` - Testar autenticação
5. `pages/dashboard.html` - Testar dashboard
