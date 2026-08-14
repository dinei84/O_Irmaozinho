import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    toggleLike,
    hasUserLiked,
    getLikesCount,
    getUserLikes,
    getMostLikedContent
} from '../likeService';
import { db } from '../../lib/firebase';
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    runTransaction,
    increment,
    serverTimestamp,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore';

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        doc: vi.fn(),
        getDoc: vi.fn(),
        setDoc: vi.fn(),
        deleteDoc: vi.fn(),
        runTransaction: vi.fn(),
        increment: vi.fn((value) => ({ increment: value })),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        limit: vi.fn(),
        getDocs: vi.fn()
    };
});

vi.mock('../../lib/firebase', () => ({
    db: {}
}));

describe('likeService', () => {
    const mockContentId = 'content123';
    const mockUserId = 'user123';
    const mockLikeId = `${mockContentId}_${mockUserId}`;
    const mockLikeRef = {};
    const mockContentRef = {};

    beforeEach(() => {
        vi.clearAllMocks();
        doc.mockImplementation((dbInstance, collectionName, docId) => {
            if (collectionName === 'likes') return mockLikeRef;
            if (collectionName === 'content') return mockContentRef;
            return {};
        });
    });

    describe('toggleLike', () => {
        it('deve criar curtida quando não existe', async () => {
            const likeDoc = { exists: () => false };
            const contentDoc = { exists: () => true };
            const mockTransaction = {
                get: vi.fn((ref) => {
                    if (ref === mockLikeRef) return Promise.resolve(likeDoc);
                    if (ref === mockContentRef) return Promise.resolve(contentDoc);
                }),
                set: vi.fn(),
                update: vi.fn()
            };

            runTransaction.mockImplementation((dbInstance, callback) => {
                return callback(mockTransaction);
            });

            const result = await toggleLike(mockContentId, mockUserId);

            expect(runTransaction).toHaveBeenCalled();
            expect(result.action).toBe('liked');
            expect(result.likeId).toBe(mockLikeId);
        });

        it('deve deletar curtida quando já existe', async () => {
            const likeDoc = { exists: () => true };
            const contentDoc = { exists: () => true };
            const mockTransaction = {
                get: vi.fn((ref) => {
                    if (ref === mockLikeRef) return Promise.resolve(likeDoc);
                    if (ref === mockContentRef) return Promise.resolve(contentDoc);
                }),
                delete: vi.fn(),
                update: vi.fn()
            };

            runTransaction.mockImplementation((dbInstance, callback) => {
                return callback(mockTransaction);
            });

            const result = await toggleLike(mockContentId, mockUserId);

            expect(runTransaction).toHaveBeenCalled();
            expect(result.action).toBe('unliked');
        });

        it('deve lançar erro quando contentId ou userId são inválidos', async () => {
            await expect(toggleLike(null, mockUserId)).rejects.toThrow();
            await expect(toggleLike(mockContentId, null)).rejects.toThrow();
            await expect(toggleLike('', '')).rejects.toThrow();
        });

        it('deve lançar erro quando artigo não existe', async () => {
            const likeDoc = { exists: () => false };
            const contentDoc = { exists: () => false };
            const mockTransaction = {
                get: vi.fn((ref) => {
                    if (ref === mockLikeRef) return Promise.resolve(likeDoc);
                    if (ref === mockContentRef) return Promise.resolve(contentDoc);
                }),
                set: vi.fn(),
                delete: vi.fn(),
                update: vi.fn()
            };

            runTransaction.mockImplementation((dbInstance, callback) => {
                return callback(mockTransaction);
            });

            await expect(toggleLike(mockContentId, mockUserId)).rejects.toThrow('Artigo não encontrado');
        });
    });

    describe('hasUserLiked', () => {
        it('deve retornar true quando usuário curtiu', async () => {
            const mockLikeDoc = {
                exists: () => true
            };

            getDoc.mockResolvedValue(mockLikeDoc);

            const result = await hasUserLiked(mockContentId, mockUserId);

            expect(doc).toHaveBeenCalledWith(db, 'likes', mockLikeId);
            expect(result).toBe(true);
        });

        it('deve retornar false quando usuário não curtiu', async () => {
            const mockLikeDoc = {
                exists: () => false
            };

            getDoc.mockResolvedValue(mockLikeDoc);

            const result = await hasUserLiked(mockContentId, mockUserId);

            expect(result).toBe(false);
        });

        it('deve retornar false para parâmetros inválidos', async () => {
            expect(await hasUserLiked(null, mockUserId)).toBe(false);
            expect(await hasUserLiked(mockContentId, null)).toBe(false);
        });

        it('deve retornar false em caso de erro', async () => {
            getDoc.mockRejectedValue(new Error('Firestore error'));

            const result = await hasUserLiked(mockContentId, mockUserId);

            expect(result).toBe(false);
        });
    });

    describe('getLikesCount', () => {
        it('deve retornar contagem de curtidas', async () => {
            const mockContentDoc = {
                exists: () => true,
                data: () => ({ likesCount: 42 })
            };

            getDoc.mockResolvedValue(mockContentDoc);

            const result = await getLikesCount(mockContentId);

            expect(doc).toHaveBeenCalledWith(db, 'content', mockContentId);
            expect(result).toBe(42);
        });

        it('deve retornar 0 quando artigo não existe', async () => {
            const mockContentDoc = {
                exists: () => false
            };

            getDoc.mockResolvedValue(mockContentDoc);

            const result = await getLikesCount(mockContentId);

            expect(result).toBe(0);
        });

        it('deve retornar 0 quando likesCount não está definido', async () => {
            const mockContentDoc = {
                exists: () => true,
                data: () => ({})
            };

            getDoc.mockResolvedValue(mockContentDoc);

            const result = await getLikesCount(mockContentId);

            expect(result).toBe(0);
        });

        it('deve retornar 0 para contentId inválido', async () => {
            expect(await getLikesCount(null)).toBe(0);
            expect(await getLikesCount('')).toBe(0);
        });

        it('deve retornar 0 em caso de erro', async () => {
            getDoc.mockRejectedValue(new Error('Firestore error'));

            const result = await getLikesCount(mockContentId);

            expect(result).toBe(0);
        });
    });

    describe('getUserLikes', () => {
        it('deve retornar lista de curtidas do usuário', async () => {
            const mockDocs = [
                { id: 'like1', data: () => ({ contentId: 'content1', userId: mockUserId }) },
                { id: 'like2', data: () => ({ contentId: 'content2', userId: mockUserId }) }
            ];
            const mockQuerySnapshot = {
                docs: mockDocs
            };

            const mockQuery = {};
            query.mockReturnValue(mockQuery);
            where.mockReturnValue(mockQuery);
            orderBy.mockReturnValue(mockQuery);
            limit.mockReturnValue(mockQuery);
            getDocs.mockResolvedValue(mockQuerySnapshot);

            const result = await getUserLikes(mockUserId);

            expect(collection).toHaveBeenCalledWith(db, 'likes');
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('like1');
        });

        it('deve retornar array vazio para userId inválido', async () => {
            const result = await getUserLikes(null);
            expect(result).toEqual([]);
        });

        it('deve usar limit padrão de 50', async () => {
            const mockQuerySnapshot = { docs: [] };
            const mockQuery = {};
            
            query.mockReturnValue(mockQuery);
            where.mockReturnValue(mockQuery);
            orderBy.mockReturnValue(mockQuery);
            limit.mockReturnValue(mockQuery);
            getDocs.mockResolvedValue(mockQuerySnapshot);

            await getUserLikes(mockUserId);

            expect(limit).toHaveBeenCalledWith(50);
        });
    });

    describe('getMostLikedContent', () => {
        it('deve retornar conteúdo mais curtido sem categoria', async () => {
            const mockDocs = [
                { id: 'content1', data: () => ({ likesCount: 100, title: 'Artigo 1' }) },
                { id: 'content2', data: () => ({ likesCount: 50, title: 'Artigo 2' }) }
            ];
            const mockQuerySnapshot = {
                docs: mockDocs
            };

            const mockQuery = {};
            query.mockReturnValue(mockQuery);
            orderBy.mockReturnValue(mockQuery);
            limit.mockReturnValue(mockQuery);
            getDocs.mockResolvedValue(mockQuerySnapshot);

            const result = await getMostLikedContent(null, 10);

            expect(collection).toHaveBeenCalledWith(db, 'content');
            expect(result).toHaveLength(2);
        });

        it('deve retornar conteúdo mais curtido por categoria', async () => {
            const mockDocs = [
                { id: 'content1', data: () => ({ likesCount: 100, category: 'Artigos' }) }
            ];
            const mockQuerySnapshot = {
                docs: mockDocs
            };

            const mockQuery = {};
            query.mockReturnValue(mockQuery);
            where.mockReturnValue(mockQuery);
            orderBy.mockReturnValue(mockQuery);
            limit.mockReturnValue(mockQuery);
            getDocs.mockResolvedValue(mockQuerySnapshot);

            const result = await getMostLikedContent('Artigos', 10);

            expect(where).toHaveBeenCalledWith('category', '==', 'Artigos');
            expect(result).toHaveLength(1);
        });

        it('deve usar limit padrão de 10', async () => {
            const mockQuerySnapshot = { docs: [] };
            const mockQuery = {};
            
            query.mockReturnValue(mockQuery);
            orderBy.mockReturnValue(mockQuery);
            limit.mockReturnValue(mockQuery);
            getDocs.mockResolvedValue(mockQuerySnapshot);

            await getMostLikedContent();

            expect(limit).toHaveBeenCalledWith(10);
        });
    });
});
