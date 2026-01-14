import React from 'react';

const Card = ({ children, className = '', hover = true, ...props }) => {
    return (
        <div
            className={`bg-surface rounded-2xl shadow-md overflow-hidden ${hover ? 'hover:shadow-xl transition-all duration-300 hover:-translate-y-1' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`p-6 border-b border-gray-100 ${className}`}>
        {children}
    </div>
);

export const CardBody = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`p-6 border-t border-gray-100 bg-gray-50 ${className}`}>
        {children}
    </div>
);

export default Card;
