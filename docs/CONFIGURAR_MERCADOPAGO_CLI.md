# 🔧 Configurar Mercado Pago via CLI

## 📋 Credenciais Fornecidas

- **Public Key:** `APP_USR-479d2b30-7b32-44a0-b8f3-b2b52ae31c87`
- **Access Token:** `APP_USR-4455998573983950-112511-dad71f8e74f1bfcb357c85cbd1b96aa5-15105017`
- **Client ID:** `4455998573983950`
- **Client Secret:** `j1pm4cnDJvbzA8kY5jBnwQ7mgrU2Z6Yi`

## ✅ Método 1: Usando Secrets (Recomendado - Moderno)

### **Configurar Access Token:**

```bash
firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
```

Quando solicitado, cole o Access Token:
```
APP_USR-4455998573983950-112511-dad71f8e74f1bfcb357c85cbd1b96aa5-15105017
```

### **Atualizar o código para usar Secrets:**

Em `functions/index.js`, você precisa atualizar para usar secrets. Mas por enquanto, vamos usar o método mais simples.

## ✅ Método 2: Usando Config (Mais Simples - Funciona)

### **Configurar Access Token:**

```bash
firebase functions:config:set mercadopago.access_token="APP_USR-4455998573983950-112511-dad71f8e74f1bfcb357c85cbd1b96aa5-15105017"
```

⚠️ **Nota:** Este método está deprecado, mas ainda funciona e é mais simples.

## 🔄 Método 3: Arquivo .env Local (Para Desenvolvimento)

Criar arquivo `functions/.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-4455998573983950-112511-dad71f8e74f1bfcb357c85cbd1b96aa5-15105017
```

Mas isso só funciona localmente, não em produção.

## 🎯 Recomendação: Método 2 (Config)

Vamos usar o método mais simples que funciona:

1. Execute o comando `firebase functions:config:set`
2. O código já está preparado para pegar de `functions.config().mercadopago?.access_token`
3. Não precisa alterar código
