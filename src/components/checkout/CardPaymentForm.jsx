import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { useMercadoPago } from '../../hooks/useMercadoPago';
import { createCardPaymentIntent } from '../../services/paymentService';

/**
 * Formulário de pagamento com cartão de crédito.
 * Tokenização via Mercado Pago SDK; apenas o token é enviado ao backend.
 */
const CardPaymentForm = ({ orderId, amount, customer = {}, onSuccess, onError }) => {
    // Ler chave pública dinamicamente para permitir mock em testes
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';
    const { loading: sdkLoading, error: sdkError, createCardToken } = useMercadoPago(publicKey);

    const [cardNumber, setCardNumber] = useState('');
    const [cardholderName, setCardholderName] = useState(customer.name || '');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [docNumber, setDocNumber] = useState(() => (customer.document || '').replace(/\D/g, '').slice(0, 11));
    const [installments, setInstallments] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const formatCardNumber = (v) => {
        const digits = v.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    };

    const formatExpiry = (v) => {
        const digits = v.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 2) {
            return digits.slice(0, 2) + '/' + digits.slice(2);
        }
        return digits;
    };

    const formatCvv = (v) => v.replace(/\D/g, '').slice(0, 4);
    const formatDoc = (v) => v.replace(/\D/g, '').slice(0, 11);

    const handleCardNumber = (e) => setCardNumber(formatCardNumber(e.target.value));
    const handleExpiry = (e) => setExpiry(formatExpiry(e.target.value));
    const handleCvv = (e) => setCvv(formatCvv(e.target.value));
    const handleDoc = (e) => setDocNumber(formatDoc(e.target.value));

    const parseExpiry = () => {
        const [mm, yy] = expiry.split('/');
        let year = yy;
        if (yy && yy.length === 2) {
            const currentYear = new Date().getFullYear();
            const currentCentury = Math.floor(currentYear / 100) * 100;
            const fullYear = currentCentury + parseInt(yy, 10);
            year = String(fullYear);
        } else if (!yy || yy.length !== 4) {
            year = String(new Date().getFullYear() + 1);
        }
        return { 
            month: mm || '01', 
            year: year || String(new Date().getFullYear() + 1)
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const rawNumber = cardNumber.replace(/\D/g, '');
        if (rawNumber.length < 15) {
            setError('Número do cartão inválido.');
            return;
        }
        if (!cardholderName.trim()) {
            setError('Nome no cartão é obrigatório.');
            return;
        }
        const { month, year } = parseExpiry();
        if (!month || !year || month.length !== 2 || year.length !== 4) {
            setError('Data de validade inválida (MM/AA).');
            return;
        }
        const expiryDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
        const now = new Date();
        if (expiryDate < now) {
            setError('Cartão expirado. Verifique a data de validade.');
            return;
        }
        if (cvv.length < 3) {
            setError('CVV inválido.');
            return;
        }
        if (docNumber.length !== 11) {
            setError('CPF deve ter 11 dígitos.');
            return;
        }

        setLoading(true);
        try {
            const token = await createCardToken({
                cardNumber: rawNumber,
                cardholderName: cardholderName.trim(),
                cardExpirationMonth: month,
                cardExpirationYear: year,
                securityCode: cvv,
                identificationNumber: docNumber
            });

            const result = await createCardPaymentIntent(orderId, token, installments);

            const cardStatus = result?.card?.status || result?.status;
            if (cardStatus === 'approved' || result?.success) {
                setPaymentSuccess(true);
                    if (onSuccess) {
                        onSuccess({
                        id: orderId,
                        finalTotal: amount,
                        payment: { method: 'credit_card', status: 'approved' },
                    orderStatus: 'paid'
                });
            }
                } else if (cardStatus === 'rejected' || result?.status === 'rejected') {
                const msg = result?.card?.statusDetail || 'Pagamento recusado. Verifique os dados ou use outro cartão.';
            setError(msg);
                } else {
                setError('Não foi possível processar o pagamento. Tente novamente.');
            }
        } catch (err) {
            setError(err.message || 'Erro ao processar pagamento.');
            onError?.(err);
        } finally {
            setLoading(false);
        }
    };

    if (sdkLoading) {
        return (
            <Card>
                <CardBody className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                    <p className="text-center text-text-secondary mt-4">
                        Carregando formulário de pagamento...
                    </p>
                </CardBody>
            </Card>
        );
    }

    if (sdkError || !publicKey) {
        return (
            <Card>
                <CardBody className="p-6">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                        <AlertCircle size={20} />
                        <span className="font-medium">Pagamento com cartão indisponível</span>
                    </div>
                    <p className="text-sm text-text-secondary">
                        {sdkError || 'Configure VITE_MERCADOPAGO_PUBLIC_KEY para habilitar pagamento por cartão.'}
                    </p>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardBody className="p-6">
                {paymentSuccess ? (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CreditCard className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                            Pagamento Aprovado!
                        </h3>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                            <p className="text-sm text-green-800">
                                <strong>✓ Pagamento com cartão processado com sucesso!</strong><br />
                                Seu pedido está sendo processado.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/orders'}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Ver Meus Pedidos
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <CreditCard className="text-primary" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-heading font-bold text-secondary">
                                    Cartão de Crédito
                                </h3>
                                <p className="text-sm text-text-secondary">
                                    Parcelamento em até 12x. Dados criptografados pelo Mercado Pago.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Número do cartão
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={handleCardNumber}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Nome no cartão
                                </label>
                                <input
                                    type="text"
                                    placeholder="Como está no cartão"
                                    value={cardholderName}
                                    onChange={(e) => setCardholderName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">
                                        Validade (MM/AA)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="MM/AA"
                                        value={expiry}
                                        onChange={handleExpiry}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={handleCvv}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        3 ou 4 dígitos no verso do cartão
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    CPF do titular
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Apenas números, 11 dígitos"
                                    value={docNumber}
                                    onChange={handleDoc}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Parcelas
                                </label>
                                <select
                                    value={installments}
                                    onChange={(e) => setInstallments(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {n}x de R$ {(amount / n).toFixed(2).replace('.', ',')}
                                            {n > 1 ? ' sem juros' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={18} />
                                        Pagar R$ {amount.toFixed(2).replace('.', ',')}
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default CardPaymentForm;
