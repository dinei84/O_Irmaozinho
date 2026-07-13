import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent, act } from '@testing-library/react';
import { useMercadoPago } from '../../../hooks/useMercadoPago';
import { createCardPaymentIntent } from '../../../services/paymentService';

// Mock hooks e services ANTES de importar o componente
vi.mock('../../../hooks/useMercadoPago');
vi.mock('../../../services/paymentService');

// Mock import.meta.env ANTES de importar o componente
const mockEnv = {
    VITE_MERCADOPAGO_PUBLIC_KEY: 'TEST_PUBLIC_KEY_123'
};

// Definir env antes de importar
Object.defineProperty(import.meta, 'env', {
    value: mockEnv,
    writable: true,
    configurable: true
});

// Importar componente DEPOIS de mockar env
import CardPaymentForm from '../CardPaymentForm';

describe('CardPaymentForm', () => {
    const mockOrderId = 'order123';
    const mockAmount = 100.50;
    const mockCustomer = {
        name: 'João Silva',
        document: '12345678901'
    };
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();
    const mockCreateCardToken = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Garantir que env está mockado
        Object.defineProperty(import.meta, 'env', {
            value: mockEnv,
            writable: true,
            configurable: true
        });
        useMercadoPago.mockReturnValue({
            mp: {},
            loading: false,
            error: null,
            createCardToken: mockCreateCardToken
        });
    });

    it('deve exibir loading quando SDK está carregando', () => {
        useMercadoPago.mockReturnValue({
            mp: null,
            loading: true,
            error: null,
            createCardToken: null
        });

        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        expect(screen.getByText(/Carregando formulário/i)).toBeInTheDocument();
    });

    it('deve exibir erro quando SDK não está disponível', () => {
        useMercadoPago.mockReturnValue({
            mp: null,
            loading: false,
            error: 'Chave pública não configurada',
            createCardToken: null
        });

        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        expect(screen.getByText(/Pagamento com cartão indisponível/i)).toBeInTheDocument();
        expect(screen.getByText(/Chave pública não configurada/i)).toBeInTheDocument();
    });

    it('deve renderizar formulário quando SDK está pronto', () => {
        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        expect(screen.getByText(/Cartão de Crédito/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/0000 0000 0000 0000/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Como está no cartão/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/MM\/AA/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/123/i)).toBeInTheDocument();
    });

    it('deve preencher nome e CPF do customer', () => {
        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const nameInput = screen.getByPlaceholderText(/Como está no cartão/i);
        expect(nameInput).toHaveValue(mockCustomer.name);

        const docInput = screen.getByPlaceholderText(/Apenas números/i);
        expect(docInput).toHaveValue(mockCustomer.document);
    });

    it('deve formatar número do cartão ao digitar', () => {
        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const cardInput = screen.getByPlaceholderText(/0000 0000 0000 0000/i);
        fireEvent.change(cardInput, { target: { value: '1234567812345678' } });

        expect(cardInput).toHaveValue('1234 5678 1234 5678');
    });

    it('deve formatar data de validade ao digitar', () => {
        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const expiryInput = screen.getByPlaceholderText(/MM\/AA/i);
        fireEvent.change(expiryInput, { target: { value: '1225' } });

        expect(expiryInput).toHaveValue('12/25');
    });

    it('deve validar campos obrigatórios antes de submeter', async () => {
        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const submitButton = screen.getByRole('button', { name: /Pagar/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Número do cartão inválido/i)).toBeInTheDocument();
        });
    });

    it('deve validar data de validade no passado', async () => {
        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const cardInput = screen.getByPlaceholderText(/0000 0000 0000 0000/i);
        const expiryInput = screen.getByPlaceholderText(/MM\/AA/i);
        const cvvInput = screen.getByPlaceholderText(/123/i);

        fireEvent.change(cardInput, { target: { value: '1234567812345678' } });
        fireEvent.change(expiryInput, { target: { value: '01/20' } }); // Data passada
        fireEvent.change(cvvInput, { target: { value: '123' } });

        const submitButton = screen.getByRole('button', { name: /Pagar/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Cartão expirado/i)).toBeInTheDocument();
        });
    });

    it('deve processar pagamento com sucesso', async () => {
        const mockToken = 'card_token_abc123';
        mockCreateCardToken.mockResolvedValue(mockToken);
        createCardPaymentIntent.mockResolvedValue({
            success: true,
            status: 'approved',
            paymentId: 'payment123',
            card: { status: 'approved' }
        });

        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        // Preencher formulário
        const cardInput = screen.getByPlaceholderText(/0000 0000 0000 0000/i);
        const expiryInput = screen.getByPlaceholderText(/MM\/AA/i);
        const cvvInput = screen.getByPlaceholderText(/123/i);

        fireEvent.change(cardInput, { target: { value: '1234567812345678' } });
        fireEvent.change(expiryInput, { target: { value: '12/25' } });
        fireEvent.change(cvvInput, { target: { value: '123' } });

        const submitButton = screen.getByRole('button', { name: /Pagar/i });
        
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(mockCreateCardToken).toHaveBeenCalledWith({
                cardNumber: '1234567812345678',
                cardholderName: mockCustomer.name,
                cardExpirationMonth: '12',
                cardExpirationYear: '2025',
                securityCode: '123',
                identificationNumber: mockCustomer.document
            });
        });

        await waitFor(() => {
            // Sem `amount`: o valor cobrado vem do pedido, no servidor (V-01)
            expect(createCardPaymentIntent).toHaveBeenCalledWith(
                mockOrderId,
                mockToken,
                1 // installments padrão
            );
        });

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalledWith({
                id: mockOrderId,
                finalTotal: mockAmount,
                payment: { method: 'credit_card', status: 'approved' },
                orderStatus: 'paid'
            });
        });
    });

    it('deve tratar erro de tokenização', async () => {
        const mockError = new Error('Erro ao tokenizar cartão');
        mockCreateCardToken.mockRejectedValue(mockError);

        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const cardInput = screen.getByPlaceholderText(/0000 0000 0000 0000/i);
        const expiryInput = screen.getByPlaceholderText(/MM\/AA/i);
        const cvvInput = screen.getByPlaceholderText(/123/i);

        fireEvent.change(cardInput, { target: { value: '1234567812345678' } });
        fireEvent.change(expiryInput, { target: { value: '12/25' } });
        fireEvent.change(cvvInput, { target: { value: '123' } });

        const submitButton = screen.getByRole('button', { name: /Pagar/i });
        
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/Erro ao tokenizar cartão/i)).toBeInTheDocument();
        });

        expect(mockOnError).toHaveBeenCalledWith(mockError);
    });

    it('deve tratar pagamento rejeitado', async () => {
        const mockToken = 'card_token_abc123';
        mockCreateCardToken.mockResolvedValue(mockToken);
        createCardPaymentIntent.mockResolvedValue({
            success: true,
            status: 'rejected',
            paymentId: 'payment123',
            card: {
                status: 'rejected',
                statusDetail: 'cc_rejected_insufficient_amount'
            }
        });

        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const cardInput = screen.getByPlaceholderText(/0000 0000 0000 0000/i);
        const expiryInput = screen.getByPlaceholderText(/MM\/AA/i);
        const cvvInput = screen.getByPlaceholderText(/123/i);

        fireEvent.change(cardInput, { target: { value: '1234567812345678' } });
        fireEvent.change(expiryInput, { target: { value: '12/25' } });
        fireEvent.change(cvvInput, { target: { value: '123' } });

        const submitButton = screen.getByRole('button', { name: /Pagar/i });
        
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/Pagamento recusado/i)).toBeInTheDocument();
        });

        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('deve permitir selecionar número de parcelas', () => {
        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const installmentsSelect = screen.getByRole('combobox', { name: /Parcelas/i }) || 
                                   screen.getByLabelText(/Parcelas/i) ||
                                   document.querySelector('select');
        expect(installmentsSelect).toBeInTheDocument();

        fireEvent.change(installmentsSelect, { target: { value: '3' } });

        expect(installmentsSelect.value).toBe('3');
    });

    it('deve exibir valor total formatado no botão', () => {
        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        // O texto pode estar dividido em múltiplos elementos
        expect(screen.getByRole('button', { name: /Pagar/i })).toBeInTheDocument();
        expect(screen.getByText(/100,50/i)).toBeInTheDocument();
    });

    it('deve exibir loading durante processamento', async () => {
        const mockToken = 'card_token_abc123';
        mockCreateCardToken.mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve(mockToken), 100))
        );
        createCardPaymentIntent.mockResolvedValue({
            success: true,
            status: 'approved'
        });

        render(
            <CardPaymentForm
                orderId={mockOrderId}
                amount={mockAmount}
                customer={mockCustomer}
                onSuccess={mockOnSuccess}
                onError={mockOnError}
            />
        );

        const cardInput = screen.getByPlaceholderText(/0000 0000 0000 0000/i);
        const expiryInput = screen.getByPlaceholderText(/MM\/AA/i);
        const cvvInput = screen.getByPlaceholderText(/123/i);

        fireEvent.change(cardInput, { target: { value: '1234567812345678' } });
        fireEvent.change(expiryInput, { target: { value: '12/25' } });
        fireEvent.change(cvvInput, { target: { value: '123' } });

        const submitButton = screen.getByRole('button', { name: /Pagar/i });
        
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(screen.getByText(/Processando.../i)).toBeInTheDocument();
    });
});
