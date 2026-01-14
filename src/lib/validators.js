/**
 * Biblioteca de validação de dados
 * Validações client-side para melhor UX
 * Validações server-side são feitas via Firestore Rules
 */

/**
 * Valida formato de email
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Valida senha
 */
export function validatePassword(password) {
    const errors = [];
    
    if (!password) {
        return { valid: false, errors: ['Senha é obrigatória'] };
    }
    
    if (password.length < 6) {
        errors.push('Senha deve ter no mínimo 6 caracteres');
    }
    
    if (password.length > 100) {
        errors.push('Senha deve ter no máximo 100 caracteres');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Valida e normaliza artigo
 */
export function validateArticle(data) {
    const errors = [];
    
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
        errors.push('Título é obrigatório');
    } else if (data.title.length > 200) {
        errors.push('Título deve ter no máximo 200 caracteres');
    }
    
    if (!data.body || typeof data.body !== 'string' || data.body.trim().length === 0) {
        errors.push('Conteúdo é obrigatório');
    } else if (data.body.length > 50000) {
        errors.push('Conteúdo deve ter no máximo 50000 caracteres');
    }
    
    if (!data.category || !['Artigos', 'Crônicas'].includes(data.category)) {
        errors.push('Categoria deve ser "Artigos" ou "Crônicas"');
    }
    
    if (data.imageUrl && typeof data.imageUrl === 'string') {
        if (data.imageUrl.length > 1000) {
            errors.push('URL da imagem deve ter no máximo 1000 caracteres');
        }
        if (!data.imageUrl.match(/^https?:\/\//)) {
            errors.push('URL da imagem deve começar com http:// ou https://');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Normaliza dados de artigo
 */
export function normalizeArticle(data) {
    return {
        title: (data.title || '').trim(),
        body: (data.body || '').trim(),
        category: data.category || 'Artigos',
        imageUrl: data.imageUrl ? data.imageUrl.trim() : '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
}

/**
 * Valida e normaliza produto
 */
export function validateProduct(data) {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Nome é obrigatório');
    } else if (data.name.length > 200) {
        errors.push('Nome deve ter no máximo 200 caracteres');
    }
    
    if (data.price === undefined || data.price === null || isNaN(data.price)) {
        errors.push('Preço é obrigatório');
    } else if (data.price < 0) {
        errors.push('Preço não pode ser negativo');
    } else if (data.price > 1000000) {
        errors.push('Preço não pode ser maior que 1.000.000');
    }
    
    if (data.stock === undefined || data.stock === null || isNaN(data.stock)) {
        errors.push('Estoque é obrigatório');
    } else if (data.stock < 0 || !Number.isInteger(Number(data.stock))) {
        errors.push('Estoque deve ser um número inteiro não negativo');
    }
    
    if (typeof data.active !== 'boolean') {
        errors.push('Status ativo deve ser verdadeiro ou falso');
    }
    
    if (data.imageUrl && typeof data.imageUrl === 'string') {
        if (data.imageUrl.length > 1000) {
            errors.push('URL da imagem deve ter no máximo 1000 caracteres');
        }
        if (!data.imageUrl.match(/^https?:\/\//)) {
            errors.push('URL da imagem deve começar com http:// ou https://');
        }
    }
    
    if (data.supplierId && typeof data.supplierId === 'string') {
        if (data.supplierId.length > 200) {
            errors.push('ID do fornecedor deve ter no máximo 200 caracteres');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Normaliza dados de produto
 */
export function normalizeProduct(data) {
    return {
        name: (data.name || '').trim(),
        description: (data.description || '').trim() || '',
        price: Number(data.price) || 0,
        stock: Number.isInteger(Number(data.stock)) ? Number(data.stock) : 0,
        imageUrl: data.imageUrl ? data.imageUrl.trim() : '',
        category: data.category ? data.category.trim() : '',
        supplierId: data.supplierId ? data.supplierId.trim() : '',
        supplierName: data.supplierName ? data.supplierName.trim() : '',
        active: data.active !== undefined ? Boolean(data.active) : true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
}

/**
 * Valida e normaliza fornecedor
 */
export function validateSupplier(data) {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Nome é obrigatório');
    } else if (data.name.length > 200) {
        errors.push('Nome deve ter no máximo 200 caracteres');
    }
    
    if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
        errors.push('Email é obrigatório');
    } else if (!isValidEmail(data.email)) {
        errors.push('Email inválido');
    } else if (data.email.length > 200) {
        errors.push('Email deve ter no máximo 200 caracteres');
    }
    
    if (data.commissionRate === undefined || data.commissionRate === null || isNaN(data.commissionRate)) {
        errors.push('Taxa de comissão é obrigatória');
    } else if (data.commissionRate < 0 || data.commissionRate > 1) {
        errors.push('Taxa de comissão deve estar entre 0 e 1');
    }
    
    if (data.paymentMethod !== 'centralized') {
        errors.push('Método de pagamento deve ser "centralized" na Fase 1');
    }
    
    if (typeof data.active !== 'boolean') {
        errors.push('Status ativo deve ser verdadeiro ou falso');
    }
    
    if (data.phone && typeof data.phone === 'string') {
        if (data.phone.length > 50) {
            errors.push('Telefone deve ter no máximo 50 caracteres');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Normaliza dados de fornecedor
 */
export function normalizeSupplier(data) {
    return {
        name: (data.name || '').trim(),
        email: (data.email || '').trim().toLowerCase(),
        phone: data.phone ? data.phone.trim() : '',
        commissionRate: Number(data.commissionRate) || 0.15,
        paymentMethod: 'centralized',
        active: data.active !== undefined ? Boolean(data.active) : true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
}

