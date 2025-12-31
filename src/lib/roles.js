/**
 * Sistema de roles e permissões
 * Centraliza a lógica de verificação de roles
 */

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Verifica se o usuário tem um determinado role
 */
export function hasRole(user, role) {
  if (!user) return false;
  
  // Verifica custom claims (definidos no backend via Cloud Functions)
  const customClaims = user.customClaims || {};
  return customClaims.role === role;
}

/**
 * Verifica se o usuário é admin
 */
export function isAdmin(user) {
  return hasRole(user, ROLES.ADMIN);
}

/**
 * Verifica se o usuário é um usuário comum
 */
export function isUser(user) {
  return hasRole(user, ROLES.USER) || (!hasRole(user, ROLES.ADMIN) && user !== null);
}

/**
 * Obtém o role do usuário
 */
export function getUserRole(user) {
  if (!user) return null;
  
  const customClaims = user.customClaims || {};
  return customClaims.role || ROLES.USER;
}

/**
 * Verifica se o usuário pode acessar uma rota administrativa
 */
export function canAccessAdmin(user) {
  return isAdmin(user);
}

