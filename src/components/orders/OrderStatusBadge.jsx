const OrderStatusBadge = ({ status }) => {
    const statusConfig = {
        pending: {
            label: 'Pendente',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        },
        paid: {
            label: 'Pago',
            className: 'bg-green-100 text-green-800 border-green-200'
        },
        processing: {
            label: 'Processando',
            className: 'bg-pessego/30 text-dourado border-primary/30'
        },
        shipped: {
            label: 'Enviado',
            className: 'bg-areia text-secondary border-borda'
        },
        delivered: {
            label: 'Entregue',
            className: 'bg-green-100 text-green-800 border-green-200'
        },
        cancelled: {
            label: 'Cancelado',
            className: 'bg-red-100 text-red-800 border-red-200'
        }
    };

    const config = statusConfig[status] || {
        label: status,
        className: 'bg-areia text-text-secondary border-borda'
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
            {config.label}
        </span>
    );
};

export default OrderStatusBadge;
