import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, increment, runTransaction } from 'firebase/firestore';

/**
 * Reduz o estoque de produtos após aprovação de pagamento
 * Usa transação para garantir atomicidade
 * 
 * @param {Array} items - Array de itens do pedido [{productId, quantity}]
 * @returns {Promise<{success: boolean, updated: Array, errors: Array}>}
 */
export async function reduceStock(items) {
    const results = {
        success: true,
        updated: [],
        errors: []
    };

    try {
        await runTransaction(db, async (transaction) => {
            const productRefs = items.map(item => doc(db, 'products', item.productId));
            const productDocs = await Promise.all(
                productRefs.map(ref => transaction.get(ref))
            );

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const productDoc = productDocs[i];
                const productRef = productRefs[i];

                if (!productDoc.exists()) {
                    results.errors.push({
                        productId: item.productId,
                        error: 'Produto não encontrado'
                    });
                    continue;
                }

                const product = productDoc.data();
                const currentStock = product.stock || 0;

                if (currentStock < item.quantity) {
                    results.errors.push({
                        productId: item.productId,
                        productName: item.name,
                        requested: item.quantity,
                        available: currentStock,
                        error: 'Estoque insuficiente'
                    });
                    continue;
                }

                transaction.update(productRef, {
                    stock: increment(-item.quantity),
                    updatedAt: new Date()
                });

                results.updated.push({
                    productId: item.productId,
                    productName: item.name,
                    reduced: item.quantity,
                    previousStock: currentStock,
                    newStock: currentStock - item.quantity
                });
            }

            if (results.errors.length > 0) {
                throw new Error('Falha ao reduzir estoque de alguns produtos');
            }
        });

        return results;
    } catch (error) {
        console.error('Erro ao reduzir estoque:', error);
        results.success = false;
        return results;
    }
}

/**
 * Restaura o estoque de produtos (ex: cancelamento de pedido)
 * 
 * @param {Array} items - Array de itens do pedido [{productId, quantity}]
 * @returns {Promise<{success: boolean, restored: Array, errors: Array}>}
 */
export async function restoreStock(items) {
    const results = {
        success: true,
        restored: [],
        errors: []
    };

    try {
        await runTransaction(db, async (transaction) => {
            const productRefs = items.map(item => doc(db, 'products', item.productId));
            const productDocs = await Promise.all(
                productRefs.map(ref => transaction.get(ref))
            );

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const productDoc = productDocs[i];
                const productRef = productRefs[i];

                if (!productDoc.exists()) {
                    results.errors.push({
                        productId: item.productId,
                        error: 'Produto não encontrado'
                    });
                    continue;
                }

                const product = productDoc.data();
                const currentStock = product.stock || 0;

                transaction.update(productRef, {
                    stock: increment(item.quantity),
                    updatedAt: new Date()
                });

                results.restored.push({
                    productId: item.productId,
                    productName: item.name,
                    restored: item.quantity,
                    previousStock: currentStock,
                    newStock: currentStock + item.quantity
                });
            }
        });

        return results;
    } catch (error) {
        console.error('Erro ao restaurar estoque:', error);
        results.success = false;
        results.errors.push({
            error: error.message
        });
        return results;
    }
}

/**
 * Verifica disponibilidade de estoque para um pedido
 * 
 * @param {Array} items - Array de itens [{productId, quantity}]
 * @returns {Promise<{available: boolean, items: Array}>}
 */
export async function checkStockAvailability(items) {
    const results = {
        available: true,
        items: []
    };

    try {
        for (const item of items) {
            const productRef = doc(db, 'products', item.productId);
            const productDoc = await getDoc(productRef);

            if (!productDoc.exists()) {
                results.available = false;
                results.items.push({
                    productId: item.productId,
                    available: false,
                    reason: 'Produto não encontrado'
                });
                continue;
            }

            const product = productDoc.data();
            const currentStock = product.stock || 0;
            const isAvailable = currentStock >= item.quantity;

            if (!isAvailable) {
                results.available = false;
            }

            results.items.push({
                productId: item.productId,
                productName: product.name,
                requested: item.quantity,
                available: isAvailable,
                currentStock: currentStock
            });
        }

        return results;
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        throw error;
    }
}
