import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    getIdTokenResult
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { isAdmin, getUserRole } from '../lib/roles';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Faz login e atualiza o token para obter custom claims
     */
    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Força a atualização do token para obter custom claims atualizados
        await refreshUserToken(userCredential.user);
        return userCredential;
    }

    function logout() {
        setUserRole(null);
        return signOut(auth);
    }

    /**
     * Atualiza o token do usuário para obter custom claims atualizados
     * Útil quando os claims são atualizados no backend
     */
    async function refreshUserToken(user) {
        if (!user) return null;
        
        try {
            const tokenResult = await getIdTokenResult(user, true); // true força refresh
            const role = tokenResult.claims.role || 'user';
            setUserRole(role);
            return tokenResult;
        } catch (error) {
            console.error('Erro ao obter token:', error);
            setUserRole('user'); // Fallback para user comum
            return null;
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Quando o usuário faz login, atualiza o token para obter custom claims
                await refreshUserToken(user);
            } else {
                setUserRole(null);
            }
            
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        isAdmin: userRole === 'admin',
        refreshToken: () => refreshUserToken(currentUser),
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
