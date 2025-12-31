/**
 * Serviço de auditoria
 * Registra ações importantes dos usuários para rastreabilidade
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Tipos de ações auditáveis
 */
export const AUDIT_ACTIONS = {
  ARTICLE_CREATED: 'article_created',
  ARTICLE_UPDATED: 'article_updated',
  ARTICLE_DELETED: 'article_deleted',
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
};

/**
 * Registra uma ação de auditoria
 * @param {string} action - Tipo de ação (use AUDIT_ACTIONS)
 * @param {string} userId - ID do usuário que realizou a ação
 * @param {string} targetId - ID do recurso afetado (opcional)
 * @param {object} metadata - Metadados adicionais (opcional)
 */
export async function logAudit(action, userId, targetId = null, metadata = {}) {
  try {
    if (!action || !userId) {
      console.warn('Auditoria: action e userId são obrigatórios');
      return;
    }

    await addDoc(collection(db, 'audit_logs'), {
      action,
      userId,
      targetId,
      metadata,
      timestamp: serverTimestamp(),
      ip: metadata.ip || null, // Pode ser obtido no backend via Cloud Functions
      userAgent: metadata.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
    });

    // Em produção, você pode querer fazer isso de forma assíncrona
    // para não bloquear a UI
  } catch (error) {
    // Não queremos que erros de auditoria quebrem a aplicação
    console.error('Erro ao registrar auditoria:', error);
  }
}

/**
 * Helper para logar ações de artigos
 */
export function logArticleAction(action, userId, articleId, metadata = {}) {
  return logAudit(action, userId, articleId, {
    ...metadata,
    resourceType: 'article',
  });
}

/**
 * Helper para logar ações de produtos
 */
export function logProductAction(action, userId, productId, metadata = {}) {
  return logAudit(action, userId, productId, {
    ...metadata,
    resourceType: 'product',
  });
}

