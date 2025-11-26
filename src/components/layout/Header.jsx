import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartCount, openCart } = useCart();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Artigos', path: '/artigos' },
        { name: 'Crônicas', path: '/cronicas' },
        { name: 'Loja', path: '/store' },
        { name: 'Sobre', path: '/sobre' },
    ];

    return (
        <header className="fixed w-full top-0 z-50 bg-surface/95 backdrop-blur-sm shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-3xl font-heading font-bold text-primary">
                    O Irmãozinho
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `text-base font-medium transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary' : 'text-text-secondary'
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center space-x-4">
                    <button
                        onClick={openCart}
                        className="relative p-2 text-text-secondary hover:text-primary transition-colors"
                    >
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    <Link to="/admin" className="p-2 text-text-secondary hover:text-primary transition-colors">
                        <User size={24} />
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-text-primary"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-surface border-t border-gray-100 overflow-hidden"
                    >
                        <nav className="flex flex-col p-4 space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="text-base font-medium text-text-secondary hover:text-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                                <button className="flex items-center space-x-2 text-text-secondary">
                                    <ShoppingCart size={20} />
                                    <span>Carrinho</span>
                                </button>
                                <Link to="/admin" className="flex items-center space-x-2 text-text-secondary" onClick={() => setIsMenuOpen(false)}>
                                    <User size={20} />
                                    <span>Conta</span>
                                </Link>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
