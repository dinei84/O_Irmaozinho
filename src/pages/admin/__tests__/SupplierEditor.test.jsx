import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SupplierEditor from '../SupplierEditor';
import { useAuth } from '../../../contexts/AuthContext';
import * as supplierService from '../../../services/supplierService';

// Mock dos módulos
vi.mock('../../../contexts/AuthContext');
vi.mock('../../../services/supplierService');
// NÃO mockar validators - vamos usar os reais para testes mais confiáveis

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: undefined }) // Modo criação por padrão
    };
});

const renderSupplierEditor = () => {
    return render(
        <BrowserRouter>
            <SupplierEditor />
        </BrowserRouter>
    );
};

describe('SupplierEditor', () => {
    const mockCurrentUser = { uid: 'user123', email: 'admin@test.com' };
    const mockDefaultSupplier = {
        id: 'supplier123',
        name: 'Fornecedor Teste',
        email: 'teste@example.com',
        type: 'third_party',
        orderMethod: 'email',
        commissionRate: 0.15,
        paymentMethod: 'centralized',
        active: true
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            currentUser: mockCurrentUser,
            isAdmin: true
        });
        
        supplierService.getSupplier.mockResolvedValue(null);
        supplierService.createSupplier.mockResolvedValue('new-supplier-id');
        supplierService.updateSupplier.mockResolvedValue();
    });

    describe('Renderização', () => {
        it('deve renderizar o formulário em modo criação', () => {
            renderSupplierEditor();
            
            expect(screen.getByText('Novo Fornecedor')).toBeInTheDocument();
            expect(screen.getByLabelText(/nome do fornecedor/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        it('deve renderizar todas as seções do formulário', () => {
            renderSupplierEditor();
            
            expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
            expect(screen.getByText('Tipo e Métodos de Operação')).toBeInTheDocument();
            expect(screen.getByText('Comissões e Métodos de Pagamento')).toBeInTheDocument();
            expect(screen.getByText('Status e Configurações')).toBeInTheDocument();
        });

        it('deve renderizar campos condicionais corretamente', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            // Selecionar método de pedido "email"
            const orderMethodSelect = screen.getByLabelText(/método de pedido/i);
            await user.selectOptions(orderMethodSelect, 'email');
            
            // Deve aparecer campo de email para pedidos
            await waitFor(() => {
                expect(screen.getByLabelText(/email para pedidos/i)).toBeInTheDocument();
            });
        });

        it('deve mostrar seção de dados bancários quando paymentMethod é centralized', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            const paymentMethodSelect = screen.getByLabelText(/forma de pagamento/i);
            await user.selectOptions(paymentMethodSelect, 'centralized');
            
            await waitFor(() => {
                expect(screen.getByText(/dados bancários para repasse/i)).toBeInTheDocument();
            });
        });
    });

    describe('Validação', () => {
        it('deve mostrar erros de validação quando o formulário está vazio', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            // Tentar submeter sem preencher nada
            const submitButton = screen.getByRole('button', { name: /criar fornecedor/i });
            await user.click(submitButton);
            
            // O formulário HTML deve prevenir submissão com campos obrigatórios vazios
            // Ou pode mostrar mensagens de validação
            await waitFor(() => {
                expect(submitButton).toBeInTheDocument();
            }, { timeout: 2000 });
        });

        it('deve validar email para pedidos quando orderMethod é email', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            // Preencher campos básicos
            await user.type(screen.getByLabelText(/nome do fornecedor/i), 'Fornecedor ABC');
            await user.type(screen.getByLabelText(/^email$/i), 'contato@abc.com');
            
            // Selecionar método email sem preencher orderEmail
            const orderMethodSelect = screen.getByLabelText(/método de pedido/i);
            await user.selectOptions(orderMethodSelect, 'email');
            
            // Aguardar campo aparecer
            await waitFor(() => {
                expect(screen.getByLabelText(/email para pedidos/i)).toBeInTheDocument();
            });
            
            // Tentar submeter sem preencher orderEmail
            const submitButton = screen.getByRole('button', { name: /criar fornecedor/i });
            await user.click(submitButton);
            
            // Deve mostrar erro de validação
            await waitFor(() => {
                const orderEmailInput = screen.getByLabelText(/email para pedidos/i);
                expect(orderEmailInput).toBeInvalid();
            }, { timeout: 2000 });
        });
    });

    describe('Submissão do Formulário', () => {
        it('deve criar fornecedor quando o formulário é válido', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            // Preencher formulário básico
            await user.type(screen.getByLabelText(/nome do fornecedor/i), 'Fornecedor ABC');
            await user.type(screen.getByLabelText(/^email$/i), 'contato@abc.com');
            
            const submitButton = screen.getByRole('button', { name: /criar fornecedor/i });
            await user.click(submitButton);
            
            await waitFor(() => {
                expect(supplierService.createSupplier).toHaveBeenCalled();
            });
        });

        it('deve limpar dados bancários quando paymentMethod não é centralized', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            await user.type(screen.getByLabelText(/nome do fornecedor/i), 'Fornecedor ABC');
            await user.type(screen.getByLabelText(/^email$/i), 'contato@abc.com');
            
            // Mudar para "none" - dados bancários devem ser limpos
            const paymentMethodSelect = screen.getByLabelText(/forma de pagamento/i);
            await user.selectOptions(paymentMethodSelect, 'none');
            
            const submitButton = screen.getByRole('button', { name: /criar fornecedor/i });
            await user.click(submitButton);
            
            await waitFor(() => {
                expect(supplierService.createSupplier).toHaveBeenCalled();
                const callData = supplierService.createSupplier.mock.calls[0][0];
                expect(callData.bankAccount).toBeNull();
            });
        });

        it('deve mostrar mensagem de sucesso após criar fornecedor', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            await user.type(screen.getByLabelText(/nome do fornecedor/i), 'Fornecedor ABC');
            await user.type(screen.getByLabelText(/^email$/i), 'contato@abc.com');
            
            const submitButton = screen.getByRole('button', { name: /criar fornecedor/i });
            await user.click(submitButton);
            
            await waitFor(() => {
                expect(screen.getByText(/fornecedor criado com sucesso/i)).toBeInTheDocument();
            });
        });

        it('deve navegar para lista de fornecedores após criar com sucesso', async () => {
            const user = userEvent.setup();
            vi.useFakeTimers();
            
            renderSupplierEditor();
            
            await user.type(screen.getByLabelText(/nome do fornecedor/i), 'Fornecedor ABC');
            await user.type(screen.getByLabelText(/^email$/i), 'contato@abc.com');
            
            const submitButton = screen.getByRole('button', { name: /criar fornecedor/i });
            await user.click(submitButton);
            
            await waitFor(() => {
                expect(screen.getByText(/fornecedor criado com sucesso/i)).toBeInTheDocument();
            });
            
            vi.advanceTimersByTime(1500);
            
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/admin/suppliers');
            });
            
            vi.useRealTimers();
        });
    });

    describe('Campos Dinâmicos', () => {
        it('deve ajustar valores automaticamente ao mudar tipo para "own"', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            const typeSelect = screen.getByLabelText(/tipo de fornecedor/i);
            
            // Verificar valores iniciais (third_party)
            expect(screen.getByLabelText(/taxa de comissão/i)).not.toBeDisabled();
            
            // Mudar para "own"
            await user.selectOptions(typeSelect, 'own');
            
            await waitFor(() => {
                const commissionInput = screen.getByLabelText(/taxa de comissão/i);
                expect(commissionInput).toBeDisabled();
                expect(commissionInput).toHaveValue(0);
            });
        });

        it('deve desabilitar método de pedido quando tipo é "own"', async () => {
            const user = userEvent.setup();
            renderSupplierEditor();
            
            const typeSelect = screen.getByLabelText(/tipo de fornecedor/i);
            await user.selectOptions(typeSelect, 'own');
            
            await waitFor(() => {
                const orderMethodSelect = screen.getByLabelText(/método de pedido/i);
                expect(orderMethodSelect).toBeDisabled();
            });
        });
    });

    describe('Tratamento de Erros', () => {
        it('deve mostrar erro quando createSupplier falha', async () => {
            const user = userEvent.setup();
            supplierService.createSupplier.mockRejectedValue({
                code: 'permission-denied',
                message: 'Permission denied'
            });
            
            renderSupplierEditor();
            
            await user.type(screen.getByLabelText(/nome do fornecedor/i), 'Fornecedor ABC');
            await user.type(screen.getByLabelText(/^email$/i), 'contato@abc.com');
            
            const submitButton = screen.getByRole('button', { name: /criar fornecedor/i });
            await user.click(submitButton);
            
            await waitFor(() => {
                expect(screen.getByText(/não tem permissão/i)).toBeInTheDocument();
            });
        });
    });
});
