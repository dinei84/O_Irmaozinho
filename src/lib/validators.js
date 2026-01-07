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
 * Sanitiza HTML preservando formatação básica segura (negrito, itálico, etc)
 * Remove apenas tags e atributos perigosos
 * Para produção, considere usar uma biblioteca como DOMPurify para maior segurança
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  
  // Se o texto não contém tags HTML, retorna como está
  if (!/<[^>]+>/.test(html)) {
    return html;
  }
  
  // Tags permitidas para formatação
  const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'p', 'br', 'span', 'div'];
  
  // Atributos permitidos (nenhum por enquanto, para segurança)
  const allowedAttributes = [];
  
  // Usa DOM para sanitizar (mais seguro e preciso)
  try {
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Remove scripts e elementos perigosos
      const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style'];
      dangerousTags.forEach(tag => {
        tempDiv.querySelectorAll(tag).forEach(el => el.remove());
      });
      
      // Remove todos os elementos que não estão na lista de permitidos
      const allElements = tempDiv.querySelectorAll('*');
      allElements.forEach(el => {
        const tagName = el.tagName.toLowerCase();
        
        // Se a tag não está permitida, substitui pelo conteúdo
        if (!allowedTags.includes(tagName)) {
          const parent = el.parentNode;
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        } else {
          // Remove atributos perigosos, mantendo apenas os permitidos
          Array.from(el.attributes).forEach(attr => {
            // Remove event handlers (onclick, onload, etc)
            if (attr.name.startsWith('on')) {
              el.removeAttribute(attr.name);
            }
            // Remove atributos de estilo e script
            else if (['style', 'class', 'id'].includes(attr.name.toLowerCase())) {
              // Permite class, id, mas remove style (pode conter javascript)
              if (attr.name.toLowerCase() === 'style') {
                el.removeAttribute(attr.name);
              }
            }
            // Remove outros atributos não permitidos
            else if (!allowedAttributes.includes(attr.name)) {
              el.removeAttribute(attr.name);
            }
          });
        }
      });
      
      return tempDiv.innerHTML;
    }
  } catch (e) {
    console.warn('Erro ao sanitizar HTML:', e);
  }
  
  // Fallback: sanitização via regex (menos precisa, mas funciona sem DOM)
  let sanitized = html;
  
  // Remove scripts e iframes
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove event handlers de todas as tags
  sanitized = sanitized
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove atributos style (pode conter javascript)
  sanitized = sanitized.replace(/\sstyle\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove tags não permitidas, mas preserva conteúdo
  // Mantém apenas tags de formatação básica
  const tagPattern = new RegExp(`<(?!\/?(${allowedTags.join('|')})\b)[^>]+>`, 'gi');
  sanitized = sanitized.replace(tagPattern, '');
  
  return sanitized;
}

/**
 * Valida email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida senha
 * Retorna { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Senha é obrigatória');
    return { valid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }
  
  if (password.length > 128) {
    errors.push('Senha deve ter no máximo 128 caracteres');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
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
    errors.push('Conteúdo deve ter no máximo 50000 caracteres');
  } else if (article.body.length < 10) {
    errors.push('Conteúdo deve ter no mínimo 10 caracteres');
  }
  
  // Validação de categoria
  if (!article.category || typeof article.category !== 'string') {
    errors.push('Categoria é obrigatória');
  } else if (!['Artigos', 'Crônicas'].includes(article.category)) {
    errors.push('Categoria deve ser "Artigos" ou "Crônicas"');
  }
  
  // Validação de URL de imagem (opcional)
  if (article.imageUrl && typeof article.imageUrl === 'string' && article.imageUrl.trim().length > 0) {
    if (!isValidUrl(article.imageUrl)) {
      errors.push('URL de imagem inválida');
    } else if (article.imageUrl.length > 1000) {
      errors.push('URL de imagem muito longa (máximo 1000 caracteres)');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normaliza dados de um artigo
 */
export function normalizeArticle(article) {
  return {
    title: article.title ? article.title.trim() : '',
    // sanitizeHtml agora preserva formatação básica (negrito, itálico) e remove apenas código perigoso
    body: article.body ? sanitizeHtml(article.body) : '',
    category: article.category || 'Artigos',
    imageUrl: article.imageUrl ? article.imageUrl.trim() : '',
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
  } else if (product.name.length < 3) {
    errors.push('Nome do produto deve ter no mínimo 3 caracteres');
  }
  
  // Validação de preço
  if (product.price === undefined || product.price === null) {
    errors.push('Preço é obrigatório');
  } else if (typeof product.price !== 'number') {
    errors.push('Preço deve ser um número');
  } else if (product.price < 0) {
    errors.push('Preço não pode ser negativo');
  } else if (product.price > 1000000) {
    errors.push('Preço muito alto (máximo R$ 1.000.000,00)');
  }
  
  // Validação de estoque
  if (product.stock === undefined || product.stock === null) {
    errors.push('Estoque é obrigatório');
  } else if (!Number.isInteger(product.stock)) {
    errors.push('Estoque deve ser um número inteiro');
  } else if (product.stock < 0) {
    errors.push('Estoque não pode ser negativo');
  }
  
  // Validação de status ativo
  if (product.active === undefined || product.active === null) {
    errors.push('Status ativo é obrigatório');
  } else if (typeof product.active !== 'boolean') {
    errors.push('Status ativo deve ser verdadeiro ou falso');
  }
  
  // Validação de URL de imagem (opcional)
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim().length > 0) {
    if (!isValidUrl(product.imageUrl)) {
      errors.push('URL de imagem inválida');
    } else if (product.imageUrl.length > 1000) {
      errors.push('URL de imagem muito longa (máximo 1000 caracteres)');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normaliza dados de um produto
 */
export function normalizeProduct(product) {
  return {
    name: product.name ? product.name.trim() : '',
    description: product.description ? product.description.trim() : '',
    price: typeof product.price === 'number' ? product.price : 0,
    stock: Number.isInteger(product.stock) ? product.stock : 0,
    active: typeof product.active === 'boolean' ? product.active : true,
    imageUrl: product.imageUrl ? product.imageUrl.trim() : '',
  };
}
