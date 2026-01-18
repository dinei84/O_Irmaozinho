import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function createUserProfile(userId, userData) {
    try {
        const userRef = doc(db, 'users', userId);
        
        await setDoc(userRef, {
            ...userData,
            role: 'user',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao criar perfil de usuário:', error);
        throw error;
    }
}

export async function updateLastLogin(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.warn('Erro ao atualizar último login:', error);
    }
}

export async function updateUserProfile(userId, updates) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
    }
}

