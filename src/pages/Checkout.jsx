import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Package } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';

const Checkout = () => {
    const { cartItems, cartTotal, cartCount } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center">
                    <Package className="mx-auto text-gray-300 mb-6" size={64} />
                    <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
                        Carrinho Vazio
                    </h2>
                    <p className="text-text-secondary mb-8">
                        Adicione produtos ao carrinho antes de finalizar a compra
                    </p>
                    <Button to="/store" variant="primary">
                        Ir para Loja
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={() => navigate('/store')}
                        variant="ghost"
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Voltar para Loja
                    </Button>
                    <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
                        Finalizar Compra
                    </h1>
                    <p className="text-text-secondary">
                        {cartCount} {cartCount === 1 ? 'item' : 'itens'} no carrinho
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardBody className="p-6">
                                <h2 className="text-2xl font-heading font-bold text-secondary mb-6">
                                    Resumo do Pedido
                                </h2>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://placehold.co/200x200?text=Produto'
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingBag className="text-gray-300" size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-secondary mb-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-text-secondary mb-2">
                                                    Quantidade: {item.quantity}
                                                </p>
                                                <p className="text-lg font-bold text-primary">
                                                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Total and Actions */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardBody className="p-6">
                                <h3 className="text-xl font-heading font-bold text-secondary mb-6">
                                    Total
                                </h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Subtotal</span>
                                        <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Frete</span>
                                        <span>A calcular</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-secondary">Total</span>
                                            <span className="text-2xl font-bold text-primary">
                                                R$ {cartTotal.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-yellow-800 text-center">
                                        <strong>Em Desenvolvimento</strong><br />
                                        O sistema de pagamento será implementado em breve.
                                    </p>
                                </div>

                                <Button
                                    variant="primary"
                                    className="w-full py-4 mb-3"
                                    disabled
                                >
                                    Prosseguir para Pagamento
                                </Button>
                                <Button
                                    onClick={() => navigate('/store')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Continuar Comprando
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
