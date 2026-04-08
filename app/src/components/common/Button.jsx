import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left',
    onClick,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary hover:bg-primary-dark text-background-dark shadow-lg shadow-primary/25',
        secondary: 'bg-gray-200 dark:bg-white/10 text-slate-900 dark:text-white border border-transparent hover:border-white/20',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
        ghost: 'bg-transparent text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10',
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25',
        vip: 'bg-vip-gold hover:brightness-110 text-background-dark shadow-lg shadow-vip-gold/30',
    };

    const sizes = {
        sm: 'h-9 px-4 text-sm rounded-lg gap-1.5',
        md: 'h-11 px-6 text-sm rounded-xl gap-2',
        lg: 'h-14 px-8 text-lg rounded-xl gap-2.5',
        xl: 'h-16 px-10 text-xl rounded-2xl gap-3',
    };

    return (
        <motion.button
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                    )}
                    {children}
                    {icon && iconPosition === 'right' && (
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                    )}
                </>
            )}
        </motion.button>
    );
};

export default Button;
