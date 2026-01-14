# 📚 Guia de Setup Completo

Este documento guia você através de todo o processo de configuração da aplicação.

## ✅ O que foi implementado

### 1. Segurança
- ✅ Regras do Firestore com validação server-side
- ✅ Sistema de roles (Admin/User) via Custom Claims
- ✅ Proteção de rotas administrativas
- ✅ Validação de dados (client + server)

### 2. Estrutura
- ✅ Variáveis de ambiente configuráveis
- ✅ Camada de validação centralizada
- ✅ Sistema de auditoria
- ✅ Estrutura de testes configurada

### 3. Qualidade
- ✅ Testes unitários para validators e roles
- ✅ Validação robusta de dados
- ✅ Tratamento de erros melhorado
- ✅ Documentação completa

## 🚀 Passo a Passo de Configuração

### Passo 1: Instalar Dependências

```bash
npm install
```

Isso instalará todas as dependências, incluindo as novas para testes:
- `vitest` - Framework de testes
- `@testing-library/react` - Testes de componentes
- `@testing-library/jest-dom` - Matchers adicionais

### Passo 2: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
VITE_FIREBASE_API_KEY=AIzaSyAvBppTLTDs8qALcOjSmQgZU_KoPODp1I0
VITE_FIREBASE_AUTH_DOMAIN=admoirmaozinho.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=admoirmaozinho
VITE_FIREBASE_STORAGE_BUCKET=admoirmaozinho.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=79331048689
VITE_FIREBASE_APP_ID=1:79331048689:web:02506c8ddbdd3369f97d50
VITE_FIREBASE_MEASUREMENT_ID=G-4NF3N0878T
VITE_APP_ENV=development
```

⚠️ **Importante**: Em produção, NUNCA commite o arquivo `.env`. Ele já está no `.gitignore`.

### Passo 3: Configurar Firebase

#### 3.1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

#### 3.2. Login no Firebase

```bash
firebase login
```

#### 3.3. Deploy das Regras do Firestore

```bash
firebase deploy --only firestore:rules
```

Isso irá aplicar as regras de segurança definidas em `firestore.rules`.

### Passo 4: Configurar Custom Claims (Admin Role)

Você precisa definir um usuário como admin. Existem duas formas:

#### Opção A: Via Console do Firebase (Temporário)

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em Authentication > Users
3. Copie o UID do usuário que deseja tornar admin
4. Vá em Cloud Functions e crie uma função (ou use um script Node.js)

#### Opção B: Script fornecido (Recomendado)

Use o script fornecido no projeto:

1. **Obter Service Account Key:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Vá em Configurações do Projeto > Contas de serviço
   - Clique em "Gerar nova chave privada"
   - Salve como `serviceAccountKey.json` na raiz do projeto

2. **Instalar dependências (se necessário):**
   ```bash
   npm install
   ```

3. **Executar o script:**
   ```bash
   npm run admin:set <uid>
   ```
   
   Onde `<uid>` é o UID do usuário (encontre em Authentication > Users)

4. **⚠️ Importante:** O usuário precisa fazer **logout e login** novamente!

Para mais detalhes, consulte [scripts/README.md](./scripts/README.md).

### Passo 5: Testar a Configuração

#### 5.1. Executar Testes

```bash
npm test
```

Você deve ver todos os testes passando.

#### 5.2. Executar a Aplicação

```bash
npm run dev
```

#### 5.3. Testar Autenticação

1. Faça login com um usuário comum
2. Tente acessar `/admin` - deve ser redirecionado
3. Faça logout
4. Torne o usuário admin (Passo 4)
5. Faça login novamente
6. Tente acessar `/admin` - deve funcionar!

## 📋 Checklist de Verificação

Antes de considerar tudo configurado, verifique:

- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] Regras do Firestore deployadas (`firebase deploy --only firestore:rules`)
- [ ] Pelo menos um usuário configurado como admin
- [ ] Testes passando (`npm test`)
- [ ] Aplicação rodando sem erros (`npm run dev`)

## 🔍 Estrutura de Arquivos Criados

```
O_Irmaozinho/
├── .env                          # Variáveis de ambiente (não commitado)
├── .gitignore                    # Atualizado
├── firebase.json                 # ✨ NOVO: Config Firebase
├── firestore.rules               # ✨ NOVO: Regras de segurança
├── firestore.indexes.json        # ✨ NOVO: Índices
├── vitest.config.js              # ✨ NOVO: Config testes
├── README.md                     # ✨ NOVO: Documentação
├── SETUP.md                      # ✨ NOVO: Este arquivo
├── package.json                  # ✨ ATUALIZADO: Scripts de teste
└── src/
    ├── lib/
    │   ├── firebase.js           # ✨ ATUALIZADO: Variáveis de ambiente
    │   ├── validators.js         # ✨ NOVO: Validações
    │   ├── roles.js              # ✨ NOVO: Sistema de roles
    │   └── __tests__/            # ✨ NOVO: Testes
    │       ├── validators.test.js
    │       └── roles.test.js
    ├── services/
    │   └── auditService.js       # ✨ NOVO: Auditoria
    ├── contexts/
    │   └── AuthContext.jsx       # ✨ ATUALIZADO: Suporte a roles
    ├── components/
    │   └── auth/
    │       └── ProtectedRoute.jsx # ✨ ATUALIZADO: Verificação de roles
    ├── pages/
    │   └── admin/
    │       └── ArticleEditor.jsx  # ✨ ATUALIZADO: Validação + Auditoria
    └── test/
        └── setup.js              # ✨ NOVO: Setup de testes
```

## 🎓 Entendendo as Mudanças

### 1. Sistema de Roles

**Antes**: Qualquer usuário autenticado podia acessar `/admin`
**Agora**: Apenas usuários com `role: 'admin'` no Custom Claim podem acessar

**Como funciona**:
- Custom Claims são definidos no Firebase Auth (server-side)
- O cliente obtém os claims através do token JWT
- As regras do Firestore verificam os claims automaticamente

### 2. Validação de Dados

**Antes**: Validação apenas visual (HTML5 required)
**Agora**: Validação em duas camadas:
- **Client-side**: Para melhor UX (feedback imediato)
- **Server-side**: Via Firestore Rules (última linha de defesa)

### 3. Auditoria

**Novo**: Todas as ações administrativas são registradas na coleção `audit_logs`:
- Quem fez
- O que fez
- Quando fez
- Em qual recurso

### 4. Testes

**Novo**: Testes unitários garantem que:
- Validações funcionam corretamente
- Sistema de roles funciona como esperado
- Mudanças futuras não quebrem funcionalidades

## 🐛 Solução de Problemas

### Erro: "Variáveis de ambiente do Firebase não configuradas"

**Solução**: Verifique se o arquivo `.env` existe e contém todas as variáveis necessárias.

### Erro: "permission-denied" ao tentar criar artigo

**Causa**: Usuário não é admin ou regras não foram deployadas.

**Solução**: 
1. Verifique se o usuário tem role de admin (veja Passo 4)
2. Deploy das regras: `firebase deploy --only firestore:rules`
3. Faça logout e login novamente

### Testes falhando

**Solução**: 
```bash
# Limpe o cache
rm -rf node_modules/.vite
npm install
npm test
```

### Custom Claims não aparecem após definir

**Solução**: O usuário precisa fazer **logout e login novamente** para obter um novo token com os claims atualizados.

## 📚 Próximos Passos

1. **Migrar outros componentes**: Aplique validação + auditoria nos outros editores (ProductEditor, etc.)
2. **Adicionar mais testes**: Teste componentes React com Testing Library
3. **Cloud Functions**: Migre operações críticas para Cloud Functions
4. **Monitoramento**: Configure alertas para ações suspeitas nos logs

## 🆘 Precisa de Ajuda?

1. Verifique os logs do console do navegador
2. Verifique os logs do Firebase Console
3. Execute os testes para verificar se há problemas
4. Consulte a [documentação do Firebase](https://firebase.google.com/docs)

---

✅ **Setup concluído com sucesso!** Sua aplicação agora está mais segura, escalável e profissional.

