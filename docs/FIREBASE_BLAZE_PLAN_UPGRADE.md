# 🔄 Upgrade para Plano Blaze - Cloud Functions

## ❌ Problema

Erro ao fazer deploy das Cloud Functions:
```
Error: Your project admoirmaozinho must be on the Blaze (pay-as-you-go) plan to complete this command. 
Required API cloudbuild.googleapis.com can't be enabled until the upgrade is complete.
```

## ✅ Solução: Fazer Upgrade para Plano Blaze

### 📋 Passo a Passo

1. **Acesse o link do erro ou vá direto para:**
   ```
   https://console.firebase.google.com/project/admoirmaozinho/usage/details
   ```

2. **Ou acesse manualmente:**
   - Vá em: https://console.firebase.google.com/project/admoirmaozinho/overview
   - Clique em **"Fazer upgrade"** (aparece no banner superior se ainda não estiver no Blaze)
   - Ou vá em **Configurações do Projeto** > **Uso e cobrança** > **Fazer upgrade**

3. **Siga as instruções:**
   - Leia os termos e condições
   - Aceite os termos
   - Confirme o upgrade

4. **Depois do upgrade, tente o deploy novamente:**
   ```bash
   firebase deploy --only functions
   ```

## 💰 Sobre o Plano Blaze

### **Tier Gratuito Generoso:**

O plano Blaze **NÃO significa que você vai pagar imediatamente**. Ele tem um tier gratuito muito generoso:

- **Cloud Functions:**
  - 2 milhões de invocações/mês grátis
  - 400.000 GB-segundo de computação/mês grátis
  - 200.000 GB-segundo de uso de rede/mês grátis

- **Cloud Build:**
  - 120 minutos/dia grátis (mais que suficiente para desenvolvimento)

- **Artifact Registry:**
  - 0,5 GB de armazenamento grátis

### **Quando você paga:**

Você só paga se exceder os limites gratuitos. Para desenvolvimento e testes, é muito difícil exceder esses limites.

### **Proteções:**

O Firebase tem proteções para evitar cobranças inesperadas:
- **Alertas de cobrança:** Você recebe alertas quando se aproxima dos limites
- **Orçamentos:** Pode configurar orçamentos e limites de gastos
- **Tier gratuito permanente:** Alguns serviços sempre têm tier gratuito (como Firestore com 50k leituras/dia grátis)

## ✅ Após o Upgrade

Depois de fazer o upgrade:

1. **Verifique se está no plano Blaze:**
   - No Console, você verá "Plano Blaze" no topo
   - O banner de upgrade desaparecerá

2. **Tente o deploy novamente:**
   ```bash
   firebase deploy --only functions
   ```

3. **Se ainda der erro de quota (temporário):**
   - Aguarde alguns minutos
   - As APIs podem levar alguns minutos para serem habilitadas
   - Tente novamente depois de 2-5 minutos

## 🆘 Problemas Comuns

### Problema: "Quota exceeded" após upgrade

**Solução:**
- Isso é temporário - as APIs estão sendo habilitadas
- Aguarde alguns minutos (2-5 minutos)
- Tente o deploy novamente

### Problema: Não consigo fazer upgrade

**Possíveis causas:**
- Conta não tem método de pagamento configurado
- Precisa adicionar cartão de crédito (mesmo que não vá usar)

**Solução:**
1. Acesse: https://console.cloud.google.com/billing
2. Configure um método de pagamento
3. Volte ao Firebase Console e faça o upgrade

### Problema: Tenho medo de custos inesperados

**Proteções que você pode configurar:**

1. **Alertas de Cobrança:**
   - Vá em: https://console.cloud.google.com/billing/budgets
   - Configure alertas (ex: alerta em $5, $10, $20)

2. **Limites de Orçamento:**
   - Configure um limite de orçamento mensal
   - Exemplo: $10/mês como limite máximo

3. **Monitoramento:**
   - Verifique uso diariamente no início
   - Firebase mostra uso em tempo real no Console

## 📝 Nota Importante

O plano Blaze é necessário para Cloud Functions, mas é muito raro você pagar algo durante desenvolvimento e testes. A maioria dos projetos pequenos/médios nunca excede o tier gratuito.

## ✅ Próximos Passos

1. ✅ Fazer upgrade para Blaze
2. ✅ Aguardar 2-5 minutos para APIs serem habilitadas
3. ✅ Fazer deploy das functions
4. ✅ Verificar se funcionou
