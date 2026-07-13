# 🚀 Guia de Deploy na Vercel

Este guia explica como configurar as variáveis de ambiente na Vercel para que a aplicação funcione corretamente em produção.

## ❌ Problema Comum

**Erro em produção:**
```
Uncaught Error: Variáveis de ambiente do Firebase não configuradas: 
apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
```

**Causa:** As variáveis de ambiente não estão configuradas na Vercel.

## ✅ Solução: Configurar Variáveis na Vercel

### Passo 1: Acessar Configurações do Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Selecione seu projeto (`O_Irmaozinho` ou o nome que você deu)
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)

### Passo 2: Adicionar Variáveis de Ambiente

Adicione **TODAS** as seguintes variáveis:

| Nome da Variável | Descrição | Exemplo |
|-----------------|-----------|---------|
| `VITE_FIREBASE_API_KEY` | Chave da API do Firebase | `AIzaSyAvBppTLTDs8qALcOjSmQgZU_KoPODp1I0` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação | `admoirmaozinho.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto | `admoirmaozinho` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de armazenamento | `admoirmaozinho.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID do remetente de mensagens | `79331048689` |
| `VITE_FIREBASE_APP_ID` | ID do app | `1:79331048689:web:02506c8ddbdd3369f97d50` |
| `VITE_FIREBASE_MEASUREMENT_ID` | ID de medição (opcional) | `G-4NF3N0878T` |

#### Como adicionar cada variável:

1. Clique em **Add New** (Adicionar Nova)
2. **Key (Chave):** Cole o nome da variável (ex: `VITE_FIREBASE_API_KEY`)
3. **Value (Valor):** Cole o valor correspondente
4. **Environments:** Selecione:
   - ✅ **Production** (Produção)
   - ✅ **Preview** (Visualização)
   - ✅ **Development** (Desenvolvimento) - opcional

### Passo 3: Onde Encontrar os Valores

**Opção 1: Do seu arquivo `.env` local**
- Abra o arquivo `.env` na raiz do projeto
- Copie os valores de cada variável

**Opção 2: Do Firebase Console**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Role até **"Seus apps"** > **Web app**
5. Copie os valores do objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // → VITE_FIREBASE_API_KEY
  authDomain: "...",              // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "...",               // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "...",           // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...",       // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "...",                   // → VITE_FIREBASE_APP_ID
  measurementId: "G-..."          // → VITE_FIREBASE_MEASUREMENT_ID (opcional)
};
```

### Passo 4: Fazer Redeploy

⚠️ **IMPORTANTE:** Após adicionar as variáveis, você precisa fazer um **novo deploy**:

**Opção A: Via Git (Recomendado)**
```bash
# Faça um commit vazio para forçar redeploy
git commit --allow-empty -m "Redeploy para aplicar variáveis de ambiente"
git push
```

**Opção B: Via Painel da Vercel**
1. Vá na aba **Deployments**
2. Clique nos **três pontos** (...) do último deploy
3. Selecione **Redeploy**

### Passo 5: Verificar se Funcionou

1. Acesse seu site: `https://o-irmaozinho.vercel.app`
2. Abra o Console do navegador (F12)
3. Verifique se **NÃO** há o erro de variáveis de ambiente
4. Teste funcionalidades básicas (login, navegação)

## 🔍 Troubleshooting

### Erro persiste após configurar variáveis

**Solução 1: Verificar se o prefixo `VITE_` está correto**
- No Vite, **TODAS** as variáveis devem começar com `VITE_`
- Se você colocou `FIREBASE_API_KEY`, deve ser `VITE_FIREBASE_API_KEY`

**Solução 2: Verificar se fez redeploy**
- Variáveis de ambiente só são aplicadas em **novos deploys**
- Faça um commit e push, ou use "Redeploy" no painel

**Solução 3: Verificar se todas as variáveis foram adicionadas**
- Certifique-se de que **TODAS** as 7 variáveis foram configuradas
- Não pode faltar nenhuma!

**Solução 4: Verificar valores copiados**
- Certifique-se de que não há espaços extras antes/depois dos valores
- Não coloque aspas nos valores (a Vercel já trata isso)

### Variáveis aparecem mas ainda não funcionam

**Verificar logs de build:**
1. Vá em **Deployments** na Vercel
2. Clique no último deploy
3. Veja os **Build Logs**
4. Procure por erros relacionados a variáveis de ambiente

## 📝 Checklist

Antes de considerar o problema resolvido:

- [ ] Todas as 7 variáveis foram adicionadas na Vercel
- [ ] Todas começam com `VITE_`
- [ ] Valores foram copiados corretamente (sem espaços extras)
- [ ] Foi feito um novo deploy após adicionar as variáveis
- [ ] Não há erros no console do navegador
- [ ] A aplicação carrega sem erros
- [ ] Firebase conecta corretamente

## 🎓 Entendendo o Problema

**Por que funciona em desenvolvimento mas não em produção?**

1. **Desenvolvimento local:**
   - O Vite lê o arquivo `.env` da sua máquina
   - As variáveis estão disponíveis via `import.meta.env.VITE_*`

2. **Produção (Vercel):**
   - O arquivo `.env` **não é enviado** para o Git (está no `.gitignore`)
   - A Vercel precisa que você configure as variáveis no painel dela
   - Cada plataforma de deploy tem sua forma de configurar variáveis

**Por que o prefixo `VITE_`?**

- Por segurança, o Vite só expõe variáveis que começam com `VITE_`
- Isso evita vazar variáveis sensíveis acidentalmente
- Variáveis sem `VITE_` não ficam disponíveis no frontend

## 📚 Referências

- [Documentação da Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentação do Vite - Env Variables](https://vitejs.dev/guide/env-and-mode.html)

