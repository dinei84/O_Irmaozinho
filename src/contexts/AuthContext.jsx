import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    getIdTokenResult,
    updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { isAdmin, getUserRole } from '../lib/roles';
import { createUserProfile, updateLastLogin } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await refreshUserToken(userCredential.user);
        updateLastLogin(userCredential.user.uid).catch(() => {});
        return userCredential;
    }

    async function signup(email, password, additionalData = {}) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Grava o nome no perfil do Auth (não só no Firestore): assim ele entra no
        // ID token como claim `name`, e as rules de comentários conseguem verificar
        // que o autor é quem diz ser, em vez de confiar num nome vindo do cliente (V-08).
        const displayName = (additionalData.displayName || '').trim();
        if (displayName) {
            await updateProfile(user, { displayName });
        }

        await createUserProfile(user.uid, {
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: additionalData.displayName || user.displayName || '',
            photoURL: additionalData.photoURL || user.photoURL || '',
            preferences: additionalData.preferences || {},
        });

        await refreshUserToken(user);
        
        return userCredential;
    }

    function logout() {
        setUserRole(null);
        return signOut(auth);
    }

    async function refreshUserToken(user) {
        if (!user) return null;
        
        try {
            const tokenResult = await getIdTokenResult(user, true);
            const role = tokenResult.claims.role || 'user';
            setUserRole(role);
            return tokenResult;
        } catch (error) {
            console.error('Erro ao obter token:', error);
            setUserRole('user');
            return null;
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
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
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
