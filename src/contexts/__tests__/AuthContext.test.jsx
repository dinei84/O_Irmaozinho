import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    getIdTokenResult
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { createUserProfile, updateLastLogin } from '../../services/userService';

vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn(() => Promise.resolve()),
    signOut: vi.fn(),
    getIdTokenResult: vi.fn()
}));

vi.mock('../../lib/firebase', () => ({
    auth: {}
}));

vi.mock('../../services/userService', () => ({
    createUserProfile: vi.fn(),
    updateLastLogin: vi.fn()
}));

describe('AuthContext', () => {
    let mockUnsubscribe;
    let mockOnAuthStateChangedCallback;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUnsubscribe = vi.fn();
        
        onAuthStateChanged.mockImplementation((authInstance, callback) => {
            mockOnAuthStateChangedCallback = callback;
            return mockUnsubscribe;
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    describe('useAuth', () => {
        it('deve inicializar com usuário null e loading false após verificação', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                mockOnAuthStateChangedCallback(null);
            });

            await waitFor(() => {
                expect(result.current.currentUser).toBeNull();
                expect(result.current.userRole).toBeNull();
                expect(result.current.isAdmin).toBe(false);
                expect(result.current.loading).toBeUndefined();
            });
        });

        it('deve definir usuário quando autenticado', async () => {
            const mockUser = {
                uid: 'user123',
                email: 'test@example.com'
            };

            getIdTokenResult.mockResolvedValue({
                claims: { role: 'user' }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                mockOnAuthStateChangedCallback(mockUser);
            });

            await waitFor(() => {
                expect(result.current.currentUser).toEqual(mockUser);
                expect(result.current.userRole).toBe('user');
                expect(result.current.isAdmin).toBe(false);
            });
        });

        it('deve definir role como admin quando usuário é admin', async () => {
            const mockUser = {
                uid: 'admin123',
                email: 'admin@example.com'
            };

            getIdTokenResult.mockResolvedValue({
                claims: { role: 'admin' }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                mockOnAuthStateChangedCallback(mockUser);
            });

            await waitFor(() => {
                expect(result.current.userRole).toBe('admin');
                expect(result.current.isAdmin).toBe(true);
            });
        });
    });

    describe('login', () => {
        it('deve fazer login com email e senha', async () => {
            const mockUser = {
                uid: 'user123',
                email: 'test@example.com'
            };
            const mockUserCredential = {
                user: mockUser
            };

            signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'user' }
            });
            updateLastLogin.mockResolvedValue();

            const { result } = renderHook(() => useAuth(), { wrapper });
            
            await act(async () => {
                mockOnAuthStateChangedCallback(null);
            });

            await waitFor(() => {
                expect(result.current).not.toBeNull();
            });

            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                auth,
                'test@example.com',
                'password123'
            );
            expect(getIdTokenResult).toHaveBeenCalledWith(mockUser, true);
        });

        it('deve atualizar último login após login', async () => {
            const mockUser = {
                uid: 'user123',
                email: 'test@example.com'
            };
            const mockUserCredential = {
                user: mockUser
            };

            signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'user' }
            });
            updateLastLogin.mockResolvedValue();

            const { result } = renderHook(() => useAuth(), { wrapper });
            
            await act(async () => {
                mockOnAuthStateChangedCallback(null);
            });

            await waitFor(() => {
                expect(result.current).not.toBeNull();
            });

            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(updateLastLogin).toHaveBeenCalledWith('user123');
        });
    });

    describe('signup', () => {
        it('deve criar nova conta de usuário', async () => {
            const mockUser = {
                uid: 'user123',
                email: 'new@example.com',
                emailVerified: false,
                displayName: null,
                photoURL: null
            };
            const mockUserCredential = {
                user: mockUser
            };

            createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
            createUserProfile.mockResolvedValue();
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'user' }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });
            
            await act(async () => {
                mockOnAuthStateChangedCallback(null);
            });

            await waitFor(() => {
                expect(result.current).not.toBeNull();
            });

            await act(async () => {
                await result.current.signup('new@example.com', 'password123');
            });

            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                auth,
                'new@example.com',
                'password123'
            );
            expect(createUserProfile).toHaveBeenCalledWith('user123', {
                email: 'new@example.com',
                emailVerified: false,
                displayName: '',
                photoURL: '',
                preferences: {}
            });
        });

        it('deve criar perfil com additionalData', async () => {
            const mockUser = {
                uid: 'user123',
                email: 'new@example.com',
                emailVerified: false
            };
            const mockUserCredential = {
                user: mockUser
            };

            createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
            createUserProfile.mockResolvedValue();
            getIdTokenResult.mockResolvedValue({
                claims: { role: 'user' }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });
            
            mockOnAuthStateChangedCallback(null);

            await waitFor(() => {
                expect(result.current).not.toBeNull();
            });

            const additionalData = {
                displayName: 'Test User',
                photoURL: 'https://example.com/photo.jpg'
            };

            await result.current.signup('new@example.com', 'password123', additionalData);

            expect(createUserProfile).toHaveBeenCalledWith(
                'user123',
                expect.objectContaining({
                    displayName: 'Test User',
                    photoURL: 'https://example.com/photo.jpg'
                })
            );
        });
    });

    describe('logout', () => {
        it('deve fazer logout e limpar role', async () => {
            signOut.mockResolvedValue();

            const { result } = renderHook(() => useAuth(), { wrapper });
            
            mockOnAuthStateChangedCallback(null);

            await waitFor(() => {
                expect(result.current).not.toBeNull();
            });

            await result.current.logout();

            expect(signOut).toHaveBeenCalledWith(auth);
        });
    });

    describe('refreshToken', () => {
        it('deve atualizar token e role', async () => {
            const mockUser = {
                uid: 'user123',
                email: 'test@example.com'
            };

            getIdTokenResult.mockResolvedValue({
                claims: { role: 'admin' }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                mockOnAuthStateChangedCallback(mockUser);
            });

            await waitFor(() => {
                expect(result.current.currentUser).toEqual(mockUser);
            });

            await act(async () => {
                await result.current.refreshToken();
            });

            expect(getIdTokenResult).toHaveBeenCalledWith(mockUser, true);
        });
    });

    describe('cleanup', () => {
        it('deve cancelar subscription ao desmontar', () => {
            const { unmount } = renderHook(() => useAuth(), { wrapper });

            unmount();

            expect(mockUnsubscribe).toHaveBeenCalled();
        });
    });
});
