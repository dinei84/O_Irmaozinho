import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    Loader2,
    AlertCircle,
    MapPin,
    Package,
    Save,
    Truck,
    User
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { getOrder, adminUpdateOrder } from '../../services/orderService';

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderDetailAdmin = () => {
    const { orderId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [saving, setSaving] = useState(false);
    const [draftStatus, setDraftStatus] = useState('pending');
    const [draftTracking, setDraftTracking] = useState('');
    const [draftInternalNotes, setDraftInternalNotes] = useState('');

    const canSave = useMemo(() => {
        if (!order) return false;
        return (
            draftStatus !== (order.orderStatus || 'pending') ||
            (draftTracking || '') !== (order.tracking || '') ||
            (draftInternalNotes || '') !== (order.internalNotes || '')
        );
    }, [order, draftStatus, draftTracking, draftInternalNotes]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/admin/orders');
            return;
        }
        loadOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, currentUser, navigate]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrder(orderId);
            if (!data) {
                setError('Pedido não encontrado');
                setOrder(null);
                return;
            }
            setOrder(data);
            setDraftStatus(data.orderStatus || 'pending');
            setDraftTracking(data.tracking || '');
            setDraftInternalNotes(data.internalNotes || '');
        } catch (err) {
            console.error('Erro ao carregar pedido (admin):', err);
            setError('Erro ao carregar pedido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Data não disponível';
        let date;
        if (timestamp?.toDate) date = timestamp.toDate();
        else if (timestamp?.seconds) date = new Date(timestamp.seconds * 1000);
        else date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;

    const getPaymentMethodLabel = (method) => {
        const labels = { pix: 'PIX', boleto: 'Boleto', credit_card: 'Cartão de Crédito' };
        return labels[method] || method || '—';
    };

    const handleSave = async () => {
        if (!order || !currentUser) return;
        setSaving(true);
        try {
            const patch = {
                orderStatus: draftStatus,
                tracking: draftTracking ? String(draftTracking).trim() : null,
                internalNotes: draftInternalNotes ? String(draftInternalNotes).trim() : null
            };
            await adminUpdateOrder(order.id, patch, currentUser.uid);
            await loadOrder();
        } catch (err) {
            console.error('Erro ao salvar alterações (admin):', err);
            alert(err?.message || 'Erro ao salvar alterações. Tente novamente.');
        } finally {
            setSaving(false);
        }
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
                    <h2 className="text-2xl font-heading font-bold text-secondary mb-4">{error}</h2>
                    <Button onClick={() => navigate('/admin/orders')} variant="primary">
                        <ArrowLeft size={18} className="mr-2" />
                        Voltar para Pedidos
                    </Button>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8">
                    <Button
                        onClick={() => navigate('/admin/orders')}
                        variant="ghost"
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Voltar para Pedidos
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
                        <div className="flex items-center gap-3">
                            <OrderStatusBadge status={order.orderStatus} />
                            <button
                                onClick={handleSave}
                                disabled={!canSave || saving}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    !canSave || saving
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-primary text-background hover:bg-primary/90'
                                }`}
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Package className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">Itens do Pedido</h2>
                                </div>

                                <div className="space-y-4">
                                    {order.items?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                                        >
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Package className="text-gray-400" size={32} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-secondary mb-1">{item.name}</h3>
                                                <p className="text-sm text-text-secondary mb-1">
                                                    Quantidade: {item.quantity}
                                                </p>
                                                {(item.supplierName || item.supplierId) && (
                                                    <p className="text-xs text-text-secondary mb-2">
                                                        Fornecedor: {item.supplierName || item.supplierId}
                                                    </p>
                                                )}
                                                <p className="text-sm font-semibold text-primary">
                                                    {formatCurrency(item.price)} x {item.quantity} ={' '}
                                                    {formatCurrency(item.subtotal)}
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
                                        <span>{Number(order.shipping || 0) > 0 ? formatCurrency(order.shipping) : 'Grátis'}</span>
                                    </div>
                                    {Number(order.discount || 0) > 0 && (
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
                                    <h2 className="text-xl font-heading font-bold text-secondary">Histórico do Pedido</h2>
                                </div>
                                <OrderTimeline order={order} />
                            </CardBody>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <User className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">Cliente</h2>
                                </div>
                                <div className="space-y-2 text-sm text-secondary">
                                    <p><span className="text-text-secondary">Nome:</span> {order.customer?.name || '—'}</p>
                                    <p><span className="text-text-secondary">Email:</span> {order.customer?.email || '—'}</p>
                                    <p><span className="text-text-secondary">UserId:</span> {order.userId || '—'}</p>
                                    {order.customer?.document && (
                                        <p><span className="text-text-secondary">Documento:</span> {order.customer.document}</p>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <MapPin className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">Endereço</h2>
                                </div>
                                <div className="text-sm text-secondary space-y-1">
                                    <p>{order.shippingAddress?.street || '—'}</p>
                                    {order.shippingAddress?.complement && <p>{order.shippingAddress.complement}</p>}
                                    <p>
                                        {order.shippingAddress?.neighborhood || '—'} - {order.shippingAddress?.city || '—'}/
                                        {order.shippingAddress?.state || '—'}
                                    </p>
                                    <p>CEP: {order.shippingAddress?.zipCode || '—'}</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <CreditCard className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">Pagamento</h2>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-text-secondary mb-1">Método</p>
                                        <p className="font-semibold text-secondary">{getPaymentMethodLabel(order.payment?.method)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary mb-1">Status</p>
                                        <OrderStatusBadge status={order.payment?.status} />
                                    </div>
                                    {order.payment?.gatewayPaymentId && (
                                        <div>
                                            <p className="text-xs text-text-secondary mb-1">Gateway Payment ID</p>
                                            <p className="text-sm font-mono text-secondary break-all">{order.payment.gatewayPaymentId}</p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Truck className="text-primary" size={24} />
                                    <h2 className="text-xl font-heading font-bold text-secondary">Ações do Admin</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-text-secondary mb-1 block">Status do pedido</label>
                                        <select
                                            value={draftStatus}
                                            onChange={(e) => setDraftStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-secondary"
                                        >
                                            {ORDER_STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-text-secondary mt-2">
                                            Dica: o `payment.status` vem do webhook. Aqui você controla o fluxo logístico (`orderStatus`).
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs text-text-secondary mb-1 block">Código de rastreio</label>
                                        <input
                                            value={draftTracking}
                                            onChange={(e) => setDraftTracking(e.target.value)}
                                            placeholder="BR123456789"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-secondary"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-text-secondary mb-1 block">Notas internas</label>
                                        <textarea
                                            value={draftInternalNotes}
                                            onChange={(e) => setDraftInternalNotes(e.target.value)}
                                            placeholder="Visível apenas para admin..."
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-secondary"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={!canSave || saving}
                                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                            !canSave || saving
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary text-background hover:bg-primary/90'
                                        }`}
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Salvar alterações
                                    </button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailAdmin;

