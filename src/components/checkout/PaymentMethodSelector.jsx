import React from 'react';
import { CreditCard, QrCode, FileText } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';

/**
 * Componente para seleção de método de pagamento
 * Suporta: PIX, Boleto e Cartão de Crédito
 */
const PaymentMethodSelector = ({ selectedMethod, onSelect, availableMethods = ['pix', 'boleto', 'credit_card'] }) => {
    const methods = [
        {
            id: 'pix',
            name: 'PIX',
            description: 'Aprovação instantânea. Escaneie o QR Code com seu app bancário.',
            icon: QrCode,
            available: availableMethods.includes('pix'),
            comingSoon: false
        },
        {
            id: 'credit_card',
            name: 'Cartão de Crédito',
            description: 'Parcelamento em até 12x. Informe os dados na próxima etapa.',
            icon: CreditCard,
            available: availableMethods.includes('credit_card'),
            comingSoon: false
        },
        {
            id: 'boleto',
            name: 'Boleto Bancário',
            description: 'Aprovação em até 2 dias úteis. Link do boleto após confirmar.',
            icon: FileText,
            available: availableMethods.includes('boleto'),
            comingSoon: false
        }
    ];

    const handleSelect = (methodId) => {
        const method = methods.find(m => m.id === methodId);
        if (method && method.available && !method.comingSoon) {
            onSelect(methodId);
        }
    };

    return (
        <Card>
            <CardBody className="p-6">
                <h3 className="text-xl font-heading font-bold text-secondary mb-6">
                    Método de Pagamento
                </h3>

                <div className="space-y-3">
                    {methods.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedMethod === method.id;
                        const isDisabled = !method.available || method.comingSoon;

                        return (
                            <button
                                key={method.id}
                                onClick={() => handleSelect(method.id)}
                                disabled={isDisabled}
                                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                                    isSelected
                                        ? 'border-primary bg-primary/5'
                                        : isDisabled
                                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                        : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${
                                        isSelected ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-secondary">
                                                {method.name}
                                            </h4>
                                            {method.comingSoon && (
                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                                    Em breve
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-text-secondary">
                                            {method.description}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {selectedMethod === 'pix' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            <strong>✓ PIX selecionado</strong><br />
                            Após confirmar o pedido, você receberá um QR Code para pagamento instantâneo.
                        </p>
                    </div>
                )}
                {selectedMethod === 'boleto' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            <strong>✓ Boleto selecionado</strong><br />
                            Após confirmar, você receberá o link do boleto para pagar em qualquer banco. Confirmação em até 2 dias úteis.
                        </p>
                    </div>
                )}
                {selectedMethod === 'credit_card' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>✓ Cartão de Crédito selecionado</strong><br />
                            Na próxima etapa você informará os dados do cartão. Parcelamento em até 12x.
                        </p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default PaymentMethodSelector;
