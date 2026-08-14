const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Carregar variáveis de ambiente do .env (apenas em desenvolvimento local)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Inicializar Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Importar módulos de pagamento modulares
const GatewayFactory = require('./gateways/GatewayFactory');
const paymentConfig = require('./config/payment.config');

const PAYMENT_METHODS = ['pix', 'boleto', 'credit_card'];

/**
 * Arredonda para 2 casas decimais (evita erro de ponto flutuante em dinheiro).
 */
function round2(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Reduz o estoque de produtos no Firestore
 * Usa transação para garantir atomicidade
 */
async function reduceProductStock(items) {
    const results = {
        success: true,
        updated: [],
        errors: []
    };

    try {
        const batch = db.batch();

        for (const item of items) {
            const productRef = db.collection('products').doc(item.productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
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

            batch.update(productRef, {
                stock: admin.firestore.FieldValue.increment(-item.quantity),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
            results.success = false;
            return results;
        }

        await batch.commit();
        return results;
    } catch (error) {
        console.error('Erro ao reduzir estoque:', error);
        results.success = false;
        results.errors.push({ error: error.message });
        return results;
    }
}

/**
 * Cloud Function: createOrder
 * Cria o pedido NO SERVIDOR, buscando os preços reais no Firestore.
 *
 * O cliente envia APENAS `items: [{ productId, quantity }]` + `customer` +
 * `shippingAddress` + `paymentMethod`. Subtotal/frete/desconto/total são
 * calculados aqui a partir dos preços gravados em `products` — nunca aceitos
 * do cliente. Fecha a V-02 (pedido de R$ 0,01 via carrinho adulterado no
 * localStorage). Ver docs/seguranca/AUDITORIA_SEGURANCA.md.
 *
 * @param {Array} data.items - [{ productId: string, quantity: int }]
 * @param {Object} data.customer - { name, email, phone?, document? }
 * @param {Object} data.shippingAddress - { street, city, state, zipCode, ... }
 * @param {string} data.paymentMethod - 'pix' | 'boleto' | 'credit_card'
 * @returns {Promise<{ orderId: string, finalTotal: number }>}
 */
exports.createOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário deve estar autenticado para criar um pedido'
        );
    }

    const { items, customer, shippingAddress, paymentMethod } = data || {};

    if (!Array.isArray(items) || items.length === 0) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Pedido deve conter pelo menos um item'
        );
    }
    if (items.length > 100) {
        throw new functions.https.HttpsError('invalid-argument', 'Muitos itens no pedido');
    }
    for (const item of items) {
        if (!item || typeof item.productId !== 'string' || !item.productId.trim()) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Cada item precisa de um productId válido'
            );
        }
        const quantity = parseInt(item.quantity, 10);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Quantidade inválida para o item'
            );
        }
    }
    if (!customer || typeof customer.name !== 'string' || !customer.name.trim()) {
        throw new functions.https.HttpsError('invalid-argument', 'Dados do cliente são obrigatórios');
    }
    if (typeof customer.email !== 'string' || !/^\S+@\S+\.\S+$/.test(customer.email)) {
        throw new functions.https.HttpsError('invalid-argument', 'Email do cliente é obrigatório');
    }
    if (
        !shippingAddress ||
        typeof shippingAddress.street !== 'string' || !shippingAddress.street.trim() ||
        typeof shippingAddress.city !== 'string' || !shippingAddress.city.trim() ||
        typeof shippingAddress.state !== 'string' || !shippingAddress.state.trim() ||
        typeof shippingAddress.zipCode !== 'string' || !shippingAddress.zipCode.trim()
    ) {
        throw new functions.https.HttpsError('invalid-argument', 'Endereço de entrega é obrigatório');
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            `paymentMethod deve ser um de: ${PAYMENT_METHODS.join(', ')}`
        );
    }

    try {
        // Resolve preços reais a partir do Firestore (nunca do cliente).
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const productRef = db.collection('products').doc(item.productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                throw new functions.https.HttpsError(
                    'not-found',
                    `Produto não encontrado: ${item.productId}`
                );
            }

            const product = productDoc.data();

            if (product.active !== true) {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    `Produto indisponível: ${product.name || item.productId}`
                );
            }

            const quantity = parseInt(item.quantity, 10);

            if (typeof product.stock === 'number' && product.stock < quantity) {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    `Estoque insuficiente para "${product.name || item.productId}"`
                );
            }

            const price = Number(product.price);
            if (!Number.isFinite(price) || price < 0) {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    `Preço inválido para o produto "${product.name || item.productId}"`
                );
            }

            const itemSubtotal = round2(price * quantity);
            subtotal += itemSubtotal;
            orderItems.push({
                productId: item.productId,
                name: product.name || item.productId,
                price,
                quantity,
                subtotal: itemSubtotal,
                supplierId: product.supplierId || null,
                supplierName: product.supplierName || null
            });
        }

        // Frete/desconto: sem cálculo no MVP (0). Total recalculado no servidor.
        const shipping = 0;
        const discount = 0;
        const finalTotal = round2(subtotal + shipping - discount);

        const order = {
            userId: context.auth.uid,
            items: orderItems,
            subtotal,
            shipping,
            discount,
            finalTotal,
            customer: {
                name: String(customer.name).trim(),
                email: String(customer.email).trim(),
                phone: customer.phone ? String(customer.phone).trim() : '',
                document: customer.document ? String(customer.document).trim() : ''
            },
            shippingAddress: {
                street: String(shippingAddress.street).trim(),
                complement: shippingAddress.complement ? String(shippingAddress.complement).trim() : '',
                neighborhood: shippingAddress.neighborhood ? String(shippingAddress.neighborhood).trim() : '',
                city: String(shippingAddress.city).trim(),
                state: String(shippingAddress.state).trim(),
                zipCode: String(shippingAddress.zipCode).trim(),
                country: shippingAddress.country || 'Brasil'
            },
            payment: {
                method: paymentMethod,
                status: 'pending',
                gateway: 'mercadopago',
                gatewayTransactionId: null,
                gatewayPaymentId: null,
                pix: null,
                boleto: null,
                card: null,
                createdAt: admin.firestore.Timestamp.now(),
                approvedAt: null,
                rejectedAt: null
            },
            orderStatus: 'pending',
            tracking: null,
            statusHistory: [
                {
                    status: 'pending',
                    timestamp: admin.firestore.Timestamp.now(),
                    changedBy: context.auth.uid
                }
            ],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const orderRef = await db.collection('orders').add(order);

        return { orderId: orderRef.id, finalTotal };
    } catch (error) {
        console.error('Erro ao criar pedido (servidor):', error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError('internal', 'Erro ao criar pedido. Tente novamente.');
    }
});

/**
 * Cloud Function: createPaymentIntent
 * Cria intenção de pagamento (PIX, Boleto ou Cartão) no Mercado Pago
 *
 * @param {string} data.orderId - ID do pedido no Firestore
 * @param {string} data.paymentMethod - 'pix' | 'boleto' | 'credit_card'
 * @param {number} data.amount - Valor do pagamento
 * @param {string} [data.token] - Obrigatório para credit_card (tokenização MP)
 * @param {number} [data.installments] - Parcelas (cartão), default 1
 */
exports.createPaymentIntent = functions.runWith({
    secrets: ['MERCADOPAGO_ACCESS_TOKEN']
}).https.onCall(async (data, context) => {
    try {
        paymentConfig.validate();
    } catch (err) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            `Configuração de pagamento inválida: ${err.message}`
        );
    }
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário deve estar autenticado para criar um pagamento'
        );
    }

    try {
        // O `amount` NÃO é aceito do cliente: o valor cobrado é lido do pedido no
        // Firestore, mais abaixo. Aceitá-lo daqui permitia pagar R$ 0,01 num pedido
        // de R$ 500 (V-01). Ver docs/seguranca/AUDITORIA_SEGURANCA.md
        const { orderId, paymentMethod, token, installments } = data;

        if (!orderId || !paymentMethod) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'orderId e paymentMethod são obrigatórios'
            );
        }
        if (!PAYMENT_METHODS.includes(paymentMethod)) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `paymentMethod deve ser um de: ${PAYMENT_METHODS.join(', ')}`
            );
        }
        if (paymentMethod === 'credit_card' && !token) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Token do cartão é obrigatório para pagamento com crédito'
            );
        }

        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Pedido não encontrado');
        }

        const order = orderDoc.data();

        if (order.userId !== context.auth.uid) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Você não tem permissão para acessar este pedido'
            );
        }

        // Validar se o método de pagamento corresponde ao do pedido
        const orderPaymentMethod = order.payment?.method;
        if (orderPaymentMethod && orderPaymentMethod !== paymentMethod) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Método de pagamento "${paymentMethod}" não corresponde ao método do pedido ("${orderPaymentMethod}")`
            );
        }

        if (order.payment?.gatewayPaymentId) {
            throw new functions.https.HttpsError(
                'already-exists',
                'Pagamento já foi criado para este pedido'
            );
        }

        // Fonte da verdade do valor cobrado: o pedido gravado no Firestore.
        const amount = Number(order.finalTotal);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Pedido com valor inválido. Refaça o pedido ou contate o suporte.'
            );
        }

        const gateway = GatewayFactory.create();

        const paymentResult = await gateway.createPayment({
            orderId,
            amount,
            paymentMethod,
            customer: {
                email: order.customer.email,
                name: order.customer.name,
                document: order.customer.document
            },
            metadata: { user_id: context.auth.uid },
            ...(paymentMethod === 'credit_card' && {
                token: String(token).trim(),
                installments: Math.max(1, Math.min(12, parseInt(installments, 10) || 1))
            })
        });

        const updates = {
            'payment.gatewayTransactionId': paymentResult.gatewayTransactionId,
            'payment.gatewayPaymentId': paymentResult.gatewayPaymentId,
            'payment.status': paymentResult.status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (paymentResult.pix) {
            updates['payment.pix'] = {
                qrCode: paymentResult.pix.qrCode || null,
                qrCodeBase64: paymentResult.pix.qrCodeBase64 || null,
                expiresAt: admin.firestore.Timestamp.fromMillis(paymentResult.pix.expiresAt)
            };
        } else {
            updates['payment.pix'] = null;
        }

        if (paymentResult.boleto) {
            updates['payment.boleto'] = {
                pdfUrl: paymentResult.boleto.pdfUrl || null,
                barcode: paymentResult.boleto.barcode || null,
                barcodeFormatted: paymentResult.boleto.barcodeFormatted || null,
                dueDate: admin.firestore.Timestamp.fromMillis(paymentResult.boleto.dueDate)
            };
        } else {
            updates['payment.boleto'] = null;
        }

        if (paymentResult.card) {
            updates['payment.card'] = {
                status: paymentResult.card.status || null,
                statusDetail: paymentResult.card.statusDetail || null
            };
        } else {
            updates['payment.card'] = null;
        }

        await orderRef.update(updates);

        const response = {
            success: true,
            paymentId: paymentResult.gatewayPaymentId,
            pix: null,
            boleto: null,
            card: null
        };

        if (paymentResult.pix) {
            response.pix = {
                qrCode: paymentResult.pix.qrCode,
                qrCodeBase64: paymentResult.pix.qrCodeBase64,
                expiresAt: paymentResult.pix.expiresAt
            };
        }
        if (paymentResult.boleto) {
            response.boleto = {
                pdfUrl: paymentResult.boleto.pdfUrl,
                barcode: paymentResult.boleto.barcode,
                barcodeFormatted: paymentResult.boleto.barcodeFormatted,
                dueDate: paymentResult.boleto.dueDate
            };
        }
        if (paymentResult.card) {
            response.card = {
                status: paymentResult.card.status,
                statusDetail: paymentResult.card.statusDetail
            };
        }

        return response;
    } catch (error) {
        console.error('Erro ao criar intenção de pagamento:', error);
        console.error('Stack trace:', error.stack);

        // Se já for HttpsError, apenas re-throw
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        // Para outros erros, criar HttpsError com mensagem detalhada
        const errorMessage = error.message || 'Erro desconhecido ao processar pagamento';
        console.error('Erro detalhado:', {
            message: errorMessage,
            code: error.code,
            status: error.status,
            response: error.response
        });

        throw new functions.https.HttpsError(
            'internal',
            `Erro ao processar pagamento: ${errorMessage}. Tente novamente ou entre em contato com o suporte.`
        );
    }
});

/**
 * Cloud Function: checkPaymentStatus
 * Verifica o status de um pagamento no Mercado Pago
 * 
 * @param {string} data.orderId - ID do pedido
 */
exports.checkPaymentStatus = functions.runWith({
    secrets: ['MERCADOPAGO_ACCESS_TOKEN']
}).https.onCall(async (data, context) => {
    // Validar configuração de pagamento
    try {
        paymentConfig.validate();
    } catch (error) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            `Configuração de pagamento inválida: ${error.message}`
        );
    }
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário deve estar autenticado'
        );
    }

    try {
        const { orderId } = data;

        if (!orderId) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'orderId é obrigatório'
            );
        }

        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new functions.https.HttpsError(
                'not-found',
                'Pedido não encontrado'
            );
        }

        const order = orderDoc.data();

        if (order.userId !== context.auth.uid) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Você não tem permissão para acessar este pedido'
            );
        }

        return {
            status: order.payment?.status || 'pending',
            orderStatus: order.orderStatus || 'pending'
        };
    } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            'internal',
            'Erro ao verificar status do pagamento'
        );
    }
});

/**
 * Cloud Function: handlePaymentWebhook
 * Endpoint HTTP para receber webhooks do Mercado Pago
 * 
 * IMPORTANTE: Configure esta URL no painel do Mercado Pago
 * URL: https://us-central1-<project-id>.cloudfunctions.net/handlePaymentWebhook
 */
exports.handlePaymentWebhook = functions.runWith({
    secrets: ['MERCADOPAGO_ACCESS_TOKEN']
}).https.onRequest(async (req, res) => {
    // Validar configuração de pagamento
    try {
        paymentConfig.validate();
    } catch (error) {
        console.error('Erro na configuração de pagamento:', error);
        return res.status(500).send('Erro na configuração do gateway de pagamento');
    }
    // Verificar método HTTP
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { type, data } = req.body;

        // Processar apenas eventos de pagamento
        if (type === 'payment') {
            const paymentId = data?.id;

            if (!paymentId) {
                return res.status(400).send('Payment ID não encontrado');
            }

            // Processar webhook usando gateway modular
            const gateway = GatewayFactory.create();
            
            const webhookResult = await gateway.processWebhook(req.body);
            
            if (!webhookResult.processed) {
                return res.status(200).send('Evento ignorado');
            }

            const orderId = webhookResult.orderId;
            
            if (!orderId) {
                console.error('Pedido não encontrado no metadata do pagamento:', paymentId);
                return res.status(400).send('Pedido não encontrado');
            }

            const orderRef = db.collection('orders').doc(orderId);
            const orderDoc = await orderRef.get();

            if (!orderDoc.exists) {
                console.error('Pedido não existe no Firestore:', orderId);
                return res.status(404).send('Pedido não encontrado');
            }

            const order = orderDoc.data();
            const currentStatus = order.payment?.status || 'pending';
            const newStatus = webhookResult.status;

            // Atualizar pedido apenas se status mudou
            if (currentStatus !== newStatus) {
                const updates = {
                    'payment.status': newStatus,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };

                // Atualizar IDs do gateway se disponível
                if (webhookResult.paymentId) {
                    updates['payment.gatewayTransactionId'] = webhookResult.paymentId;
                    updates['payment.gatewayPaymentId'] = webhookResult.paymentId;
                }

                // Se pagamento aprovado, atualizar status do pedido
                if (newStatus === 'approved') {
                    updates.orderStatus = 'paid';
                    updates['payment.approvedAt'] = admin.firestore.FieldValue.serverTimestamp();

                    // Adicionar ao histórico - usar Timestamp.now() pois serverTimestamp() não funciona dentro de arrays
                    const statusHistory = order.statusHistory || [];
                    statusHistory.push({
                        status: 'paid',
                        timestamp: admin.firestore.Timestamp.now(),
                        changedBy: 'system'
                    });
                    updates.statusHistory = statusHistory;

                    // Reduzir estoque dos produtos
                    try {
                        const items = order.items || [];
                        const stockResults = await reduceProductStock(items);

                        if (stockResults.success) {
                            console.log(`✅ Estoque reduzido para pedido ${orderId}:`, stockResults.updated);
                            updates.stockReduced = true;
                            updates.stockReductionDetails = stockResults.updated;
                        } else {
                            console.error(`⚠️ Falha ao reduzir estoque do pedido ${orderId}:`, stockResults.errors);
                            updates.stockReduced = false;
                            updates.stockReductionErrors = stockResults.errors;
                        }
                    } catch (stockError) {
                        console.error(`❌ Erro ao processar estoque do pedido ${orderId}:`, stockError);
                        updates.stockReduced = false;
                        updates.stockReductionErrors = [{ error: stockError.message }];
                    }
                } else if (newStatus === 'rejected') {
                    updates['payment.rejectedAt'] = admin.firestore.FieldValue.serverTimestamp();
                }

                await orderRef.update(updates);

                console.log(`Pedido ${orderId} atualizado: ${currentStatus} → ${newStatus}`);
            }

            return res.status(200).send('OK');
        }

        // Para outros tipos de eventos, apenas confirmar recebimento
        return res.status(200).send('OK');
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        return res.status(500).send('Erro ao processar webhook');
    }
});
