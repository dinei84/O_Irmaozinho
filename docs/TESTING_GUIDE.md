# 🧪 Guia de Testes - O Irmãozinho

Este guia ajuda você a testar todas as funcionalidades após a estruturação do backend.

## 🚀 Iniciando a Aplicação

```bash
npm run dev
```

A aplicação deve iniciar em `http://localhost:5173` (ou porta similar).

---

## 📋 Checklist de Testes

### ✅ 1. Testes Básicos (Usuário Não Autenticado)

#### 1.1 Navegação Pública
- [ ] Acessar a Home (`/`)
  - [ ] Página carrega sem erros
  - [ ] Imagens aparecem corretamente
  - [ ] Links de navegação funcionam
  
- [ ] Acessar Artigos (`/artigos`)
  - [ ] Lista de artigos carrega
  - [ ] Não há erros no console
  - [ ] Cards de artigos aparecem
  
- [ ] Acessar Crônicas (`/cronicas`)
  - [ ] Lista de crônicas carrega
  - [ ] Sem erros
  
- [ ] Acessar Loja (`/store`)
  - [ ] Produtos carregam (se houver)
  - [ ] Sem erros
  
- [ ] Acessar Sobre (`/sobre`)
  - [ ] Página carrega normalmente

#### 1.2 Teste de Artigo/Crônica Individual
- [ ] Clicar em um artigo
  - [ ] Página de detalhe carrega
  - [ ] Conteúdo aparece corretamente
  - [ ] Botão "Compartilhar" funciona
  - [ ] Artigos relacionados aparecem (se houver)

#### 1.3 Teste de Proteção de Rotas
- [ ] Tentar acessar `/admin` sem estar logado
  - [ ] Deve redirecionar para `/login`
  
- [ ] Tentar acessar `/admin/new` sem estar logado
  - [ ] Deve redirecionar para `/login`

---

### ✅ 2. Testes de Autenticação

#### 2.1 Login
- [ ] Acessar `/login`
  - [ ] Formulário aparece
  - [ ] Campo de email funciona
  - [ ] Campo de senha funciona
  - [ ] Botão de login aparece

- [ ] Fazer login com credenciais válidas
  - [ ] Login bem-sucedido
  - [ ] Redireciona para `/admin` (se for admin)
  - [ ] Ou para home (se não for admin)
  - [ ] Não há erros no console

- [ ] Tentar login com credenciais inválidas
  - [ ] Mostra mensagem de erro
  - [ ] Não quebra a aplicação

#### 2.2 Logout
- [ ] Fazer logout
  - [ ] Volta para página inicial
  - [ ] Não há erros

---

### ✅ 3. Testes de Usuário Comum (Não Admin)

#### 3.1 Proteção de Rotas Admin
- [ ] Fazer login com usuário comum (sem role admin)
- [ ] Tentar acessar `/admin`
  - [ ] Deve redirecionar para `/` (home)
  - [ ] Não deve mostrar erro, apenas redirecionar silenciosamente

- [ ] Tentar acessar `/admin/products`
  - [ ] Deve redirecionar para `/`

#### 3.2 Funcionalidades Públicas
- [ ] Todas as páginas públicas continuam funcionando
- [ ] Loja funciona normalmente
- [ ] Carrinho funciona (se implementado)

---

### ✅ 4. Testes de Admin (Usuário com Role Admin)

**⚠️ IMPORTANTE:** Para estes testes, você precisa de um usuário com role `admin`.

Se ainda não configurou:
```bash
npm run admin:set <uid-do-usuario>
```

Depois, o usuário precisa fazer **logout e login novamente**.

#### 4.1 Acesso às Rotas Admin
- [ ] Fazer login com usuário admin
- [ ] Acessar `/admin`
  - [ ] Dashboard carrega
  - [ ] Lista de artigos aparece
  - [ ] Sem erros no console

#### 4.2 Dashboard de Artigos
- [ ] Lista de artigos aparece
- [ ] Busca funciona (se houver artigos)
- [ ] Botões de ação (editar/deletar) aparecem
- [ ] Estatísticas aparecem corretamente

#### 4.3 Criar Artigo
- [ ] Clicar em "Novo Artigo"
- [ ] Formulário aparece
  - [ ] Todos os campos aparecem
  - [ ] Preview de imagem funciona (se preencher URL)
  
- [ ] Teste de Validação
  - [ ] Tentar salvar sem título → Deve mostrar erro
  - [ ] Tentar salvar sem conteúdo → Deve mostrar erro
  - [ ] Preencher título muito longo (>200 chars) → Deve mostrar erro
  - [ ] Preencher URL de imagem inválida → Deve mostrar erro
  
- [ ] Criar artigo válido
  - [ ] Preencher todos os campos obrigatórios
  - [ ] Salvar
  - [ ] Deve mostrar mensagem de sucesso
  - [ ] Deve redirecionar para dashboard
  - [ ] Artigo aparece na lista
  - [ ] Verificar no Firestore Console que o artigo foi criado
  - [ ] Verificar que há um log em `audit_logs` com ação `article_created`

#### 4.4 Editar Artigo
- [ ] Clicar em "Editar" em um artigo
- [ ] Formulário carrega com dados do artigo
- [ ] Modificar algum campo
- [ ] Salvar
  - [ ] Mensagem de sucesso aparece
  - [ ] Mudanças aparecem na lista
  - [ ] Verificar log de auditoria (`article_updated`)

#### 4.5 Deletar Artigo
- [ ] Clicar em "Deletar" em um artigo
- [ ] Confirmação aparece (`window.confirm`)
- [ ] Confirmar
  - [ ] Artigo desaparece da lista
  - [ ] Verificar no Firestore que foi deletado
  - [ ] Verificar log de auditoria (`article_deleted`)

#### 4.6 Gerenciar Produtos
- [ ] Acessar `/admin/products`
  - [ ] Lista de produtos aparece
  - [ ] Sem erros

#### 4.7 Criar Produto
- [ ] Clicar em "Novo Produto"
- [ ] Formulário aparece
- [ ] Teste de Validação
  - [ ] Tentar salvar sem nome → Erro
  - [ ] Tentar salvar sem preço → Erro
  - [ ] Preço negativo → Erro
  - [ ] Estoque negativo → Erro
  
- [ ] Criar produto válido
  - [ ] Preencher campos obrigatórios
  - [ ] Salvar
  - [ ] Mensagem de sucesso
  - [ ] Produto aparece na lista
  - [ ] Verificar log de auditoria (`product_created`)

#### 4.8 Editar Produto
- [ ] Editar um produto existente
- [ ] Modificar campos
- [ ] Salvar
  - [ ] Sucesso
  - [ ] Mudanças aplicadas
  - [ ] Log de auditoria (`product_updated`)

#### 4.9 Deletar Produto
- [ ] Deletar um produto
- [ ] Confirmar
  - [ ] Produto removido
  - [ ] Log de auditoria (`product_deleted`)

---

### ✅ 5. Testes de Loja (Store)

#### 5.1 Visualização de Produtos
- [ ] Acessar `/store`
- [ ] Produtos ativos aparecem
- [ ] Produtos inativos NÃO aparecem (se houver)
- [ ] Imagens carregam
- [ ] Informações corretas (nome, preço)

#### 5.2 Detalhes do Produto
- [ ] Clicar em um produto
- [ ] Modal/detalhes aparecem
- [ ] Quantidade funciona
- [ ] Adicionar ao carrinho funciona (se implementado)

---

### ✅ 6. Testes de Console (Importante!)

**Abrir DevTools (F12) e verificar:**

#### 6.1 Sem Erros
- [ ] Console não mostra erros vermelhos
- [ ] Avisos (warnings) são aceitáveis, mas verificar
- [ ] Erros de rede não devem aparecer

#### 6.2 Mensagens Esperadas
- [ ] Pode haver mensagens de "Firebase initialized"
- [ ] Mensagens de loading são normais

#### 6.3 Erros Comuns a Verificar
- [ ] ❌ "permission-denied" → Regras não estão funcionando
- [ ] ❌ "Unauthenticated" → Problema de autenticação
- [ ] ❌ "Firebase config not found" → `.env` não configurado
- [ ] ❌ "Missing index" → Índices não foram criados

---

### ✅ 7. Testes de Integração com Firestore

#### 7.1 Verificar Regras Funcionando
- [ ] Como usuário comum: tentar criar artigo diretamente (via console)
  ```javascript
  // No console do navegador (com usuário comum logado)
  // Deve FALHAR com permission-denied
  ```
  
- [ ] Como admin: criar artigo via interface
  - [ ] Deve funcionar
  
- [ ] Verificar que usuário comum NÃO pode deletar
  - [ ] Deve ser bloqueado pelas regras

#### 7.2 Verificar Auditoria
- [ ] No Firestore Console, verificar coleção `audit_logs`
- [ ] Cada ação admin deve ter um log
- [ ] Logs contêm: action, userId, targetId, timestamp

---

### ✅ 8. Testes de Performance

#### 8.1 Carregamento Inicial
- [ ] Home carrega rápido
- [ ] Não há delays excessivos
- [ ] Imagens carregam progressivamente

#### 8.2 Navegação
- [ ] Transições entre páginas são suaves
- [ ] Sem "travamentos"

---

## 🐛 Problemas Comuns e Soluções

### Erro: "permission-denied"
**Causa:** Regras do Firestore não deployadas ou usuário sem permissão
**Solução:** 
1. Verificar se fez `firebase deploy --only firestore:rules`
2. Verificar se usuário é admin (se necessário)

### Erro: "Missing index"
**Causa:** Índices não foram criados
**Solução:** 
1. Deploy dos índices: `firebase deploy --only firestore:indexes`
2. Ou criar manualmente no Firebase Console (o erro mostra o link)

### Erro: "Firebase config not found"
**Causa:** Arquivo `.env` não existe ou está incompleto
**Solução:** Criar `.env` com todas as variáveis necessárias

### Usuário não consegue acessar /admin
**Causa:** Custom Claims não foram atualizados
**Solução:** 
1. Verificar se executou `npm run admin:set <uid>`
2. Usuário precisa fazer **logout e login novamente**

### Formulários não salvam
**Causa:** Validação falhando ou regras bloqueando
**Solução:**
1. Verificar mensagens de erro no formulário
2. Verificar console para erros do Firestore
3. Verificar se está logado como admin

---

## ✅ Resultado Esperado

Após todos os testes, você deve ter:

- ✅ Aplicação funcionando normalmente
- ✅ Navegação pública funcionando
- ✅ Autenticação funcionando
- ✅ Admin consegue criar/editar/deletar
- ✅ Usuários comuns são bloqueados
- ✅ Validação funcionando
- ✅ Auditoria registrando ações
- ✅ Sem erros críticos no console

---

## 📝 Notas para Testes

1. **Teste em diferentes navegadores** (Chrome, Firefox, Edge)
2. **Teste responsividade** (mobile, tablet, desktop)
3. **Teste com diferentes usuários** (admin e não-admin)
4. **Verifique o Firestore Console** durante os testes
5. **Mantenha o console aberto** para ver erros

---

## 🎯 Prioridade de Testes

**Alta Prioridade:**
1. Login/Logout
2. Acesso admin vs não-admin
3. Criar artigo (validação + auditoria)
4. Deletar artigo (auditoria)
5. Console sem erros

**Média Prioridade:**
1. Editar artigo
2. Produtos (CRUD completo)
3. Loja pública
4. Navegação geral

**Baixa Prioridade:**
1. Performance
2. Edge cases
3. Responsividade

---

Boa sorte com os testes! 🚀

