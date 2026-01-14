import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllSuppliers, deleteSupplier } from '../../services/supplierService';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, AlertCircle, Search, Truck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';

const SuppliersManager = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSuppliers();
    }, []);

    async function fetchSuppliers() {
        try {
            setLoading(true);
            const suppliersData = await getAllSuppliers(false); // Buscar todos, incluindo inativos
            setSuppliers(suppliersData);
            setError('');
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            setError('Erro ao carregar fornecedores. Verifique as permissões do Firestore.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Tem certeza que deseja desativar este fornecedor?')) {
            return;
        }

        try {
            await deleteSupplier(id);
            // Atualizar lista local
            setSuppliers(suppliers.map(supplier => 
                supplier.id === id ? { ...supplier, active: false } : supplier
            ));
        } catch (err) {
            console.error('Error deleting supplier:', err);
            
            if (err.code === 'permission-denied') {
                alert('Você não tem permissão para deletar este fornecedor.');
            } else if (err.code === 'unauthenticated') {
                alert('Você precisa estar autenticado para realizar esta ação.');
            } else {
                alert('Erro ao deletar fornecedor. Tente novamente.');
            }
        }
    }

    // Filtrar fornecedores baseado na busca
    const filteredSuppliers = suppliers.filter(supplier => {
        const query = searchQuery.toLowerCase();
        return (
            supplier.name?.toLowerCase().includes(query) ||
            supplier.email?.toLowerCase().includes(query) ||
            supplier.phone?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
                            Gerenciar Fornecedores
                        </h1>
                        <p className="text-text-secondary">
                            Gerencie os fornecedores da plataforma
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            to="/admin/suppliers/new"
                            variant="primary"
                            className="flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Novo Fornecedor
                        </Button>
                        <Button
                            to="/admin"
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            Voltar ao Dashboard
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3 mb-6"
                    >
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card>
                                <CardBody className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Truck className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-sm">Total de Fornecedores</p>
                                        <p className="text-3xl font-bold text-secondary">
                                            {searchQuery ? `${filteredSuppliers.length} / ${suppliers.length}` : suppliers.length}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Truck className="text-green-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-sm">Ativos</p>
                                        <p className="text-3xl font-bold text-secondary">
                                            {suppliers.filter(s => s.active !== false).length}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <Truck className="text-gray-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-sm">Inativos</p>
                                        <p className="text-3xl font-bold text-secondary">
                                            {suppliers.filter(s => s.active === false).length}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Suppliers List */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <h2 className="text-2xl font-heading font-bold text-secondary">
                                        Todos os Fornecedores
                                    </h2>
                                    <div className="relative w-full md:w-96">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar por nome, email ou telefone..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {filteredSuppliers.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Truck className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-text-secondary">
                                        {searchQuery ? 'Nenhum fornecedor encontrado para sua pesquisa.' : 'Nenhum fornecedor cadastrado.'}
                                    </p>
                                    <Button to="/admin/suppliers/new" variant="primary" className="mt-4">
                                        Criar Primeiro Fornecedor
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Fornecedor
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Contato
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Comissão
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Ações
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredSuppliers.map((supplier) => (
                                                <motion.tr
                                                    key={supplier.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-secondary">
                                                                {supplier.name || 'Sem nome'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm">
                                                            <p className="text-secondary">{supplier.email}</p>
                                                            {supplier.phone && (
                                                                <p className="text-text-secondary">{supplier.phone}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                            {(supplier.commissionRate * 100).toFixed(0)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${supplier.active !== false
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {supplier.active !== false ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                to={`/admin/suppliers/edit/${supplier.id}`}
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            >
                                                                <Edit2 size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(supplier.id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SuppliersManager;
