import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Package, Loader2, AlertCircle, Check } from 'lucide-react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import ShippingAddressForm from '../components/checkout/ShippingAddressForm';
import CustomerDataForm from '../components/checkout/CustomerDataForm';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import PixPaymentForm from '../components/checkout/PixPaymentForm';
import BoletoPaymentForm from '../components/checkout/BoletoPaymentForm';
import CardPaymentForm from '../components/checkout/CardPaymentForm';
import { createOrder } from '../services/orderService';
import { createPixPaymentIntent, createBoletoPaymentIntent } from '../services/paymentService';

const Checkout = () => {
    const { cartItems, cartTotal, cartCount, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Estados do formulário
    const [step, setStep] = useState(1); // 1: Dados, 2: Endereço, 3: Pagamento, 4: Confirmação
    const [customerData, setCustomerData] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [errors, setErrors] = useState({});
    
    // Estados do pedido
    const [orderId, setOrderId] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [pixData, setPixData] = useState(null);
    const [boletoData, setBoletoData] = useState(null);
    const [orderTotal, setOrderTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Redirecionar se não estiver logado
    React.useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/checkout');
        }
    }, [currentUser, navigate]);

    // Carrinho vazio
    if (cartItems.length === 0 && !orderId) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center">
                    <Package className="mx-auto text-text-secondary mb-6" size={64} />
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

    // Step 3: telas de pagamento (PIX, Boleto ou Cartão)
    if (orderId && step === 3) {
        const titles = {
            pix: 'Pagamento PIX',
            boleto: 'Pagamento por Boleto',
            credit_card: 'Pagamento com Cartão'
        };
        return (
            <div className="min-h-screen bg-background py-24 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-8">
                        <Button
                            onClick={() => setStep(2)}
                            variant="ghost"
                            className="mb-4 flex items-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            Voltar
                        </Button>
                        <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
                            {titles[paymentMethod] || 'Pagamento'}
                        </h1>
                        <p className="text-text-secondary">
                            Pedido #{orderId}
                        </p>
                    </div>

                    {paymentMethod === 'pix' && (
                        <PixPaymentForm
                            orderId={orderId}
                            pixData={pixData}
                        />
                    )}

                    {paymentMethod === 'boleto' && (
                        <BoletoPaymentForm
                            orderId={orderId}
                            boletoData={boletoData}
                        />
                    )}

                    {paymentMethod === 'credit_card' && (
                        <CardPaymentForm
                            orderId={orderId}
                            amount={orderTotal}
                            customer={{ name: customerData?.name, document: customerData?.document }}
                            onError={(err) => setError(err?.message || 'Erro no pagamento.')}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Validar formulário antes de avançar
    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            // Validar dados do cliente
            if (!customerData?.name || customerData.name.trim().length < 3) {
                newErrors.customerName = 'Nome completo é obrigatório (mínimo 3 caracteres)';
            }
            if (!customerData?.email || !/\S+@\S+\.\S+/.test(customerData.email)) {
                newErrors.customerEmail = 'Email válido é obrigatório';
            }
            if (!customerData?.phone || customerData.phone.replace(/\D/g, '').length < 10) {
                newErrors.customerPhone = 'Telefone válido é obrigatório';
            }
            if (!customerData?.document || customerData.document.replace(/\D/g, '').length < 11) {
                newErrors.customerDocument = 'CPF/CNPJ é obrigatório';
            }
        } else if (step === 2) {
            // Validar endereço
            if (!shippingAddress?.zipCode || shippingAddress.zipCode.replace(/\D/g, '').length !== 8) {
                newErrors.zipCode = 'CEP válido é obrigatório';
            }
            if (!shippingAddress?.street || shippingAddress.street.trim().length < 3) {
                newErrors.street = 'Rua é obrigatória';
            }
            if (!shippingAddress?.number || shippingAddress.number.trim().length === 0) {
                newErrors.number = 'Número é obrigatório';
            }
            if (!shippingAddress?.neighborhood || shippingAddress.neighborhood.trim().length < 2) {
                newErrors.neighborhood = 'Bairro é obrigatório';
            }
            if (!shippingAddress?.city || shippingAddress.city.trim().length < 2) {
                newErrors.city = 'Cidade é obrigatória';
            }
            if (!shippingAddress?.state || shippingAddress.state.length !== 2) {
                newErrors.state = 'Estado é obrigatório (2 letras)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Avançar para próxima etapa
    const handleNext = () => {
        if (validateStep()) {
            if (step === 2) {
                // Ao passar da etapa 2, criar pedido e processar pagamento
                handleCreateOrder();
            } else {
                setStep(step + 1);
            }
        }
    };

    // Voltar para etapa anterior
    const handleBack = () => {
        setStep(step - 1);
        setErrors({});
    };

    // Criar pedido e processar pagamento
    const handleCreateOrder = async () => {
        setLoading(true);
        setError(null);

        try {
            // Recalcular totais (não confiar no frontend)
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = 0; // Por enquanto sem cálculo de frete
            const discount = 0; // Sem cupons no MVP
            const finalTotal = subtotal + shipping - discount;

            // Preparar itens do pedido
            const orderItems = cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                supplierId: item.supplierId || null,
                supplierName: item.supplierName || null
            }));

            // Criar pedido no Firestore
            const newOrderId = await createOrder({
                userId: currentUser.uid,
                items: orderItems,
                customer: customerData,
                shippingAddress: {
                    ...shippingAddress,
                    street: `${shippingAddress.street}, ${shippingAddress.number}`,
                    complement: shippingAddress.complement || ''
                },
                subtotal,
                shipping,
                discount,
                finalTotal,
                paymentMethod
            });

            setOrderId(newOrderId);
            setOrderTotal(finalTotal);

            if (paymentMethod === 'pix') {
                try {
                    const pixResult = await createPixPaymentIntent(newOrderId);
                    setPixData({
                        qrCode: pixResult.qrCode,
                        qrCodeBase64: pixResult.qrCodeBase64,
                        expiresAt: pixResult.expiresAt
                    });
                    setStep(3);
                } catch (paymentError) {
                    console.error('Erro ao criar pagamento PIX:', paymentError);
                    setError({
                        message: 'Erro ao processar pagamento. O pedido foi criado, mas o pagamento falhou.',
                        orderId: newOrderId,
                        paymentMethod: 'pix',
                        canRetry: true
                    });
                }
                return;
            }

            if (paymentMethod === 'boleto') {
                try {
                    const boletoResult = await createBoletoPaymentIntent(newOrderId);
                    setBoletoData({
                        pdfUrl: boletoResult.pdfUrl,
                        barcode: boletoResult.barcode,
                        barcodeFormatted: boletoResult.barcodeFormatted,
                        dueDate: boletoResult.dueDate
                    });
                    setStep(3);
                } catch (paymentError) {
                    console.error('Erro ao criar boleto:', paymentError);
                    setError({
                        message: 'Erro ao gerar boleto. O pedido foi criado.',
                        orderId: newOrderId,
                        paymentMethod: 'boleto',
                        canRetry: true
                    });
                }
                return;
            }

            if (paymentMethod === 'credit_card') {
                setStep(3);
            }
        } catch (err) {
            console.error('Erro ao criar pedido:', err);
            setError(err.message || 'Erro ao criar pedido. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

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

                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                        step >= s
                                            ? 'bg-primary text-background'
                                            : 'bg-areia text-text-secondary'
                                    }`}>
                                        {step > s ? <Check size={20} /> : s}
                                    </div>
                                    <span className={`mt-2 text-xs ${
                                        step >= s ? 'text-primary font-semibold' : 'text-text-secondary'
                                    }`}>
                                        {s === 1 ? 'Dados' : s === 2 ? 'Endereço' : 'Pagamento'}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-0.5 mx-4 ${
                                        step > s ? 'bg-primary' : 'bg-borda'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Erro geral */}
                {error && (
                    <div className="mb-6 p-4 bg-pessego/30 border border-primary/30 rounded-lg">
                        <div className="flex items-start gap-3 mb-3">
                            <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-secondary flex-1">
                                {typeof error === 'string' ? error : error.message}
                            </p>
                        </div>
                        {typeof error === 'object' && error.canRetry && (
                            <div className="flex gap-2 mt-3">
                                <Button
                                    variant="outline"
                                    className="text-sm py-2 px-4"
                                    onClick={async () => {
                                        setError(null);
                                        setLoading(true);
                                        try {
                                            if (error.paymentMethod === 'pix') {
                                                const pixResult = await createPixPaymentIntent(error.orderId);
                                                setPixData({
                                                    qrCode: pixResult.qrCode,
                                                    qrCodeBase64: pixResult.qrCodeBase64,
                                                    expiresAt: pixResult.expiresAt
                                                });
                                                setStep(3);
                                            } else if (error.paymentMethod === 'boleto') {
                                                const boletoResult = await createBoletoPaymentIntent(error.orderId);
                                                setBoletoData({
                                                    pdfUrl: boletoResult.pdfUrl,
                                                    barcode: boletoResult.barcode,
                                                    barcodeFormatted: boletoResult.barcodeFormatted,
                                                    dueDate: boletoResult.dueDate
                                                });
                                                setStep(3);
                                            }
                                        } catch (err) {
                                            setError({ ...error, message: err.message });
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                >
                                    Tentar Novamente
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulários */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="customer"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <CustomerDataForm
                                        value={customerData}
                                        onChange={setCustomerData}
                                        errors={{
                                            name: errors.customerName,
                                            email: errors.customerEmail,
                                            phone: errors.customerPhone,
                                            document: errors.customerDocument
                                        }}
                                    />
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="address"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <ShippingAddressForm
                                        value={shippingAddress}
                                        onChange={setShippingAddress}
                                        errors={errors}
                                    />
                                    <div className="mt-6">
                                        <PaymentMethodSelector
                                            selectedMethod={paymentMethod}
                                            onSelect={setPaymentMethod}
                                            availableMethods={['pix', 'boleto', 'credit_card']}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Resumo do Pedido */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardBody className="p-6">
                                <h3 className="text-xl font-heading font-bold text-secondary mb-6">
                                    Resumo do Pedido
                                </h3>

                                {/* Itens */}
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 pb-3 border-b border-borda last:border-0">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-areia flex-shrink-0">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://placehold.co/200x200?text=Produto';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingBag className="text-text-secondary" size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-secondary text-sm truncate mb-1">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-text-secondary mb-1">
                                                    Qtd: {item.quantity}
                                                </p>
                                                <p className="font-semibold text-primary text-sm">
                                                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totais */}
                                <div className="space-y-3 mb-6 pt-4 border-t border-borda">
                                    <div className="flex justify-between text-text-secondary text-sm">
                                        <span>Subtotal</span>
                                        <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div className="flex justify-between text-text-secondary text-sm">
                                        <span>Frete</span>
                                        <span>Grátis</span>
                                    </div>
                                    <div className="pt-3 border-t border-borda">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-secondary">Total</span>
                                            <span className="text-xl font-bold text-primary">
                                                R$ {cartTotal.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="space-y-3">
                                    {step > 1 && (
                                        <Button
                                            onClick={handleBack}
                                            variant="outline"
                                            className="w-full"
                                            disabled={loading}
                                        >
                                            Voltar
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleNext}
                                        variant="primary"
                                        className="w-full py-4"
                                        disabled={loading || (step === 2 && !paymentMethod)}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={20} />
                                                Processando...
                                            </>
                                        ) : step === 2 ? (
                                            'Finalizar Pedido'
                                        ) : (
                                            'Continuar'
                                        )}
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
