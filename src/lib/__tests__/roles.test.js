import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isAdmin, getUserRole, canAccessAdmin } from '../roles';
import { getIdTokenResult } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
    getIdTokenResult: vi.fn()
}));

describe('roles', () => {
    let mockUser;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = {
            uid: 'user123',
            email: 'test@example.com'
        };
    });

    describe('isAdmin', () => {
        it('deve retornar false quando usuário é null', async () => {
            const result = await isAdmin(null);
            expect(result).toBe(false);
            expect(getIdTokenResult).not.toHaveBeenCalled();
        });

        it('deve retornar false quando usuário é undefined', async () => {
            const result = await isAdmin(undefined);
            expect(result).toBe(false);
            expect(getIdTokenResult).not.toHaveBeenCalled();
        });

        it('deve retornar true quando role é admin', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'admin' }
            });

            const result = await isAdmin(mockUser);
            expect(result).toBe(true);
            expect(getIdTokenResult).toHaveBeenCalledWith(mockUser, false);
        });

        it('deve retornar false quando role é user', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'user' }
            });

            const result = await isAdmin(mockUser);
            expect(result).toBe(false);
        });

        it('deve retornar false quando role não está definido', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: {}
            });

            const result = await isAdmin(mockUser);
            expect(result).toBe(false);
        });

        it('deve retornar false em caso de erro', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            getIdTokenResult.mockRejectedValue(new Error('Token error'));

            const result = await isAdmin(mockUser);
            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe('getUserRole', () => {
        it('deve retornar null quando usuário é null', async () => {
            const result = await getUserRole(null);
            expect(result).toBe(null);
            expect(getIdTokenResult).not.toHaveBeenCalled();
        });

        it('deve retornar null quando usuário é undefined', async () => {
            const result = await getUserRole(undefined);
            expect(result).toBe(null);
            expect(getIdTokenResult).not.toHaveBeenCalled();
        });

        it('deve retornar admin quando role é admin', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'admin' }
            });

            const result = await getUserRole(mockUser);
            expect(result).toBe('admin');
        });

        it('deve retornar user quando role é user', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'user' }
            });

            const result = await getUserRole(mockUser);
            expect(result).toBe('user');
        });

        it('deve retornar user como padrão quando role não está definido', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: {}
            });

            const result = await getUserRole(mockUser);
            expect(result).toBe('user');
        });

        it('deve retornar user em caso de erro', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            getIdTokenResult.mockRejectedValue(new Error('Token error'));

            const result = await getUserRole(mockUser);
            expect(result).toBe('user');
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe('canAccessAdmin', () => {
        it('deve retornar true quando usuário é admin', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'admin' }
            });

            const result = await canAccessAdmin(mockUser);
            expect(result).toBe(true);
        });

        it('deve retornar false quando usuário não é admin', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'user' }
            });

            const result = await canAccessAdmin(mockUser);
            expect(result).toBe(false);
        });

        it('deve delegar para isAdmin', async () => {
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'admin' }
            });

            await canAccessAdmin(mockUser);
            expect(getIdTokenResult).toHaveBeenCalledWith(mockUser, false);
        });
    });
});
