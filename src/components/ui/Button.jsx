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
    const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-heading font-semibold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white shadow-lg hover:bg-primary-dark hover:shadow-xl hover:-translate-y-1",
        secondary: "bg-secondary text-white shadow-lg hover:bg-secondary-light hover:shadow-xl hover:-translate-y-1",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
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
