import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Copy, Check, Loader2, Clock } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/**
 * Componente para exibir QR Code PIX e acompanhar pagamento
 * Monitora o status do pagamento em tempo real apenas para exibição visual
 * A lógica de aprovação e navegação é gerenciada pelo componente pai (Checkout.jsx)
 */
const PixPaymentForm = ({ orderId, pixData }) => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, approved, rejected
    const [timeRemaining, setTimeRemaining] = useState(null);

    // Monitorar mudanças no pedido em tempo real APENAS para atualizar UI
    // NÃO chama onPaymentApproved aqui - isso é responsabilidade do Checkout.jsx
    useEffect(() => {
        if (!orderId) return;

        const orderRef = doc(db, 'orders', orderId);

        const unsubscribe = onSnapshot(orderRef, (snapshot) => {
            if (snapshot.exists()) {
                const order = { id: snapshot.id, ...snapshot.data() };
                const status = order.payment?.status || 'pending';

                // Apenas atualiza o status visual local
                // NÃO chama onPaymentApproved - evita aprovação duplicada
                setPaymentStatus(status);
            }
        });

        return () => unsubscribe();
    }, [orderId]); // Removido onPaymentApproved das dependências

    // Calcular tempo restante do QR Code
    useEffect(() => {
        if (!pixData?.expiresAt) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiresAt = pixData.expiresAt?.toMillis?.() || pixData.expiresAt;
            const remaining = Math.max(0, expiresAt - now);

            if (remaining <= 0) {
                setTimeRemaining(null);
                clearInterval(interval);
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                setTimeRemaining({ minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [pixData]);

    // Copiar código PIX
    const handleCopyPixCode = async () => {
        if (pixData?.qrCode) {
            try {
                await navigator.clipboard.writeText(pixData.qrCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Erro ao copiar código PIX:', error);
            }
        }
    };

    if (!pixData) {
        return (
            <Card>
                <CardBody className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                    <p className="text-center text-text-secondary mt-4">
                        Gerando QR Code PIX...
                    </p>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardBody className="p-6">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <QrCode className="text-green-600" size={32} />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                        Pagamento via PIX
                    </h3>
                    <p className="text-text-secondary">
                        Escaneie o QR Code abaixo com seu app bancário
                    </p>
                </div>

                {/* QR Code */}
                {pixData.qrCodeBase64 ? (
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 flex justify-center">
                        <img
                            src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                            alt="QR Code PIX"
                            className="w-64 h-64"
                        />
                    </div>
                ) : (
                    <div className="bg-gray-100 p-8 rounded-lg mb-4 flex items-center justify-center min-h-[256px]">
                        <p className="text-text-secondary">QR Code não disponível</p>
                    </div>
                )}

                {/* Código PIX Copiável */}
                {pixData.qrCode && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Código PIX (Copiar e Colar)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={pixData.qrCode}
                                readOnly
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                            />
                            <button
                                onClick={handleCopyPixCode}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check size={18} />
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        Copiar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Timer */}
                {timeRemaining && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                        <Clock className="text-yellow-600" size={18} />
                        <span className="text-sm text-yellow-800">
                            QR Code expira em: <strong>{timeRemaining.minutes}:{String(timeRemaining.seconds).padStart(2, '0')}</strong>
                        </span>
                    </div>
                )}

                {/* QR Code expirado */}
                {!timeRemaining && paymentStatus === 'pending' && pixData?.expiresAt && (
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <p className="text-sm text-red-800">
                            <strong>QR Code expirado</strong><br />
                            Por favor, crie um novo pagamento.
                        </p>
                    </div>
                )}

                {/* Status do Pagamento */}
                {paymentStatus === 'pending' && (
                    <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Aguardando pagamento...</strong><br />
                            Após realizar o pagamento, o status será atualizado automaticamente.
                        </p>
                    </div>
                )}

                {paymentStatus === 'rejected' && (
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            <strong>✗ Pagamento rejeitado</strong><br />
                            Por favor, tente novamente ou escolha outro método de pagamento.
                        </p>
                    </div>
                )}

                {/* Instruções */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-secondary mb-2">Como pagar:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary">
                        <li>Abra o app do seu banco</li>
                        <li>Escolha a opção PIX</li>
                        <li>Escaneie o QR Code acima ou cole o código PIX</li>
                        <li>Confirme o pagamento</li>
                        <li>Aguarde a confirmação automática</li>
                    </ol>
                </div>

                {/* Botão Ver Meus Pedidos */}
                <div className="mt-6">
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-semibold"
                    >
                        Ver Meus Pedidos
                    </button>
                </div>
            </CardBody>
        </Card>
    );
};

export default PixPaymentForm;
