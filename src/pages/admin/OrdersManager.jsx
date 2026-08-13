import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllOrders, getOrderStats } from '../../services/orderService';
import { 
    Package, 
    Loader2, 
    AlertCircle, 
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Clock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import OrderCard from '../../components/orders/OrderCard';

const OrdersManager = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/admin/orders');
            return;
        }

        loadData();
    }, [currentUser, navigate, filter]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [ordersData, statsData] = await Promise.all([
                getAllOrders({ status: filter }),
                getOrderStats()
            ]);
            
            setOrders(ordersData);
            setStats(statsData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao carregar pedidos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };

    if (loading && !stats) {
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
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
                        Gerenciar Pedidos
                    </h1>
                    <p className="text-text-secondary">
                        Visualize e gerencie todos os pedidos da plataforma
                    </p>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">Total de Pedidos</p>
                                        <p className="text-3xl font-bold text-secondary">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <ShoppingCart className="text-blue-600" size={24} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">Receita Total</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(stats.totalRevenue)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <DollarSign className="text-green-600" size={24} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">Receita Confirmada</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {formatCurrency(stats.paidRevenue)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <TrendingUp className="text-primary" size={24} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary mb-1">Pendentes</p>
                                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <Clock className="text-yellow-600" size={24} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-sm text-red-800">{error}</p>
                            <button
                                onClick={loadData}
                                className="text-sm text-red-600 hover:text-red-700 font-medium mt-2"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                )}

                <div className="mb-6 flex flex-wrap gap-2">
                    {[
                        { value: 'all', label: 'Todos', count: stats?.total },
                        { value: 'pending', label: 'Pendentes', count: stats?.pending },
                        { value: 'paid', label: 'Pagos', count: stats?.paid },
                        { value: 'processing', label: 'Processando', count: stats?.processing },
                        { value: 'shipped', label: 'Enviados', count: stats?.shipped },
                        { value: 'delivered', label: 'Entregues', count: stats?.delivered },
                        { value: 'cancelled', label: 'Cancelados', count: stats?.cancelled }
                    ].map(({ value, label, count }) => (
                        <button
                            key={value}
                            onClick={() => setFilter(value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === value
                                    ? 'bg-primary text-background'
                                    : 'bg-white text-text-secondary border border-gray-200 hover:border-primary hover:text-primary'
                            }`}
                        >
                            {label} {count !== undefined && `(${count})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="mx-auto text-primary animate-spin mb-4" size={32} />
                        <p className="text-text-secondary">Carregando pedidos...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                        <Package className="mx-auto text-gray-300 mb-4" size={64} />
                        <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
                            Nenhum pedido encontrado
                        </h2>
                        <p className="text-text-secondary">
                            {filter === 'all' 
                                ? 'Ainda não há pedidos na plataforma' 
                                : 'Nenhum pedido encontrado com este filtro'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <OrderCard key={order.id} order={order} isAdmin={true} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersManager;
