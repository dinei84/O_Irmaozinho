export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

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

export function normalizeArticle(data) {
    const normalized = {
        title: (data.title || '').trim(),
        body: (data.body || '').trim(),
        category: data.category || 'Artigos'
    };

    if (data.imageUrl && data.imageUrl.trim()) {
        normalized.imageUrl = data.imageUrl.trim();
    }

    return normalized;
}

export function validateProduct(data) {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Nome é obrigatório');
    } else if (data.name.length > 200) {
        errors.push('Nome deve ter no máximo 200 caracteres');
    }
    
    // Preço é obrigatório
    const priceNum = Number(data.price);
    if (data.price === undefined || data.price === null || data.price === '' || isNaN(priceNum)) {
        errors.push('Preço é obrigatório');
    } else if (priceNum < 0) {
        errors.push('Preço não pode ser negativo');
    } else if (priceNum > 1000000) {
        errors.push('Preço não pode ser maior que 1.000.000');
    }
    
    // Estoque é opcional, mas se fornecido deve ser válido
    if (data.stock !== undefined && data.stock !== null && data.stock !== '') {
        const stockNum = Number(data.stock);
        if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
            errors.push('Estoque deve ser um número inteiro não negativo');
        }
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
    
    // SupplierId é obrigatório
    if (!data.supplierId || typeof data.supplierId !== 'string' || data.supplierId.trim().length === 0) {
        errors.push('Fornecedor é obrigatório');
    } else if (data.supplierId.length > 200) {
        errors.push('ID do fornecedor deve ter no máximo 200 caracteres');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

export function normalizeProduct(data) {
    const normalized = {
        name: (data.name || '').trim(),
        description: (data.description || '').trim() || '',
        price: Number(data.price) || 0,
        stock: Number.isInteger(Number(data.stock)) ? Number(data.stock) : 0,
        category: data.category ? data.category.trim() : '',
        supplierId: data.supplierId ? data.supplierId.trim() : '',
        supplierName: data.supplierName ? data.supplierName.trim() : '',
        active: data.active !== undefined ? Boolean(data.active) : true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };

    if (data.imageUrl && data.imageUrl.trim()) {
        normalized.imageUrl = data.imageUrl.trim();
    }

    return normalized;
}

export function validateSupplier(data) {
    const errors = [];
    
    // Validações básicas
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
    
    if (data.phone && typeof data.phone === 'string') {
        if (data.phone.length > 50) {
            errors.push('Telefone deve ter no máximo 50 caracteres');
        }
    }
    
    // Tipo de fornecedor
    const validTypes = ['own', 'third_party'];
    if (!data.type || !validTypes.includes(data.type)) {
        errors.push('Tipo de fornecedor deve ser "own" (próprio) ou "third_party" (terceiro)');
    }
    
    // Taxa de comissão
    if (data.commissionRate === undefined || data.commissionRate === null || isNaN(data.commissionRate)) {
        errors.push('Taxa de comissão é obrigatória');
    } else if (data.commissionRate < 0 || data.commissionRate > 1) {
        errors.push('Taxa de comissão deve estar entre 0 e 1');
    }
    
    // Validação: fornecedor próprio deve ter comissão 0
    if (data.type === 'own' && data.commissionRate !== 0) {
        errors.push('Fornecedor próprio deve ter comissão de 0%');
    }
    
    // Método de pedido
    const validOrderMethods = ['direct_sale', 'email', 'api'];
    if (!data.orderMethod || !validOrderMethods.includes(data.orderMethod)) {
        errors.push('Método de pedido é obrigatório (direct_sale, email ou api)');
    }
    
    // Se método é email, precisa ter orderEmail
    if (data.orderMethod === 'email') {
        if (!data.orderEmail || !isValidEmail(data.orderEmail)) {
            errors.push('Email para pedidos é obrigatório quando método é "email"');
        }
    }
    
    // Forma de pagamento
    const validPaymentMethods = ['none', 'centralized', 'split'];
    if (!data.paymentMethod || !validPaymentMethods.includes(data.paymentMethod)) {
        errors.push('Forma de pagamento deve ser "none", "centralized" ou "split"');
    }
    
    // Validação: fornecedor próprio deve ter paymentMethod "none"
    if (data.type === 'own' && data.paymentMethod !== 'none') {
        errors.push('Fornecedor próprio deve ter forma de pagamento "none"');
    }
    
    // Se paymentMethod é centralized, validar bankAccount (opcional, mas recomendado)
    // Nota: Dados bancários são opcionais para permitir cadastro inicial
    // Admin pode preencher depois se necessário
    if (data.paymentMethod === 'centralized' && data.bankAccount && 
        (data.bankAccount.accountHolder || data.bankAccount.account)) {
        // Se começou a preencher, valida que os campos essenciais estão preenchidos
        if (!data.bankAccount.accountHolder || !data.bankAccount.account) {
            errors.push('Dados bancários incompletos: preencha pelo menos Titular e Conta');
        }
    }
    
    // Status
    if (typeof data.active !== 'boolean') {
        errors.push('Status ativo deve ser verdadeiro ou falso');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

export function normalizeSupplier(data) {
    // Determinar valores padrão baseados no tipo
    const type = data.type || (data.isDefault ? 'own' : 'third_party');
    const isDefault = data.isDefault || (type === 'own');
    
    // Comissão padrão: 0 para próprio, 0.15 para terceiro
    const defaultCommissionRate = type === 'own' ? 0 : 0.15;
    
    // Payment method padrão: none para próprio, centralized para terceiro
    const defaultPaymentMethod = type === 'own' ? 'none' : 'centralized';
    
    // Order method padrão: direct_sale para próprio, email para terceiro
    const defaultOrderMethod = type === 'own' ? 'direct_sale' : (data.orderMethod || 'email');
    
    // Se tipo é 'own', forçar valores corretos
    const finalCommissionRate = type === 'own' ? 0 : (data.commissionRate !== undefined ? Number(data.commissionRate) : defaultCommissionRate);
    const finalPaymentMethod = type === 'own' ? 'none' : (data.paymentMethod || defaultPaymentMethod);
    const finalOrderMethod = type === 'own' ? 'direct_sale' : (data.orderMethod || defaultOrderMethod);
    
    return {
        name: (data.name || '').trim(),
        email: (data.email || '').trim().toLowerCase(),
        phone: data.phone ? data.phone.trim() : '',
        type: type,
        isDefault: isDefault,
        orderMethod: finalOrderMethod,
        orderEmail: data.orderEmail ? data.orderEmail.trim().toLowerCase() : '',
        orderEmailTemplate: data.orderEmailTemplate ? data.orderEmailTemplate.trim() : '',
        commissionRate: finalCommissionRate,
        paymentMethod: finalPaymentMethod,
        bankAccount: (data.bankAccount && typeof data.bankAccount === 'object' && 
                      (data.bankAccount.accountHolder || data.bankAccount.account || 
                       data.bankAccount.agency || data.bankAccount.bank)) ? {
            bank: (data.bankAccount.bank || '').trim(),
            agency: (data.bankAccount.agency || '').trim(),
            account: (data.bankAccount.account || '').trim(),
            accountType: data.bankAccount.accountType || 'checking',
            accountHolder: (data.bankAccount.accountHolder || '').trim(),
            taxId: (data.bankAccount.taxId || '').trim(),
            pixKey: data.bankAccount.pixKey ? (data.bankAccount.pixKey || '').trim() : null
        } : null,
        verified: data.verified !== undefined ? Boolean(data.verified) : false,
        active: data.active !== undefined ? Boolean(data.active) : true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
}

export function validateComment(content) {
    const errors = [];
    
    if (!content || typeof content !== 'string') {
        return { valid: false, errors: ['Comentário é obrigatório'] };
    }
    
    const trimmed = content.trim();
    
    if (trimmed.length < 3) {
        errors.push('Comentário deve ter no mínimo 3 caracteres');
    }
    
    if (trimmed.length > 500) {
        errors.push('Comentário deve ter no máximo 500 caracteres');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

export function normalizeComment(content) {
    return (content || '').trim();
}
