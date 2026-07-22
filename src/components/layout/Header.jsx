import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Package, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { cartCount, openCart } = useCart();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            setIsUserMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

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
                <Link to="/" className="flex items-center gap-3">
                    <img
                        src="/assets/icons/logo-symbol.svg"
                        alt="O Irmãozinho"
                        className="h-9 w-9"
                    />
                    <span className="text-3xl font-heading font-bold text-primary">
                        O Irmãozinho
                    </span>
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

                    {/* User Menu Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2 p-2 text-text-secondary hover:text-primary transition-colors"
                        >
                            <User size={24} />
                            <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                                    onMouseLeave={() => setIsUserMenuOpen(false)}
                                >
                                    {currentUser ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-gray-200">
                                                <p className="text-sm font-semibold text-secondary truncate">
                                                    {currentUser.email}
                                                </p>
                                            </div>
                                            <Link
                                                to="/orders"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary transition-colors"
                                            >
                                                <Package size={18} />
                                                Meus Pedidos
                                            </Link>
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary transition-colors"
                                            >
                                                <User size={18} />
                                                Painel Admin
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut size={18} />
                                                Sair
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary transition-colors"
                                            >
                                                <LogIn size={18} />
                                                Entrar
                                            </Link>
                                            <Link
                                                to="/signup"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary transition-colors"
                                            >
                                                <User size={18} />
                                                Criar Conta
                                            </Link>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
                            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        openCart();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-2 text-text-secondary"
                                >
                                    <ShoppingCart size={20} />
                                    <span>Carrinho {cartCount > 0 && `(${cartCount})`}</span>
                                </button>
                                {currentUser ? (
                                    <>
                                        <Link
                                            to="/orders"
                                            className="flex items-center space-x-2 text-text-secondary"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Package size={20} />
                                            <span>Meus Pedidos</span>
                                        </Link>
                                        <Link
                                            to="/admin"
                                            className="flex items-center space-x-2 text-text-secondary"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User size={20} />
                                            <span>Painel Admin</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center space-x-2 text-red-600"
                                        >
                                            <LogOut size={20} />
                                            <span>Sair</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="flex items-center space-x-2 text-text-secondary"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <LogIn size={20} />
                                            <span>Entrar</span>
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="flex items-center space-x-2 text-text-secondary"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User size={20} />
                                            <span>Criar Conta</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
