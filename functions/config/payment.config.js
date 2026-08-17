const functions = require('firebase-functions');

/**
 * Configuração centralizada de pagamento
 * 
 * Permite trocar gateway e credenciais facilmente via variáveis de ambiente
 */

/**
 * Normaliza access token removendo "Bearer " se presente
 */
function normalizeAccessToken(token) {
    if (!token) return null;
    
    let normalized = token.trim();
    normalized = normalized.replace(/^Bearer\s+/i, '');
    return normalized.trim();
}

/**
 * Obtém credenciais do Mercado Pago
 */
function getMercadoPagoConfig() {
    // Prioridade: Secret > .env > config deprecado > fallback
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN 
        || functions.config().mercadopago?.access_token
        || null; // Sem fallback hardcoded por segurança
    
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY
        || functions.config().mercadopago?.public_key
        || null;

    return {
        accessToken: normalizeAccessToken(accessToken),
        publicKey: publicKey
    };
}

/**
 * Secrets exigidos por cada gateway suportado.
 *
 * As Cloud Functions declaram TODOS eles, não apenas os do gateway ativo: o
 * pagamento é roteado pelo gateway gravado em cada pedido (order.payment.gateway),
 * então uma mesma function pode precisar falar com um gateway antigo enquanto
 * pedidos em trânsito ainda existem. Ver ESTUDO_GATEWAY_ASAAS.md §9.
 */
const GATEWAY_SECRETS = {
    mercadopago: ['MERCADOPAGO_ACCESS_TOKEN']
    // Futuro: asaas: ['ASAAS_API_KEY'], stripe: ['STRIPE_SECRET_KEY']
};

/**
 * Gateway usado por pedidos criados antes de o campo `gateway` passar a ser
 * gravado a partir da configuração (OS_PAYMENT_001). É a verdade histórica
 * deles: até então, o único gateway existente era o Mercado Pago.
 */
const LEGACY_GATEWAY = 'mercadopago';

/**
 * Configuração de pagamento
 */
module.exports = {
    // Gateway ativo (pode ser mudado via variável de ambiente)
    // Opções: 'mercadopago', 'stripe' (futuro)
    activeGateway: process.env.PAYMENT_GATEWAY || 'mercadopago',

    legacyGateway: LEGACY_GATEWAY,
    
    // Credenciais Mercado Pago
    mercadopago: getMercadoPagoConfig(),
    
    // Futuro: Adicionar outros gateways aqui
    // stripe: { ... },
    
    /**
     * Valida se as credenciais necessárias estão configuradas.
     *
     * @param {string} [gatewayName] - Gateway a validar. Omitido, valida o ativo.
     *   Recebe um nome explícito quando o pagamento é roteado pelo gateway
     *   gravado no pedido, que pode não ser o ativo.
     */
    validate(gatewayName) {
        const config = module.exports;
        const gateway = gatewayName || config.activeGateway;

        if (gateway === 'mercadopago') {
            if (!config.mercadopago.accessToken) {
                throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado. Configure via Secrets ou variável de ambiente.');
            }
        }

        return true;
    },
    
    /**
     * Obtém configuração do gateway ativo
     */
    getActiveGatewayConfig() {
        return module.exports.getGatewayConfig(module.exports.activeGateway);
    },

    /**
     * Obtém a configuração de um gateway específico (roteamento por pedido)
     */
    getGatewayConfig(gatewayName) {
        switch(gatewayName) {
            case 'mercadopago':
                return module.exports.mercadopago;
            // Futuro: case 'stripe': return module.exports.stripe;
            default:
                throw new Error(`Gateway "${gatewayName}" não suportado`);
        }
    },

    /**
     * Lista os secrets de todos os gateways suportados, para declaração no
     * runWith() das Cloud Functions — evita espalhar nomes de secret de um
     * provedor específico pelo index.js.
     *
     * @returns {string[]}
     */
    getRequiredSecrets() {
        return Object.values(GATEWAY_SECRETS).flat();
    }
};
