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
        // Validar configuração
        paymentConfig.validate();
        
        const gatewayName = paymentConfig.activeGateway;
        const config = paymentConfig.getActiveGatewayConfig();
        
        console.log(`🔌 Inicializando gateway: ${gatewayName}`);
        
        switch(gatewayName) {
            case 'mercadopago':
                return new MercadoPagoGateway(config);
            
            // Futuro: Adicionar outros gateways
            // case 'stripe':
            //     return new StripeGateway(config);
            
            default:
                throw new Error(`Gateway "${gatewayName}" não suportado. Gateways disponíveis: mercadopago`);
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
