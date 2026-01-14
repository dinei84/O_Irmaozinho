import { getIdTokenResult } from 'firebase/auth';

/**
 * Sistema de roles e permissões
 * Usa Custom Claims do Firebase Auth
 */

/**
 * Verifica se o usuário é admin
 * @param {Object} user - Objeto do usuário do Firebase Auth
 * @returns {Promise<boolean>}
 */
export async function isAdmin(user) {
    if (!user) return false;
    
    try {
        const tokenResult = await getIdTokenResult(user, false);
        return tokenResult.claims.role === 'admin';
    } catch (error) {
        console.error('Erro ao verificar role:', error);
        return false;
    }
}

/**
 * Obtém o role do usuário
 * @param {Object} user - Objeto do usuário do Firebase Auth
 * @returns {Promise<string>} - 'admin' ou 'user'
 */
export async function getUserRole(user) {
    if (!user) return null;
    
    try {
        const tokenResult = await getIdTokenResult(user, false);
        return tokenResult.claims.role || 'user';
    } catch (error) {
        console.error('Erro ao obter role:', error);
        return 'user';
    }
}

/**
 * Verifica se o usuário pode acessar área administrativa
 * @param {Object} user - Objeto do usuário do Firebase Auth
 * @returns {Promise<boolean>}
 */
export async function canAccessAdmin(user) {
    return await isAdmin(user);
}

