import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
    variant = 'primary', 
    children, 
    className = '',
    ...props 
}) => {
    const baseClasses = 'font-bold py-2 px-4 rounded-md flex items-center justify-center';
    
    const variantClasses = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    };

    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    );
};

export default Button;