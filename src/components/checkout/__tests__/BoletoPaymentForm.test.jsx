import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import BoletoPaymentForm from '../BoletoPaymentForm';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
    onSnapshot: vi.fn(),
    doc: vi.fn()
}));

vi.mock('../../../lib/firebase', () => ({
    db: {}
}));

// Mock navigator.clipboard globalmente
const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined)
};

Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
    configurable: true
});

describe('BoletoPaymentForm', () => {
    const mockOrderId = 'order123';
    const mockOnPaymentApproved = vi.fn();
    const mockUnsubscribe = vi.fn();

    const mockBoletoData = {
        pdfUrl: 'https://www.mercadopago.com.br/boleto.pdf',
        barcode: '34191090000000123456789012345678901234567890',
        barcodeFormatted: '34191.09000 00001.234567 89012.345678 90123.4567890',
        dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000 // 3 dias
    };

    beforeEach(() => {
        vi.clearAllMocks();
        onSnapshot.mockReturnValue(mockUnsubscribe);
        doc.mockReturnValue({});
        // Resetar mock do clipboard
        mockClipboard.writeText.mockClear();
        mockClipboard.writeText.mockResolvedValue(undefined);
    });

    it('deve exibir loading quando boletoData não está disponível', () => {
        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={null}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        expect(screen.getByText(/Gerando boleto.../i)).toBeInTheDocument();
    });

    it('deve exibir dados do boleto quando disponível', () => {
        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        expect(screen.getByText(/Pagamento por Boleto/i)).toBeInTheDocument();
        expect(screen.getByText(/Ver \/ Baixar boleto/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockBoletoData.barcodeFormatted)).toBeInTheDocument();
    });

    it('deve exibir link do PDF do boleto', () => {
        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        const pdfLink = screen.getByText(/Ver \/ Baixar boleto/i).closest('a');
        expect(pdfLink).toHaveAttribute('href', mockBoletoData.pdfUrl);
        expect(pdfLink).toHaveAttribute('target', '_blank');
        expect(pdfLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('deve copiar código de barras ao clicar no botão', async () => {
        // Garantir que clipboard está mockado
        const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
        
        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        // Encontrar o botão pelo texto "Copiar" dentro de um button
        const copyButtons = screen.getAllByText(/Copiar/i);
        const copyButton = copyButtons.find(btn => btn.closest('button'));
        
        expect(copyButton).toBeTruthy();
        
        await act(async () => {
            fireEvent.click(copyButton);
        });

        // Aguardar a chamada assíncrona do clipboard
        await waitFor(() => {
            expect(writeTextSpy).toHaveBeenCalledWith(
                mockBoletoData.barcodeFormatted
            );
        }, { timeout: 2000 });

        // Aguardar o estado "Copiado!" aparecer
        await waitFor(() => {
            expect(screen.getByText(/Copiado!/i)).toBeInTheDocument();
        }, { timeout: 2000 });
        
        writeTextSpy.mockRestore();
    });

    it('deve formatar data de vencimento corretamente', () => {
        const dueDate = new Date('2025-12-31');
        const boletoDataWithDate = {
            ...mockBoletoData,
            dueDate: dueDate.getTime()
        };

        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={boletoDataWithDate}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        // A data está dentro de um span dentro do div com "Vencimento:"
        const vencimentoDiv = screen.getByText(/Vencimento:/i).closest('div');
        expect(vencimentoDiv).toBeInTheDocument();
        // Verificar se a data está presente no texto completo do div
        expect(vencimentoDiv.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve monitorar mudanças no pedido via onSnapshot', () => {
        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        expect(doc).toHaveBeenCalledWith(db, 'orders', mockOrderId);
        expect(onSnapshot).toHaveBeenCalled();
    });

    it('deve chamar onPaymentApproved quando status muda para approved', async () => {
        const mockSnapshot = {
            exists: () => true,
            id: mockOrderId,
            data: () => ({
                payment: {
                    status: 'approved'
                }
            })
        };

        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        // Simular callback do onSnapshot dentro de act
        const snapshotCallback = onSnapshot.mock.calls[0][1];
        await act(async () => {
            snapshotCallback(mockSnapshot);
        });

        await waitFor(() => {
            expect(mockOnPaymentApproved).toHaveBeenCalledWith({
                id: mockOrderId,
                payment: { status: 'approved' }
            });
        });
    });

    it('deve exibir status pending quando aguardando pagamento', async () => {
        const mockSnapshot = {
            exists: () => true,
            id: mockOrderId,
            data: () => ({
                payment: {
                    status: 'pending'
                }
            })
        };

        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        const snapshotCallback = onSnapshot.mock.calls[0][1];
        await act(async () => {
            snapshotCallback(mockSnapshot);
        });

        await waitFor(() => {
            expect(screen.getByText(/Aguardando pagamento.../i)).toBeInTheDocument();
        });
    });

    it('deve exibir status approved quando pagamento aprovado', async () => {
        const mockSnapshot = {
            exists: () => true,
            id: mockOrderId,
            data: () => ({
                payment: {
                    status: 'approved'
                }
            })
        };

        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        const snapshotCallback = onSnapshot.mock.calls[0][1];
        await act(async () => {
            snapshotCallback(mockSnapshot);
        });

        await waitFor(() => {
            expect(screen.getByText(/✓ Pagamento aprovado!/i)).toBeInTheDocument();
        });
    });

    it('deve exibir status rejected quando pagamento rejeitado', async () => {
        const mockSnapshot = {
            exists: () => true,
            id: mockOrderId,
            data: () => ({
                payment: {
                    status: 'rejected'
                }
            })
        };

        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        const snapshotCallback = onSnapshot.mock.calls[0][1];
        await act(async () => {
            snapshotCallback(mockSnapshot);
        });

        await waitFor(() => {
            expect(screen.getByText(/✗ Pagamento rejeitado/i)).toBeInTheDocument();
        });
    });

    it('deve fazer cleanup do onSnapshot ao desmontar', () => {
        const { unmount } = render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={mockBoletoData}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('deve tratar dueDate como Timestamp do Firestore', () => {
        const mockTimestamp = {
            toMillis: () => Date.now() + 3 * 24 * 60 * 60 * 1000
        };

        const boletoDataWithTimestamp = {
            ...mockBoletoData,
            dueDate: mockTimestamp
        };

        render(
            <BoletoPaymentForm
                orderId={mockOrderId}
                boletoData={boletoDataWithTimestamp}
                onPaymentApproved={mockOnPaymentApproved}
            />
        );

        // Deve renderizar sem erro
        expect(screen.getByText(/Pagamento por Boleto/i)).toBeInTheDocument();
    });
});
