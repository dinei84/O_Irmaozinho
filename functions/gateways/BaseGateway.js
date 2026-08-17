/**
 * Interface base para gateways de pagamento
 * 
 * Todos os gateways devem implementar esta interface
 * para garantir compatibilidade e facilidade de troca
 */
class BaseGateway {
    constructor(config) {
        this.config = config;
        this.validateCredentials();
    }
    
    /**
     * Valida se as credenciais estão configuradas
     * Deve lançar erro se não estiverem válidas
     */
    validateCredentials() {
        throw new Error('Gateway deve implementar validateCredentials()');
    }
    
    /**
     * Cria um pagamento
     * 
     * @param {Object} data - Dados do pagamento
     * @param {string} data.orderId - ID do pedido
     * @param {number} data.amount - Valor do pagamento
     * @param {string} data.paymentMethod - Método de pagamento ('pix', 'credit_card', etc)
     * @param {Object} data.customer - Dados do cliente
     * @param {Object} data.metadata - Metadados adicionais
     * 
     * @returns {Promise<Object>} Dados do pagamento criado
     */
    async createPayment(data) {
        throw new Error('Gateway deve implementar createPayment()');
    }
    
    /**
     * Busca status de um pagamento
     * 
     * @param {string} paymentId - ID do pagamento no gateway
     * @returns {Promise<Object>} Status do pagamento
     */
    async getPaymentStatus(paymentId) {
        throw new Error('Gateway deve implementar getPaymentStatus()');
    }
    
    /**
     * Processa webhook do gateway.
     *
     * O handler HTTP entrega o corpo da requisição CRU e não o interpreta —
     * qualquer conhecimento do formato do provedor (nome do evento, onde está o
     * id do pagamento, como se chega ao pedido) vive aqui dentro. O handler só
     * consome o retorno normalizado abaixo.
     *
     * @param {Object} payload - Payload cru do webhook, como veio do provedor
     * @returns {Promise<Object>} Resultado normalizado:
     *   - `processed` {boolean} — se o evento é relevante para nós
     *   - `reason` {string} — quando `processed: false`, por que foi ignorado
     *   - `paymentId` {string} — id do pagamento no gateway
     *   - `status` {string} — status já normalizado (ver normalizeStatus)
     *   - `orderId` {string} — id do pedido no Firestore
     */
    async processWebhook(payload) {
        throw new Error('Gateway deve implementar processWebhook()');
    }
    
    /**
     * Normaliza status do gateway para formato padrão
     * 
     * @param {string} gatewayStatus - Status do gateway
     * @returns {string} Status normalizado ('pending', 'approved', 'rejected', 'cancelled')
     */
    normalizeStatus(gatewayStatus) {
        throw new Error('Gateway deve implementar normalizeStatus()');
    }
}

module.exports = BaseGateway;
