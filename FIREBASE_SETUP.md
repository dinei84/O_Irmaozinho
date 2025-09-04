# Configuração Firebase - O Irmãozinho

Este guia explica como configurar e usar o Firebase Authentication e Firestore no projeto.

## 🔥 Configuração Firebase

### 1. Configuração do Projeto Firebase

O projeto já está configurado com as seguintes credenciais:
- **Project ID**: `admoirmaozinho`
- **Auth Domain**: `admoirmaozinho.firebaseapp.com`

### 2. Estrutura de Arquivos

```
js/
├── firebase-config.js    # Configuração Firebase
├── dashboard.js          # Dashboard com autenticação
└── admin.js             # Admin original (localStorage)

pages/
├── dashboard.html       # Nova página dashboard
└── admin.html          # Admin original

css/
└── dashboard.css       # Estilos do dashboard
```

## 🚀 Como Usar

### 1. Executar o Projeto

O projeto agora usa CDN do Firebase, então funciona diretamente abrindo os arquivos HTML no navegador. Não é necessário servidor HTTP!

**Opção 1 - Abrir diretamente:**
- Abra `pages/dashboard.html` diretamente no navegador
- Ou abra `test-firebase.html` para testar

**Opção 2 - Servidor HTTP (recomendado para desenvolvimento):**
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (se tiver http-server instalado)
npx http-server

# PHP
php -S localhost:8000
```

Acesse: `http://localhost:8000`

### 2. Testar Firebase

1. Acesse `http://localhost:8000/test-firebase.html`
2. Faça login com suas credenciais Firebase
3. Teste a criação de conteúdo

### 3. Dashboard Principal

1. Acesse `http://localhost:8000/pages/dashboard.html`
2. Faça login com suas credenciais Firebase
3. Use o criador de conteúdo

## 👤 Configuração de Usuários

### Criar Usuário no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `admoirmaozinho`
3. Vá em **Authentication** > **Users**
4. Clique em **Add User**
5. Digite email e senha
6. Clique em **Add User**

### Usuários de Teste Sugeridos

```
Email: admin@oirmaozinho.com
Senha: admin123456

Email: editor@oirmaozinho.com
Senha: editor123456
```

## 📊 Estrutura do Firestore

### Coleção: `content`

```javascript
{
  title: "Título do conteúdo",
  body: "Conteúdo completo...",
  excerpt: "Resumo opcional",
  image: "URL da imagem",
  type: "artigo" | "cronica",
  status: "publicado" | "rascunho",
  date: "15/01/2025",
  timestamp: 1705276800000,
  createdAt: Timestamp
}
```

## 🔧 Funcionalidades Implementadas

### ✅ Autenticação
- Login com email/senha
- Logout
- Verificação de estado de autenticação
- Proteção de rotas

### ✅ Dashboard
- Interface moderna e responsiva
- Criador de conteúdo com botões para artigos/crônicas
- Gerenciamento de conteúdos
- Filtros por tipo e status
- Auto-save de rascunhos

### ✅ Integração Firestore
- Salvar conteúdo no Firestore
- Carregar lista de conteúdos
- Editar conteúdos existentes
- Excluir conteúdos
- Filtros e busca

## 🎨 Interface do Dashboard

### Criador de Conteúdo
- Campo de título
- Campo de resumo (opcional)
- Campo de URL da imagem (opcional)
- Área de texto principal
- Botões para publicar como artigo ou crônica
- Botão para salvar rascunho
- Botão para limpar formulário

### Gerenciamento
- Lista de todos os conteúdos
- Filtros por tipo (artigo/crônica)
- Filtros por status (publicado/rascunho)
- Ações de editar e excluir
- Badges visuais para tipo e status

## 🔒 Segurança

### Regras do Firestore (Recomendadas)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados podem acessar
    match /content/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Configuração no Firebase Console

1. Acesse **Firestore Database** > **Rules**
2. Substitua as regras padrão pelas regras acima
3. Clique em **Publish**

## 🚨 Solução de Problemas

### Erro: "Failed to resolve module"
- **SOLUCIONADO**: Agora usamos CDN do Firebase, não há mais problemas de módulos
- O projeto funciona abrindo diretamente os arquivos HTML

### Erro: "Firebase: Error (auth/user-not-found)"
- Verifique se o usuário existe no Firebase Console
- Confirme se o email está correto

### Erro: "Firebase: Error (auth/wrong-password)"
- Verifique se a senha está correta
- Considere resetar a senha no Firebase Console

### Erro: "Firebase: Error (permission-denied)"
- Verifique as regras do Firestore
- Confirme se o usuário está autenticado

## 📱 Responsividade

O dashboard é totalmente responsivo:
- **Mobile**: Layout em coluna única
- **Tablet**: Layout adaptativo
- **Desktop**: Layout em duas colunas

## 🔄 Próximos Passos

1. **Configurar usuários** no Firebase Console
2. **Testar autenticação** com usuários reais
3. **Configurar regras** do Firestore
4. **Integrar com páginas** de artigos e crônicas
5. **Implementar upload** de imagens
6. **Adicionar notificações** push (opcional)

## 📞 Suporte

Para problemas específicos:
1. Verifique o console do navegador para erros
2. Confirme se o Firebase está configurado corretamente
3. Teste com o arquivo `test-firebase.html` primeiro
4. Verifique se o servidor HTTP está rodando

---

**Nota**: Este sistema substitui o sistema de autenticação local anterior, oferecendo maior segurança e escalabilidade.
