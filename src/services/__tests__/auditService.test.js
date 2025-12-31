import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  logAudit,
  logArticleAction,
  logProductAction,
  AUDIT_ACTIONS
} from '../auditService';

// Mock do Firebase Firestore
const mockAddDoc = vi.fn();
const mockCollection = vi.fn(() => 'mock-collection-ref');
const mockServerTimestamp = vi.fn(() => 'mock-server-timestamp');

vi.mock('firebase/firestore', () => ({
  collection: (...args) => {
    mockCollection(...args);
    return 'mock-collection-ref';
  },
  addDoc: async (...args) => {
    await mockAddDoc(...args);
    return Promise.resolve();
  },
  serverTimestamp: () => mockServerTimestamp(),
  getFirestore: vi.fn(),
}));

// Mock do módulo firebase.js
vi.mock('../../lib/firebase', () => ({
  db: 'mock-db',
}));

describe('AuditService', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    vi.clearAllMocks();
    // Resetar console.warn e console.error
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('AUDIT_ACTIONS', () => {
    it('deve ter todas as ações definidas', () => {
      expect(AUDIT_ACTIONS).toHaveProperty('ARTICLE_CREATED');
      expect(AUDIT_ACTIONS).toHaveProperty('ARTICLE_UPDATED');
      expect(AUDIT_ACTIONS).toHaveProperty('ARTICLE_DELETED');
      expect(AUDIT_ACTIONS).toHaveProperty('PRODUCT_CREATED');
      expect(AUDIT_ACTIONS).toHaveProperty('PRODUCT_UPDATED');
      expect(AUDIT_ACTIONS).toHaveProperty('PRODUCT_DELETED');
      expect(AUDIT_ACTIONS).toHaveProperty('USER_LOGIN');
      expect(AUDIT_ACTIONS).toHaveProperty('USER_LOGOUT');
      expect(AUDIT_ACTIONS).toHaveProperty('ORDER_CREATED');
      expect(AUDIT_ACTIONS).toHaveProperty('ORDER_UPDATED');
    });

    it('deve ter valores corretos para cada ação', () => {
      expect(AUDIT_ACTIONS.ARTICLE_CREATED).toBe('article_created');
      expect(AUDIT_ACTIONS.ARTICLE_UPDATED).toBe('article_updated');
      expect(AUDIT_ACTIONS.ARTICLE_DELETED).toBe('article_deleted');
      expect(AUDIT_ACTIONS.PRODUCT_CREATED).toBe('product_created');
      expect(AUDIT_ACTIONS.PRODUCT_UPDATED).toBe('product_updated');
      expect(AUDIT_ACTIONS.PRODUCT_DELETED).toBe('product_deleted');
    });
  });

  describe('logAudit', () => {
    it('deve registrar auditoria com dados mínimos', async () => {
      const action = AUDIT_ACTIONS.ARTICLE_CREATED;
      const userId = 'user123';

      await logAudit(action, userId);

      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'audit_logs');
      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection-ref', expect.objectContaining({
        action,
        userId,
        targetId: null,
        metadata: {},
        timestamp: 'mock-server-timestamp',
        ip: null,
        // userAgent pode ser null ou o userAgent do jsdom
      }));
      // Verificar que userAgent existe (pode ser null ou string)
      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs).toHaveProperty('userAgent');
      expect(callArgs.userAgent === null || typeof callArgs.userAgent === 'string').toBe(true);
    });

    it('deve registrar auditoria com targetId', async () => {
      const action = AUDIT_ACTIONS.ARTICLE_UPDATED;
      const userId = 'user123';
      const targetId = 'article456';

      await logAudit(action, userId, targetId);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          action,
          userId,
          targetId,
        })
      );
    });

    it('deve registrar auditoria com metadata', async () => {
      const action = AUDIT_ACTIONS.PRODUCT_CREATED;
      const userId = 'user123';
      const targetId = 'product789';
      const metadata = {
        name: 'Produto Teste',
        price: 29.90,
      };

      await logAudit(action, userId, targetId, metadata);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          action,
          userId,
          targetId,
          metadata,
        })
      );
    });

    it('deve incluir ip e userAgent do metadata', async () => {
      const action = AUDIT_ACTIONS.USER_LOGIN;
      const userId = 'user123';
      const metadata = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      await logAudit(action, userId, null, metadata);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        })
      );
    });

    it('deve usar userAgent do navigator se não fornecido no metadata', async () => {
      // Salvar o navigator original
      const originalNavigator = global.navigator;
      
      // Simular navigator
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Test User Agent',
        },
        writable: true,
        configurable: true,
      });

      try {
        const action = AUDIT_ACTIONS.USER_LOGIN;
        const userId = 'user123';

        await logAudit(action, userId);

        expect(mockAddDoc).toHaveBeenCalledWith(
          'mock-collection-ref',
          expect.objectContaining({
            userAgent: 'Test User Agent',
          })
        );
      } finally {
        // Restaurar o navigator original
        Object.defineProperty(global, 'navigator', {
          value: originalNavigator,
          writable: true,
          configurable: true,
        });
      }
    });

    it('deve retornar undefined e logar warning se action não for fornecido', async () => {
      const result = await logAudit(null, 'user123');

      expect(result).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        'Auditoria: action e userId são obrigatórios'
      );
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('deve retornar undefined e logar warning se userId não for fornecido', async () => {
      const result = await logAudit(AUDIT_ACTIONS.ARTICLE_CREATED, null);

      expect(result).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        'Auditoria: action e userId são obrigatórios'
      );
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('deve retornar undefined e logar warning se ambos forem vazios', async () => {
      const result = await logAudit('', '');

      expect(result).toBeUndefined();
      expect(console.warn).toHaveBeenCalled();
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('deve tratar erros sem quebrar a aplicação', async () => {
      // Simular erro no addDoc
      mockAddDoc.mockRejectedValueOnce(new Error('Firebase error'));

      const action = AUDIT_ACTIONS.ARTICLE_CREATED;
      const userId = 'user123';

      // Não deve lançar erro
      await expect(logAudit(action, userId)).resolves.toBeUndefined();

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao registrar auditoria:',
        expect.any(Error)
      );
    });
  });

  describe('logArticleAction', () => {
    it('deve chamar logAudit com resourceType article', async () => {
      const action = AUDIT_ACTIONS.ARTICLE_CREATED;
      const userId = 'user123';
      const articleId = 'article456';
      const metadata = { title: 'Título do Artigo' };

      await logArticleAction(action, userId, articleId, metadata);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          action,
          userId,
          targetId: articleId,
          metadata: expect.objectContaining({
            ...metadata,
            resourceType: 'article',
          }),
        })
      );
    });

    it('deve funcionar sem metadata', async () => {
      const action = AUDIT_ACTIONS.ARTICLE_DELETED;
      const userId = 'user123';
      const articleId = 'article789';

      await logArticleAction(action, userId, articleId);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          metadata: expect.objectContaining({
            resourceType: 'article',
          }),
        })
      );
    });

    it('deve preservar metadata existente e adicionar resourceType', async () => {
      const action = AUDIT_ACTIONS.ARTICLE_UPDATED;
      const userId = 'user123';
      const articleId = 'article456';
      const metadata = {
        title: 'Título',
        category: 'Artigos',
      };

      await logArticleAction(action, userId, articleId, metadata);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          metadata: {
            title: 'Título',
            category: 'Artigos',
            resourceType: 'article',
          },
        })
      );
    });
  });

  describe('logProductAction', () => {
    it('deve chamar logAudit com resourceType product', async () => {
      const action = AUDIT_ACTIONS.PRODUCT_CREATED;
      const userId = 'user123';
      const productId = 'product456';
      const metadata = { name: 'Produto Teste', price: 29.90 };

      await logProductAction(action, userId, productId, metadata);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          action,
          userId,
          targetId: productId,
          metadata: expect.objectContaining({
            ...metadata,
            resourceType: 'product',
          }),
        })
      );
    });

    it('deve funcionar sem metadata', async () => {
      const action = AUDIT_ACTIONS.PRODUCT_DELETED;
      const userId = 'user123';
      const productId = 'product789';

      await logProductAction(action, userId, productId);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          metadata: expect.objectContaining({
            resourceType: 'product',
          }),
        })
      );
    });

    it('deve preservar metadata existente e adicionar resourceType', async () => {
      const action = AUDIT_ACTIONS.PRODUCT_UPDATED;
      const userId = 'user123';
      const productId = 'product456';
      const metadata = {
        name: 'Produto',
        price: 99.90,
        stock: 10,
      };

      await logProductAction(action, userId, productId, metadata);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({
          metadata: {
            name: 'Produto',
            price: 99.90,
            stock: 10,
            resourceType: 'product',
          },
        })
      );
    });
  });

  describe('Integração', () => {
    it('deve registrar múltiplas ações independentemente', async () => {
      await logAudit(AUDIT_ACTIONS.ARTICLE_CREATED, 'user1', 'article1');
      await logAudit(AUDIT_ACTIONS.PRODUCT_CREATED, 'user2', 'product1');
      await logAudit(AUDIT_ACTIONS.USER_LOGIN, 'user1');

      expect(mockAddDoc).toHaveBeenCalledTimes(3);
    });

    it('deve usar serverTimestamp em todas as chamadas', async () => {
      await logAudit(AUDIT_ACTIONS.ARTICLE_CREATED, 'user1', 'article1');
      await logArticleAction(AUDIT_ACTIONS.ARTICLE_UPDATED, 'user1', 'article1');
      await logProductAction(AUDIT_ACTIONS.PRODUCT_CREATED, 'user1', 'product1');

      // Verificar que serverTimestamp foi chamado 3 vezes
      expect(mockServerTimestamp).toHaveBeenCalledTimes(3);
      
      // Verificar que todas as chamadas incluem timestamp
      expect(mockAddDoc).toHaveBeenCalledTimes(3);
      mockAddDoc.mock.calls.forEach(call => {
        expect(call[1]).toHaveProperty('timestamp', 'mock-server-timestamp');
      });
    });
  });
});

