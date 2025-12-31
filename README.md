# O Irmãozinho

Plataforma web para compartilhamento de conteúdo cristão com e-commerce integrado.

## 📋 Índice

- [Características](#características)
- [Stack Tecnológica](#stack-tecnológica)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Segurança](#segurança)
- [Testes](#testes)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)

## ✨ Características

- 📖 Publicação de artigos e crônicas
- 🛍️ Loja de produtos
- 👥 Sistema de roles (Admin/Usuário)
- 🔒 Segurança com Firestore Rules
- 📊 Sistema de auditoria
- ✅ Validação de dados robusta
- 🧪 Testes unitários

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** - Biblioteca UI
- **React Router DOM** - Roteamento
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Vitest** - Testes unitários

### Backend
- **Firebase Authentication** - Autenticação
- **Cloud Firestore** - Banco de dados NoSQL
- **Firebase Hosting** - Hospedagem

## 📦 Requisitos

- Node.js 18+ 
- npm ou yarn
- Conta Firebase configurada

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/O_Irmaozinho.git
cd O_Irmaozinho
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (veja [Configuração](#configuração))

4. Execute em modo de desenvolvimento:
```bash
npm run dev
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
VITE_APP_ENV=development
```

**Como obter essas credenciais:**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em Configurações do Projeto (ícone de engrenagem)
4. Role até "Seus apps" e copie as credenciais

### 2. Configuração do Firestore

#### Deploy das Regras

```bash
# Instale o Firebase CLI se ainda não tiver
npm install -g firebase-tools

# Faça login
firebase login

# Inicialize o projeto (se for a primeira vez)
firebase init

# Deploy das regras
firebase deploy --only firestore:rules
```

#### Configurar Custom Claims (Admin)

Para definir um usuário como admin, use o script fornecido:

**1. Obter Service Account Key**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Na aba **"Contas de serviço"**, clique em **"Gerar nova chave privada"**
5. Salve o arquivo JSON como `serviceAccountKey.json` na **raiz do projeto**
6. ⚠️ **IMPORTANTE**: Este arquivo está no `.gitignore` e **NÃO deve ser commitado**!

**2. Instalar dependências (se necessário)**

```bash
npm install
```

**3. Executar o script**

```bash
# Via npm script (recomendado)
npm run admin:set <uid>

# Ou diretamente
node scripts/setAdminRole.js <uid>
```

**Onde obter o UID:**
1. Acesse Firebase Console > Authentication > Users
2. Encontre o usuário desejado
3. Copie o UID

**Exemplo:**
```bash
npm run admin:set abc123def456ghi789
```

**⚠️ Importante:** Após configurar, o usuário precisa fazer **logout e login novamente** para que o token JWT seja atualizado.

Para mais detalhes, consulte [scripts/README.md](./scripts/README.md).

### 3. Estrutura do Firestore

O projeto espera as seguintes coleções:

```
firestore/
├── content/          # Artigos e crônicas
├── products/         # Produtos da loja
├── orders/           # Pedidos (futuro)
├── audit_logs/       # Logs de auditoria
├── admins/           # Lista de admins (opcional)
└── users/            # Perfis de usuários (opcional)
```

## 📁 Estrutura do Projeto

```
O_Irmaozinho/
├── 📚 docs/                    # Documentação completa
│   ├── SETUP.md               # Guia de setup
│   ├── TESTING_GUIDE.md       # Guia de testes
│   ├── TROUBLESHOOTING.md     # Solução de problemas
│   └── ...                    # Outros documentos
│
├── 🛠️ scripts/                 # Scripts utilitários
│   ├── setAdminRole.js        # Script para configurar admin
│   └── README.md
│
├── 📂 src/
│   ├── components/            # Componentes React
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── layout/           # Layout (Header, Footer)
│   │   ├── ui/               # Componentes UI reutilizáveis
│   │   └── features/         # Componentes de features
│   │       └── cart/         # Componentes do carrinho
│   ├── contexts/             # Context API (Auth, Cart)
│   ├── hooks/                # Custom hooks (futuro)
│   ├── lib/                  # Bibliotecas e utilitários
│   │   ├── firebase.js       # Configuração Firebase
│   │   ├── validators.js     # Validações
│   │   ├── roles.js          # Sistema de roles
│   │   └── __tests__/        # Testes unitários
│   ├── pages/                # Páginas da aplicação
│   │   └── admin/            # Páginas administrativas
│   ├── services/             # Serviços (API, auditoria)
│   └── test/                 # Configuração de testes
│
├── 🔥 Firebase/
│   ├── firestore.rules       # Regras de segurança
│   ├── firestore.indexes.json # Índices do Firestore
│   └── firebase.json         # Configuração Firebase
│
└── ⚙️ Configuração/
    ├── vite.config.js
    ├── vitest.config.js
    └── tailwind.config.js
```

Para mais detalhes sobre a estrutura, veja a [documentação completa](./docs/README.md).

## 🔒 Segurança

### Regras do Firestore

As regras implementadas garantem:

- ✅ Apenas admins podem criar/editar/deletar conteúdo
- ✅ Qualquer pessoa pode ler conteúdo público
- ✅ Validação de estrutura de dados
- ✅ Limites de tamanho de campos
- ✅ Logs de auditoria protegidos

### Roles

O sistema suporta dois tipos de usuários:

- **Admin**: Acesso completo ao painel administrativo
- **User**: Usuário comum (padrão)

### Validação de Dados

Todas as operações são validadas:
- **Client-side**: Para melhor UX
- **Server-side**: Via Firestore Rules (última linha de defesa)

## 🧪 Testes

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm test -- --watch

# Executar com UI
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

### Estrutura de Testes

```
src/
└── lib/
    └── __tests__/
        ├── validators.test.js
        └── roles.test.js
```

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

### Deploy no Firebase Hosting

```bash
# Deploy completo (hosting + regras)
firebase deploy

# Apenas hosting
firebase deploy --only hosting

# Apenas regras
firebase deploy --only firestore:rules
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas, abra uma [issue](../../issues) no GitHub.

---

Desenvolvido com ❤️ para a comunidade cristã

