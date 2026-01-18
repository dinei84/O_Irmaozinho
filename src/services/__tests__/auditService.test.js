import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    AUDIT_ACTIONS,
    logArticleAction,
    logProductAction,
    logSupplierAction
} from '../auditService';
import { db } from '../../lib/firebase';

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        addDoc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP')
    };
});

vi.mock('../../lib/firebase', () => ({
    db: {}
}));

describe('auditService', () => {
    const mockCollectionRef = {};
    const mockUserId = 'user123';
    const mockTargetId = 'target123';
    const mockMetadata = { title: 'Test Article' };

    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, 'location', {
            value: { href: 'https://example.com' },
            writable: true
        });
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 Test',
            writable: true
        });
        collection.mockReturnValue(mockCollectionRef);
    });

    describe('AUDIT_ACTIONS', () => {
        it('deve conter todas as ações de auditoria', () => {
            expect(AUDIT_ACTIONS).toHaveProperty('ARTICLE_CREATED');
            expect(AUDIT_ACTIONS).toHaveProperty('ARTICLE_UPDATED');
            expect(AUDIT_ACTIONS).toHaveProperty('ARTICLE_DELETED');
            expect(AUDIT_ACTIONS).toHaveProperty('PRODUCT_CREATED');
            expect(AUDIT_ACTIONS).toHaveProperty('PRODUCT_UPDATED');
            expect(AUDIT_ACTIONS).toHaveProperty('PRODUCT_DELETED');
            expect(AUDIT_ACTIONS).toHaveProperty('SUPPLIER_CREATED');
            expect(AUDIT_ACTIONS).toHaveProperty('SUPPLIER_UPDATED');
            expect(AUDIT_ACTIONS).toHaveProperty('SUPPLIER_DELETED');
            expect(AUDIT_ACTIONS).toHaveProperty('USER_ROLE_CHANGED');
        });
    });

    describe('logArticleAction', () => {
        it('deve registrar ação de auditoria para artigo', async () => {
            addDoc.mockResolvedValue();

            await logArticleAction(
                AUDIT_ACTIONS.ARTICLE_CREATED,
                mockUserId,
                mockTargetId,
                mockMetadata
            );

            expect(collection).toHaveBeenCalledWith(db, 'audit_logs');
            expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
                action: AUDIT_ACTIONS.ARTICLE_CREATED,
                userId: mockUserId,
                targetId: mockTargetId,
                targetType: 'article',
                metadata: mockMetadata,
                timestamp: 'MOCK_TIMESTAMP',
                userAgent: 'Mozilla/5.0 Test',
                url: 'https://example.com'
            });
        });

        it('deve usar metadata vazio quando não fornecido', async () => {
            addDoc.mockResolvedValue();

            await logArticleAction(
                AUDIT_ACTIONS.ARTICLE_UPDATED,
                mockUserId,
                mockTargetId
            );

            expect(addDoc).toHaveBeenCalledWith(
                mockCollectionRef,
                expect.objectContaining({ metadata: {} })
            );
        });

        it('não deve lançar erro quando addDoc falha', async () => {
            const mockError = new Error('Firestore error');
            addDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(
                logArticleAction(AUDIT_ACTIONS.ARTICLE_DELETED, mockUserId, mockTargetId)
            ).resolves.not.toThrow();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Erro ao registrar log de auditoria:',
                mockError
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('logProductAction', () => {
        it('deve registrar ação de auditoria para produto', async () => {
            addDoc.mockResolvedValue();

            await logProductAction(
                AUDIT_ACTIONS.PRODUCT_CREATED,
                mockUserId,
                mockTargetId,
                mockMetadata
            );

            expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
                action: AUDIT_ACTIONS.PRODUCT_CREATED,
                userId: mockUserId,
                targetId: mockTargetId,
                targetType: 'product',
                metadata: mockMetadata,
                timestamp: 'MOCK_TIMESTAMP',
                userAgent: 'Mozilla/5.0 Test',
                url: 'https://example.com'
            });
        });

        it('não deve lançar erro quando addDoc falha', async () => {
            const mockError = new Error('Firestore error');
            addDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(
                logProductAction(AUDIT_ACTIONS.PRODUCT_DELETED, mockUserId, mockTargetId)
            ).resolves.not.toThrow();

            consoleErrorSpy.mockRestore();
        });
    });

    describe('logSupplierAction', () => {
        it('deve registrar ação de auditoria para fornecedor', async () => {
            addDoc.mockResolvedValue();

            await logSupplierAction(
                AUDIT_ACTIONS.SUPPLIER_CREATED,
                mockUserId,
                mockTargetId,
                mockMetadata
            );

            expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
                action: AUDIT_ACTIONS.SUPPLIER_CREATED,
                userId: mockUserId,
                targetId: mockTargetId,
                targetType: 'supplier',
                metadata: mockMetadata,
                timestamp: 'MOCK_TIMESTAMP',
                userAgent: 'Mozilla/5.0 Test',
                url: 'https://example.com'
            });
        });

        it('não deve lançar erro quando addDoc falha', async () => {
            const mockError = new Error('Firestore error');
            addDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(
                logSupplierAction(AUDIT_ACTIONS.SUPPLIER_DELETED, mockUserId, mockTargetId)
            ).resolves.not.toThrow();

            consoleErrorSpy.mockRestore();
        });
    });
});
