import { Check, Clock, Package, Truck, Home, XCircle } from 'lucide-react';

const OrderTimeline = ({ order }) => {
    const formatDate = (timestamp) => {
        if (!timestamp) return null;
        
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

    const timelineSteps = [
        {
            status: 'pending',
            label: 'Pedido Criado',
            icon: Package,
            completed: true,
            date: order.createdAt
        },
        {
            status: 'paid',
            label: 'Pagamento Aprovado',
            icon: Check,
            completed: ['paid', 'processing', 'shipped', 'delivered'].includes(order.orderStatus),
            date: order.payment?.approvedAt
        },
        {
            status: 'processing',
            label: 'Em Processamento',
            icon: Clock,
            completed: ['processing', 'shipped', 'delivered'].includes(order.orderStatus),
            date: null
        },
        {
            status: 'shipped',
            label: 'Enviado',
            icon: Truck,
            completed: ['shipped', 'delivered'].includes(order.orderStatus),
            date: order.shippedAt
        },
        {
            status: 'delivered',
            label: 'Entregue',
            icon: Home,
            completed: order.orderStatus === 'delivered',
            date: order.deliveredAt
        }
    ];

    if (order.orderStatus === 'cancelled') {
        return (
            <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="p-2 bg-red-100 rounded-full">
                    <XCircle className="text-red-600" size={24} />
                </div>
                <div>
                    <p className="font-semibold text-red-800">Pedido Cancelado</p>
                    {order.cancelledAt && (
                        <p className="text-sm text-red-600">{formatDate(order.cancelledAt)}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === timelineSteps.length - 1;
                const isCurrent = order.orderStatus === step.status;

                return (
                    <div key={step.status} className="relative">
                        <div className="flex items-start gap-4">
                            <div className="relative flex flex-col items-center">
                                <div className={`p-2 rounded-full ${
                                    step.completed
                                        ? 'bg-green-100'
                                        : isCurrent
                                        ? 'bg-blue-100'
                                        : 'bg-gray-100'
                                }`}>
                                    <Icon className={
                                        step.completed
                                            ? 'text-green-600'
                                            : isCurrent
                                            ? 'text-blue-600'
                                            : 'text-gray-400'
                                    } size={20} />
                                </div>
                                {!isLast && (
                                    <div className={`w-0.5 h-12 mt-2 ${
                                        step.completed ? 'bg-green-300' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>

                            <div className="flex-1 pb-8">
                                <p className={`font-semibold ${
                                    step.completed
                                        ? 'text-green-800'
                                        : isCurrent
                                        ? 'text-blue-800'
                                        : 'text-gray-500'
                                }`}>
                                    {step.label}
                                </p>
                                {step.date && (
                                    <p className="text-sm text-text-secondary mt-1">
                                        {formatDate(step.date)}
                                    </p>
                                )}
                                {isCurrent && !step.completed && (
                                    <p className="text-xs text-blue-600 mt-1">Em andamento</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderTimeline;
