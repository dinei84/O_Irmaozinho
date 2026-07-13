# 🔧 Troubleshooting - Solução de Problemas

## Problema: Login não redireciona para /admin

### Sintomas
- Faz login com sucesso
- Mas redireciona para `/` (home) ao invés de `/admin`
- Console não mostra erros

### Causa
O usuário não tem o Custom Claim `role: 'admin'` configurado, ou o token não foi atualizado.

### Solução

1. **Verificar se o usuário é admin:**
   ```bash
   # Execute o script de admin
   npm run admin:set <uid-do-usuario>
   ```

2. **IMPORTANTE: Fazer logout e login novamente**
   - O token JWT precisa ser atualizado
   - Custom Claims só aparecem em um novo token
   - Logout → Login resolve o problema

3. **Verificar no console do navegador:**
   - Abra DevTools (F12)
   - Vá em Application/Storage > Local Storage
   - Procure por chaves do Firebase
   - Ou limpe o localStorage e faça login novamente

---

## Problema: Warning do React Router

### Sintoma
```
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7.
```

### Causa
Aviso sobre mudanças futuras no React Router v7. Não é um erro, apenas um aviso.

### Solução (Opcional)
Pode ser ignorado, ou se quiser silenciar:

No `main.jsx` ou onde o Router é configurado, você pode adicionar future flags (quando o React Router v7 for lançado).

Por enquanto, pode ser ignorado - não afeta a funcionalidade.

---

## Problema: Aplicação demora muito para carregar

### Causas Possíveis

1. **Firebase inicializando**
   - Primeira carga sempre é mais lenta
   - Firebase SDK precisa baixar e inicializar

2. **Imagens grandes**
   - Verificar tamanho das imagens
   - Considerar otimização/compressão

3. **Muitas requisições ao Firestore**
   - Verificar se está fazendo muitas queries
   - Considerar paginação

### Soluções

1. **Para desenvolvimento:**
   - Aguardar carregamento inicial (normal)
   - Recarregar a página (cache ajuda)

2. **Para produção:**
   - Otimizar imagens
   - Implementar lazy loading
   - Usar CDN para assets
   - Implementar cache

---

## Problema: Erro "permission-denied"

### Causas

1. **Regras não deployadas**
   - Execute: `firebase deploy --only firestore:rules`

2. **Usuário não é admin**
   - Configure com: `npm run admin:set <uid>`
   - Faça logout/login

3. **Token não atualizado**
   - Faça logout e login novamente

### Solução

```bash
# 1. Deploy das regras
firebase deploy --only firestore:rules

# 2. Configurar admin
npm run admin:set <uid>

# 3. No navegador: logout → login
```

---

## Problema: Custom Claims não aparecem

### Sintoma
- Executou `npm run admin:set <uid>`
- Mas ainda não tem acesso ao admin

### Solução

**O usuário PRECISA fazer logout e login novamente!**

Custom Claims só aparecem em um **novo token JWT**. O token antigo não tem os claims atualizados.

1. Fazer logout
2. Fazer login novamente
3. O novo token terá os claims atualizados

---

## Problema: Validação não funciona

### Verificar

1. **Console do navegador:**
   - Abrir DevTools (F12)
   - Ver se há erros

2. **Validação client-side:**
   - Deve mostrar erros no formulário
   - Se não mostrar, verificar se `validators.js` está sendo usado

3. **Validação server-side:**
   - Regras do Firestore devem estar deployadas
   - Verificar Firebase Console > Firestore > Rules

---

## Problema: Testes falhando

### Solução

```bash
# Limpar cache e reinstalar
rm -rf node_modules
rm package-lock.json
npm install

# Executar testes
npm test
```

---

## Checklist de Verificação Rápida

Se algo não está funcionando, verifique:

- [ ] `.env` está configurado?
- [ ] Regras do Firestore foram deployadas?
- [ ] Usuário é admin? (`npm run admin:set <uid>`)
- [ ] Fez logout e login após configurar admin?
- [ ] Console do navegador tem erros?
- [ ] Firebase Console mostra os dados corretos?

---

## Logs Úteis para Debug

### No Console do Navegador

Adicione temporariamente para debug:

```javascript
// Em AuthContext.jsx, adicione:
console.log('Current User:', currentUser);
console.log('User Role:', userRole);
console.log('Is Admin:', isAdmin);
```

### No Firebase Console

1. Authentication > Users - Ver usuários
2. Firestore > Data - Ver dados
3. Firestore > Rules - Ver regras deployadas
4. Firestore > Indexes - Ver índices

---

## Contato

Se o problema persistir:
1. Verifique os logs do console
2. Verifique o Firebase Console
3. Revise a documentação
4. Consulte os testes para entender o comportamento esperado

