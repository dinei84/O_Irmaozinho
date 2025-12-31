import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { validateProduct, normalizeProduct } from '../../lib/validators';
import { logProductAction, AUDIT_ACTIONS } from '../../services/auditService';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, AlertCircle, Image as ImageIcon, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';

const ProductEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        category: '',
        stock: '',
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    async function fetchProduct() {
        try {
            setLoading(true);
            const docRef = doc(db, 'products', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setFormData(docSnap.data());
            } else {
                setError('Produto não encontrado.');
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Erro ao carregar produto.');
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setValidationErrors([]);

        // Validação client-side
        const normalized = normalizeProduct(formData);
        const validation = validateProduct(normalized);

        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            setError('Por favor, corrija os erros no formulário.');
            return;
        }

        try {
            setLoading(true);

            const productData = {
                ...normalized,
                updatedAt: serverTimestamp()
            };

            if (isEditMode) {
                // Update existing product
                const docRef = doc(db, 'products', id);
                await updateDoc(docRef, productData);
                
                // Log de auditoria
                if (currentUser) {
                    await logProductAction(
                        AUDIT_ACTIONS.PRODUCT_UPDATED,
                        currentUser.uid,
                        id,
                        { name: normalized.name, price: normalized.price }
                    );
                }
                
                setSuccess('Produto atualizado com sucesso!');
            } else {
                // Create new product
                const docRef = await addDoc(collection(db, 'products'), {
                    ...productData,
                    createdAt: serverTimestamp()
                });
                
                // Log de auditoria
                if (currentUser) {
                    await logProductAction(
                        AUDIT_ACTIONS.PRODUCT_CREATED,
                        currentUser.uid,
                        docRef.id,
                        { name: normalized.name, price: normalized.price }
                    );
                }
                
                setSuccess('Produto criado com sucesso!');
            }

            setTimeout(() => {
                navigate('/admin/products');
            }, 1500);
        } catch (err) {
            console.error('Error saving product:', err);
            
            // Mensagens de erro mais específicas
            if (err.code === 'permission-denied') {
                setError('Você não tem permissão para realizar esta ação.');
            } else if (err.code === 'unauthenticated') {
                setError('Você precisa estar autenticado para realizar esta ação.');
            } else {
                setError('Erro ao salvar produto. Verifique as permissões do Firestore.');
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
                        to="/admin/products"
                        variant="ghost"
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Voltar aos Produtos
                    </Button>
                    <h1 className="text-4xl font-heading font-bold text-secondary">
                        {isEditMode ? 'Editar Produto' : 'Novo Produto'}
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
                                    Nome do Produto *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    placeholder="Ex: Camiseta Fé"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-secondary mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-y"
                                    placeholder="Descrição detalhada do produto..."
                                />
                                <p className="mt-2 text-sm text-text-secondary">
                                    {formData.description.length} caracteres
                                </p>
                            </div>

                            {/* Price and Stock */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-semibold text-secondary mb-2">
                                        Preço (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="stock" className="block text-sm font-semibold text-secondary mb-2">
                                        Estoque
                                    </label>
                                    <input
                                        type="number"
                                        id="stock"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-semibold text-secondary mb-2">
                                    URL da Imagem
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                </div>
                                {formData.imageUrl && (
                                    <div className="mt-3">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-full max-w-md h-48 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/600x400?text=Imagem+Inválida';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-semibold text-secondary mb-2">
                                    Categoria
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                >
                                    <option value="">Selecione uma categoria</option>
                                    <option value="Camisetas">Camisetas</option>
                                    <option value="Canecas">Canecas</option>
                                    <option value="Livros">Livros</option>
                                    <option value="Acessórios">Acessórios</option>
                                    <option value="Decoração">Decoração</option>
                                    <option value="Outros">Outros</option>
                                </select>
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
                                    Produto Ativo (visível na loja)
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
                                    {loading ? 'Salvando...' : (isEditMode ? 'Atualizar Produto' : 'Criar Produto')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/admin/products')}
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

export default ProductEditor;
