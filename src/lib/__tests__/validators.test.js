import { describe, it, expect } from 'vitest';
import {
  validateArticle,
  validateProduct,
  isValidUrl,
  normalizeArticle,
  normalizeProduct,
} from '../validators';

describe('Validators', () => {
  describe('isValidUrl', () => {
    it('deve retornar true para URLs válidas', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/image.jpg')).toBe(true);
    });

    it('deve retornar false para URLs inválidas', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });
  });

  describe('validateArticle', () => {
    it('deve validar artigo válido', () => {
      const article = {
        title: 'Título do Artigo',
        body: 'Este é o conteúdo do artigo que tem mais de 10 caracteres.',
        category: 'Artigos',
        imageUrl: 'https://example.com/image.jpg',
      };

      const result = validateArticle(article);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar artigo sem título', () => {
      const article = {
        title: '',
        body: 'Conteúdo válido',
        category: 'Artigos',
      };

      const result = validateArticle(article);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título é obrigatório');
    });

    it('deve rejeitar título muito longo', () => {
      const article = {
        title: 'A'.repeat(201),
        body: 'Conteúdo válido',
        category: 'Artigos',
      };

      const result = validateArticle(article);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título deve ter no máximo 200 caracteres');
    });

    it('deve rejeitar artigo sem conteúdo', () => {
      const article = {
        title: 'Título válido',
        body: '',
        category: 'Artigos',
      };

      const result = validateArticle(article);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Conteúdo é obrigatório');
    });

    it('deve rejeitar conteúdo muito grande', () => {
      const article = {
        title: 'Título válido',
        body: 'A'.repeat(50001),
        category: 'Artigos',
      };

      const result = validateArticle(article);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Conteúdo muito grande (máximo 50.000 caracteres)');
    });

    it('deve rejeitar categoria inválida', () => {
      const article = {
        title: 'Título válido',
        body: 'Conteúdo válido',
        category: 'Categoria Inválida',
      };

      const result = validateArticle(article);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Categoria'))).toBe(true);
    });

    it('deve rejeitar URL de imagem inválida', () => {
      const article = {
        title: 'Título válido',
        body: 'Conteúdo válido',
        category: 'Artigos',
        imageUrl: 'not-a-url',
      };

      const result = validateArticle(article);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('URL de imagem'))).toBe(true);
    });
  });

  describe('validateProduct', () => {
    it('deve validar produto válido', () => {
      const product = {
        name: 'Produto Teste',
        price: 29.90,
        stock: 10,
        active: true,
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar produto sem nome', () => {
      const product = {
        name: '',
        price: 29.90,
        stock: 10,
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome do produto é obrigatório');
    });

    it('deve rejeitar preço negativo', () => {
      const product = {
        name: 'Produto Teste',
        price: -10,
        stock: 10,
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Preço não pode ser negativo');
    });

    it('deve rejeitar estoque negativo', () => {
      const product = {
        name: 'Produto Teste',
        price: 29.90,
        stock: -1,
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estoque não pode ser negativo');
    });

    it('deve aceitar produto sem estoque definido', () => {
      const product = {
        name: 'Produto Teste',
        price: 29.90,
      };

      const result = validateProduct(product);
      // Não deve dar erro se stock não estiver definido
      expect(result.errors.filter(e => e.includes('Estoque'))).toHaveLength(0);
    });
  });

  describe('normalizeArticle', () => {
    it('deve normalizar espaços em branco', () => {
      const article = {
        title: '  Título com espaços  ',
        body: '  Conteúdo com espaços  ',
        category: 'Artigos',
        imageUrl: '  https://example.com  ',
      };

      const normalized = normalizeArticle(article);
      expect(normalized.title).toBe('Título com espaços');
      expect(normalized.body).toBe('  Conteúdo com espaços  '); // body mantém espaços
      expect(normalized.imageUrl).toBe('https://example.com');
    });
  });

  describe('normalizeProduct', () => {
    it('deve converter string para número', () => {
      const product = {
        name: 'Produto',
        price: '29.90',
        stock: '10',
      };

      const normalized = normalizeProduct(product);
      expect(normalized.price).toBe(29.90);
      expect(normalized.stock).toBe(10);
      expect(typeof normalized.price).toBe('number');
      expect(typeof normalized.stock).toBe('number');
    });

    it('deve definir valores padrão', () => {
      const product = {
        name: 'Produto',
      };

      const normalized = normalizeProduct(product);
      expect(normalized.price).toBe(0);
      expect(normalized.stock).toBe(0);
      expect(normalized.active).toBe(true);
      expect(normalized.category).toBe('Outros');
    });
  });
});

