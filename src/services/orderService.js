import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

function normalizeOrderStatus(status) {
    const s = String(status || '').trim();
    if (!ORDER_STATUSES.includes(s)) {
        throw new Error(`Status inválido: "${status}". Use: ${ORDER_STATUSES.join(', ')}`);
    }
    return s;
}

function addStatusHistoryEntry(order, entry) {
    const current = Array.isArray(order?.statusHistory) ? order.statusHistory : [];
    return [
        ...current,
        {
            status: entry.status,
            timestamp: new Date(),
            changedBy: entry.changedBy || 'system',
            ...(entry.reason ? { reason: entry.reason } : {})
        }
    ];
}

/**
 * Cria um novo pedido no Firestore
 * 
 * IMPORTANTE: Este serviço cria o pedido, mas o processamento de pagamento
 * deve ser feito via Cloud Functions para segurança.
 * 
 * @param {Object} orderData - Dados do pedido
 * @param {string} orderData.userId - ID do usuário
 * @param {Array} orderData.items - Itens do pedido
 * @param {Object} orderData.customer - Dados do cliente
 * @param {Object} orderData.shippingAddress - Endereço de entrega
 * @param {number} orderData.subtotal - Subtotal (validado no servidor)
 * @param {number} orderData.shipping - Frete
 * @param {number} orderData.finalTotal - Total final
 * @returns {Promise<string>} ID do pedido criado
 */
export async function createOrder(orderData) {
    try {
        // Validações básicas (validações completas devem ser feitas no servidor)
        if (!orderData.userId) {
            throw new Error('ID do usuário é obrigatório');
        }

        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('Pedido deve conter pelo menos um item');
        }

        if (!orderData.customer) {
            throw new Error('Dados do cliente são obrigatórios');
        }

        if (!orderData.shippingAddress) {
            throw new Error('Endereço de entrega é obrigatório');
        }

        // Estrutura do pedido
        const order = {
            userId: orderData.userId,
            items: orderData.items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price, // Preço no momento da compra
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
                supplierId: item.supplierId || null,
                supplierName: item.supplierName || null
            })),
            subtotal: orderData.subtotal || 0,
            shipping: orderData.shipping || 0,
            discount: orderData.discount || 0,
            finalTotal: orderData.finalTotal || 0,
            customer: {
                name: orderData.customer.name,
                email: orderData.customer.email,
                phone: orderData.customer.phone || '',
                document: orderData.customer.document || '' // CPF/CNPJ
            },
            shippingAddress: {
                street: orderData.shippingAddress.street,
                complement: orderData.shippingAddress.complement || '',
                neighborhood: orderData.shippingAddress.neighborhood || '',
                city: orderData.shippingAddress.city,
                state: orderData.shippingAddress.state,
                zipCode: orderData.shippingAddress.zipCode,
                country: orderData.shippingAddress.country || 'Brasil'
            },
            payment: {
                method: orderData.paymentMethod || 'pix',
                status: 'pending',
                gateway: 'mercadopago',
                gatewayTransactionId: null,
                gatewayPaymentId: null,
                pix: null,
                boleto: null,
                card: null,
                createdAt: new Date(), // Usar Date() em vez de serverTimestamp() pois está dentro de objeto aninhado
                approvedAt: null,
                rejectedAt: null
            },
            orderStatus: 'pending',
            tracking: null,
            statusHistory: [
                {
                    status: 'pending',
                    timestamp: new Date(), // Usar Date() no array, serverTimestamp() não funciona dentro de arrays
                    changedBy: orderData.userId
                }
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const ordersRef = collection(db, 'orders');
        const docRef = await addDoc(ordersRef, order);

        return docRef.id;
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
    }
}

/**
 * Busca um pedido específico por ID
 * 
 * @param {string} orderId - ID do pedido
 * @returns {Promise<Object|null>} Dados do pedido ou null se não encontrado
 */
export async function getOrder(orderId) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
            return {
                id: orderSnap.id,
                ...orderSnap.data()
            };
        }

        return null;
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        throw error;
    }
}

/**
 * Busca todos os pedidos de um usuário
 * 
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de pedidos
 */
export async function getUserOrders(userId) {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao buscar pedidos do usuário:', error);
        throw error;
    }
}

/**
 * Atualiza o status de um pedido
 * 
 * IMPORTANTE: Esta função deve ser usada apenas com validação adequada.
 * A atualização de status após pagamento deve ser feita via Cloud Functions.
 * 
 * @param {string} orderId - ID do pedido
 * @param {string} newStatus - Novo status
 * @param {string} changedBy - ID do usuário/sistema que fez a mudança
 * @returns {Promise<void>}
 */
export async function updateOrderStatus(orderId, newStatus, changedBy = 'system') {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error('Pedido não encontrado');
        }

        const currentData = orderSnap.data();
        const statusHistory = currentData.statusHistory || [];

        // Criar novo histórico - usar new Date() pois serverTimestamp() não funciona dentro de arrays
        const newHistory = [
            ...statusHistory,
            {
                status: newStatus,
                timestamp: new Date(), // new Date() será convertido para Firestore Timestamp automaticamente
                changedBy: changedBy
            }
        ];

        await updateDoc(orderRef, {
            orderStatus: newStatus,
            statusHistory: newHistory,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        throw error;
    }
}

/**
 * Atualiza informações de pagamento do pedido
 * 
 * IMPORTANTE: Esta função deve ser usada apenas com validação adequada.
 * A atualização de pagamento deve ser feita via Cloud Functions após webhook.
 * 
 * @param {string} orderId - ID do pedido
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<void>}
 */
export async function updateOrderPayment(orderId, paymentData) {
    try {
        const orderRef = doc(db, 'orders', orderId);

        await updateDoc(orderRef, {
            'payment.status': paymentData.status,
            'payment.gatewayTransactionId': paymentData.gatewayTransactionId || null,
            'payment.gatewayPaymentId': paymentData.gatewayPaymentId || null,
            'payment.pix': paymentData.pix || null,
            'payment.boleto': paymentData.boleto || null,
            'payment.card': paymentData.card || null,
            'payment.approvedAt': paymentData.status === 'approved' ? serverTimestamp() : null,
            'payment.rejectedAt': paymentData.status === 'rejected' ? serverTimestamp() : null,
            orderStatus: paymentData.status === 'approved' ? 'paid' : 'pending',
            updatedAt: serverTimestamp()
        });

        // Adicionar ao histórico se status mudou
        if (paymentData.status === 'approved') {
            const orderSnap = await getDoc(orderRef);
            const currentData = orderSnap.data();
            const statusHistory = currentData.statusHistory || [];

            // Criar novo histórico - usar new Date() pois serverTimestamp() não funciona dentro de arrays
            const newHistory = [
                ...statusHistory,
                {
                    status: 'paid',
                    timestamp: new Date(), // new Date() será convertido para Firestore Timestamp automaticamente
                    changedBy: 'system'
                }
            ];

            // Atualizar histórico com new Date() - não podemos usar serverTimestamp() dentro de arrays
            await updateDoc(orderRef, {
                statusHistory: newHistory
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar pagamento do pedido:', error);
        throw error;
    }
}

export async function getAllOrders(filters = {}) {
    try {
        const ordersRef = collection(db, 'orders');
        let q = query(ordersRef, orderBy('createdAt', 'desc'));

        if (filters.status && filters.status !== 'all') {
            q = query(ordersRef, where('orderStatus', '==', filters.status), orderBy('createdAt', 'desc'));
        }

        if (filters.paymentMethod && filters.paymentMethod !== 'all') {
            q = query(ordersRef, where('payment.method', '==', filters.paymentMethod), orderBy('createdAt', 'desc'));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao buscar todos os pedidos:', error);
        throw error;
    }
}

export async function getOrderStats() {
    try {
        const ordersRef = collection(db, 'orders');
        const allOrders = await getDocs(ordersRef);

        const stats = {
            total: allOrders.size,
            pending: 0,
            paid: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            totalRevenue: 0,
            paidRevenue: 0
        };

        allOrders.forEach(doc => {
            const order = doc.data();
            stats[order.orderStatus] = (stats[order.orderStatus] || 0) + 1;
            stats.totalRevenue += order.finalTotal || 0;
            if (order.orderStatus === 'paid' || order.orderStatus === 'processing' ||
                order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
                stats.paidRevenue += order.finalTotal || 0;
            }
        });

        return stats;
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
    }
}

export async function cancelOrder(orderId, userId) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error('Pedido não encontrado');
        }

        const order = orderSnap.data();

        if (order.userId !== userId) {
            throw new Error('Você não tem permissão para cancelar este pedido');
        }

        if (order.orderStatus !== 'pending') {
            throw new Error('Apenas pedidos pendentes podem ser cancelados');
        }

        const statusHistory = order.statusHistory || [];
        const newHistory = [
            ...statusHistory,
            {
                status: 'cancelled',
                timestamp: new Date(),
                changedBy: userId,
                reason: 'Cancelado pelo cliente'
            }
        ];

        await updateDoc(orderRef, {
            orderStatus: 'cancelled',
            statusHistory: newHistory,
            cancelledAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        throw error;
    }
}

/**
 * Atualização administrativa do pedido (apenas admin)
 * Permite alterar orderStatus, tracking e internalNotes.
 */
export async function adminUpdateOrder(orderId, patch, adminId = 'system') {
    try {
        if (!orderId) throw new Error('orderId é obrigatório');
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error('Pedido não encontrado');
        }

        const order = orderSnap.data();
        const updates = { updatedAt: serverTimestamp() };

        if (patch?.orderStatus !== undefined) {
            const newStatus = normalizeOrderStatus(patch.orderStatus);
            updates.orderStatus = newStatus;

            // Registrar no histórico apenas se mudou de fato
            if (newStatus !== order.orderStatus) {
                updates.statusHistory = addStatusHistoryEntry(order, {
                    status: newStatus,
                    changedBy: adminId,
                    reason: 'Atualizado pelo admin'
                });
            }
        }

        if (patch?.tracking !== undefined) {
            const tracking = patch.tracking === null ? null : String(patch.tracking).trim();
            updates.tracking = tracking || null;
        }

        if (patch?.internalNotes !== undefined) {
            const notes = patch.internalNotes === null ? null : String(patch.internalNotes);
            updates.internalNotes = notes?.trim() ? notes.trim() : null;
        }

        await updateDoc(orderRef, updates);
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar pedido (admin):', error);
        throw error;
    }
}
