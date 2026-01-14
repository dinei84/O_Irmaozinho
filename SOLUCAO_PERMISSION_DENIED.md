# ✅ Solução: Permission Denied

## Problema Resolvido

O erro "Permission denied" ao executar `npm run dev` foi causado por **permissões de execução** nos binários do `node_modules`.

## ✅ Correções Aplicadas

1. **Permissões corrigidas:**
   ```bash
   chmod +x node_modules/.bin/*
   ```

2. **Arquivo .env criado:**
   - Template criado na raiz do projeto
   - **IMPORTANTE:** Configure com suas credenciais do Firebase

## 📋 Próximos Passos

### 1. Configurar o arquivo .env

Edite o arquivo `.env` na raiz do projeto e adicione suas credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
VITE_APP_ENV=development
```

**Como obter as credenciais:**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Role até **"Seus apps"** e copie as credenciais

### 2. Deploy das Regras do Firestore

As regras do Firestore precisam ser deployadas para funcionar:

```bash
# Se ainda não tiver o Firebase CLI instalado
npm install -g firebase-tools

# Fazer login
firebase login

# Deploy das regras
firebase deploy --only firestore:rules
```

### 3. Executar a aplicação

```bash
npm run dev
```

A aplicação deve iniciar em `http://localhost:5173`

## ⚠️ Se ainda houver problemas

### Erro: "Variáveis de ambiente do Firebase não configuradas"

- Verifique se o arquivo `.env` existe na raiz
- Verifique se todas as variáveis estão preenchidas
- Reinicie o servidor após criar/editar o `.env`

### Erro: "permission-denied" no Firestore

1. **Verifique se as regras foram deployadas:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Verifique se você está autenticado:**
   - Faça login na aplicação
   - Se for admin, verifique se o Custom Claim está configurado

3. **Para tornar um usuário admin:**
   ```bash
   npm run admin:set <uid-do-usuario>
   ```
   - Depois, o usuário precisa fazer **logout e login novamente**

### Erro: "Permission denied" ao executar npm

Se o problema voltar, execute:

```bash
chmod +x node_modules/.bin/*
```

Ou reinstale as dependências:

```bash
rm -rf node_modules package-lock.json
npm install
```

## ✅ Checklist Final

- [x] Permissões dos binários corrigidas
- [ ] Arquivo `.env` configurado com credenciais do Firebase
- [ ] Regras do Firestore deployadas
- [ ] Aplicação rodando (`npm run dev`)
- [ ] Usuário admin configurado (se necessário)

---

**Agora você pode executar `npm run dev` sem problemas!** 🚀

