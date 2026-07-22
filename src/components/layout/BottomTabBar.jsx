import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Feather, ShoppingBag } from 'lucide-react';

const items = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Artigos', path: '/artigos', icon: FileText },
    { name: 'Crônicas', path: '/cronicas', icon: Feather },
    { name: 'Loja', path: '/store', icon: ShoppingBag },
];

const BottomTabBar = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#FBF7EF] border-t border-borda h-16">
            <div className="flex items-center justify-around h-full max-w-lg mx-auto">
                {items.map(({ name, path, icon: Icon }) => (
                    <NavLink
                        key={name}
                        to={path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 px-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'
                            }`
                        }
                    >
                        <Icon size={22} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">
                            {name}
                        </span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomTabBar;
