# 🔒 Guia de Segurança - O Irmãozinho

## ⚠️ Configuração de Segurança

### 1. Configuração Inicial

1. **Crie o arquivo `.env`** na raiz do projeto:
```bash
# Copie o exemplo
cp firebase-config.example.js .env
```

2. **Adicione suas chaves reais** no arquivo `.env`:
```env
FIREBASE_API_KEY=sua_chave_real_aqui
FIREBASE_AUTH_DOMAIN=seu_dominio.firebaseapp.com
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_STORAGE_BUCKET=seu_bucket.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

3. **Gere o arquivo de configuração**:
```bash
npm run build
```

### 2. Arquivos Protegidos

Os seguintes arquivos **NÃO** devem ser enviados para o repositório:
- ✅ `.env` - Variáveis de ambiente
- ✅ `js/firebase-config.js` - Configuração gerada
- ✅ `node_modules/` - Dependências

### 3. Comandos Úteis

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

## 🛡️ Boas Práticas de Segurança

### Firebase Security Rules

Certifique-se de que suas regras do Firestore estão configuradas corretamente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública apenas para conteúdo publicado
    match /content/{document} {
      allow read: if resource.data.status == 'publicado';
      allow write: if request.auth != null;
    }
  }
}
```

### Variáveis de Ambiente

- ✅ **Nunca** commite o arquivo `.env`
- ✅ **Sempre** use o `.env.example` como referência
- ✅ **Rotacione** suas chaves periodicamente
- ✅ **Use** diferentes chaves para desenvolvimento e produção

### Deploy Seguro

Para deploy em produção:

1. Configure as variáveis de ambiente no seu provedor
2. Execute `npm run build` no servidor
3. Verifique se o arquivo `.env` não está no deploy

## 🚨 Troubleshooting

### Erro: "Arquivo .env não encontrado"
```bash
# Crie o arquivo .env
touch .env
# Adicione suas chaves do Firebase
```

### Erro: "Variáveis de ambiente faltando"
Verifique se todas as variáveis estão definidas no `.env`:
- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID

### Erro: "firebase-config.js não encontrado"
```bash
# Gere o arquivo de configuração
npm run build
```

## 📞 Suporte

Se encontrar problemas de segurança:
1. Verifique se o `.env` está configurado corretamente
2. Execute `npm run build` para gerar a configuração
3. Verifique as regras do Firestore no console do Firebase
