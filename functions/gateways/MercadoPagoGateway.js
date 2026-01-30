const { MercadoPagoConfig, Payment } = require('mercadopago');
const BaseGateway = require('./BaseGateway');

const SUPPORTED_METHODS = ['pix', 'boleto', 'credit_card'];
const BOLETO_EXPIRATION_DAYS = 3;

/**
 * Implementação do gateway Mercado Pago (PIX, Boleto, Cartão)
 */
class MercadoPagoGateway extends BaseGateway {
    constructor(config) {
        super(config);
        this.client = new MercadoPagoConfig({
            accessToken: config.accessToken,
            options: {
                timeout: 5000,
                idempotencyKey: 'abc'
            }
        });
        this.paymentClient = new Payment(this.client);
    }

    validateCredentials() {
        if (!this.config.accessToken) {
            throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
        }
        if (!this.config.accessToken.startsWith('APP_USR-') &&
            !this.config.accessToken.startsWith('TEST-')) {
            console.warn('⚠️ Access Token do Mercado Pago pode estar inválido');
        }
    }

    /**
     * Monta objeto payer reutilizável
     */
    buildPayer(customer) {
        const doc = customer.document?.replace(/\D/g, '') || '00000000000';
        const parts = (customer.name || '').trim().split(/\s+/);
        const firstName = parts[0] || 'Cliente';
        const lastName = parts.slice(1).join(' ') || '';
        return {
            email: customer.email,
            first_name: firstName,
            last_name: lastName,
            identification: {
                type: 'CPF',
                number: doc
            }
        };
    }

    /**
     * Cria pagamento (PIX, Boleto ou Cartão)
     */
    async createPayment(data) {
        const { orderId, amount, paymentMethod, customer, metadata, token, installments } = data;

        if (!SUPPORTED_METHODS.includes(paymentMethod)) {
            throw new Error(`Método "${paymentMethod}" não suportado. Use: ${SUPPORTED_METHODS.join(', ')}.`);
        }

        const baseBody = {
            transaction_amount: Number(amount),
            description: `Pedido #${orderId}`,
            payer: this.buildPayer(customer),
            metadata: {
                order_id: orderId,
                ...(metadata || {})
            }
        };

        let body;

        if (paymentMethod === 'pix') {
            body = {
                ...baseBody,
                payment_method_id: 'pix'
            };
        } else if (paymentMethod === 'boleto') {
            const expires = new Date();
            expires.setDate(expires.getDate() + BOLETO_EXPIRATION_DAYS);
            body = {
                ...baseBody,
                payment_method_id: 'bolbradesco',
                date_of_expiration: expires.toISOString().slice(0, 10) // YYYY-MM-DD
            };
        } else if (paymentMethod === 'credit_card') {
            if (!token) {
                throw new Error('Token do cartão é obrigatório para pagamento com crédito.');
            }
            body = {
                ...baseBody,
                payment_method_id: 'credit_card',
                token: String(token).trim(),
                installments: Math.max(1, Math.min(12, parseInt(installments, 10) || 1))
            };
        } else {
            throw new Error(`Método "${paymentMethod}" não implementado.`);
        }

        console.log(`Criando pagamento ${paymentMethod} no Mercado Pago...`, { orderId, amount });

        try {
            const payment = await this.paymentClient.create({ body });
            console.log('Pagamento criado:', payment.id);
            return this.formatPaymentResponse(payment, paymentMethod);
        } catch (err) {
            console.error('Erro ao criar pagamento no Mercado Pago:', err);
            if (err.response) {
                console.error('Resposta MP:', err.response);
            }
            const msg = err.message || err.cause?.message || 'Erro desconhecido';
            throw new Error(`Erro ao criar pagamento no Mercado Pago: ${msg}`);
        }
    }

    async getPaymentStatus(paymentId) {
        try {
            const payment = await this.paymentClient.get({ id: paymentId });
            return {
                id: payment.id?.toString(),
                status: this.normalizeStatus(payment.status),
                originalStatus: payment.status
            };
        } catch (err) {
            console.error('Erro ao buscar status do pagamento:', err);
            throw err;
        }
    }

    async processWebhook(payload) {
        const { type, data } = payload;

        if (type !== 'payment') {
            return { processed: false, reason: 'Evento não é de pagamento' };
        }

        const paymentId = data?.id;
        if (!paymentId) {
            throw new Error('Payment ID não encontrado no webhook');
        }

        const payment = await this.paymentClient.get({ id: paymentId });
        const orderId = payment.metadata?.order_id;

        if (!orderId) {
            console.error('Pedido não encontrado no metadata do pagamento:', paymentId);
            throw new Error('Pedido não encontrado no metadata do pagamento');
        }

        const status = this.normalizeStatus(payment.status);

        return {
            processed: true,
            paymentId: payment.id?.toString(),
            status,
            orderId
        };
    }

    normalizeStatus(gatewayStatus) {
        const map = {
            pending: 'pending',
            approved: 'approved',
            authorized: 'approved',
            rejected: 'rejected',
            cancelled: 'cancelled',
            refunded: 'cancelled',
            charged_back: 'rejected',
            in_process: 'pending',
            in_mediation: 'pending'
        };
        return map[String(gatewayStatus || '').toLowerCase()] || 'pending';
    }

    /**
     * Formata resposta padronizada (pix | boleto | card)
     */
    formatPaymentResponse(payment, paymentMethod) {
        // IMPORTANTE: PIX e Boleto SEMPRE começam como 'pending'
        // Apenas o webhook pode mudar para 'approved' após pagamento real
        let status;

        if (paymentMethod === 'pix' || paymentMethod === 'boleto') {
            // Forçar status 'pending' para PIX e Boleto
            // Evita aprovação prematura antes do pagamento real
            status = 'pending';
            console.log(`Status forçado para 'pending' (${paymentMethod}). Status original MP: ${payment.status}`);
        } else {
            // Cartão pode ser aprovado imediatamente
            status = this.normalizeStatus(payment.status);
        }

        const result = {
            gatewayPaymentId: payment.id?.toString(),
            gatewayTransactionId: payment.id?.toString(),
            status,
            originalStatus: payment.status,
            pix: null,
            boleto: null,
            card: null,
            metadata: payment.metadata || {}
        };

        if (paymentMethod === 'pix') {
            const pixData = payment.point_of_interaction?.transaction_data;
            if (pixData) {
                result.pix = {
                    qrCode: pixData.qr_code || null,
                    qrCodeBase64: pixData.qr_code_base64 || null,
                    expiresAt: pixData.expiration_date
                        ? new Date(pixData.expiration_date).getTime()
                        : Date.now() + 30 * 60 * 1000
                };
            }
        }

        if (paymentMethod === 'boleto') {
            const td = payment.transaction_details || {};
            const pdfUrl = td.external_resource_url || null;
            const barcode = payment.barcode?.content || td.verification_code || null;

            let dueDate;
            if (payment.date_of_expiration) {
                dueDate = new Date(payment.date_of_expiration).getTime();
            } else {
                const d = new Date();
                d.setDate(d.getDate() + BOLETO_EXPIRATION_DAYS);
                dueDate = d.getTime();
            }

            result.boleto = {
                pdfUrl,
                barcode,
                barcodeFormatted: barcode,
                dueDate
            };
        }

        if (paymentMethod === 'credit_card') {
            result.card = {
                status: payment.status,
                statusDetail: payment.status_detail || null
            };
        }

        return result;
    }
}

module.exports = MercadoPagoGateway;
