import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Ações de auditoria disponíveis
 */
export const AUDIT_ACTIONS = {
    ARTICLE_CREATED: 'article_created',
    ARTICLE_UPDATED: 'article_updated',
    ARTICLE_DELETED: 'article_deleted',
    PRODUCT_CREATED: 'product_created',
    PRODUCT_UPDATED: 'product_updated',
    PRODUCT_DELETED: 'product_deleted',
    SUPPLIER_CREATED: 'supplier_created',
    SUPPLIER_UPDATED: 'supplier_updated',
    SUPPLIER_DELETED: 'supplier_deleted',
    USER_ROLE_CHANGED: 'user_role_changed'
};

/**
 * Registra ação de auditoria para artigos
 */
export async function logArticleAction(action, userId, targetId, metadata = {}) {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            action,
            userId,
            targetId,
            targetType: 'article',
            metadata,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    } catch (error) {
        console.error('Erro ao registrar log de auditoria:', error);
        // Não lança erro para não quebrar o fluxo principal
    }
}

/**
 * Registra ação de auditoria para produtos
 */
export async function logProductAction(action, userId, targetId, metadata = {}) {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            action,
            userId,
            targetId,
            targetType: 'product',
            metadata,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    } catch (error) {
        console.error('Erro ao registrar log de auditoria:', error);
        // Não lança erro para não quebrar o fluxo principal
    }
}

/**
 * Registra ação de auditoria para fornecedores
 */
export async function logSupplierAction(action, userId, targetId, metadata = {}) {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            action,
            userId,
            targetId,
            targetType: 'supplier',
            metadata,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    } catch (error) {
        console.error('Erro ao registrar log de auditoria:', error);
        // Não lança erro para não quebrar o fluxo principal
    }
}

