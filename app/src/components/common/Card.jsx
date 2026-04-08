import React from 'react';

const Card = ({
    children,
    variant = 'default',
    padding = 'md',
    className = '',
    onClick,
    hoverable = false,
    ...props
}) => {
    const baseStyles = 'rounded-2xl transition-all';

    const variants = {
        default: 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm',
        elevated: 'bg-white dark:bg-surface-dark shadow-lg shadow-black/10',
        glass: 'bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border border-white/20 dark:border-white/5',
        primary: 'bg-primary/10 border border-primary/20',
        outline: 'bg-transparent border border-gray-200 dark:border-white/10',
        dark: 'bg-surface-dark border border-white/5',
    };

    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5',
        xl: 'p-6',
    };

    const hoverStyles = hoverable
        ? 'cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.99]'
        : '';

    return (
        <div
            onClick={onClick}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
