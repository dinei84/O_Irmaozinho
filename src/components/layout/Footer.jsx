import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-secondary text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl font-heading font-bold text-primary mb-3">O Irmãozinho</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Compartilhando artigos e reflexões sobre a vida Cristã.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-base font-heading font-semibold mb-3">Navegação</h4>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-300 hover:text-primary text-sm transition-colors">Home</Link></li>
                            <li><Link to="/artigos" className="text-gray-300 hover:text-primary text-sm transition-colors">Artigos</Link></li>
                            <li><Link to="/cronicas" className="text-gray-300 hover:text-primary text-sm transition-colors">Crônicas</Link></li>
                            <li><Link to="/sobre" className="text-gray-300 hover:text-primary text-sm transition-colors">Sobre Nós</Link></li>
                        </ul>
                    </div>

                    {/* Logo */}
                    <div className="flex items-center justify-center md:justify-end pt-4">
                        <div className="relative w-40 h-40 p-2">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow"></div>
                            <div className="relative w-full h-full rounded-full bg-primary/10 overflow-hidden shadow-lg">
                                <img
                                    src="/assets/images/Podcast.png"
                                    alt="O Irmãozinho Logo"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=Logo' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media - Moved to bottom */}
                <div className="flex justify-center space-x-6 mb-6">
                    <a
                        href="#"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-gray-300 hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-110"
                        aria-label="Facebook"
                    >
                        <Facebook size={22} />
                    </a>
                    <a
                        href="#"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-gray-300 hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-110"
                        aria-label="Instagram"
                    >
                        <Instagram size={22} />
                    </a>
                    <a
                        href="#"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-gray-300 hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-110"
                        aria-label="Twitter"
                    >
                        <Twitter size={22} />
                    </a>
                </div>

                <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p className="text-gray-400 text-center md:text-left mb-3 md:mb-0">
                        &copy; {new Date().getFullYear()} O Irmãozinho. Todos os direitos reservados.
                    </p>
                    <div className="flex space-x-4">
                        <Link to="/privacidade" className="text-gray-400 hover:text-primary transition-colors">Privacidade</Link>
                        <Link to="/termos" className="text-gray-400 hover:text-primary transition-colors">Termos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
