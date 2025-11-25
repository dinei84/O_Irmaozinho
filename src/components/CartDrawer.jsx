import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from './ui/Button';

const CartDrawer = () => {
    const { cartItems, cartCount, cartTotal, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    function handleCheckout() {
        closeCart();
        navigate('/checkout');
    }

    function handleQuantityChange(productId, currentQuantity, delta) {
        const newQuantity = currentQuantity + delta;
        if (newQuantity >= 1) {
            updateQuantity(productId, newQuantity);
        }
    }

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={closeCart}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-heading font-bold text-secondary flex items-center gap-2">
                                    <ShoppingBag size={24} />
                                    Carrinho
                                </h2>
                                <button
                                    onClick={closeCart}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} className="text-gray-600" />
                                </button>
                            </div>
                            <p className="text-sm text-text-secondary">
                                {cartCount} {cartCount === 1 ? 'item' : 'itens'} no carrinho
                            </p>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingBag className="text-gray-300 mb-4" size={64} />
                                    <h3 className="text-xl font-heading font-bold text-secondary mb-2">
                                        Carrinho Vazio
                                    </h3>
                                    <p className="text-text-secondary mb-6">
                                        Adicione produtos para começar suas compras
                                    </p>
                                    <Button onClick={closeCart} variant="primary">
                                        Continuar Comprando
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 100 }}
                                            className="bg-gray-50 rounded-xl p-4"
                                        >
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = 'https://placehold.co/200x200?text=Produto'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag className="text-gray-300" size={24} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-secondary mb-1 line-clamp-1">
                                                        {item.name}
                                                    </h4>
                                                    {item.category && (
                                                        <p className="text-xs text-primary font-semibold mb-2">
                                                            {item.category}
                                                        </p>
                                                    )}
                                                    <p className="text-lg font-bold text-primary">
                                                        R$ {item.price.toFixed(2).replace('.', ',')}
                                                    </p>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                                                    title="Remover item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                        disabled={item.quantity <= 1}
                                                        className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="text-lg font-bold text-secondary min-w-[2rem] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                        disabled={item.quantity >= (item.stock || 999)}
                                                        className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-lg font-bold text-secondary">
                                                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="border-t border-gray-200 p-6 bg-gray-50">
                                {/* Total */}
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg font-semibold text-secondary">Total:</span>
                                    <span className="text-3xl font-bold text-primary">
                                        R$ {cartTotal.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleCheckout}
                                        variant="primary"
                                        className="w-full py-4 text-lg"
                                    >
                                        Finalizar Compra
                                        <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                    <Button
                                        onClick={closeCart}
                                        variant="outline"
                                        className="w-full py-3"
                                    >
                                        Continuar Comprando
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
