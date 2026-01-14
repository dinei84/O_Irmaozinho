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
        commissionRate: 0.15,
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
                    commissionRate: supplierData.commissionRate || 0.15,
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

        // Validação client-side
        const normalized = normalizeSupplier(formData);
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
                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            {/* Commission Rate */}
                            <div>
                                <label htmlFor="commissionRate" className="block text-sm font-semibold text-secondary mb-2">
                                    Taxa de Comissão (Fase 1: Fixo em 15%)
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
                                        disabled
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                        {(formData.commissionRate * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-text-secondary">
                                    Na Fase 1, a comissão é fixa em 15% para todos os fornecedores.
                                </p>
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
