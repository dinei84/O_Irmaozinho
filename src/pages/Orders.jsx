import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders } from '../services/orderService';
import { Package, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import OrderCard from '../components/orders/OrderCard';

const Orders = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/orders');
            return;
        }

        loadOrders();
    }, [currentUser, navigate]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const userOrders = await getUserOrders(currentUser.uid);
            setOrders(userOrders);
        } catch (err) {
            console.error('Erro ao carregar pedidos:', err);
            setError('Erro ao carregar pedidos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return order.orderStatus === 'pending';
        if (filter === 'paid') return order.orderStatus === 'paid';
        if (filter === 'processing') return order.orderStatus === 'processing';
        if (filter === 'shipped') return order.orderStatus === 'shipped';
        if (filter === 'delivered') return order.orderStatus === 'delivered';
        if (filter === 'cancelled') return order.orderStatus === 'cancelled';
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="mx-auto text-primary animate-spin mb-4" size={48} />
                    <p className="text-text-secondary">Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
                        Meus Pedidos
                    </h1>
                    <p className="text-text-secondary">
                        Acompanhe o status dos seus pedidos
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-pessego/30 border border-primary/30 rounded-lg flex items-start gap-3">
                        <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-sm text-secondary">{error}</p>
                            <button
                                onClick={loadOrders}
                                className="text-sm text-primary hover:text-primary-dark font-medium mt-2"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                )}

                {orders.length === 0 && !error ? (
                    <div className="text-center py-16">
                        <Package className="mx-auto text-text-secondary mb-6" size={64} />
                        <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
                            Nenhum pedido encontrado
                        </h2>
                        <p className="text-text-secondary mb-8">
                            Você ainda não fez nenhum pedido
                        </p>
                        <Button to="/store" variant="primary">
                            <ShoppingBag size={18} className="mr-2" />
                            Ir para Loja
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex flex-wrap gap-2">
                            {[
                                { value: 'all', label: 'Todos' },
                                { value: 'pending', label: 'Pendentes' },
                                { value: 'paid', label: 'Pagos' },
                                { value: 'processing', label: 'Processando' },
                                { value: 'shipped', label: 'Enviados' },
                                { value: 'delivered', label: 'Entregues' },
                                { value: 'cancelled', label: 'Cancelados' }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setFilter(value)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filter === value
                                            ? 'bg-primary text-background'
                                            : 'bg-surface text-text-secondary border border-borda hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 bg-surface rounded-lg border border-borda">
                                <Package className="mx-auto text-text-secondary mb-4" size={48} />
                                <p className="text-text-secondary">
                                    Nenhum pedido encontrado com este filtro
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;
