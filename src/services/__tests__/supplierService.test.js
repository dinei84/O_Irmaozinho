import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getAllSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getOrCreateDefaultSupplier
} from '../supplierService';
import { db } from '../../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        getDocs: vi.fn(),
        doc: vi.fn(),
        getDoc: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        limit: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP')
    };
});

vi.mock('../../lib/firebase', () => ({
    db: {}
}));

describe('supplierService', () => {
    const mockCollectionRef = {};
    const mockDocRef = {};
    const mockSupplierId = 'supplier123';
    const mockSupplierData = {
        name: 'Fornecedor Teste',
        email: 'fornecedor@example.com',
        type: 'third_party',
        isDefault: false,
        orderMethod: 'email',
        orderEmail: 'pedidos@example.com',
        commissionRate: 0.15,
        paymentMethod: 'centralized',
        active: true
    };

    beforeEach(() => {
        vi.clearAllMocks();
        collection.mockReturnValue(mockCollectionRef);
        doc.mockReturnValue(mockDocRef);
    });

    describe('getAllSuppliers', () => {
        it('deve retornar todos os fornecedores ativos por padrão', async () => {
            const mockDocs = [
                { id: '1', data: () => ({ ...mockSupplierData, active: true }) },
                { id: '2', data: () => ({ ...mockSupplierData, active: true }) }
            ];
            const mockQuerySnapshot = {
                docs: mockDocs
            };

            const mockQuery = {};
            query.mockReturnValue(mockQuery);
            where.mockReturnValue(mockQuery);
            getDocs.mockResolvedValue(mockQuerySnapshot);

            const result = await getAllSuppliers();

            expect(collection).toHaveBeenCalledWith(db, 'suppliers');
            expect(where).toHaveBeenCalledWith('active', '==', true);
            expect(getDocs).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ id: '1', ...mockSupplierData, active: true });
        });

        it('deve retornar todos os fornecedores quando activeOnly é false', async () => {
            const mockDocs = [
                { id: '1', data: () => ({ ...mockSupplierData, active: true }) },
                { id: '2', data: () => ({ ...mockSupplierData, active: false }) }
            ];
            const mockQuerySnapshot = {
                docs: mockDocs
            };

            getDocs.mockResolvedValue(mockQuerySnapshot);

            const result = await getAllSuppliers(false);

            expect(collection).toHaveBeenCalledWith(db, 'suppliers');
            expect(getDocs).toHaveBeenCalledWith(mockCollectionRef);
            expect(result).toHaveLength(2);
        });

        it('deve lançar erro quando getDocs falha', async () => {
            const mockError = new Error('Firestore error');
            getDocs.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(getAllSuppliers()).rejects.toThrow(mockError);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('getSupplier', () => {
        it('deve retornar fornecedor por ID', async () => {
            const mockDocSnapshot = {
                exists: () => true,
                id: mockSupplierId,
                data: () => mockSupplierData
            };

            getDoc.mockResolvedValue(mockDocSnapshot);

            const result = await getSupplier(mockSupplierId);

            expect(doc).toHaveBeenCalledWith(db, 'suppliers', mockSupplierId);
            expect(getDoc).toHaveBeenCalledWith(mockDocRef);
            expect(result).toEqual({ id: mockSupplierId, ...mockSupplierData });
        });

        it('deve retornar null quando fornecedor não existe', async () => {
            const mockDocSnapshot = {
                exists: () => false
            };

            getDoc.mockResolvedValue(mockDocSnapshot);

            const result = await getSupplier(mockSupplierId);

            expect(result).toBeNull();
        });

        it('deve lançar erro quando getDoc falha', async () => {
            const mockError = new Error('Firestore error');
            getDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(getSupplier(mockSupplierId)).rejects.toThrow(mockError);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('createSupplier', () => {
        it('deve criar novo fornecedor', async () => {
            const mockDocRef = { id: mockSupplierId };
            addDoc.mockResolvedValue(mockDocRef);

            const result = await createSupplier(mockSupplierData);

            expect(collection).toHaveBeenCalledWith(db, 'suppliers');
            expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
                ...mockSupplierData,
                createdAt: 'MOCK_TIMESTAMP',
                updatedAt: 'MOCK_TIMESTAMP'
            });
            expect(result).toBe(mockSupplierId);
        });

        it('deve lançar erro quando addDoc falha', async () => {
            const { addDoc } = await import('firebase/firestore');
            const mockError = new Error('Firestore error');
            addDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(createSupplier(mockSupplierData)).rejects.toThrow(mockError);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('updateSupplier', () => {
        const mockUpdates = {
            name: 'Fornecedor Atualizado',
            active: false
        };

        it('deve atualizar fornecedor', async () => {
            updateDoc.mockResolvedValue();

            await updateSupplier(mockSupplierId, mockUpdates);

            expect(doc).toHaveBeenCalledWith(db, 'suppliers', mockSupplierId);
            expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
                ...mockUpdates,
                updatedAt: 'MOCK_TIMESTAMP'
            });
        });

        it('deve remover campos que não devem ser atualizados', async () => {
            const updatesWithForbiddenFields = {
                ...mockUpdates,
                createdAt: 'should-be-removed',
                id: 'should-be-removed'
            };

            updateDoc.mockResolvedValue();

            await updateSupplier(mockSupplierId, updatesWithForbiddenFields);

            expect(updateDoc).toHaveBeenCalledWith(
                mockDocRef,
                expect.not.objectContaining({
                    createdAt: 'should-be-removed',
                    id: 'should-be-removed'
                })
            );
        });

        it('deve lançar erro quando updateDoc falha', async () => {
            const mockError = new Error('Firestore error');
            updateDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(updateSupplier(mockSupplierId, mockUpdates)).rejects.toThrow(mockError);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('deleteSupplier', () => {
        it('deve fazer soft delete marcando como inativo', async () => {
            updateDoc.mockResolvedValue();

            await deleteSupplier(mockSupplierId);

            expect(doc).toHaveBeenCalledWith(db, 'suppliers', mockSupplierId);
            expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
                active: false,
                updatedAt: 'MOCK_TIMESTAMP'
            });
        });

        it('deve lançar erro quando updateDoc falha', async () => {
            const mockError = new Error('Firestore error');
            updateDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(deleteSupplier(mockSupplierId)).rejects.toThrow(mockError);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('getOrCreateDefaultSupplier', () => {
        it('deve retornar fornecedor padrão se já existir', async () => {
            const mockDefaultSupplier = {
                id: 'default123',
                name: 'O Irmaozinho',
                type: 'own',
                isDefault: true,
                orderMethod: 'direct_sale',
                commissionRate: 0,
                paymentMethod: 'none',
                active: true
            };

            const mockDocs = [
                { id: 'default123', data: () => mockDefaultSupplier }
            ];
            const mockQuerySnapshot = {
                docs: mockDocs,
                empty: false
            };

            const mockQuery = {};
            query.mockReturnValue(mockQuery);
            where.mockReturnValue(mockQuery);
            getDocs.mockResolvedValue(mockQuerySnapshot);

            const result = await getOrCreateDefaultSupplier();

            expect(query).toHaveBeenCalled();
            expect(where).toHaveBeenCalledWith('isDefault', '==', true);
            expect(where).toHaveBeenCalledWith('active', '==', true);
            expect(result).toEqual(mockDefaultSupplier);
        });

        it('deve criar fornecedor padrão se não existir', async () => {
            const mockQuerySnapshot = {
                docs: [],
                empty: true
            };

            const mockQuery = {};
            query.mockReturnValue(mockQuery);
            where.mockReturnValue(mockQuery);
            getDocs.mockResolvedValue(mockQuerySnapshot);

            const mockDocRef = { id: 'new-default-id' };
            addDoc.mockResolvedValue(mockDocRef);

            const result = await getOrCreateDefaultSupplier();

            expect(addDoc).toHaveBeenCalled();
            expect(result.id).toBe('new-default-id');
            expect(result.name).toBe('O Irmaozinho');
            expect(result.type).toBe('own');
            expect(result.isDefault).toBe(true);
            expect(result.commissionRate).toBe(0);
            expect(result.paymentMethod).toBe('none');
        });

        it('deve lançar erro quando getDocs falha', async () => {
            const mockError = new Error('Firestore error');
            const mockQuery = {};
            query.mockReturnValue(mockQuery);
            where.mockReturnValue(mockQuery);
            getDocs.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(getOrCreateDefaultSupplier()).rejects.toThrow(mockError);

            consoleErrorSpy.mockRestore();
        });
    });
});
