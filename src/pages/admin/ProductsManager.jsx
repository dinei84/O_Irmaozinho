import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { logProductAction, AUDIT_ACTIONS } from '../../services/auditService';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Package, AlertCircle, Search, ShoppingBag } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';

const ProductsManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'products'));
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
            setError('');
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Erro ao carregar produtos. Verifique as permissões do Firestore.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Tem certeza que deseja deletar este produto?')) {
            return;
        }

        try {
            // Buscar informações do produto antes de deletar (para o log)
            const productRef = doc(db, 'products', id);
            const productSnap = await getDoc(productRef);
            const productData = productSnap.exists() ? productSnap.data() : null;

            // Deletar o produto
            await deleteDoc(productRef);
            
            // Remover da lista local
            setProducts(products.filter(product => product.id !== id));

            // Log de auditoria
            if (currentUser) {
                await logProductAction(
                    AUDIT_ACTIONS.PRODUCT_DELETED,
                    currentUser.uid,
                    id,
                    { name: productData?.name || 'Produto desconhecido', price: productData?.price }
                );
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            
            // Mensagens de erro mais específicas
            if (err.code === 'permission-denied') {
                alert('Você não tem permissão para deletar este produto.');
            } else if (err.code === 'unauthenticated') {
                alert('Você precisa estar autenticado para realizar esta ação.');
            } else {
                alert('Erro ao deletar produto. Tente novamente.');
            }
        }
    }

    // Filter products based on search query
    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase();
        return (
            product.name?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
                            Gerenciar Produtos
                        </h1>
                        <p className="text-text-secondary">
                            Gerencie os produtos da sua loja
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            to="/admin/products/new"
                            variant="primary"
                            className="flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Novo Produto
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
                                        <ShoppingBag className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-sm">Total de Produtos</p>
                                        <p className="text-3xl font-bold text-secondary">
                                            {searchQuery ? `${filteredProducts.length} / ${products.length}` : products.length}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Products List */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <h2 className="text-2xl font-heading font-bold text-secondary">
                                        Todos os Produtos
                                    </h2>
                                    <div className="relative w-full md:w-96">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar por nome, categoria ou descrição..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {filteredProducts.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Package className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-text-secondary">
                                        {searchQuery ? 'Nenhum produto encontrado para sua pesquisa.' : 'Nenhum produto cadastrado.'}
                                    </p>
                                    <Button to="/admin/products/new" variant="primary" className="mt-4">
                                        Criar Primeiro Produto
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Produto
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Categoria
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Preço
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Estoque
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
                                            {filteredProducts.map((product) => (
                                                <motion.tr
                                                    key={product.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {product.imageUrl && (
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                    onError={(e) => { e.target.style.display = 'none' }}
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-secondary">
                                                                    {product.name || 'Sem nome'}
                                                                </p>
                                                                <p className="text-sm text-text-secondary line-clamp-1">
                                                                    {product.description?.substring(0, 50)}...
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                            {product.category || 'Sem categoria'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-secondary font-semibold">
                                                        R$ {product.price?.toFixed(2).replace('.', ',') || '0,00'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                                        {product.stock || 0} un.
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${product.active
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {product.active ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                to={`/admin/products/edit/${product.id}`}
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            >
                                                                <Edit2 size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
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

export default ProductsManager;
