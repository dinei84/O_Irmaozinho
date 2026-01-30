import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

/**
 * Serviço para interagir com pagamentos via Cloud Functions
 *
 * IMPORTANTE: Todo processamento de pagamento é feito via Cloud Functions
 * para garantir segurança e conformidade.
 */

function handlePaymentError(error) {
    console.error('Erro no pagamento:', error);

    if (error.code === 'functions/unauthenticated') {
        throw new Error('Você precisa estar logado para fazer um pagamento');
    }
    if (error.code === 'functions/permission-denied') {
        throw new Error('Você não tem permissão para realizar esta operação');
    }
    if (error.code === 'functions/not-found') {
        throw new Error('Pedido não encontrado');
    }
    if (error.code === 'functions/already-exists') {
        throw new Error('Pagamento já foi criado para este pedido');
    }
    if (error.code === 'functions/invalid-argument') {
        throw new Error(error.message || 'Dados inválidos');
    }
    if (error.message) {
        throw new Error(error.message);
    }
    throw new Error('Erro ao processar pagamento. Tente novamente.');
}

/**
 * Cria intenção de pagamento PIX
 *
 * @param {string} orderId - ID do pedido
 * @param {number} amount - Valor do pagamento
 * @returns {Promise<{ qrCode, qrCodeBase64, expiresAt }>}
 */
export async function createPixPaymentIntent(orderId, amount) {
    try {
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
        const result = await createPaymentIntent({
            orderId,
            paymentMethod: 'pix',
            amount
        });

        const data = result.data;
        if (data.success && data.pix) {
            return {
                qrCode: data.pix.qrCode,
                qrCodeBase64: data.pix.qrCodeBase64,
                expiresAt: data.pix.expiresAt
            };
        }
        throw new Error('Resposta inválida do servidor');
    } catch (error) {
        handlePaymentError(error); // handlePaymentError sempre lança, então não precisa return
    }
}

/**
 * Cria intenção de pagamento por Boleto
 *
 * @param {string} orderId - ID do pedido
 * @param {number} amount - Valor do pagamento
 * @returns {Promise<{ pdfUrl, barcode, barcodeFormatted, dueDate }>}
 */
export async function createBoletoPaymentIntent(orderId, amount) {
    try {
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
        const result = await createPaymentIntent({
            orderId,
            paymentMethod: 'boleto',
            amount
        });

        const data = result.data;
        if (data.success && data.boleto) {
            return {
                pdfUrl: data.boleto.pdfUrl,
                barcode: data.boleto.barcode,
                barcodeFormatted: data.boleto.barcodeFormatted,
                dueDate: data.boleto.dueDate
            };
        }
        throw new Error('Resposta inválida do servidor');
    } catch (error) {
        handlePaymentError(error); // handlePaymentError sempre lança, então não precisa return
    }
}

/**
 * Cria intenção de pagamento por Cartão de Crédito
 *
 * @param {string} orderId - ID do pedido
 * @param {number} amount - Valor do pagamento
 * @param {string} token - Token do cartão (Mercado Pago SDK)
 * @param {number} [installments=1] - Número de parcelas
 * @returns {Promise<{ success, status, paymentId, card? }>}
 */
export async function createCardPaymentIntent(orderId, amount, token, installments = 1) {
    try {
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
        const result = await createPaymentIntent({
            orderId,
            paymentMethod: 'credit_card',
            amount,
            token: String(token).trim(),
            installments: Math.max(1, Math.min(12, parseInt(installments, 10) || 1))
        });

        const data = result.data;
        if (data.success) {
            return {
                success: true,
                status: data.card?.status ?? 'approved',
                paymentId: data.paymentId,
                card: data.card || null
            };
        }
        throw new Error('Resposta inválida do servidor');
    } catch (error) {
        handlePaymentError(error); // handlePaymentError sempre lança, então não precisa return
    }
}

/**
 * Verifica o status de um pagamento
 *
 * @param {string} orderId - ID do pedido
 * @returns {Promise<{ status, orderStatus }>}
 */
export async function checkPaymentStatus(orderId) {
    try {
        const checkStatus = httpsCallable(functions, 'checkPaymentStatus');
        const result = await checkStatus({ orderId });
        return result.data;
    } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
        throw error;
    }
}
