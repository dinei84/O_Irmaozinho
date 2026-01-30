# 🔧 Configurar Mercado Pago via CLI

## 📋 Credenciais Fornecidas

- **Public Key:** `YOUR_PUBLIC_KEY`
- **Access Token:** `YOUR_ACCESS_TOKEN`
- **Client ID:** `4455998573983950`
- **Client Secret:** `j1pm4cnDJvbzA8kY5jBnwQ7mgrU2Z6Yi`

## ✅ Método 1: Usando Secrets (Recomendado - Moderno)

### **Configurar Access Token:**

```bash
firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
```

Quando solicitado, cole o Access Token:
```
YOUR_ACCESS_TOKEN
```

### **Atualizar o código para usar Secrets:**

Em `functions/index.js`, você precisa atualizar para usar secrets. Mas por enquanto, vamos usar o método mais simples.

## ✅ Método 2: Usando Config (Mais Simples - Funciona)

### **Configurar Access Token:**

```bash
firebase functions:config:set mercadopago.access_token="YOUR_ACCESS_TOKEN"
```

⚠️ **Nota:** Este método está deprecado, mas ainda funciona e é mais simples.

## 🔄 Método 3: Arquivo .env Local (Para Desenvolvimento)

Criar arquivo `functions/.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
```

Mas isso só funciona localmente, não em produção.

## 🎯 Recomendação: Método 2 (Config)

Vamos usar o método mais simples que funciona:

1. Execute o comando `firebase functions:config:set`
2. O código já está preparado para pegar de `functions.config().mercadopago?.access_token`
3. Não precisa alterar código
