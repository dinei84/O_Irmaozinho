import { describe, it, expect } from 'vitest';
import {
    isValidEmail,
    validatePassword,
    validateArticle,
    normalizeArticle,
    validateProduct,
    normalizeProduct,
    validateSupplier,
    normalizeSupplier
} from '../validators';

describe('validators', () => {
    describe('isValidEmail', () => {
        it('deve retornar true para email válido', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('deve retornar false para email inválido', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('test @example.com')).toBe(false);
        });

        it('deve retornar false para valores não-string', () => {
            expect(isValidEmail(null)).toBe(false);
            expect(isValidEmail(undefined)).toBe(false);
            expect(isValidEmail(123)).toBe(false);
            expect(isValidEmail({})).toBe(false);
        });

        it('deve remover espaços antes de validar', () => {
            expect(isValidEmail(' test@example.com ')).toBe(true);
        });
    });

    describe('validatePassword', () => {
        it('deve validar senha com tamanho correto', () => {
            const result = validatePassword('senha123');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('deve rejeitar senha vazia', () => {
            const result = validatePassword('');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Senha é obrigatória');
        });

        it('deve rejeitar senha muito curta', () => {
            const result = validatePassword('12345');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Senha deve ter no mínimo 6 caracteres');
        });

        it('deve rejeitar senha muito longa', () => {
            const longPassword = 'a'.repeat(101);
            const result = validatePassword(longPassword);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Senha deve ter no máximo 100 caracteres');
        });

        it('deve aceitar senha no limite mínimo', () => {
            const result = validatePassword('123456');
            expect(result.valid).toBe(true);
        });

        it('deve aceitar senha no limite máximo', () => {
            const result = validatePassword('a'.repeat(100));
            expect(result.valid).toBe(true);
        });
    });

    describe('validateArticle', () => {
        const validArticle = {
            title: 'Título do Artigo',
            body: 'Conteúdo do artigo aqui',
            category: 'Artigos'
        };

        it('deve validar artigo completo e válido', () => {
            const result = validateArticle(validArticle);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('deve rejeitar artigo sem título', () => {
            const article = { ...validArticle, title: '' };
            const result = validateArticle(article);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Título é obrigatório');
        });

        it('deve rejeitar título muito longo', () => {
            const article = { ...validArticle, title: 'a'.repeat(201) };
            const result = validateArticle(article);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Título deve ter no máximo 200 caracteres');
        });

        it('deve rejeitar artigo sem conteúdo', () => {
            const article = { ...validArticle, body: '' };
            const result = validateArticle(article);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Conteúdo é obrigatório');
        });

        it('deve rejeitar conteúdo muito longo', () => {
            const article = { ...validArticle, body: 'a'.repeat(50001) };
            const result = validateArticle(article);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Conteúdo deve ter no máximo 50000 caracteres');
        });

        it('deve rejeitar categoria inválida', () => {
            const article = { ...validArticle, category: 'Outra' };
            const result = validateArticle(article);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Categoria deve ser "Artigos" ou "Crônicas"');
        });

        it('deve aceitar categoria Crônicas', () => {
            const article = { ...validArticle, category: 'Crônicas' };
            const result = validateArticle(article);
            expect(result.valid).toBe(true);
        });

        it('deve validar imageUrl quando presente', () => {
            const article = { ...validArticle, imageUrl: 'https://example.com/image.jpg' };
            const result = validateArticle(article);
            expect(result.valid).toBe(true);
        });

        it('deve rejeitar imageUrl inválida', () => {
            const article = { ...validArticle, imageUrl: 'not-a-url' };
            const result = validateArticle(article);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('URL da imagem deve começar com http:// ou https://');
        });

        it('deve rejeitar imageUrl muito longa', () => {
            const article = { ...validArticle, imageUrl: 'https://example.com/' + 'a'.repeat(1000) };
            const result = validateArticle(article);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('URL da imagem deve ter no máximo 1000 caracteres');
        });
    });

    describe('normalizeArticle', () => {
        it('deve normalizar dados de artigo', () => {
            const data = {
                title: '  Título  ',
                body: '  Conteúdo  ',
                category: 'Artigos',
                imageUrl: '  https://example.com/image.jpg  '
            };
            const result = normalizeArticle(data);
            expect(result.title).toBe('Título');
            expect(result.body).toBe('Conteúdo');
            expect(result.category).toBe('Artigos');
            expect(result.imageUrl).toBe('https://example.com/image.jpg');
        });

        it('deve usar categoria padrão quando não informada', () => {
            const data = { title: 'Título', body: 'Conteúdo' };
            const result = normalizeArticle(data);
            expect(result.category).toBe('Artigos');
        });

        it('deve manter campos de timestamp quando presentes', () => {
            const timestamp = { seconds: 1234567890 };
            const data = { title: 'Título', body: 'Conteúdo', createdAt: timestamp };
            const result = normalizeArticle(data);
            expect(result.createdAt).toBe(timestamp);
        });
    });

    describe('validateProduct', () => {
        const validProduct = {
            name: 'Produto Teste',
            price: 99.99,
            stock: 10,
            active: true
        };

        it('deve validar produto completo e válido', () => {
            const result = validateProduct(validProduct);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('deve rejeitar produto sem nome', () => {
            const product = { ...validProduct, name: '' };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Nome é obrigatório');
        });

        it('deve rejeitar nome muito longo', () => {
            const product = { ...validProduct, name: 'a'.repeat(201) };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Nome deve ter no máximo 200 caracteres');
        });

        it('deve rejeitar preço inválido', () => {
            expect(validateProduct({ ...validProduct, price: null }).valid).toBe(false);
            expect(validateProduct({ ...validProduct, price: undefined }).valid).toBe(false);
            expect(validateProduct({ ...validProduct, price: NaN }).valid).toBe(false);
        });

        it('deve rejeitar preço negativo', () => {
            const product = { ...validProduct, price: -10 };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Preço não pode ser negativo');
        });

        it('deve rejeitar preço muito alto', () => {
            const product = { ...validProduct, price: 1000001 };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Preço não pode ser maior que 1.000.000');
        });

        it('deve rejeitar estoque inválido', () => {
            expect(validateProduct({ ...validProduct, stock: null }).valid).toBe(false);
            expect(validateProduct({ ...validProduct, stock: undefined }).valid).toBe(false);
            expect(validateProduct({ ...validProduct, stock: NaN }).valid).toBe(false);
        });

        it('deve rejeitar estoque negativo', () => {
            const product = { ...validProduct, stock: -1 };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Estoque deve ser um número inteiro não negativo');
        });

        it('deve rejeitar estoque não inteiro', () => {
            const product = { ...validProduct, stock: 10.5 };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Estoque deve ser um número inteiro não negativo');
        });

        it('deve rejeitar active não booleano', () => {
            const product = { ...validProduct, active: 'true' };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Status ativo deve ser verdadeiro ou falso');
        });

        it('deve validar imageUrl quando presente', () => {
            const product = { ...validProduct, imageUrl: 'https://example.com/image.jpg' };
            const result = validateProduct(product);
            expect(result.valid).toBe(true);
        });

        it('deve rejeitar imageUrl inválida', () => {
            const product = { ...validProduct, imageUrl: 'not-a-url' };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('URL da imagem deve começar com http:// ou https://');
        });

        it('deve validar supplierId quando presente', () => {
            const product = { ...validProduct, supplierId: 'supplier123' };
            const result = validateProduct(product);
            expect(result.valid).toBe(true);
        });

        it('deve rejeitar supplierId muito longo', () => {
            const product = { ...validProduct, supplierId: 'a'.repeat(201) };
            const result = validateProduct(product);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('ID do fornecedor deve ter no máximo 200 caracteres');
        });
    });

    describe('normalizeProduct', () => {
        it('deve normalizar dados de produto', () => {
            const data = {
                name: '  Produto  ',
                description: '  Descrição  ',
                price: '99.99',
                stock: '10',
                imageUrl: '  https://example.com/image.jpg  ',
                category: '  Categoria  ',
                supplierId: '  supplier123  ',
                supplierName: '  Fornecedor  ',
                active: true
            };
            const result = normalizeProduct(data);
            expect(result.name).toBe('Produto');
            expect(result.description).toBe('Descrição');
            expect(result.price).toBe(99.99);
            expect(result.stock).toBe(10);
            expect(result.imageUrl).toBe('https://example.com/image.jpg');
            expect(result.category).toBe('Categoria');
            expect(result.supplierId).toBe('supplier123');
            expect(result.supplierName).toBe('Fornecedor');
            expect(result.active).toBe(true);
        });

        it('deve usar valores padrão quando não informados', () => {
            const data = { name: 'Produto', price: 10, stock: 5 };
            const result = normalizeProduct(data);
            expect(result.description).toBe('');
            expect(result.imageUrl).toBe('');
            expect(result.category).toBe('');
            expect(result.supplierId).toBe('');
            expect(result.supplierName).toBe('');
            expect(result.active).toBe(true);
        });

        it('deve converter price para número', () => {
            const data = { name: 'Produto', price: '99.99', stock: 10 };
            const result = normalizeProduct(data);
            expect(result.price).toBe(99.99);
            expect(typeof result.price).toBe('number');
        });

        it('deve converter stock para inteiro', () => {
            const data = { name: 'Produto', price: 10, stock: '10' };
            const result = normalizeProduct(data);
            expect(result.stock).toBe(10);
            expect(Number.isInteger(result.stock)).toBe(true);
        });
    });

    describe('validateSupplier', () => {
        const validSupplier = {
            name: 'Fornecedor Teste',
            email: 'fornecedor@example.com',
            commissionRate: 0.15,
            paymentMethod: 'centralized',
            active: true
        };

        it('deve validar fornecedor completo e válido', () => {
            const result = validateSupplier(validSupplier);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('deve rejeitar fornecedor sem nome', () => {
            const supplier = { ...validSupplier, name: '' };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Nome é obrigatório');
        });

        it('deve rejeitar nome muito longo', () => {
            const supplier = { ...validSupplier, name: 'a'.repeat(201) };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Nome deve ter no máximo 200 caracteres');
        });

        it('deve rejeitar fornecedor sem email', () => {
            const supplier = { ...validSupplier, email: '' };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Email é obrigatório');
        });

        it('deve rejeitar email inválido', () => {
            const supplier = { ...validSupplier, email: 'invalid-email' };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Email inválido');
        });

        it('deve rejeitar email muito longo', () => {
            const supplier = { ...validSupplier, email: 'a'.repeat(200) + '@example.com' };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Email deve ter no máximo 200 caracteres');
        });

        it('deve rejeitar commissionRate inválido', () => {
            expect(validateSupplier({ ...validSupplier, commissionRate: null }).valid).toBe(false);
            expect(validateSupplier({ ...validSupplier, commissionRate: undefined }).valid).toBe(false);
        });

        it('deve rejeitar commissionRate fora do range', () => {
            expect(validateSupplier({ ...validSupplier, commissionRate: -0.1 }).valid).toBe(false);
            expect(validateSupplier({ ...validSupplier, commissionRate: 1.1 }).valid).toBe(false);
        });

        it('deve aceitar commissionRate nos limites', () => {
            expect(validateSupplier({ ...validSupplier, commissionRate: 0 }).valid).toBe(true);
            expect(validateSupplier({ ...validSupplier, commissionRate: 1 }).valid).toBe(true);
        });

        it('deve rejeitar paymentMethod diferente de centralized', () => {
            const supplier = { ...validSupplier, paymentMethod: 'direct' };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Método de pagamento deve ser "centralized" na Fase 1');
        });

        it('deve rejeitar active não booleano', () => {
            const supplier = { ...validSupplier, active: 'true' };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Status ativo deve ser verdadeiro ou falso');
        });

        it('deve validar telefone quando presente', () => {
            const supplier = { ...validSupplier, phone: '11999999999' };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(true);
        });

        it('deve rejeitar telefone muito longo', () => {
            const supplier = { ...validSupplier, phone: 'a'.repeat(51) };
            const result = validateSupplier(supplier);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Telefone deve ter no máximo 50 caracteres');
        });
    });

    describe('normalizeSupplier', () => {
        it('deve normalizar dados de fornecedor', () => {
            const data = {
                name: '  Fornecedor  ',
                email: '  FORNECEDOR@EXAMPLE.COM  ',
                phone: '  11999999999  ',
                commissionRate: '0.15',
                paymentMethod: 'centralized',
                active: true
            };
            const result = normalizeSupplier(data);
            expect(result.name).toBe('Fornecedor');
            expect(result.email).toBe('fornecedor@example.com');
            expect(result.phone).toBe('11999999999');
            expect(result.commissionRate).toBe(0.15);
            expect(result.paymentMethod).toBe('centralized');
            expect(result.active).toBe(true);
        });

        it('deve usar valores padrão quando não informados', () => {
            const data = { name: 'Fornecedor', email: 'test@example.com' };
            const result = normalizeSupplier(data);
            expect(result.phone).toBe('');
            expect(result.commissionRate).toBe(0.15);
            expect(result.paymentMethod).toBe('centralized');
            expect(result.active).toBe(true);
        });

        it('deve converter email para lowercase', () => {
            const data = { name: 'Fornecedor', email: 'TEST@EXAMPLE.COM' };
            const result = normalizeSupplier(data);
            expect(result.email).toBe('test@example.com');
        });
    });
});
