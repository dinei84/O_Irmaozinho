const paymentConfig = require('../config/payment.config');
const MercadoPagoGateway = require('./MercadoPagoGateway');
// Futuro: const StripeGateway = require('./StripeGateway');

/**
 * Factory para criar instâncias de gateways de pagamento
 * 
 * Permite trocar gateway facilmente via variável de ambiente
 */
class GatewayFactory {
    /**
     * Cria uma instância do gateway ativo
     * 
     * @returns {BaseGateway} Instância do gateway configurado
     */
    static create() {
        return GatewayFactory.createFor(paymentConfig.activeGateway);
    }

    /**
     * Cria uma instância de um gateway específico, pelo nome.
     *
     * Usado para rotear pelo gateway gravado no pedido (order.payment.gateway)
     * em vez da variável de ambiente: no dia em que PAYMENT_GATEWAY mudar, os
     * pedidos em trânsito precisam continuar sendo resolvidos pelo gateway que
     * de fato os criou. Ver ESTUDO_GATEWAY_ASAAS.md §9.
     *
     * @param {string} gatewayName
     * @returns {BaseGateway}
     */
    static createFor(gatewayName) {
        // Validar configuração do gateway pedido, não a do ativo
        paymentConfig.validate(gatewayName);

        const config = paymentConfig.getGatewayConfig(gatewayName);

        console.log(`🔌 Inicializando gateway: ${gatewayName}`);

        switch(gatewayName) {
            case 'mercadopago':
                return new MercadoPagoGateway(config);

            // Futuro: Adicionar outros gateways
            // case 'stripe':
            //     return new StripeGateway(config);

            default:
                throw new Error(`Gateway "${gatewayName}" não suportado. Gateways disponíveis: ${GatewayFactory.getAvailableGateways().join(', ')}`);
        }
    }
    
    /**
     * Lista gateways disponíveis
     */
    static getAvailableGateways() {
        return ['mercadopago']; // Futuro: adicionar 'stripe', etc
    }
}

module.exports = GatewayFactory;
