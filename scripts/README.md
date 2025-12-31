# Scripts de Administração

Este diretório contém scripts auxiliares para gerenciamento e configuração do projeto.

## 📋 Scripts Disponíveis

### `setAdminRole.js`

Script para configurar role de admin no Firebase Authentication.

#### Pré-requisitos

1. **Firebase Admin SDK Service Account Key**

   Você precisa obter o arquivo `serviceAccountKey.json` do Firebase Console:

   1. Acesse [Firebase Console](https://console.firebase.google.com/)
   2. Selecione seu projeto
   3. Vá em **Configurações do Projeto** (ícone de engrenagem)
   4. Na aba **"Contas de serviço"**, clique em **"Gerar nova chave privada"**
   5. Salve o arquivo JSON como `serviceAccountKey.json` na **raiz do projeto**
   6. ⚠️ **IMPORTANTE**: Este arquivo está no `.gitignore` e **NÃO deve ser commitado**!

#### Uso

```bash
# Via npm script (recomendado)
npm run admin:set <uid>

# Diretamente com Node
node scripts/setAdminRole.js <uid>
```

#### Exemplo

```bash
# Tornar um usuário admin pelo UID
npm run admin:set abc123def456ghi789
```

#### Como obter o UID do usuário

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication > Users**
3. Encontre o usuário desejado
4. Copie o **UID** (coluna mais à esquerda)

#### O que o script faz

1. ✅ Verifica se o `serviceAccountKey.json` existe
2. ✅ Verifica se o usuário existe no Firebase Auth
3. ✅ Verifica se o usuário já é admin (avisa se for)
4. ✅ Define o Custom Claim `role: 'admin'`
5. ✅ Opcionalmente cria registro na coleção `admins` do Firestore
6. ✅ Informa que o usuário precisa fazer logout/login

#### Exemplo de Saída

```
ℹ️  serviceAccountKey.json encontrado
ℹ️  Firebase Admin inicializado
ℹ️  Verificando usuário com UID: abc123def456ghi789
✅ Usuário encontrado: user@example.com
ℹ️  Configurando role de admin...
✅ Role de admin configurada com sucesso!

Detalhes:
  UID: abc123def456ghi789
  Email: user@example.com
  Role anterior: user
  Role nova: admin

⚠️  IMPORTANTE: O usuário precisa fazer LOGOUT e LOGIN novamente para ver as mudanças!
```

#### Troubleshooting

**Erro: "serviceAccountKey.json não encontrado"**

- Verifique se o arquivo existe na raiz do projeto
- Verifique se você seguiu os passos acima para gerar a chave

**Erro: "Usuário não encontrado"**

- Verifique se o UID está correto
- Verifique se o usuário existe no Firebase Authentication

**Erro: "permission-denied" ou erros de permissão**

- Verifique se a service account tem permissões de administrador
- Verifique se você gerou a chave corretamente no Firebase Console

**Usuário não consegue acessar /admin após configurar**

- ⚠️ O usuário precisa fazer **LOGOUT e LOGIN novamente** para que o token JWT seja atualizado com os novos Custom Claims

---

## 🔒 Segurança

⚠️ **ATENÇÃO**: O arquivo `serviceAccountKey.json` contém credenciais sensíveis!

- ✅ Está no `.gitignore` (não será commitado)
- ❌ NUNCA compartilhe este arquivo publicamente
- ❌ NUNCA commite este arquivo no Git
- ✅ Mantenha este arquivo apenas no seu ambiente local
- ✅ Em produção, use variáveis de ambiente ou secret management

---

## 📚 Referências

- [Firebase Admin SDK - Authentication](https://firebase.google.com/docs/admin/setup)
- [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)

