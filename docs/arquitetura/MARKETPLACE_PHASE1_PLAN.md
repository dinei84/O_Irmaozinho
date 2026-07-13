# 🏪 Fase 1: Marketplace Multi-Fornecedor (MVP)

## 📋 Objetivo

Implementar sistema básico de fornecedores com **recebimento centralizado**, permitindo:
- Cadastro de fornecedores
- Associar produtos a fornecedores
- Calcular comissões no momento do pedido
- Estrutura pronta para evoluir para split payment depois

---

## 🎯 Escopo da Fase 1

### ✅ O que VAI ser implementado:
1. **Estrutura de dados `suppliers`**
2. **Produtos associados a fornecedores** (`supplierId`)
3. **Cadastro/gestão de fornecedores** (interface admin)
4. **Atualização de produtos** para incluir fornecedor
5. **Cálculo de comissões** (fixo 15% inicialmente)
6. **Estrutura de pedidos** preparada para fornecedores

### ❌ O que NÃO será implementado (Fase 2+):
- Split payment (Mercado Pago)
- Múltiplos tipos de fornecedores
- Repasse automático
- Dashboard financeiro

---

## 📊 Estrutura de Dados

### 1. Coleção `suppliers`

```javascript
{
  id: "supplier_123",
  name: "Fornecedor ABC",           // Nome do fornecedor
  email: "contato@fornecedor.com",  // Email de contato
  phone: "(11) 99999-9999",         // Telefone (opcional)
  
  // Dados financeiros (Fase 1: centralizado)
  commissionRate: 0.15,             // 15% de comissão (fixo na Fase 1)
  paymentMethod: "centralized",     // Sempre "centralized" na Fase 1
  
  // Status
  active: true,                     // Fornecedor ativo/inativo
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. Atualizar `products`

Adicionar campos:
```javascript
{
  // ... campos existentes
  supplierId: "supplier_123",       // NOVO: Referência ao fornecedor
  supplierName: "Fornecedor ABC"    // NOVO: Nome denormalizado (performance)
}
```

### 3. Preparar `orders` (estrutura básica)

```javascript
{
  // ... campos básicos existentes
  
  items: [
    {
      // ... campos existentes
      supplierId: "supplier_123",           // NOVO
      supplierName: "Fornecedor ABC",       // NOVO
      commission: 4.49,                     // NOVO: 15% de 29.90
      supplierAmount: 25.41                 // NOVO: 29.90 - 4.49
    }
  ],
  
  // NOVO: Resumo por fornecedor (preparação para Fase 2)
  suppliersSummary: {
    "supplier_123": {
      supplierId: "supplier_123",
      supplierName: "Fornecedor ABC",
      itemsCount: 2,
      subtotal: 59.80,
      commission: 8.97,
      supplierAmount: 50.83
    }
  }
}
```

---

## 🛠️ Componentes a Criar/Atualizar

### 1. Backend/Serviços

#### `src/services/supplierService.js` (NOVO)
- `getAllSuppliers()` - Listar todos
- `getSupplier(id)` - Buscar por ID
- `createSupplier(data)` - Criar fornecedor
- `updateSupplier(id, data)` - Atualizar
- `deleteSupplier(id)` - Deletar (soft delete)

#### `src/lib/validators.js` (ATUALIZAR)
- `validateSupplier(data)` - Validar estrutura
- `normalizeSupplier(data)` - Normalizar dados
- Atualizar `validateProduct` para incluir `supplierId`

### 2. Firestore Rules (ATUALIZAR)

Adicionar:
- Regras para coleção `suppliers`
- Atualizar validação de `products` para incluir `supplierId`

### 3. Frontend/Admin

#### `src/pages/admin/SuppliersManager.jsx` (NOVO)
- Listar fornecedores
- Criar/editar/deletar
- Similar ao `ProductsManager`

#### `src/pages/admin/SupplierEditor.jsx` (NOVO)
- Formulário de criação/edição
- Campos: name, email, phone, active

#### `src/pages/admin/ProductEditor.jsx` (ATUALIZAR)
- Adicionar campo de seleção de fornecedor
- Buscar fornecedores disponíveis

#### `src/pages/admin/ProductsManager.jsx` (ATUALIZAR)
- Mostrar nome do fornecedor na listagem

### 4. Rotas (ATUALIZAR)

Adicionar em `src/App.jsx`:
- `/admin/suppliers` - Listagem
- `/admin/suppliers/new` - Criar
- `/admin/suppliers/edit/:id` - Editar

---

## 📝 Plano de Implementação (Passo a Passo)

### Passo 1: Estrutura de Dados e Validação
1. ✅ Criar `supplierService.js`
2. ✅ Atualizar `validators.js`
3. ✅ Atualizar Firestore Rules

### Passo 2: Interface Admin de Fornecedores
4. ✅ Criar `SuppliersManager.jsx`
5. ✅ Criar `SupplierEditor.jsx`
6. ✅ Adicionar rotas

### Passo 3: Integração com Produtos
7. ✅ Atualizar `ProductEditor.jsx`
8. ✅ Atualizar `ProductsManager.jsx`
9. ✅ Migração de produtos existentes (opcional)

### Passo 4: Preparação para Pedidos
10. ✅ Criar estrutura básica de `orderService.js`
11. ✅ Funções de cálculo de comissão

---

## 🧪 Testes

### Validações a testar:
- Criar fornecedor válido
- Criar fornecedor inválido (campos obrigatórios)
- Atualizar fornecedor
- Deletar fornecedor
- Associar produto a fornecedor
- Calcular comissão corretamente

---

## ⚠️ Considerações Importantes

### Produtos Existentes:
- **Decisão necessária**: O que fazer com produtos já cadastrados?
  - Opção 1: Criar fornecedor "Plataforma" ou "Próprio"
  - Opção 2: Deixar `supplierId` opcional inicialmente
  - Opção 3: Migração manual (associar cada produto)

### Comissão Fixa:
- Fase 1: 15% fixo para todos
- Fase 2: Comissão por tipo de fornecedor

### Validações:
- Produto DEVE ter fornecedor? (Sim, na Fase 1)
- Fornecedor pode ser deletado se tiver produtos? (Não, ou soft delete)

---

## 🚀 Próximos Passos Após Fase 1

- Fase 2: Tipos de fornecedores
- Fase 3: Split payment (Mercado Pago)
- Fase 4: Dashboard financeiro
- Fase 5: Repasse automático

---

**Vamos começar a implementação! 🎯**
