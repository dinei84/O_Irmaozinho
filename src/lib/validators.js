/**
 * Biblioteca de validação de dados
 * Centraliza todas as validações para garantir consistência
 */

/**
 * Valida se uma string é uma URL válida
 */
export function isValidUrl(string) {
  if (!string || typeof string !== 'string') return false;
  
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Sanitiza HTML básico (remove tags potencialmente perigosas)
 * Para produção, considere usar uma biblioteca como DOMPurify
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  
  // Remove scripts e tags perigosas
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+='[^']*'/gi, '');
}

/**
 * Valida estrutura de um artigo
 */
export function validateArticle(article) {
  const errors = [];
  
  // Validação de título
  if (!article.title || typeof article.title !== 'string' || article.title.trim().length === 0) {
    errors.push('Título é obrigatório');
  } else if (article.title.length > 200) {
    errors.push('Título deve ter no máximo 200 caracteres');
  } else if (article.title.length < 3) {
    errors.push('Título deve ter no mínimo 3 caracteres');
  }
  
  // Validação de conteúdo
  if (!article.body || typeof article.body !== 'string' || article.body.trim().length === 0) {
    errors.push('Conteúdo é obrigatório');
  } else if (article.body.length > 50000) {
    errors.push('Conteúdo muito grande (máximo 50.000 caracteres)');
  } else if (article.body.length < 10) {
    errors.push('Conteúdo deve ter no mínimo 10 caracteres');
  }
  
  // Validação de categoria
  const validCategories = ['Artigos', 'Crônicas'];
  if (!article.category || !validCategories.includes(article.category)) {
    errors.push(`Categoria deve ser uma das seguintes: ${validCategories.join(', ')}`);
  }
  
  // Validação de URL de imagem (opcional)
  if (article.imageUrl) {
    if (typeof article.imageUrl !== 'string' || article.imageUrl.length > 1000) {
      errors.push('URL de imagem inválida (máximo 1000 caracteres)');
    } else if (!isValidUrl(article.imageUrl)) {
      errors.push('URL de imagem deve ser uma URL válida (http:// ou https://)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida estrutura de um produto
 */
export function validateProduct(product) {
  const errors = [];
  
  // Validação de nome
  if (!product.name || typeof product.name !== 'string' || product.name.trim().length === 0) {
    errors.push('Nome do produto é obrigatório');
  } else if (product.name.length > 200) {
    errors.push('Nome do produto deve ter no máximo 200 caracteres');
  } else if (product.name.length < 2) {
    errors.push('Nome do produto deve ter no mínimo 2 caracteres');
  }
  
  // Validação de preço
  if (product.price === undefined || product.price === null) {
    errors.push('Preço é obrigatório');
  } else {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    if (isNaN(price) || !isFinite(price)) {
      errors.push('Preço deve ser um número válido');
    } else if (price < 0) {
      errors.push('Preço não pode ser negativo');
    } else if (price > 1000000) {
      errors.push('Preço muito alto (máximo R$ 1.000.000,00)');
    }
  }
  
  // Validação de estoque
  if (product.stock !== undefined && product.stock !== null) {
    const stock = typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock;
    if (isNaN(stock) || !Number.isInteger(stock)) {
      errors.push('Estoque deve ser um número inteiro');
    } else if (stock < 0) {
      errors.push('Estoque não pode ser negativo');
    }
  }
  
  // Validação de status ativo
  if (product.active !== undefined && typeof product.active !== 'boolean') {
    errors.push('Status ativo deve ser verdadeiro ou falso');
  }
  
  // Validação de URL de imagem (opcional)
  if (product.imageUrl) {
    if (typeof product.imageUrl !== 'string' || product.imageUrl.length > 1000) {
      errors.push('URL de imagem inválida (máximo 1000 caracteres)');
    } else if (!isValidUrl(product.imageUrl)) {
      errors.push('URL de imagem deve ser uma URL válida (http:// ou https://)');
    }
  }
  
  // Validação de descrição (opcional)
  if (product.description && typeof product.description === 'string' && product.description.length > 2000) {
    errors.push('Descrição deve ter no máximo 2000 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Normaliza dados de artigo antes de salvar
 * Nota: O campo body mantém espaços preservados pois podem ser importantes para formatação
 */
export function normalizeArticle(article) {
  return {
    title: article.title ? article.title.trim() : '',
    body: article.body ? sanitizeHtml(article.body) : '', // body mantém espaços, apenas sanitiza HTML
    category: article.category || 'Artigos',
    imageUrl: article.imageUrl ? article.imageUrl.trim() : '',
  };
}

/**
 * Normaliza dados de produto antes de salvar
 */
export function normalizeProduct(product) {
  return {
    name: product.name ? product.name.trim() : '',
    description: product.description ? (product.description.trim() || '') : '',
    price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
    stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : (product.stock || 0),
    category: product.category || 'Outros',
    imageUrl: product.imageUrl ? product.imageUrl.trim() : '',
    active: product.active !== undefined ? Boolean(product.active) : true,
  };
}

