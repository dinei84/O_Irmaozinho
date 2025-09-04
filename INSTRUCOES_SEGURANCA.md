# 🔒 Instruções de Segurança - O Irmãozinho

## ⚠️ IMPORTANTE: Configure a Segurança Agora!

### 1. Crie o arquivo `.env` com suas chaves reais:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyAvBppTLTDs8qALcOjSmQgZU_KoPODp1I0
FIREBASE_AUTH_DOMAIN=admoirmaozinho.firebaseapp.com
FIREBASE_PROJECT_ID=admoirmaozinho
FIREBASE_STORAGE_BUCKET=admoirmaozinho.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=79331048689
FIREBASE_APP_ID=1:79331048689:web:02506c8ddbdd3369f97d50
FIREBASE_MEASUREMENT_ID=G-4NF3N0878T

# Admin Credentials (opcional)
ADMIN_EMAIL=seu@email.com
ADMIN_PASSWORD=sua_senha_segura

# Environment
NODE_ENV=development
```

### 2. Execute o setup:

```bash
# Windows
setup.bat

# Ou manualmente:
npm install
npm run build
```

### 3. Verifique se funcionou:

```bash
npm run dev
```

## 🛡️ O que foi implementado:

### ✅ **Proteção de Chaves**
- Chaves do Firebase movidas para `.env`
- Arquivo `.env` adicionado ao `.gitignore`
- Configuração gerada automaticamente

### ✅ **Scripts de Build**
- `npm run build` - Gera firebase-config.js
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run setup` - Setup completo

### ✅ **Arquivos de Segurança**
- `.gitignore` - Protege arquivos sensíveis
- `SECURITY.md` - Guia de segurança
- `setup.bat/setup.sh` - Setup automático

## 🚨 Próximos Passos:

1. **Crie o arquivo `.env`** com suas chaves reais
2. **Execute `npm run build`** para gerar a configuração
3. **Teste o site** com `npm run dev`
4. **Commit apenas os arquivos seguros** (não o `.env`)

## 📋 Arquivos que NÃO devem ser enviados:

- ❌ `.env` - Suas chaves reais
- ❌ `node_modules/` - Dependências
- ❌ `js/firebase-config.js` - Configuração gerada

## 📋 Arquivos que DEVEM ser enviados:

- ✅ `firebase-config.example.js` - Exemplo de configuração
- ✅ `package.json` - Dependências
- ✅ `scripts/` - Scripts de build
- ✅ `.gitignore` - Proteção de arquivos
- ✅ `SECURITY.md` - Documentação de segurança

## 🔧 Comandos Úteis:

```bash
# Instalar dependências
npm install

# Gerar configuração do Firebase
npm run build

# Iniciar servidor de desenvolvimento
npm run dev

# Setup completo
npm run setup
```

## ⚠️ Lembrete:

**NUNCA** commite o arquivo `.env` com suas chaves reais!
O arquivo `.gitignore` já está configurado para proteger isso.
