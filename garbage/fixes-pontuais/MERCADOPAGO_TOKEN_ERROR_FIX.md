# 🔧 Correção: Erro "Unauthorized use of live credentials" - Mercado Pago

## ❌ Problema

Erro ao criar pagamento PIX:
```
Erro ao criar pagamento no Mercado Pago: Unauthorized use of live credentials
```

## 🔍 Causa

O erro "Unauthorized use of live credentials" geralmente acontece quando:

1. **Token de produção usado incorretamente** - O Access Token que começa com `APP_USR-` é um token de **produção** e precisa estar configurado corretamente
2. **Token inválido ou expirado** - O token pode ter sido revogado ou estar incorreto
3. **Conta do Mercado Pago não configurada** - A conta pode precisar de verificação adicional

## ✅ Soluções

### **Solução 1: Verificar Token no Mercado Pago**

1. **Acesse o painel do Mercado Pago:**
   - https://www.mercadopago.com.br/developers/panel

2. **Verifique as credenciais:**
   - Vá em **Suas integrações** > **Credenciais**
   - Certifique-se de estar na aba **"Produção"** (não "Teste")
   - Copie o **Access Token** de produção

3. **Verifique se o token está ativo:**
   - O token deve começar com `APP_USR-` para produção
   - Certifique-se de que não foi revogado ou desabilitado

### **Solução 2: Configurar Token via Firebase Console**

**Opção A: Via Firebase Console (Recomendado para Produção)**

1. Acesse: https://console.firebase.google.com/project/admoirmaozinho/functions/config
2. Clique em **"Adicionar variável"** ou **"Add Variable"**
3. **Nome:** `MERCADOPAGO_ACCESS_TOKEN`
4. **Valor:** Cole o Access Token de produção do Mercado Pago
5. Clique em **"Salvar"**

**Opção B: Criar arquivo `.env` local (para desenvolvimento)**

Crie o arquivo `functions/.env`:
```env
MERCADOPAGO_ACCESS_TOKEN=SEU_TOKEN_AQUI
```

### **Solução 3: Verificar se Conta Está Aprovada**

O erro pode acontecer se sua conta do Mercado Pago ainda não está totalmente aprovada para produção:

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Verifique se há alguma pendência na conta
3. Certifique-se de que os dados da conta estão completos

### **Solução 4: Usar Token de Teste (Desenvolvimento)**

Se você quer testar sem usar credenciais de produção:

1. **Gere um token de teste:**
   - No painel do Mercado Pago, vá em **Credenciais de teste**
   - Gere ou copie o **Access Token de teste** (começa com `TEST-`)

2. **Atualize o código da function:**

Em `functions/index.js`, linha 22, substitua temporariamente:
```javascript
|| 'TEST-SEU_TOKEN_DE_TESTE_AQUI'; // Token de teste
```

⚠️ **Nota:** Tokens de teste só funcionam em modo de desenvolvimento. Para produção, use token de produção.

### **Solução 5: Fazer Redeploy Após Configurar Token**

Depois de configurar o token:

1. **Se configurou via Firebase Console:**
   - As functions já devem pegar a variável de ambiente automaticamente
   - Não precisa fazer redeploy

2. **Se configurou via `.env` local:**
   - Precisa fazer redeploy:
   ```bash
   firebase deploy --only functions
   ```

## 🔍 Verificar Logs das Functions

Para ver detalhes do erro:

```bash
firebase functions:log --only createPaymentIntent --limit 50
```

Procure por:
- Mensagens de erro do Mercado Pago
- Resposta completa do erro
- Status code do erro

## ✅ Checklist de Verificação

- [ ] Token está correto (copiado do painel do Mercado Pago)
- [ ] Token é de produção (começa com `APP_USR-`)
- [ ] Token está configurado no Firebase Console (variável de ambiente)
- [ ] Conta do Mercado Pago está aprovada e ativa
- [ ] Não há pendências na conta do Mercado Pago
- [ ] Logs das functions foram verificados

## 🆘 Se o Erro Persistir

1. **Verifique os logs detalhados:**
   ```bash
   firebase functions:log --only createPaymentIntent --limit 100
   ```

2. **Entre em contato com suporte do Mercado Pago:**
   - Pode ser necessário verificar a conta
   - Pode haver restrições na conta

3. **Teste com token de teste primeiro:**
   - Para garantir que o código funciona
   - Depois mude para token de produção

## 📝 Nota Importante

Tokens de produção do Mercado Pago são **sensíveis**:
- ✅ Mantenha seguros
- ✅ Não commite no código
- ✅ Use variáveis de ambiente
- ✅ Configure via Firebase Console para produção
