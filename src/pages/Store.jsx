import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ShoppingCart, Package, X, Plus, Minus } from 'lucide-react';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'products'),
                where('active', '==', true),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }

    function openProductModal(product) {
        setSelectedProduct(product);
        setQuantity(1);
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeProductModal() {
        setSelectedProduct(null);
        setQuantity(1);
        document.body.style.overflow = 'unset';
    }

    function handleQuantityChange(delta) {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= (selectedProduct?.stock || 1)) {
            setQuantity(newQuantity);
        }
    }

    function handleAddToCart() {
        if (selectedProduct && selectedProduct.stock > 0) {
            addToCart(selectedProduct, quantity);
            closeProductModal();
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-heading font-bold text-secondary mb-4">Loja O Irmãozinho</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Produtos exclusivos para você expressar sua fé.
                    </p>
                </div>

                {products.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <Package className="mx-auto text-gray-300 mb-6" size={64} />
                        <h2 className="text-2xl font-heading font-bold text-secondary mb-4">
                            Em Breve
                        </h2>
                        <p className="text-text-secondary max-w-md mx-auto mb-8">
                            Estamos preparando produtos incríveis para você!
                            Em breve nossa loja estará disponível com itens exclusivos.
                        </p>
                        <Button to="/" variant="primary">
                            Voltar para Home
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card
                                    className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                    onClick={() => openProductModal(product)}
                                >
                                    <div className="h-64 overflow-hidden bg-gray-100 flex items-center justify-center relative">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/400x400?text=Produto'
                                                }}
                                            />
                                        ) : (
                                            <Package className="text-gray-300" size={48} />
                                        )}
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                                                    Esgotado
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <CardBody className="flex-grow flex flex-col text-center">
                                        {product.category && (
                                            <span className="text-xs text-primary font-semibold mb-2 uppercase">
                                                {product.category}
                                            </span>
                                        )}
                                        <h3 className="text-lg font-heading font-bold text-secondary mb-2 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        {product.description && (
                                            <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-grow">
                                                {product.description}
                                            </p>
                                        )}
                                        <p className="text-primary font-bold text-xl mb-4">
                                            R$ {product.price.toFixed(2).replace('.', ',')}
                                        </p>
                                        {product.stock > 0 && product.stock <= 5 && (
                                            <p className="text-xs text-orange-600">
                                                Apenas {product.stock} em estoque
                                            </p>
                                        )}
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeProductModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeProductModal}
                                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                                {/* Product Image */}
                                <div className="relative">
                                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                                        {selectedProduct.imageUrl ? (
                                            <img
                                                src={selectedProduct.imageUrl}
                                                alt={selectedProduct.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/600x600?text=Produto'
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="text-gray-300" size={64} />
                                            </div>
                                        )}
                                    </div>
                                    {selectedProduct.stock === 0 && (
                                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold text-lg">
                                                Esgotado
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="flex flex-col">
                                    {selectedProduct.category && (
                                        <span className="inline-block text-sm text-primary font-semibold mb-2 uppercase">
                                            {selectedProduct.category}
                                        </span>
                                    )}
                                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-4">
                                        {selectedProduct.name}
                                    </h2>

                                    {selectedProduct.description && (
                                        <p className="text-text-secondary text-base leading-relaxed mb-6">
                                            {selectedProduct.description}
                                        </p>
                                    )}

                                    <div className="mb-6">
                                        <p className="text-4xl font-bold text-primary mb-2">
                                            R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                                        </p>
                                        {selectedProduct.stock > 0 && (
                                            <p className="text-sm text-text-secondary">
                                                {selectedProduct.stock > 5
                                                    ? `${selectedProduct.stock} unidades disponíveis`
                                                    : `Apenas ${selectedProduct.stock} em estoque`
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {selectedProduct.stock > 0 && (
                                        <>
                                            {/* Quantity Selector */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-semibold text-secondary mb-2">
                                                    Quantidade
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleQuantityChange(-1)}
                                                        disabled={quantity <= 1}
                                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus size={20} />
                                                    </button>
                                                    <span className="text-2xl font-bold text-secondary min-w-[3rem] text-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(1)}
                                                        disabled={quantity >= selectedProduct.stock}
                                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Total Price */}
                                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-secondary">Subtotal:</span>
                                                    <span className="text-2xl font-bold text-secondary">
                                                        R$ {(selectedProduct.price * quantity).toFixed(2).replace('.', ',')}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-auto">
                                        <Button
                                            onClick={handleAddToCart}
                                            variant="primary"
                                            className="flex-1 py-4 text-lg"
                                            disabled={selectedProduct.stock === 0}
                                        >
                                            <ShoppingCart size={20} className="mr-2" />
                                            {selectedProduct.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Store;
