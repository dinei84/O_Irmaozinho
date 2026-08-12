import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

/**
 * Página de confirmação após pedido criado
 */
const OrderConfirmation = ({ orderId, orderData }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="container mx-auto max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    {/* Ícone de Sucesso */}
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>

                    {/* Título */}
                    <h1 className="text-4xl font-heading font-bold text-secondary mb-4">
                        Pedido Confirmado!
                    </h1>
                    <p className="text-xl text-text-secondary mb-8">
                        Seu pedido foi criado com sucesso
                    </p>

                    {/* Informações do Pedido */}
                    {orderId && (
                        <div className="bg-surface border border-borda rounded-lg p-6 mb-8 text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="text-primary" size={20} />
                                <h2 className="text-lg font-semibold text-secondary">
                                    Informações do Pedido
                                </h2>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Número do Pedido:</span>
                                    <span className="font-semibold text-secondary">{orderId}</span>
                                </div>
                                {orderData?.finalTotal && (
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Valor Total:</span>
                                        <span className="font-semibold text-primary">
                                            R$ {orderData.finalTotal.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                )}
                                {orderData?.payment?.method && (
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Método de Pagamento:</span>
                                        <span className="font-semibold text-secondary">
                                            {{
                                                pix: 'PIX',
                                                boleto: 'Boleto',
                                                credit_card: 'Cartão de Crédito'
                                            }[orderData.payment.method] || orderData.payment.method}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mensagem */}
                    <div className="bg-areia border border-borda rounded-lg p-6 mb-8">
                        <p className="text-text-secondary">
                            {orderData?.payment?.method === 'pix' && (
                                <>
                                    <strong>Pagamento PIX confirmado.</strong> Você receberá um email de confirmação em breve.
                                </>
                            )}
                            {orderData?.payment?.method === 'boleto' && (
                                <>
                                    <strong>Boleto pago.</strong> O crédito pode levar até 2 dias úteis. Você receberá um email quando for confirmado.
                                </>
                            )}
                            {orderData?.payment?.method === 'credit_card' && (
                                <>
                                    <strong>Pagamento com cartão processado.</strong> Você receberá um email de confirmação em breve.
                                </>
                            )}
                            {!['pix', 'boleto', 'credit_card'].includes(orderData?.payment?.method) && (
                                <>
                                    Você receberá um email de confirmação em breve. Acompanhe o status em &quot;Meus Pedidos&quot;.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate(`/orders/${orderId}`)}
                            variant="primary"
                            className="flex items-center justify-center gap-2"
                        >
                            <Package size={18} />
                            Acompanhar Pedido
                        </Button>
                        <Button
                            onClick={() => navigate('/store')}
                            variant="outline"
                            className="flex items-center justify-center gap-2"
                        >
                            <Home size={18} />
                            Voltar para Loja
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
