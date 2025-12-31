# ⚡ Teste Rápido - Checklist Essencial

Teste rápido para verificar se tudo está funcionando após as mudanças.

## ✅ Checklist Rápido (5 minutos)

### 1. Aplicação Inicia? ✅
```bash
npm run dev
```
- [ ] Servidor inicia sem erros
- [ ] Abre no navegador (http://localhost:5173)
- [ ] Home aparece

### 2. Console Limpo? ✅
- [ ] Abrir DevTools (F12)
- [ ] Console não tem erros vermelhos
- [ ] Sem mensagens de "permission-denied" ou "Unauthenticated"

### 3. Navegação Básica? ✅
- [ ] Clicar em "Artigos" → Funciona
- [ ] Clicar em "Loja" → Funciona  
- [ ] Clicar em "Sobre" → Funciona
- [ ] Voltar para Home → Funciona

### 4. Proteção de Rotas? ✅
- [ ] Tentar acessar `/admin` sem login
  - [ ] Redireciona para `/login` ✅
  
- [ ] Tentar acessar `/login`
  - [ ] Página de login aparece ✅

### 5. Login Funciona? ✅
- [ ] Fazer login com credenciais válidas
  - [ ] Login bem-sucedido ✅
  - [ ] Redireciona corretamente ✅

### 6. Admin Acessa Dashboard? ✅ (Se for admin)
- [ ] Acessar `/admin`
  - [ ] Dashboard carrega ✅
  - [ ] Lista de artigos aparece ✅
  - [ ] Sem erros no console ✅

### 7. Criar Artigo Funciona? ✅ (Se for admin)
- [ ] Clicar em "Novo Artigo"
- [ ] Preencher formulário
- [ ] Salvar
  - [ ] Mensagem de sucesso ✅
  - [ ] Artigo aparece na lista ✅
  - [ ] Sem erros ✅

---

## ❌ Se Algo Falhar

### Erro: "permission-denied"
→ Regras não deployadas ou usuário não é admin

### Erro: "Firebase config"
→ Verificar arquivo `.env`

### Página não carrega
→ Verificar console para erros

### Build falha
→ Já testamos: ✅ Build passou sem erros!

---

## ✅ Resultado Esperado

Se todos os itens acima estão ✅, a aplicação está funcionando!

Para testes mais detalhados, veja [TESTING_GUIDE.md](./TESTING_GUIDE.md)

**Nota:** Esta documentação foi reorganizada. Todos os guias estão na pasta `docs/`.

