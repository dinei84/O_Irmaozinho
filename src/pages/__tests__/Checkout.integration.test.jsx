import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '../Checkout';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { createOrder } from '../../services/orderService';
import { createPixPaymentIntent, createBoletoPaymentIntent } from '../../services/paymentService';

// Mock contexts
vi.mock('../../contexts/CartContext');
vi.mock('../../contexts/AuthContext');
vi.mock('../../services/orderService');
vi.mock('../../services/paymentService');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

describe('Checkout - Integração', () => {
    const mockCurrentUser = {
        uid: 'user123',
        email: 'user@example.com'
    };

    const mockCartItems = [
        {
            id: 'product1',
            name: 'Produto 1',
            price: 50.00,
            quantity: 2,
            supplierId: 'supplier1',
            supplierName: 'Fornecedor 1'
        },
        {
            id: 'product2',
            name: 'Produto 2',
            price: 30.00,
            quantity: 1,
            supplierId: 'supplier1',
            supplierName: 'Fornecedor 1'
        }
    ];

    const mockCartTotal = 130.00;
    const mockCartCount = 3;

    beforeEach(() => {
        vi.clearAllMocks();
        useCart.mockReturnValue({
            cartItems: mockCartItems,
            cartTotal: mockCartTotal,
            cartCount: mockCartCount,
            clearCart: vi.fn()
        });
        useAuth.mockReturnValue({
            currentUser: mockCurrentUser
        });
    });

    const renderCheckout = () => {
        return render(
            <BrowserRouter>
                <Checkout />
            </BrowserRouter>
        );
    };

    const fillCustomerData = () => {
        fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'João Silva' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'joao@example.com' } });
        fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '11999999999' } });
        fireEvent.change(screen.getByLabelText(/cpf|cnpj/i), { target: { value: '12345678901' } });
    };

    const fillShippingAddress = () => {
        fireEvent.change(screen.getByLabelText(/cep/i), { target: { value: '01234567' } });
        fireEvent.change(screen.getByLabelText(/rua|logradouro/i), { target: { value: 'Rua Teste' } });
        fireEvent.change(screen.getByLabelText(/número/i), { target: { value: '123' } });
        fireEvent.change(screen.getByLabelText(/bairro/i), { target: { value: 'Centro' } });
        fireEvent.change(screen.getByLabelText(/cidade/i), { target: { value: 'São Paulo' } });
        fireEvent.change(screen.getByLabelText(/estado/i), { target: { value: 'SP' } });
    };

    const goToPaymentStep = async () => {
        fillCustomerData();
        fireEvent.click(screen.getByText(/Continuar/i));

        await waitFor(() => {
            expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
        });

        fillShippingAddress();
    };

    describe('Fluxo PIX', () => {
        it('deve completar fluxo PIX completo', async () => {
            const mockOrderId = 'order123';
            const mockPixData = {
                qrCode: '00020126360014BR.GOV.BCB.PIX0114+5511999999999',
                qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAA...',
                expiresAt: Date.now() + 30 * 60 * 1000
            };

            // R-08: o pedido é criado no servidor; o cliente não envia preço.
            createOrder.mockResolvedValue({ orderId: mockOrderId, finalTotal: mockCartTotal });
            createPixPaymentIntent.mockResolvedValue(mockPixData);

            renderCheckout();

            await goToPaymentStep();

            fireEvent.click(screen.getByRole('button', { name: /PIX/i }));

            fireEvent.click(screen.getByText(/Finalizar Pedido/i));

            // Verificar criação do pedido (sem preço/total enviados pelo cliente — R-08)
            await waitFor(() => {
                expect(createOrder).toHaveBeenCalledWith({
                    items: [
                        { productId: 'product1', quantity: 2 },
                        { productId: 'product2', quantity: 1 }
                    ],
                    customer: expect.objectContaining({ name: 'João Silva', email: 'joao@example.com' }),
                    shippingAddress: expect.objectContaining({ city: 'São Paulo', state: 'SP' }),
                    paymentMethod: 'pix'
                });
            });

            // Verificar criação do pagamento PIX
            await waitFor(() => {
                // O valor NÃO é enviado pelo cliente: o servidor o lê do pedido (V-01)
                expect(createPixPaymentIntent).toHaveBeenCalledWith(mockOrderId);
            });

            // Verificar exibição do QR Code
            await waitFor(() => {
                expect(screen.getByText(/Pagamento PIX/i)).toBeInTheDocument();
            });
        });
    });

    describe('Fluxo Boleto', () => {
        it('deve completar fluxo Boleto completo', async () => {
            const mockOrderId = 'order123';
            const mockBoletoData = {
                pdfUrl: 'https://www.mercadopago.com.br/boleto.pdf',
                barcode: '34191090000000123456789012345678901234567890',
                barcodeFormatted: '34191.09000 00001.234567 89012.345678 90123.4567890',
                dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000
            };

            createOrder.mockResolvedValue({ orderId: mockOrderId, finalTotal: mockCartTotal });
            createBoletoPaymentIntent.mockResolvedValue(mockBoletoData);

            renderCheckout();

            await goToPaymentStep();

            fireEvent.click(screen.getByRole('button', { name: /Boleto/i }));

            fireEvent.click(screen.getByText(/Finalizar Pedido/i));

            // Verificar criação do boleto
            await waitFor(() => {
                expect(createBoletoPaymentIntent).toHaveBeenCalledWith(mockOrderId);
            });

            // Verificar exibição do boleto
            await waitFor(() => {
                expect(screen.getByRole('heading', { level: 1, name: /Pagamento por Boleto/i })).toBeInTheDocument();
            });
        });
    });

    describe('Validações', () => {
        it('deve validar campos obrigatórios antes de avançar', async () => {
            renderCheckout();

            const continueButton = screen.getByText(/Continuar/i);
            fireEvent.click(continueButton);

            await waitFor(() => {
                expect(screen.getByText(/Nome completo é obrigatório/i)).toBeInTheDocument();
            });
        });

        it('deve validar formato de email', async () => {
            renderCheckout();

            const emailInput = screen.getByLabelText(/email/i);
            fireEvent.change(emailInput, { target: { value: 'email-invalido' } });

            const continueButton = screen.getByText(/Continuar/i);
            fireEvent.click(continueButton);

            await waitFor(() => {
                expect(screen.getByText(/Email válido é obrigatório/i)).toBeInTheDocument();
            });
        });

        it('deve validar CEP no formato correto', async () => {
            renderCheckout();

            fillCustomerData();
            fireEvent.click(screen.getByText(/Continuar/i));

            await waitFor(() => {
                expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/cep/i), { target: { value: '123' } });

            fireEvent.click(screen.getByText(/Finalizar Pedido/i));

            await waitFor(() => {
                expect(screen.getByText(/CEP válido é obrigatório/i)).toBeInTheDocument();
            });
        });
    });

    describe('Tratamento de Erros', () => {
        it('deve exibir erro se criação do pedido falhar', async () => {
            const mockError = new Error('Erro ao criar pedido');
            createOrder.mockRejectedValue(mockError);

            renderCheckout();

            await goToPaymentStep();

            fireEvent.click(screen.getByText(/Finalizar Pedido/i));

            await waitFor(() => {
                expect(screen.getByText(/Erro ao criar pedido/i)).toBeInTheDocument();
            });
        });

        it('deve exibir botão "Tentar Novamente" se pagamento PIX falhar', async () => {
            const mockOrderId = 'order123';
            const mockError = new Error('Erro ao processar pagamento');
            createOrder.mockResolvedValue({ orderId: mockOrderId, finalTotal: mockCartTotal });
            createPixPaymentIntent.mockRejectedValue(mockError);

            renderCheckout();

            await goToPaymentStep();

            fireEvent.click(screen.getByRole('button', { name: /PIX/i }));

            fireEvent.click(screen.getByText(/Finalizar Pedido/i));

            await waitFor(() => {
                expect(screen.getByText(/Tentar Novamente/i)).toBeInTheDocument();
            });
        });
    });
});
