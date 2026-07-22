import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
    children,
    variant = 'primary',
    to,
    onClick,
    className = '',
    type = 'button',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center min-h-[44px] px-7 py-3.5 rounded-full font-sans font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-background shadow-lg hover:bg-primary-dark hover:shadow-xl hover:-translate-y-1",
        secondary: "bg-secondary text-background shadow-lg hover:bg-secondary-light hover:shadow-xl hover:-translate-y-1",
        outline: "border-[1.5px] border-secondary text-secondary hover:bg-secondary hover:text-background",
        ghost: "text-primary hover:bg-primary/10",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

    if (to) {
        return (
            <Link to={to} className={combinedClassName} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={combinedClassName}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
