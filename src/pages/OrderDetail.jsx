import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrder, cancelOrder } from '../services/orderService';
import {
    ArrowLeft,
    Package,
    Calendar,
    CreditCard,
    MapPin,
    User,
    Mail,
    Phone,
    FileText,
    Loader2,
    AlertCircle,
    Truck,
    XCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderTimeline from '../components/orders/OrderTimeline';

const OrderDetail = () => {
    const { orderId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/orders');
            return;
        }

        loadOrder();
    }, [orderId, currentUser, navigate]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError(null);
            const orderData = await getOrder(orderId);
            
            if (!orderData) {
                setError('Pedido não encontrado');
                return;
            }

            if (orderData.userId !== currentUser.uid) {
                setError('Você não tem permissão para ver este pedido');
                return;
            }

            setOrder(orderData);
        } catch (err) {
            console.error('Erro ao carregar pedido:', err);
            setError('Erro ao carregar pedido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            await cancelOrder(orderId, currentUser.uid);
            setShowCancelModal(false);
            await loadOrder();
        } catch (err) {
            console.error('Erro ao cancelar pedido:', err);
            alert(err.message || 'Erro ao cancelar pedido. Tente novamente.');
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Data não disponível';
        
        let date;
        if (timestamp?.toDate) {
            date = timestamp.toDate();
        } else if (timestamp?.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else {
            date = new Date(timestamp);
        }
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value) => {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            pix: 'PIX',
            boleto: 'Boleto',
            credit_card: 'Cartão de Crédito'
        };
        return labels[method] || method;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="mx-auto text-primary animate-spin mb-4" size={48} />
                    <p className="text-text-secondary">Carregando pedido...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
                        {error}
                    </h2>
                    <Button onClick={() => navigate('/orders')} variant="primary">
                        <ArrowLeft size={18} className="mr-2" />
                        Voltar para Meus Pedidos
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-8">
                    <Button
                        onClick={() => navigate('/orders')}
                        variant="ghost"
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Voltar para Meus Pedidos
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
                                Pedido #{order.id.slice(-8).toUpperCase()}
                            </h1>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Calendar size={16} />
                                {formatDate(order.createdAt)}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <OrderStatusBadge status={order.orderStatus} />
                            {order.orderStatus === 'pending' && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                >
                                    <XCircle size={18} />
                                    Cancelar Pedido
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Package className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">
                                        Itens do Pedido
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Package className="text-gray-400" size={32} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-secondary mb-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-text-secondary mb-2">
                                                    Quantidade: {item.quantity}
                                                </p>
                                                <p className="text-sm font-semibold text-primary">
                                                    {formatCurrency(item.price)} x {item.quantity} = {formatCurrency(item.subtotal)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Frete</span>
                                        <span>{order.shipping > 0 ? formatCurrency(order.shipping) : 'Grátis'}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Desconto</span>
                                            <span>- {formatCurrency(order.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold text-secondary pt-2 border-t border-gray-200">
                                        <span>Total</span>
                                        <span className="text-primary">{formatCurrency(order.finalTotal)}</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <FileText className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">
                                        Histórico do Pedido
                                    </h2>
                                </div>
                                <OrderTimeline order={order} />
                            </CardBody>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <CreditCard className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">
                                        Pagamento
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-text-secondary mb-1">Método</p>
                                        <p className="font-semibold text-secondary">
                                            {getPaymentMethodLabel(order.payment?.method)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary mb-1">Status</p>
                                        <OrderStatusBadge status={order.payment?.status} />
                                    </div>
                                    {order.payment?.gatewayTransactionId && (
                                        <div>
                                            <p className="text-xs text-text-secondary mb-1">ID da Transação</p>
                                            <p className="text-sm font-mono text-secondary break-all">
                                                {order.payment.gatewayTransactionId}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <User className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">
                                        Dados do Cliente
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <User size={16} className="text-text-secondary mt-1" />
                                        <div>
                                            <p className="text-xs text-text-secondary">Nome</p>
                                            <p className="text-sm font-medium text-secondary">
                                                {order.customer?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Mail size={16} className="text-text-secondary mt-1" />
                                        <div>
                                            <p className="text-xs text-text-secondary">Email</p>
                                            <p className="text-sm font-medium text-secondary break-all">
                                                {order.customer?.email}
                                            </p>
                                        </div>
                                    </div>
                                    {order.customer?.phone && (
                                        <div className="flex items-start gap-2">
                                            <Phone size={16} className="text-text-secondary mt-1" />
                                            <div>
                                                <p className="text-xs text-text-secondary">Telefone</p>
                                                <p className="text-sm font-medium text-secondary">
                                                    {order.customer.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <MapPin className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">
                                        Endereço de Entrega
                                    </h2>
                                </div>

                                <div className="text-sm text-secondary space-y-1">
                                    <p>{order.shippingAddress?.street}</p>
                                    {order.shippingAddress?.complement && (
                                        <p>{order.shippingAddress.complement}</p>
                                    )}
                                    <p>
                                        {order.shippingAddress?.neighborhood} - {order.shippingAddress?.city}/{order.shippingAddress?.state}
                                    </p>
                                    <p>CEP: {order.shippingAddress?.zipCode}</p>
                                </div>
                            </CardBody>
                        </Card>

                        {order.tracking && (
                            <Card>
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Truck className="text-primary" size={24} />
                                        <h2 className="text-xl font-heading font-bold text-secondary">
                                            Rastreamento
                                        </h2>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary mb-1">Código de Rastreio</p>
                                        <p className="text-sm font-mono font-semibold text-secondary">
                                            {order.tracking}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Modal de Confirmação de Cancelamento */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <XCircle className="text-red-600" size={24} />
                                </div>
                                <h3 className="text-xl font-heading font-bold text-secondary">
                                    Cancelar Pedido
                                </h3>
                            </div>
                            <p className="text-text-secondary mb-6">
                                Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-text-secondary rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Cancelando...
                                        </>
                                    ) : (
                                        'Confirmar Cancelamento'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;
