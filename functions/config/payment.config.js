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
 * Configuração de pagamento
 */
module.exports = {
    // Gateway ativo (pode ser mudado via variável de ambiente)
    // Opções: 'mercadopago', 'stripe' (futuro)
    activeGateway: process.env.PAYMENT_GATEWAY || 'mercadopago',
    
    // Credenciais Mercado Pago
    mercadopago: getMercadoPagoConfig(),
    
    // Futuro: Adicionar outros gateways aqui
    // stripe: { ... },
    
    /**
     * Valida se as credenciais necessárias estão configuradas
     */
    validate() {
        const config = module.exports;
        
        if (config.activeGateway === 'mercadopago') {
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
        const gateway = module.exports.activeGateway;
        
        switch(gateway) {
            case 'mercadopago':
                return module.exports.mercadopago;
            // Futuro: case 'stripe': return module.exports.stripe;
            default:
                throw new Error(`Gateway "${gateway}" não suportado`);
        }
    }
};
