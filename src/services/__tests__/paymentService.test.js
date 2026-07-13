import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createPixPaymentIntent,
    createBoletoPaymentIntent,
    createCardPaymentIntent,
    checkPaymentStatus
} from '../paymentService';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
    httpsCallable: vi.fn()
}));

vi.mock('../../lib/firebase', () => ({
    functions: {}
}));

describe('paymentService', () => {
    const mockOrderId = 'order123';
    const mockToken = 'card_token_abc123';
    const mockInstallments = 3;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createPixPaymentIntent', () => {
        it('deve criar intenção de pagamento PIX com sucesso', async () => {
            const mockPixData = {
                qrCode: '00020126360014BR.GOV.BCB.PIX0114+5511999999999',
                qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAA...',
                expiresAt: Date.now() + 30 * 60 * 1000
            };

            const mockCallable = vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    paymentId: 'payment123',
                    pix: mockPixData
                }
            });

            httpsCallable.mockReturnValue(mockCallable);

            const result = await createPixPaymentIntent(mockOrderId);

            expect(httpsCallable).toHaveBeenCalledWith(functions, 'createPaymentIntent');
            expect(mockCallable).toHaveBeenCalledWith({
                orderId: mockOrderId,
                paymentMethod: 'pix'
            });
            expect(result).toEqual(mockPixData);
        });

        it('deve lançar erro se resposta não contém pix', async () => {
            const mockCallable = vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    paymentId: 'payment123'
                    // sem pix
                }
            });

            httpsCallable.mockReturnValue(mockCallable);

            await expect(
                createPixPaymentIntent(mockOrderId)
            ).rejects.toThrow('Resposta inválida do servidor');
        });

        it('deve tratar erro de autenticação', async () => {
            const mockError = {
                code: 'functions/unauthenticated',
                message: 'User not authenticated'
            };

            const mockCallable = vi.fn().mockRejectedValue(mockError);
            httpsCallable.mockReturnValue(mockCallable);

            await expect(
                createPixPaymentIntent(mockOrderId)
            ).rejects.toThrow('Você precisa estar logado para fazer um pagamento');
        });

        it('deve tratar erro de pedido não encontrado', async () => {
            const mockError = {
                code: 'functions/not-found',
                message: 'Order not found'
            };

            const mockCallable = vi.fn().mockRejectedValue(mockError);
            httpsCallable.mockReturnValue(mockCallable);

            await expect(
                createPixPaymentIntent(mockOrderId)
            ).rejects.toThrow('Pedido não encontrado');
        });
    });

    describe('createBoletoPaymentIntent', () => {
        it('deve criar intenção de pagamento Boleto com sucesso', async () => {
            const mockBoletoData = {
                pdfUrl: 'https://www.mercadopago.com.br/boleto.pdf',
                barcode: '34191090000000123456789012345678901234567890',
                barcodeFormatted: '34191.09000 00001.234567 89012.345678 90123.4567890',
                dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000 // 3 dias
            };

            const mockCallable = vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    paymentId: 'payment123',
                    boleto: mockBoletoData
                }
            });

            httpsCallable.mockReturnValue(mockCallable);

            const result = await createBoletoPaymentIntent(mockOrderId);

            expect(httpsCallable).toHaveBeenCalledWith(functions, 'createPaymentIntent');
            expect(mockCallable).toHaveBeenCalledWith({
                orderId: mockOrderId,
                paymentMethod: 'boleto'
            });
            expect(result).toEqual(mockBoletoData);
        });

        it('deve lançar erro se resposta não contém boleto', async () => {
            const mockCallable = vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    paymentId: 'payment123'
                    // sem boleto
                }
            });

            httpsCallable.mockReturnValue(mockCallable);

            await expect(
                createBoletoPaymentIntent(mockOrderId)
            ).rejects.toThrow('Resposta inválida do servidor');
        });

        it('deve tratar erro de argumento inválido', async () => {
            const mockError = {
                code: 'functions/invalid-argument',
                message: 'Invalid payment method'
            };

            const mockCallable = vi.fn().mockRejectedValue(mockError);
            httpsCallable.mockReturnValue(mockCallable);

            await expect(
                createBoletoPaymentIntent(mockOrderId)
            ).rejects.toThrow('Invalid payment method');
        });
    });

    describe('createCardPaymentIntent', () => {
        it('deve criar intenção de pagamento Cartão com sucesso', async () => {
            const mockCardData = {
                status: 'approved',
                statusDetail: 'accredited'
            };

            const mockCallable = vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    paymentId: 'payment123',
                    card: mockCardData
                }
            });

            httpsCallable.mockReturnValue(mockCallable);

            const result = await createCardPaymentIntent(
                mockOrderId,
                mockToken,
                mockInstallments
            );

            expect(httpsCallable).toHaveBeenCalledWith(functions, 'createPaymentIntent');
            expect(mockCallable).toHaveBeenCalledWith({
                orderId: mockOrderId,
                paymentMethod: 'credit_card',
                token: mockToken,
                installments: mockInstallments
            });
            expect(result).toEqual({
                success: true,
                status: 'approved',
                paymentId: 'payment123',
                card: mockCardData
            });
        });

        it('deve usar 1 parcela como padrão se não informado', async () => {
            const mockCallable = vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    paymentId: 'payment123',
                    card: { status: 'approved' }
                }
            });

            httpsCallable.mockReturnValue(mockCallable);

            await createCardPaymentIntent(mockOrderId, mockToken);

            expect(mockCallable).toHaveBeenCalledWith(
                expect.objectContaining({
                    installments: 1
                })
            );
        });

        it('deve limitar parcelas entre 1 e 12', async () => {
            const mockCallable = vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    paymentId: 'payment123',
                    card: { status: 'approved' }
                }
            });

            httpsCallable.mockReturnValue(mockCallable);

            // Teste com 0 parcelas (deve virar 1)
            await createCardPaymentIntent(mockOrderId, mockToken, 0);
            expect(mockCallable).toHaveBeenCalledWith(
                expect.objectContaining({ installments: 1 })
            );

            // Teste com 15 parcelas (deve virar 12)
            await createCardPaymentIntent(mockOrderId, mockToken, 15);
            expect(mockCallable).toHaveBeenCalledWith(
                expect.objectContaining({ installments: 12 })
            );
        });

        it('deve tratar erro de pagamento já existente', async () => {
            const mockError = {
                code: 'functions/already-exists',
                message: 'Payment already exists'
            };

            const mockCallable = vi.fn().mockRejectedValue(mockError);
            httpsCallable.mockReturnValue(mockCallable);

            await expect(
                createCardPaymentIntent(mockOrderId, mockToken)
            ).rejects.toThrow('Pagamento já foi criado para este pedido');
        });

        it('deve tratar erro genérico', async () => {
            const mockError = {
                message: 'Erro genérico do servidor'
            };

            const mockCallable = vi.fn().mockRejectedValue(mockError);
            httpsCallable.mockReturnValue(mockCallable);

            await expect(
                createCardPaymentIntent(mockOrderId, mockToken)
            ).rejects.toThrow('Erro genérico do servidor');
        });
    });

    // Regressão da V-01 (docs/seguranca/AUDITORIA_SEGURANCA.md): o cliente definia o
    // valor cobrado, permitindo pagar R$ 0,01 num pedido de R$ 500. O valor passou a
    // ser lido do pedido no servidor. Nenhum payload pode voltar a carregar `amount`.
    describe('V-01: o valor do pagamento nunca é enviado pelo cliente', () => {
        it.each([
            ['pix', (id) => createPixPaymentIntent(id)],
            ['boleto', (id) => createBoletoPaymentIntent(id)],
            ['credit_card', (id) => createCardPaymentIntent(id, mockToken)]
        ])('não envia `amount` no payload de %s', async (_metodo, chamar) => {
            const mockCallable = vi.fn().mockResolvedValue({
                data: {
                    success: true,
                    paymentId: 'payment123',
                    pix: { qrCode: 'x', qrCodeBase64: 'y', expiresAt: Date.now() },
                    boleto: { pdfUrl: 'x', barcode: 'y', barcodeFormatted: 'y', dueDate: Date.now() },
                    card: { status: 'approved', statusDetail: 'accredited' }
                }
            });
            httpsCallable.mockReturnValue(mockCallable);

            await chamar(mockOrderId);

            const payload = mockCallable.mock.calls[0][0];
            expect(payload).not.toHaveProperty('amount');
        });
    });

    describe('checkPaymentStatus', () => {
        it('deve verificar status do pagamento com sucesso', async () => {
            const mockStatusData = {
                status: 'approved',
                orderStatus: 'paid'
            };

            const mockCallable = vi.fn().mockResolvedValue({
                data: mockStatusData
            });

            httpsCallable.mockReturnValue(mockCallable);

            const result = await checkPaymentStatus(mockOrderId);

            expect(httpsCallable).toHaveBeenCalledWith(functions, 'checkPaymentStatus');
            expect(mockCallable).toHaveBeenCalledWith({ orderId: mockOrderId });
            expect(result).toEqual(mockStatusData);
        });

        it('deve propagar erro se verificação falhar', async () => {
            const mockError = new Error('Network error');
            const mockCallable = vi.fn().mockRejectedValue(mockError);
            httpsCallable.mockReturnValue(mockCallable);

            await expect(
                checkPaymentStatus(mockOrderId)
            ).rejects.toThrow('Network error');
        });
    });
});
