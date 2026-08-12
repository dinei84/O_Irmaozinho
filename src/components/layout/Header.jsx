import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Package, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
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
        { name: 'Início', path: '/' },
        { name: 'Artigos', path: '/artigos' },
        { name: 'Crônicas', path: '/cronicas' },
        { name: 'Loja', path: '/store' },
        { name: 'Sobre', path: '/sobre' },
    ];

    return (
        <header className="fixed w-full top-0 z-50 bg-[#FBF7EF]/95 backdrop-blur-sm border-b border-borda transition-all duration-300">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between">
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

                <div className="flex items-center space-x-2">
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

                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-1 p-2 text-text-secondary hover:text-primary transition-colors"
                        >
                            <User size={24} />
                            <ChevronDown size={16} className="hidden md:block transition-transform" />
                        </button>

                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-borda py-2"
                                    onMouseLeave={() => setIsUserMenuOpen(false)}
                                >
                                    {currentUser ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-borda">
                                                <p className="text-sm font-semibold text-secondary truncate">
                                                    {currentUser.email}
                                                </p>
                                            </div>
                                            <Link
                                                to="/orders"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-areia hover:text-primary transition-colors"
                                            >
                                                <Package size={18} />
                                                Meus Pedidos
                                            </Link>
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-areia hover:text-primary transition-colors"
                                            >
                                                <User size={18} />
                                                Painel Admin
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-pessego/30 transition-colors"
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
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-areia hover:text-primary transition-colors"
                                            >
                                                <LogIn size={18} />
                                                Entrar
                                            </Link>
                                            <Link
                                                to="/signup"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-areia hover:text-primary transition-colors"
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
            </div>
        </header>
    );
};

export default Header;
