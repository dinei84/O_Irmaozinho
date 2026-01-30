# 🧪 Guia de Testes: Sistema de Pagamento PIX

## ✅ Checklist Antes de Testar

Antes de começar, verifique se:

- [ ] Cloud Functions foram deployadas (`firebase deploy --only functions`)
- [ ] Firestore Rules foram deployadas (`firebase deploy --only firestore:rules`)
- [ ] Arquivo `.env` na raiz tem as credenciais do Firebase
- [ ] Arquivo `functions/.env` tem o token do Mercado Pago
- [ ] Webhook configurado no Mercado Pago (para produção)

---

## 🧪 Testes Passo a Passo

### **TESTE 1: Verificar se Cloud Functions estão funcionando**

#### Via Firebase Console:

1. Acesse: https://console.firebase.google.com/project/admoirmaozinho/functions
2. Verifique se aparecem 3 functions:
   - ✅ `createPaymentIntent`
   - ✅ `checkPaymentStatus`
   - ✅ `handlePaymentWebhook`

#### Via CLI (logs):

```bash
firebase functions:log
```

Se aparecerem logs sem erros, está funcionando!

---

### **TESTE 2: Testar Frontend Localmente**

1. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

2. **Acesse:** http://localhost:5173 (ou a porta que aparecer)

3. **Verifique se a página carrega sem erros**
   - Abra o Console do navegador (F12)
   - Não deve aparecer erros vermelhos relacionados a Firebase/Functions

---

### **TESTE 3: Fluxo Completo de Checkout (Teste Manual)**

#### **Passo 1: Fazer Login**

1. Acesse `/login` ou `/signup`
2. Faça login com uma conta de teste
3. Verifique se está logado (nome aparece no header)

#### **Passo 2: Adicionar Produto ao Carrinho**

1. Acesse `/store`
2. Clique em "Adicionar ao Carrinho" em algum produto
3. Verifique se o carrinho abre e mostra o produto

#### **Passo 3: Ir para Checkout**

1. Clique em "Finalizar Compra" ou acesse `/checkout`
2. Verifique se:
   - ✅ Página de checkout carrega
   - ✅ Produtos aparecem no resumo
   - ✅ Totais estão corretos

#### **Passo 4: Preencher Dados do Cliente**

1. Preencha o formulário:
   - Nome completo
   - Email válido
   - Telefone (ex: (11) 99999-9999)
   - CPF/CNPJ (ex: 123.456.789-00)

2. Clique em "Continuar"
3. Verifique se:
   - ✅ Validação funciona (tenta avançar sem preencher → mostra erro)
   - ✅ Ao preencher tudo, avança para próxima etapa

#### **Passo 5: Preencher Endereço de Entrega**

1. Preencha o CEP (ex: 01310-100)
2. Aguarde a busca automática via ViaCEP
3. Verifique se:
   - ✅ Rua, Bairro, Cidade, Estado preenchem automaticamente
   - ✅ Número aparece para preencher

4. Selecione "PIX" como método de pagamento
5. Clique em "Finalizar Pedido"

#### **Passo 6: Criar Pedido e Ver QR Code**

1. Aguarde o processamento (pode levar alguns segundos)
2. Verifique se:
   - ✅ Pedido é criado no Firestore
   - ✅ QR Code PIX aparece na tela
   - ✅ Código PIX copiável aparece
   - ✅ Timer de expiração aparece (se implementado)

#### **Passo 7: Verificar no Firebase Console**

1. Acesse: https://console.firebase.google.com/project/admoirmaozinho/firestore
2. Vá na coleção `orders`
3. Verifique se:
   - ✅ Pedido foi criado
   - ✅ Tem status `pending`
   - ✅ Payment status é `pending`
   - ✅ Dados do cliente e endereço estão corretos

---

### **TESTE 4: Testar Pagamento PIX (Ambiente de Testes)**

#### **Usando Mercado Pago Sandbox:**

1. **Gerar QR Code de teste:**
   - O QR Code já foi gerado no teste anterior
   - Use um app bancário que aceita PIX de teste

2. **Ou simular pagamento aprovado via webhook:**
   - Acesse o painel do Mercado Pago: https://www.mercadopago.com.br/developers/panel
   - Vá em "Webhooks" ou "Notificações"
   - Veja os eventos de pagamento que chegaram

#### **Verificar atualização automática:**

1. Após pagamento (simulado ou real), verifique:
   - ✅ Status do pedido muda para `paid` no Firestore
   - ✅ Frontend mostra confirmação (se implementado listener em tempo real)

---

### **TESTE 5: Verificar Erros e Validações**

#### **Teste de Validações:**

1. **Tentar avançar sem preencher campos obrigatórios:**
   - Deve mostrar mensagens de erro

2. **Tentar criar pedido sem estar logado:**
   - Deve redirecionar para `/login`

3. **Tentar criar pedido com carrinho vazio:**
   - Deve mostrar mensagem de carrinho vazio

#### **Teste de Erros de Pagamento:**

1. **Ver logs das Cloud Functions:**
```bash
firebase functions:log
```

2. **Verificar erros no Console do navegador (F12)**

---

## 🐛 Troubleshooting - Problemas Comuns

### **Problema: QR Code não aparece**

**Possíveis causas:**
- Cloud Function não foi deployada
- Token do Mercado Pago incorreto
- Erro ao criar pagamento

**Solução:**
1. Verifique logs: `firebase functions:log`
2. Verifique Console do navegador (F12)
3. Verifique se `functions/.env` tem o token correto

---

### **Problema: "Functions not found"**

**Solução:**
```bash
firebase deploy --only functions
```

---

### **Problema: Erro "Missing or insufficient permissions"**

**Solução:**
```bash
firebase deploy --only firestore:rules
```

---

### **Problema: Pedido não é criado**

**Possíveis causas:**
- Firestore Rules bloqueando
- Usuário não autenticado
- Dados inválidos

**Solução:**
1. Verifique Console do navegador (F12) para ver erro específico
2. Verifique Firestore Rules foram deployadas
3. Verifique se usuário está logado

---

## ✅ Checklist de Validação Final

### **Frontend:**
- [ ] Página de checkout carrega
- [ ] Formulários validam corretamente
- [ ] QR Code aparece após criar pedido
- [ ] Timer de expiração funciona (se implementado)
- [ ] Erros são mostrados de forma clara

### **Backend:**
- [ ] Pedido é criado no Firestore
- [ ] Cloud Function `createPaymentIntent` funciona
- [ ] QR Code é gerado corretamente
- [ ] Dados do pedido estão corretos

### **Segurança:**
- [ ] Usuário não autenticado não pode criar pedido
- [ ] Usuário só vê seus próprios pedidos
- [ ] Totais são recalculados no servidor

### **Webhook (quando configurado):**
- [ ] Webhook recebe notificações do Mercado Pago
- [ ] Status do pedido atualiza automaticamente após pagamento

---

## 📊 Testes Recomendados por Ambiente

### **Desenvolvimento Local:**
- Teste frontend completo
- Teste criação de pedido
- Teste validações
- Simule pagamento (sem pagar de fato)

### **Produção/Staging:**
- Teste completo com PIX real (valor baixo)
- Verifique webhook
- Verifique atualizações em tempo real
- Teste fluxo completo várias vezes

---

## 🎯 Próximos Passos Após Testes Bem-Sucedidos

1. ✅ Configurar webhook no Mercado Pago
2. ✅ Testar pagamento real com valor mínimo
3. ✅ Verificar atualização automática de status
4. ✅ Implementar página "Meus Pedidos"
5. ✅ Adicionar validação de estoque
6. ✅ Implementar cálculo de frete

---

**Boa sorte com os testes! 🚀**

Se encontrar algum problema, verifique os logs e o Console do navegador para identificar o erro específico.
