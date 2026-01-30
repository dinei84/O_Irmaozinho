import { useNavigate } from 'react-router-dom';
import { Package, Calendar, CreditCard, MapPin, ChevronRight } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import OrderStatusBadge from './OrderStatusBadge';

const OrderCard = ({ order, isAdmin = false }) => {
    const navigate = useNavigate();

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

    const handleOpen = () => {
        const base = isAdmin ? '/admin/orders' : '/orders';
        navigate(`${base}/${order.id}`);
    };

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleOpen}>
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Package className="text-primary" size={24} />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-secondary text-lg">
                                    Pedido #{order.id.slice(-8).toUpperCase()}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Calendar size={14} />
                                    {formatDate(order.createdAt)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <p className="text-xs text-text-secondary mb-1">Status</p>
                                <OrderStatusBadge status={order.orderStatus} />
                            </div>

                            <div>
                                <p className="text-xs text-text-secondary mb-1">Pagamento</p>
                                <div className="flex items-center gap-2">
                                    <CreditCard size={14} className="text-text-secondary" />
                                    <span className="text-sm font-medium text-secondary">
                                        {getPaymentMethodLabel(order.payment?.method)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-text-secondary mb-1">Endereço</p>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-text-secondary" />
                                    <span className="text-sm font-medium text-secondary truncate">
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-text-secondary mb-1">Total</p>
                                    <p className="text-xl font-bold text-primary">
                                        {formatCurrency(order.finalTotal)}
                                    </p>
                                </div>
                                <div className="text-sm text-text-secondary">
                                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-end">
                        <ChevronRight className="text-text-secondary" size={24} />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default OrderCard;
