import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSupplier, createSupplier, updateSupplier } from '../../services/supplierService';
import { validateSupplier, normalizeSupplier } from '../../lib/validators';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, AlertCircle, Truck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';

const SupplierEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'third_party', // 'own' ou 'third_party'
        isDefault: false,
        orderMethod: 'email', // 'direct_sale', 'email', 'api'
        orderEmail: '',
        orderEmailTemplate: '',
        commissionRate: 0.15,
        paymentMethod: 'centralized', // 'none', 'centralized', 'split'
        bankAccount: {
            bank: '',
            agency: '',
            account: '',
            accountType: 'checking',
            accountHolder: '',
            taxId: '',
            pixKey: ''
        },
        verified: false,
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            fetchSupplier();
        }
    }, [id]);

    async function fetchSupplier() {
        try {
            setLoading(true);
            const supplierData = await getSupplier(id);

            if (supplierData) {
                setFormData({
                    name: supplierData.name || '',
                    email: supplierData.email || '',
                    phone: supplierData.phone || '',
                    type: supplierData.type || 'third_party',
                    isDefault: supplierData.isDefault || false,
                    orderMethod: supplierData.orderMethod || 'email',
                    orderEmail: supplierData.orderEmail || '',
                    orderEmailTemplate: supplierData.orderEmailTemplate || '',
                    commissionRate: supplierData.commissionRate ?? (supplierData.type === 'own' ? 0 : 0.15),
                    paymentMethod: supplierData.paymentMethod || (supplierData.type === 'own' ? 'none' : 'centralized'),
                    bankAccount: supplierData.bankAccount || {
                        bank: '',
                        agency: '',
                        account: '',
                        accountType: 'checking',
                        accountHolder: '',
                        taxId: '',
                        pixKey: ''
                    },
                    verified: supplierData.verified || false,
                    active: supplierData.active !== undefined ? supplierData.active : true
                });
            } else {
                setError('Fornecedor não encontrado.');
            }
        } catch (err) {
            console.error('Error fetching supplier:', err);
            setError('Erro ao carregar fornecedor.');
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        
        // Se mudou o tipo, ajustar valores automaticamente
        if (name === 'type') {
            setFormData(prev => {
                const newData = {
                    ...prev,
                    type: value,
                    isDefault: value === 'own' ? true : prev.isDefault
                };
                
                // Se próprio, ajustar comissão e paymentMethod
                if (value === 'own') {
                    newData.commissionRate = 0;
                    newData.paymentMethod = 'none';
                    newData.orderMethod = 'direct_sale';
                } else {
                    newData.commissionRate = prev.commissionRate || 0.15;
                    newData.paymentMethod = prev.paymentMethod || 'centralized';
                }
                
                return newData;
            });
            return;
        }
        
        // Campos aninhados (bankAccount)
        if (name.startsWith('bankAccount.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                bankAccount: {
                    ...prev.bankAccount,
                    [field]: value
                }
            }));
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setValidationErrors([]);

        // Limpar dados bancários se não necessário ou vazios
        let cleanedFormData = { ...formData };
        if (cleanedFormData.paymentMethod !== 'centralized') {
            cleanedFormData.bankAccount = null;
        } else if (cleanedFormData.bankAccount) {
            // Limpar campos vazios de bankAccount
            const bankAccount = { ...cleanedFormData.bankAccount };
            Object.keys(bankAccount).forEach(key => {
                if (bankAccount[key] === '' || bankAccount[key] === null) {
                    delete bankAccount[key];
                }
            });
            // Se não há dados úteis, definir como null
            if (!bankAccount.accountHolder && !bankAccount.account && !bankAccount.agency && !bankAccount.bank) {
                cleanedFormData.bankAccount = null;
            } else {
                cleanedFormData.bankAccount = bankAccount;
            }
        }

        // Validação client-side
        const normalized = normalizeSupplier(cleanedFormData);
        const validation = validateSupplier(normalized);

        if (!validation.valid) {
            setValidationErrors(validation.errors);
            setError('Por favor, corrija os erros no formulário.');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode) {
                // Update existing supplier
                await updateSupplier(id, normalized);
                setSuccess('Fornecedor atualizado com sucesso!');
            } else {
                // Create new supplier
                await createSupplier(normalized);
                setSuccess('Fornecedor criado com sucesso!');
            }

            setTimeout(() => {
                navigate('/admin/suppliers');
            }, 1500);
        } catch (err) {
            console.error('Error saving supplier:', err);
            
            if (err.code === 'permission-denied') {
                setError('Você não tem permissão para realizar esta ação.');
            } else if (err.code === 'unauthenticated') {
                setError('Você precisa estar autenticado para realizar esta ação.');
            } else {
                setError('Erro ao salvar fornecedor. Verifique as permissões do Firestore.');
            }
        } finally {
            setLoading(false);
        }
    }

    if (loading && isEditMode) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        to="/admin/suppliers"
                        variant="ghost"
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Voltar aos Fornecedores
                    </Button>
                    <h1 className="text-4xl font-heading font-bold text-secondary">
                        {isEditMode ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h1>
                </div>

                {/* Messages */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-500" size={20} />
                            <div className="flex-1">
                                <p className="text-red-700 text-sm font-semibold">{error}</p>
                                {validationErrors.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside">
                                        {validationErrors.map((err, index) => (
                                            <li key={index} className="text-red-600 text-xs">
                                                {err}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center gap-3 mb-6"
                    >
                        <AlertCircle className="text-green-500" size={20} />
                        <p className="text-green-700 text-sm">{success}</p>
                    </motion.div>
                )}

                {/* Form */}
                <Card>
                    <CardBody className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Seção 1: Informações Básicas */}
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-3">
                                    <h3 className="text-lg font-semibold text-secondary">Informações Básicas</h3>
                                    <p className="text-sm text-text-secondary mt-1">Dados de contato e identificação do fornecedor</p>
                                </div>
                                
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-secondary mb-2">
                                    Nome do Fornecedor *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="Ex: Fornecedor ABC"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-secondary mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="contato@fornecedor.com"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-secondary mb-2">
                                    Telefone (Opcional)
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            </div>

                            {/* Seção 2: Tipo e Métodos */}
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-3">
                                    <h3 className="text-lg font-semibold text-secondary">Tipo e Métodos de Operação</h3>
                                    <p className="text-sm text-text-secondary mt-1">Configure como o fornecedor opera no sistema</p>
                                </div>

                            {/* Tipo de Fornecedor */}
                            <div>
                                <label htmlFor="type" className="block text-sm font-semibold text-secondary mb-2">
                                    Tipo de Fornecedor *
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    required
                                    disabled={isEditMode && formData.isDefault} // Não pode mudar tipo do fornecedor padrão
                                >
                                    <option value="third_party">Terceiro (Fornecedor Externo)</option>
                                    <option value="own">Próprio (O Irmaozinho)</option>
                                </select>
                                <p className="mt-2 text-sm text-text-secondary">
                                    {formData.type === 'own' 
                                        ? 'Produtos da própria empresa. Sem comissão e sem repasse.'
                                        : 'Fornecedor terceiro. Pode ter comissão e repasse.'}
                                </p>
                            </div>

                            {/* Método de Pedido */}
                            <div>
                                <label htmlFor="orderMethod" className="block text-sm font-semibold text-secondary mb-2">
                                    Método de Pedido *
                                </label>
                                <select
                                    id="orderMethod"
                                    name="orderMethod"
                                    value={formData.orderMethod}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    required
                                    disabled={formData.type === 'own'} // Próprio sempre é direct_sale
                                >
                                    <option value="direct_sale">Venda Direta (Estoque Próprio/Drop Shipping)</option>
                                    <option value="email">Pedido por Email</option>
                                    <option value="api">Pedido via API (Futuro)</option>
                                </select>
                                <p className="mt-2 text-sm text-text-secondary">
                                    Como os pedidos serão processados para este fornecedor.
                                </p>
                            </div>

                            {/* Email para Pedidos (se orderMethod == email) */}
                            {formData.orderMethod === 'email' && (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="orderEmail" className="block text-sm font-semibold text-secondary mb-2">
                                            Email para Pedidos *
                                        </label>
                                        <input
                                            type="email"
                                            id="orderEmail"
                                            name="orderEmail"
                                            value={formData.orderEmail}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                            placeholder="pedidos@fornecedor.com"
                                            required={formData.orderMethod === 'email'}
                                        />
                                        <p className="mt-2 text-sm text-text-secondary">
                                            Email onde serão enviados os pedidos automaticamente.
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="orderEmailTemplate" className="block text-sm font-semibold text-secondary mb-2">
                                            Template do Email (Opcional)
                                        </label>
                                        <textarea
                                            id="orderEmailTemplate"
                                            name="orderEmailTemplate"
                                            value={formData.orderEmailTemplate}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                                            placeholder="Olá, gostaria de solicitar os seguintes produtos:&#10;&#10;{LISTA_PRODUTOS}&#10;&#10;Aguardamos confirmação."
                                        />
                                        <p className="mt-2 text-sm text-text-secondary">
                                            Template personalizado para emails de pedidos. Use {`{LISTA_PRODUTOS}`} para incluir a lista automaticamente.
                                        </p>
                                    </div>
                                </div>
                            )}
                            </div>

                            {/* Seção 3: Comissões e Pagamentos */}
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-3">
                                    <h3 className="text-lg font-semibold text-secondary">Comissões e Métodos de Pagamento</h3>
                                    <p className="text-sm text-text-secondary mt-1">Configure taxas e formas de repasse</p>
                                </div>

                                    {/* Commission Rate */}
                                <div>
                                    <label htmlFor="commissionRate" className="block text-sm font-semibold text-secondary mb-2">
                                        Taxa de Comissão
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="commissionRate"
                                            name="commissionRate"
                                            value={formData.commissionRate}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                            placeholder="0.15"
                                            disabled={formData.type === 'own'} // Próprio sempre tem 0%
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                            {(formData.commissionRate * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-text-secondary">
                                        {formData.type === 'own' 
                                            ? 'Fornecedor próprio tem comissão de 0%.'
                                            : 'Taxa de comissão cobrada pela plataforma (padrão: 15%).'}
                                    </p>
                                </div>

                                {/* Forma de Pagamento */}
                                <div>
                                    <label htmlFor="paymentMethod" className="block text-sm font-semibold text-secondary mb-2">
                                        Forma de Pagamento ao Fornecedor *
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        required
                                        disabled={formData.type === 'own'} // Próprio sempre é 'none'
                                    >
                                        <option value="none">Sem Repasse</option>
                                        <option value="centralized">Repasse Centralizado (Manual)</option>
                                        <option value="split">Split Payment (Futuro)</option>
                                    </select>
                                    <p className="mt-2 text-sm text-text-secondary">
                                        {formData.paymentMethod === 'none' && 'Plataforma não repassa valores ao fornecedor.'}
                                        {formData.paymentMethod === 'centralized' && 'Plataforma recebe e repassa manualmente ao fornecedor.'}
                                        {formData.paymentMethod === 'split' && 'Mercado Pago divide automaticamente (requer configuração).'}
                                    </p>
                                </div>

                                {/* Dados Bancários (se paymentMethod == centralized) */}
                                {formData.paymentMethod === 'centralized' && (
                                    <div className="space-y-4 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Truck className="text-primary" size={20} />
                                            <h4 className="font-semibold text-secondary text-lg">Dados Bancários para Repasse</h4>
                                        </div>
                                        <p className="text-sm text-text-secondary mb-4">
                                            Preencha os dados bancários para permitir repasse manual dos valores ao fornecedor.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="bankAccount.bank" className="block text-sm font-medium text-secondary mb-2">
                                                    Banco (Código)
                                                </label>
                                                <input
                                                    type="text"
                                                    id="bankAccount.bank"
                                                    name="bankAccount.bank"
                                                    value={formData.bankAccount.bank}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="001"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="bankAccount.agency" className="block text-sm font-medium text-secondary mb-2">
                                                    Agência
                                                </label>
                                                <input
                                                    type="text"
                                                    id="bankAccount.agency"
                                                    name="bankAccount.agency"
                                                    value={formData.bankAccount.agency}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="1234"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label htmlFor="bankAccount.account" className="block text-sm font-medium text-secondary mb-2">
                                                    Conta
                                                </label>
                                                <input
                                                    type="text"
                                                    id="bankAccount.account"
                                                    name="bankAccount.account"
                                                    value={formData.bankAccount.account}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="56789-0"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="bankAccount.accountType" className="block text-sm font-medium text-secondary mb-2">
                                                    Tipo
                                                </label>
                                                <select
                                                    id="bankAccount.accountType"
                                                    name="bankAccount.accountType"
                                                    value={formData.bankAccount.accountType}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="checking">Corrente</option>
                                                    <option value="savings">Poupança</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="bankAccount.accountHolder" className="block text-sm font-medium text-secondary mb-2">
                                                Titular da Conta *
                                            </label>
                                            <input
                                                type="text"
                                                id="bankAccount.accountHolder"
                                                name="bankAccount.accountHolder"
                                                value={formData.bankAccount.accountHolder}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Nome ou Razão Social"
                                                required={formData.paymentMethod === 'centralized'}
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="bankAccount.taxId" className="block text-sm font-medium text-secondary mb-2">
                                                    CPF/CNPJ
                                                </label>
                                                <input
                                                    type="text"
                                                    id="bankAccount.taxId"
                                                    name="bankAccount.taxId"
                                                    value={formData.bankAccount.taxId}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="00.000.000/0000-00"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="bankAccount.pixKey" className="block text-sm font-medium text-secondary mb-2">
                                                    Chave PIX (Opcional)
                                                </label>
                                                <input
                                                    type="text"
                                                    id="bankAccount.pixKey"
                                                    name="bankAccount.pixKey"
                                                    value={formData.bankAccount.pixKey}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="email@exemplo.com ou (11) 99999-9999"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Seção 4: Status */}
                            <div className="space-y-6">
                                <div className="border-t border-gray-200 pt-6 pb-3">
                                    <h3 className="text-lg font-semibold text-secondary">Status e Configurações</h3>
                                    <p className="text-sm text-text-secondary mt-1">Gerencie o status e verificação do fornecedor</p>
                                </div>

                                    {/* Active Status */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <label htmlFor="active" className="text-sm font-semibold text-secondary">
                                        Fornecedor Ativo
                                    </label>
                                    <p className="text-xs text-text-secondary">
                                        (Desmarque para desativar temporariamente)
                                    </p>
                                </div>

                                {/* Verified Status */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="verified"
                                        name="verified"
                                        checked={formData.verified}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <label htmlFor="verified" className="text-sm font-semibold text-secondary">
                                        Fornecedor Verificado
                                    </label>
                                    <p className="text-xs text-text-secondary">
                                        (Marque após confirmar dados do fornecedor)
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <Save size={20} />
                                    {loading ? 'Salvando...' : (isEditMode ? 'Atualizar Fornecedor' : 'Criar Fornecedor')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/admin/suppliers')}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default SupplierEditor;
