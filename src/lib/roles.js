import { getIdTokenResult } from 'firebase/auth';

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

export async function canAccessAdmin(user) {
    return await isAdmin(user);
}

