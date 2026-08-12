import { useState, useEffect } from 'react';
import { FileText, Copy, Check, Loader2, ExternalLink, Calendar } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/**
 * Exibe link do boleto, código de barras e acompanha status do pagamento
 */
const BoletoPaymentForm = ({ orderId, boletoData }) => {
    const [copied, setCopied] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending');

    useEffect(() => {
        if (!orderId) return;

        const orderRef = doc(db, 'orders', orderId);
        const unsubscribe = onSnapshot(orderRef, (snapshot) => {
            if (snapshot.exists()) {
                const order = { id: snapshot.id, ...snapshot.data() };
                const status = order.payment?.status || 'pending';
                setPaymentStatus(status);
            }
        });
        return () => unsubscribe();
    }, [orderId]);

    const handleCopyBarcode = async () => {
        const code = boletoData?.barcode || boletoData?.barcodeFormatted;
        if (code) {
            try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Erro ao copiar código:', err);
            }
        }
    };

    const formatDueDate = () => {
        const due = boletoData?.dueDate;
        if (!due) return null;
        
        let ms;
        if (typeof due === 'number') {
            ms = due;
        } else if (due?.toMillis && typeof due.toMillis === 'function') {
            ms = due.toMillis();
        } else if (due?.seconds) {
            ms = due.seconds * 1000;
        } else {
            return null;
        }
        
        return new Date(ms).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (!boletoData) {
        return (
            <Card>
                <CardBody className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                    <p className="text-center text-text-secondary mt-4">
                        Gerando boleto...
                    </p>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardBody className="p-6">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-areia rounded-full mb-4">
                        <FileText className="text-dourado" size={32} />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                        Pagamento por Boleto
                    </h3>
                    <p className="text-text-secondary">
                        Pague em qualquer banco, lotérica ou app até a data de vencimento.
                    </p>
                </div>

                {boletoData.pdfUrl && (
                    <a
                        href={boletoData.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 mb-4 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                        <ExternalLink size={18} />
                        Ver / Baixar boleto (PDF)
                    </a>
                )}

                {formatDueDate() && (
                    <div className="flex items-center gap-2 p-3 bg-areia border border-borda rounded-lg mb-4">
                        <Calendar className="text-dourado" size={18} />
                        <span className="text-sm text-secondary">
                            <strong>Vencimento:</strong> {formatDueDate()}
                        </span>
                    </div>
                )}

                {(boletoData.barcode || boletoData.barcodeFormatted) && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Código de barras (copiar e colar)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={boletoData.barcodeFormatted || boletoData.barcode}
                                readOnly
                                className="flex-1 px-4 py-2 border border-borda rounded-lg bg-areia text-sm font-mono"
                            />
                            <button
                                type="button"
                                onClick={handleCopyBarcode}
                                className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
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

                {paymentStatus === 'pending' && (
                    <div className="text-center p-4 bg-areia border border-borda rounded-lg mb-4">
                        <p className="text-sm text-secondary">
                            <strong>Aguardando pagamento...</strong><br />
                            Após pagar, a confirmação pode levar até 2 dias úteis.
                        </p>
                    </div>
                )}

                {paymentStatus === 'approved' && (
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                        <p className="text-sm text-green-800 mb-3">
                            <strong>✓ Pagamento aprovado!</strong><br />
                            Seu pedido está sendo processado.
                        </p>
                        <button
                            onClick={() => window.location.href = '/orders'}
                            className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors font-medium"
                        >
                            Ver Meus Pedidos
                        </button>
                    </div>
                )}

                {paymentStatus === 'rejected' && (
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <p className="text-sm text-red-800">
                            <strong>✗ Pagamento rejeitado</strong><br />
                            Entre em contato com o suporte ou tente outro método.
                        </p>
                    </div>
                )}

                <div className="mt-6 p-4 bg-areia rounded-lg">
                    <h4 className="font-semibold text-secondary mb-2">Como pagar:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary">
                        <li>Abra o boleto pelo link acima ou use o código de barras</li>
                        <li>Pague no app do banco, internet banking ou lotérica</li>
                        <li>O status será atualizado em até 2 dias úteis</li>
                    </ol>
                </div>
            </CardBody>
        </Card>
    );
};

export default BoletoPaymentForm;
