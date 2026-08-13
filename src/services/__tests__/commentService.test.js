import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createComment,
    getComments,
    getCommentsCount,
    updateComment,
    deleteComment
} from '../commentService';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    runTransaction,
    increment,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        doc: vi.fn(),
        getDoc: vi.fn(),
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        limit: vi.fn(),
        startAfter: vi.fn(),
        getDocs: vi.fn(),
        runTransaction: vi.fn(),
        increment: vi.fn((value) => ({ type: 'increment', value })),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
        updateDoc: vi.fn()
    };
});

vi.mock('../../lib/firebase', () => ({
    db: {}
}));

describe('commentService', () => {
    const mockCommentRef = {};
    const mockArticleRef = {};
    const mockCommentDocRef = {};
    const mockArticleId = 'article123';
    const mockUserId = 'user123';
    const mockUserData = {
        displayName: 'Test User',
        photoURL: 'https://example.com/avatar.jpg'
    };
    const mockContent = 'Este é um comentário de teste';

    const mockArticleDoc = {
        exists: vi.fn(() => true),
        data: vi.fn(() => ({
            title: 'Test Article',
            body: 'Article content',
            commentsCount: 5
        }))
    };

    const mockCommentDoc = {
        id: 'comment123',
        exists: vi.fn(() => true),
        data: vi.fn(() => ({
            articleId: mockArticleId,
            userId: mockUserId,
            userName: 'Test User',
            userAvatar: 'https://example.com/avatar.jpg',
            content: mockContent,
            createdAt: { toMillis: () => Date.now() - 30 * 60 * 1000 }, // 30 minutos atrás
            updatedAt: { toMillis: () => Date.now() - 30 * 60 * 1000 },
            isDeleted: false,
            parentId: null
        }))
    };

    beforeEach(() => {
        vi.clearAllMocks();
        collection.mockReturnValue(mockCommentRef);
        // Mock flexível do doc que pode ser sobrescrito em testes específicos
        doc.mockImplementation((ref, ...paths) => {
            // Se for doc(collectionRef) - para criar novo documento
            if (ref === mockCommentRef && paths.length === 0) {
                return { id: 'new-comment-id' };
            }
            // doc(db, collection, id): o id é o último segmento do path.
            const docId = paths[paths.length - 1];
            // Se for doc(db, 'content', articleId)
            if (docId === mockArticleId) {
                return mockArticleRef;
            }
            // Se for doc(db, 'comments', commentId)
            if (docId === 'comment123') {
                return mockCommentDocRef;
            }
            // Default
            return { id: docId || 'default-id' };
        });
        query.mockImplementation((...args) => ({ args }));
        where.mockImplementation((field, op, value) => ({ field, op, value }));
        orderBy.mockImplementation((field, dir) => ({ field, dir }));
        limit.mockImplementation((size) => ({ size }));
    });

    describe('createComment', () => {
        it('deve criar um comentário com sucesso', async () => {
            const mockTransaction = {
                get: vi.fn().mockResolvedValue(mockArticleDoc),
                set: vi.fn(),
                update: vi.fn()
            };

            runTransaction.mockResolvedValue({
                id: 'new-comment-id',
                articleId: mockArticleId,
                userId: mockUserId,
                userName: mockUserData.displayName,
                userAvatar: mockUserData.photoURL,
                content: mockContent.trim(),
                createdAt: 'MOCK_TIMESTAMP',
                updatedAt: 'MOCK_TIMESTAMP',
                isDeleted: false,
                parentId: null
            });

            runTransaction.mockImplementation(async (db, callback) => {
                return await callback(mockTransaction);
            });

            const result = await createComment(mockArticleId, mockUserId, mockUserData, mockContent);

            expect(runTransaction).toHaveBeenCalled();
            expect(mockTransaction.get).toHaveBeenCalledWith(mockArticleRef);
            expect(mockTransaction.set).toHaveBeenCalled();
            expect(mockTransaction.update).toHaveBeenCalledWith(mockArticleRef, {
                commentsCount: { type: 'increment', value: 1 },
                updatedAt: 'MOCK_TIMESTAMP'
            });
            expect(result.content).toBe(mockContent.trim());
            expect(result.userName).toBe(mockUserData.displayName);
        });

        it('deve lançar erro se artigo não existir', async () => {
            const mockTransaction = {
                get: vi.fn().mockResolvedValue({
                    exists: vi.fn(() => false)
                }),
                set: vi.fn(),
                update: vi.fn()
            };

            runTransaction.mockImplementation(async (db, callback) => {
                return await callback(mockTransaction);
            });

            await expect(
                createComment(mockArticleId, mockUserId, mockUserData, mockContent)
            ).rejects.toThrow('Artigo não encontrado');
        });

        it('deve lançar erro se content tiver menos de 3 caracteres', async () => {
            await expect(
                createComment(mockArticleId, mockUserId, mockUserData, 'ab')
            ).rejects.toThrow('Comentário deve ter no mínimo 3 caracteres');
        });

        it('deve lançar erro se content tiver mais de 500 caracteres', async () => {
            const longContent = 'a'.repeat(501);
            await expect(
                createComment(mockArticleId, mockUserId, mockUserData, longContent)
            ).rejects.toThrow('Comentário deve ter no máximo 500 caracteres');
        });

        it('deve lançar erro se parâmetros obrigatórios estiverem faltando', async () => {
            await expect(
                createComment(null, mockUserId, mockUserData, mockContent)
            ).rejects.toThrow('articleId, userId e content são obrigatórios');

            await expect(
                createComment(mockArticleId, null, mockUserData, mockContent)
            ).rejects.toThrow('articleId, userId e content são obrigatórios');

            await expect(
                createComment(mockArticleId, mockUserId, mockUserData, null)
            ).rejects.toThrow('articleId, userId e content são obrigatórios');
        });

        it('deve usar valores padrão se userData estiver incompleto', async () => {
            const mockTransaction = {
                get: vi.fn().mockResolvedValue(mockArticleDoc),
                set: vi.fn(),
                update: vi.fn()
            };

            runTransaction.mockResolvedValue({
                id: 'new-comment-id',
                userName: 'Usuário',
                userAvatar: ''
            });

            runTransaction.mockImplementation(async (db, callback) => {
                return await callback(mockTransaction);
            });

            await createComment(mockArticleId, mockUserId, {}, mockContent);

            expect(runTransaction).toHaveBeenCalled();
            expect(mockTransaction.set).toHaveBeenCalled();
            const setCall = mockTransaction.set.mock.calls[0];
            expect(setCall[1].userName).toBe('Usuário');
            expect(setCall[1].userAvatar).toBe('');
        });
    });

    describe('getComments', () => {
        it('deve buscar comentários com paginação', async () => {
            const mockQuerySnapshot = {
                docs: [
                    {
                        id: 'comment1',
                        data: () => ({
                            articleId: mockArticleId,
                            content: 'Comment 1',
                            createdAt: { toMillis: () => Date.now() }
                        })
                    },
                    {
                        id: 'comment2',
                        data: () => ({
                            articleId: mockArticleId,
                            content: 'Comment 2',
                            createdAt: { toMillis: () => Date.now() - 1000 }
                        })
                    }
                ]
            };

            getDocs.mockResolvedValue(mockQuerySnapshot);

            const result = await getComments(mockArticleId, 10);

            expect(getDocs).toHaveBeenCalled();
            expect(result.comments).toHaveLength(2);
            expect(result.hasMore).toBe(false);
            expect(result.lastComment).toBeTruthy();
        });

        it('deve indicar hasMore quando houver mais comentários', async () => {
            const mockQuerySnapshot = {
                docs: Array(10).fill(null).map((_, i) => ({
                    id: `comment${i}`,
                    data: () => ({
                        articleId: mockArticleId,
                        content: `Comment ${i}`,
                        createdAt: { toMillis: () => Date.now() - i * 1000 }
                    })
                }))
            };

            getDocs.mockResolvedValue(mockQuerySnapshot);

            const result = await getComments(mockArticleId, 10);

            expect(result.hasMore).toBe(true);
        });

        it('deve usar lastComment para paginação', async () => {
            getDoc.mockResolvedValue(mockCommentDoc);

            const lastComment = {
                id: 'comment123',
                createdAt: { toMillis: () => Date.now() }
            };

            await getComments(mockArticleId, 10, lastComment);

            expect(getDoc).toHaveBeenCalled();
            expect(startAfter).toHaveBeenCalled();
        });

        it('deve lançar erro se articleId não for fornecido', async () => {
            await expect(getComments(null)).rejects.toThrow('articleId é obrigatório');
        });
    });

    describe('getCommentsCount', () => {
        it('deve retornar o contador de comentários', async () => {
            // O mock do beforeEach deve funcionar, mas vamos garantir
            doc.mockImplementation((ref, ...paths) => {
                if (paths[0] === mockArticleId) {
                    return mockArticleRef;
                }
                return { id: paths[0] || 'default-id' };
            });

            getDoc.mockResolvedValue({
                exists: vi.fn(() => true),
                data: vi.fn(() => ({ commentsCount: 42 }))
            });

            const result = await getCommentsCount(mockArticleId);

            expect(doc).toHaveBeenCalledWith(db, 'content', mockArticleId);
            expect(result).toBe(42);
            // Verificar que getDoc foi chamado com o resultado do doc
            const docResult = doc(db, 'content', mockArticleId);
            expect(getDoc).toHaveBeenCalledWith(docResult);
        });

        it('deve retornar 0 se artigo não existir', async () => {
            getDoc.mockResolvedValue({
                exists: vi.fn(() => false)
            });

            const result = await getCommentsCount(mockArticleId);

            expect(result).toBe(0);
        });

        it('deve retornar 0 se commentsCount não existir', async () => {
            getDoc.mockResolvedValue({
                exists: vi.fn(() => true),
                data: vi.fn(() => ({}))
            });

            const result = await getCommentsCount(mockArticleId);

            expect(result).toBe(0);
        });

        it('deve retornar 0 se articleId for null', async () => {
            const result = await getCommentsCount(null);
            expect(result).toBe(0);
        });
    });

    describe('updateComment', () => {
        it('deve atualizar comentário com sucesso', async () => {
            // Garantir que doc retorna o ref correto
            doc.mockImplementation((ref, ...paths) => {
                if (paths[paths.length - 1] === 'comment123') {
                    return mockCommentDocRef;
                }
                return { id: 'default-id' };
            });

            getDoc.mockResolvedValue(mockCommentDoc);
            updateDoc.mockResolvedValue();

            const newContent = 'Conteúdo atualizado';

            await updateComment('comment123', newContent, mockUserId);

            expect(getDoc).toHaveBeenCalledWith(mockCommentDocRef);
            expect(updateDoc).toHaveBeenCalledWith(mockCommentDocRef, {
                content: newContent.trim(),
                updatedAt: 'MOCK_TIMESTAMP'
            });
        });

        it('deve lançar erro se comentário não existir', async () => {
            getDoc.mockResolvedValue({
                exists: vi.fn(() => false)
            });

            await expect(
                updateComment('comment123', 'New content', mockUserId)
            ).rejects.toThrow('Comentário não encontrado');
        });

        it('deve lançar erro se usuário não for o dono', async () => {
            getDoc.mockResolvedValue(mockCommentDoc);

            await expect(
                updateComment('comment123', 'New content', 'different-user')
            ).rejects.toThrow('Você não tem permissão para editar este comentário');
        });

        it('deve lançar erro se comentário estiver deletado', async () => {
            getDoc.mockResolvedValue({
                ...mockCommentDoc,
                data: vi.fn(() => ({
                    ...mockCommentDoc.data(),
                    isDeleted: true
                }))
            });

            await expect(
                updateComment('comment123', 'New content', mockUserId)
            ).rejects.toThrow('Não é possível editar um comentário removido');
        });

        it('deve lançar erro se passou mais de 1 hora desde criação', async () => {
            const oldComment = {
                ...mockCommentDoc,
                data: vi.fn(() => ({
                    ...mockCommentDoc.data(),
                    createdAt: { toMillis: () => Date.now() - 2 * 60 * 60 * 1000 } // 2 horas atrás
                }))
            };

            getDoc.mockResolvedValue(oldComment);

            await expect(
                updateComment('comment123', 'New content', mockUserId)
            ).rejects.toThrow('Comentários só podem ser editados até 1 hora após a criação');
        });

        it('deve lançar erro se content for muito curto', async () => {
            getDoc.mockResolvedValue(mockCommentDoc);

            await expect(
                updateComment('comment123', 'ab', mockUserId)
            ).rejects.toThrow('Comentário deve ter no mínimo 3 caracteres');
        });

        it('deve lançar erro se parâmetros estiverem faltando', async () => {
            await expect(
                updateComment(null, 'content', mockUserId)
            ).rejects.toThrow('commentId, newContent e userId são obrigatórios');
        });
    });

    describe('deleteComment', () => {
        it('deve fazer soft delete do comentário e decrementar contador', async () => {
            const mockTransaction = {
                get: vi.fn(),
                update: vi.fn()
            };

            const mockCommentRef = { id: 'comment123', path: 'comments/comment123' };
            const mockArticleRef = { id: mockArticleId, path: 'content/article123' };

            // Mock do doc()
            doc.mockImplementation((ref, ...paths) => {
                const docId = paths[paths.length - 1];
                if (docId === 'comment123') return mockCommentRef;
                if (docId === 'article123') return mockArticleRef;
                return { id: docId || 'default-id' };
            });

            // Mock do transaction.get
            mockTransaction.get.mockImplementation((ref) => {
                if (ref === mockCommentRef) {
                    return Promise.resolve({
                        exists: vi.fn(() => true),
                        data: vi.fn(() => ({
                            articleId: 'article123',
                            userId: mockUserId,
                            content: 'Comment',
                            isDeleted: false
                        }))
                    });
                }
                return Promise.resolve({ exists: vi.fn(() => false) });
            });

            // Mock do runTransaction
            runTransaction.mockImplementation(async (db, callback) => {
                return await callback(mockTransaction);
            });

            const result = await deleteComment('comment123', mockUserId);

            expect(runTransaction).toHaveBeenCalled();
            expect(mockTransaction.get).toHaveBeenCalledWith(mockCommentRef);

            // Verifica update do comentário
            expect(mockTransaction.update).toHaveBeenCalledWith(mockCommentRef, {
                content: '[Comentário removido]',
                isDeleted: true,
                updatedAt: 'MOCK_TIMESTAMP'
            });

            // Verifica update do artigo (decremento)
            const updateCall = mockTransaction.update.mock.calls.find(call => call[0] === mockArticleRef);
            expect(updateCall).toBeTruthy();
            expect(updateCall[1]).toEqual({
                commentsCount: { type: 'increment', value: -1 },
                updatedAt: 'MOCK_TIMESTAMP'
            });

            expect(result.isDeleted).toBe(true);
        });

        it('deve lançar erro se comentário não existir', async () => {
            const mockTransaction = {
                get: vi.fn().mockResolvedValue({ exists: vi.fn(() => false) }),
                update: vi.fn()
            };

            runTransaction.mockImplementation(async (db, callback) => callback(mockTransaction));

            await expect(
                deleteComment('comment123', mockUserId)
            ).rejects.toThrow('Comentário não encontrado');
        });

        it('deve lançar erro se usuário não for o dono', async () => {
            const mockTransaction = {
                get: vi.fn().mockResolvedValue({
                    exists: vi.fn(() => true),
                    data: vi.fn(() => ({ userId: 'other-user', isDeleted: false }))
                }),
                update: vi.fn()
            };

            runTransaction.mockImplementation(async (db, callback) => callback(mockTransaction));

            await expect(
                deleteComment('comment123', mockUserId)
            ).rejects.toThrow('Você não tem permissão para deletar este comentário');
        });

        it('deve lançar erro se comentário já estiver deletado', async () => {
            const mockTransaction = {
                get: vi.fn().mockResolvedValue({
                    exists: vi.fn(() => true),
                    data: vi.fn(() => ({ userId: mockUserId, isDeleted: true }))
                }),
                update: vi.fn()
            };

            runTransaction.mockImplementation(async (db, callback) => callback(mockTransaction));

            await expect(
                deleteComment('comment123', mockUserId)
            ).rejects.toThrow('Este comentário já foi removido');
        });

        it('deve lançar erro se parâmetros estiverem faltando', async () => {
            await expect(
                deleteComment(null, mockUserId)
            ).rejects.toThrow('commentId e userId são obrigatórios');
        });
    });
});
