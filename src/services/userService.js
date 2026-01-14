import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Cria perfil de usuário no Firestore
 * @param {string} userId - UID do usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<void>}
 */
export async function createUserProfile(userId, userData) {
    try {
        const userRef = doc(db, 'users', userId);
        
        await setDoc(userRef, {
            ...userData,
            role: 'user', // Sempre user por padrão
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao criar perfil de usuário:', error);
        throw error;
    }
}

/**
 * Atualiza último login do usuário
 * @param {string} userId - UID do usuário
 * @returns {Promise<void>}
 */
export async function updateLastLogin(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        // Não crítico se falhar, apenas loga o erro
        console.warn('Erro ao atualizar último login:', error);
    }
}

/**
 * Atualiza perfil do usuário
 * @param {string} userId - UID do usuário
 * @param {Object} updates - Dados para atualizar
 * @returns {Promise<void>}
 */
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

