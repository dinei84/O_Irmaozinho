/**
 * Serviço para gerenciar usuários no Firestore
 * Centraliza operações relacionadas à coleção users
 */

import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Cria um documento de usuário no Firestore
 * @param {string} uid - User ID do Firebase Auth
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<void>}
 */
export async function createUserProfile(uid, userData) {
  try {
    const userDoc = {
      email: userData.email || '',
      emailVerified: userData.emailVerified || false,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      role: 'user', // Sempre user por padrão
      preferences: {
        newsletter: userData.preferences?.newsletter || false,
        emailNotifications: userData.preferences?.emailNotifications || true,
      },
      stats: {
        articlesRead: 0,
        commentsCount: 0,
        lastActivityAt: serverTimestamp(),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', uid), userDoc, { merge: false });
    return userDoc;
  } catch (error) {
    console.error('Erro ao criar perfil de usuário:', error);
    throw error;
  }
}

/**
 * Busca o perfil de um usuário
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil de usuário:', error);
    throw error;
  }
}

/**
 * Atualiza o perfil de um usuário
 * @param {string} uid - User ID
 * @param {Object} updates - Campos para atualizar
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, updates) {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Erro ao atualizar perfil de usuário:', error);
    throw error;
  }
}

/**
 * Atualiza o último login do usuário
 * @param {string} uid - User ID
 * @returns {Promise<void>}
 */
export async function updateLastLogin(uid) {
  try {
    await updateUserProfile(uid, {
      lastLoginAt: serverTimestamp(),
      'stats.lastActivityAt': serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar último login:', error);
    // Não lançar erro, pois não é crítico
  }
}


