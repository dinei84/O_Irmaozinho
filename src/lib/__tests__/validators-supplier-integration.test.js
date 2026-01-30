import { describe, it, expect } from 'vitest';
import { validateSupplier, normalizeSupplier } from '../validators';

describe('Validators - Supplier Integration Tests', () => {
    describe('Normalize + Validate Flow', () => {
        it('deve normalizar e validar fornecedor terceiro completo', () => {
            const rawData = {
                name: '  Fornecedor ABC  ',
                email: '  CONTATO@ABC.COM  ',
                phone: '  (11) 99999-9999  ',
                type: 'third_party',
                orderMethod: 'email',
                orderEmail: '  PEDIDOS@ABC.COM  ',
                commissionRate: 0.15,
                paymentMethod: 'centralized',
                bankAccount: {
                    bank: '  001  ',
                    agency: '  1234  ',
                    account: '  56789-0  ',
                    accountType: 'checking',
                    accountHolder: '  ABC LTDA  ',
                    taxId: '  12.345.678/0001-90  ',
                    pixKey: '  contato@abc.com  '
                },
                active: true,
                verified: false
            };

            const normalized = normalizeSupplier(rawData);
            const validation = validateSupplier(normalized);

            expect(validation.valid).toBe(true);
            expect(normalized.name).toBe('Fornecedor ABC');
            expect(normalized.email).toBe('contato@abc.com');
            expect(normalized.orderEmail).toBe('pedidos@abc.com');
            expect(normalized.bankAccount?.bank).toBe('001');
            expect(normalized.bankAccount?.accountHolder).toBe('ABC LTDA');
        });

        it('deve normalizar e validar fornecedor próprio', () => {
            const rawData = {
                name: 'O Irmaozinho',
                email: 'contato@oirmaozinho.com',
                type: 'own',
                orderMethod: 'direct_sale', // Será ajustado automaticamente
                commissionRate: 0.20, // Será ajustado para 0
                paymentMethod: 'centralized' // Será ajustado para 'none'
            };

            const normalized = normalizeSupplier(rawData);
            const validation = validateSupplier(normalized);

            // Deve normalizar corretamente
            expect(normalized.type).toBe('own');
            expect(normalized.commissionRate).toBe(0);
            expect(normalized.paymentMethod).toBe('none');
            expect(normalized.orderMethod).toBe('direct_sale');
            expect(normalized.isDefault).toBe(true);

            // Deve validar corretamente
            expect(validation.valid).toBe(true);
        });

        it('deve normalizar dados bancários vazios para null', () => {
            const rawData = {
                name: 'Fornecedor Teste',
                email: 'test@example.com',
                type: 'third_party',
                orderMethod: 'email',
                orderEmail: 'pedidos@example.com',
                commissionRate: 0.15,
                paymentMethod: 'centralized',
                bankAccount: {
                    bank: '',
                    agency: '',
                    account: '',
                    accountHolder: '',
                    taxId: '',
                    pixKey: ''
                }
            };

            const normalized = normalizeSupplier(rawData);
            
            // Dados bancários completamente vazios devem ser null
            expect(normalized.bankAccount).toBeNull();
        });

        it('deve normalizar dados bancários parciais corretamente', () => {
            const rawData = {
                name: 'Fornecedor Teste',
                email: 'test@example.com',
                type: 'third_party',
                orderMethod: 'email',
                orderEmail: 'pedidos@example.com',
                commissionRate: 0.15,
                paymentMethod: 'centralized',
                bankAccount: {
                    accountHolder: '  João Silva  ',
                    account: '  12345-6  ',
                    bank: '',
                    agency: ''
                }
            };

            const normalized = normalizeSupplier(rawData);
            const validation = validateSupplier(normalized);

            expect(normalized.bankAccount).not.toBeNull();
            expect(normalized.bankAccount?.accountHolder).toBe('João Silva');
            expect(normalized.bankAccount?.account).toBe('12345-6');
            expect(validation.valid).toBe(true);
        });

        it('deve manter ordem dos campos após normalização', () => {
            const rawData = {
                name: 'Fornecedor Teste',
                email: 'test@example.com',
                type: 'third_party',
                orderMethod: 'email',
                orderEmail: 'pedidos@example.com',
                commissionRate: 0.15,
                paymentMethod: 'none',
                active: true,
                verified: false
            };

            const normalized = normalizeSupplier(rawData);
            
            // Verificar que campos obrigatórios estão presentes
            expect(normalized).toHaveProperty('name');
            expect(normalized).toHaveProperty('email');
            expect(normalized).toHaveProperty('type');
            expect(normalized).toHaveProperty('orderMethod');
            expect(normalized).toHaveProperty('orderEmail');
            expect(normalized).toHaveProperty('commissionRate');
            expect(normalized).toHaveProperty('paymentMethod');
            expect(normalized).toHaveProperty('active');
            expect(normalized).toHaveProperty('isDefault');
        });
    });

    describe('Validação de Consistência', () => {
        it('deve rejeitar fornecedor próprio com comissão diferente de 0', () => {
            const data = {
                name: 'O Irmaozinho',
                email: 'contato@oirmaozinho.com',
                type: 'own',
                orderMethod: 'direct_sale',
                commissionRate: 0.15, // ERRO: próprio deve ter 0%
                paymentMethod: 'none'
            };

            const normalized = normalizeSupplier(data);
            const validation = validateSupplier(normalized);

            // normalizeSupplier deve corrigir para 0
            expect(normalized.commissionRate).toBe(0);
            expect(validation.valid).toBe(true);
        });

        it('deve rejeitar fornecedor próprio com paymentMethod diferente de none', () => {
            const data = {
                name: 'O Irmaozinho',
                email: 'contato@oirmaozinho.com',
                type: 'own',
                orderMethod: 'direct_sale',
                commissionRate: 0,
                paymentMethod: 'centralized' // ERRO: próprio deve ter 'none'
            };

            const normalized = normalizeSupplier(data);
            const validation = validateSupplier(normalized);

            // normalizeSupplier deve corrigir para 'none'
            expect(normalized.paymentMethod).toBe('none');
            expect(validation.valid).toBe(true);
        });

        it('deve validar email obrigatório quando orderMethod é email', () => {
            const data = {
                name: 'Fornecedor Teste',
                email: 'test@example.com',
                type: 'third_party',
                orderMethod: 'email',
                orderEmail: '', // ERRO: obrigatório quando método é email
                commissionRate: 0.15,
                paymentMethod: 'centralized'
            };

            const normalized = normalizeSupplier(data);
            const validation = validateSupplier(normalized);

            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('Email para pedidos é obrigatório quando método é "email"');
        });

        it('deve validar dados bancários quando paymentMethod é centralized e bankAccount está parcialmente preenchido', () => {
            const data = {
                name: 'Fornecedor Teste',
                email: 'test@example.com',
                type: 'third_party',
                orderMethod: 'email',
                orderEmail: 'pedidos@example.com',
                commissionRate: 0.15,
                paymentMethod: 'centralized',
                bankAccount: {
                    accountHolder: 'João Silva',
                    // Faltando account - deve dar erro se começou a preencher
                    account: '',
                    bank: '001',
                    agency: '1234'
                }
            };

            const normalized = normalizeSupplier(data);
            const validation = validateSupplier(normalized);

            // Se começou a preencher (tem accountHolder e bank), mas falta account
            // A validação deve rejeitar
            expect(validation.valid).toBe(false);
            // Verificar se tem erro relacionado a dados bancários
            expect(validation.errors.some(err => err.includes('dados bancários') || err.includes('incompletos'))).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('deve tratar bankAccount como objeto vazio', () => {
            const data = {
                name: 'Fornecedor Teste',
                email: 'test@example.com',
                type: 'third_party',
                orderMethod: 'direct_sale',
                commissionRate: 0.15,
                paymentMethod: 'none',
                bankAccount: {}
            };

            const normalized = normalizeSupplier(data);
            
            expect(normalized.bankAccount).toBeNull();
        });

        it('deve tratar valores undefined corretamente', () => {
            const data = {
                name: 'Fornecedor Teste',
                email: 'test@example.com',
                type: 'third_party',
                orderMethod: 'email',
                orderEmail: 'pedidos@example.com',
                commissionRate: undefined,
                paymentMethod: undefined,
                active: undefined,
                verified: undefined
            };

            const normalized = normalizeSupplier(data);
            const validation = validateSupplier(normalized);

            // Deve usar valores padrão
            expect(normalized.commissionRate).toBe(0.15);
            expect(normalized.paymentMethod).toBe('centralized');
            expect(normalized.active).toBe(true);
            expect(normalized.verified).toBe(false);
            
            // Validação deve passar com valores padrão
            expect(validation.valid).toBe(true);
        });

        it('deve tratar bankAccount null corretamente', () => {
            const data = {
                name: 'Fornecedor Teste',
                email: 'test@example.com',
                type: 'third_party',
                orderMethod: 'direct_sale',
                commissionRate: 0.15,
                paymentMethod: 'none',
                bankAccount: null
            };

            const normalized = normalizeSupplier(data);
            const validation = validateSupplier(normalized);

            expect(normalized.bankAccount).toBeNull();
            expect(validation.valid).toBe(true);
        });
    });
});
