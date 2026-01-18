import { describe, it, expect, vi, beforeEach } from 'vitest';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createUserProfile, updateLastLogin, updateUserProfile } from '../userService';
import { db } from '../../lib/firebase';

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        doc: vi.fn(),
        setDoc: vi.fn(),
        updateDoc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP')
    };
});

vi.mock('../../lib/firebase', () => ({
    db: {}
}));

describe('userService', () => {
    const mockUserRef = {};
    const mockUserId = 'user123';
    const mockUserData = {
        email: 'test@example.com',
        displayName: 'Test User'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        doc.mockReturnValue(mockUserRef);
    });

    describe('createUserProfile', () => {
        it('deve criar perfil de usuário com dados corretos', async () => {
            setDoc.mockResolvedValue();

            await createUserProfile(mockUserId, mockUserData);

            expect(doc).toHaveBeenCalledWith(db, 'users', mockUserId);
            expect(setDoc).toHaveBeenCalledWith(mockUserRef, {
                ...mockUserData,
                role: 'user',
                createdAt: 'MOCK_TIMESTAMP',
                updatedAt: 'MOCK_TIMESTAMP',
                lastLoginAt: 'MOCK_TIMESTAMP'
            });
        });

        it('deve lançar erro quando setDoc falha', async () => {
            const mockError = new Error('Firestore error');
            setDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(createUserProfile(mockUserId, mockUserData)).rejects.toThrow(mockError);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar perfil de usuário:', mockError);

            consoleErrorSpy.mockRestore();
        });

        it('deve definir role como user por padrão', async () => {
            setDoc.mockResolvedValue();

            await createUserProfile(mockUserId, mockUserData);

            expect(setDoc).toHaveBeenCalledWith(
                mockUserRef,
                expect.objectContaining({ role: 'user' })
            );
        });
    });

    describe('updateLastLogin', () => {
        it('deve atualizar último login do usuário', async () => {
            updateDoc.mockResolvedValue();

            await updateLastLogin(mockUserId);

            expect(doc).toHaveBeenCalledWith(db, 'users', mockUserId);
            expect(updateDoc).toHaveBeenCalledWith(mockUserRef, {
                lastLoginAt: 'MOCK_TIMESTAMP',
                updatedAt: 'MOCK_TIMESTAMP'
            });
        });

        it('não deve lançar erro quando updateDoc falha', async () => {
            const mockError = new Error('Firestore error');
            updateDoc.mockRejectedValue(mockError);
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            await expect(updateLastLogin(mockUserId)).resolves.not.toThrow();
            expect(consoleWarnSpy).toHaveBeenCalledWith('Erro ao atualizar último login:', mockError);

            consoleWarnSpy.mockRestore();
        });
    });

    describe('updateUserProfile', () => {
        const mockUpdates = {
            displayName: 'Updated Name',
            photoURL: 'https://example.com/photo.jpg'
        };

        it('deve atualizar perfil do usuário', async () => {
            updateDoc.mockResolvedValue();

            await updateUserProfile(mockUserId, mockUpdates);

            expect(doc).toHaveBeenCalledWith(db, 'users', mockUserId);
            expect(updateDoc).toHaveBeenCalledWith(mockUserRef, {
                ...mockUpdates,
                updatedAt: 'MOCK_TIMESTAMP'
            });
        });

        it('deve lançar erro quando updateDoc falha', async () => {
            const mockError = new Error('Firestore error');
            updateDoc.mockRejectedValue(mockError);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(updateUserProfile(mockUserId, mockUpdates)).rejects.toThrow(mockError);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar perfil:', mockError);

            consoleErrorSpy.mockRestore();
        });
    });
});
