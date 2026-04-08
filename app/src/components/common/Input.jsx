import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    type = 'text',
    placeholder,
    error,
    icon,
    iconPosition = 'right',
    helper,
    className = '',
    inputClassName = '',
    ...props
}, ref) => {
    return (
        <label className={`flex flex-col w-full ${className}`}>
            {label && (
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-normal pb-2 ml-1">
                    {label}
                </span>
            )}

            <div
                className={`
          group flex w-full items-stretch rounded-xl 
          border ${error ? 'border-red-500' : 'border-gray-300 dark:border-border-green'} 
          bg-white dark:bg-surface-dark 
          focus-within:border-primary dark:focus-within:border-primary 
          transition-colors overflow-hidden h-14
        `}
            >
                {icon && iconPosition === 'left' && (
                    <div className="flex items-center justify-center pl-4 text-gray-400 dark:text-[#94c7a8] group-focus-within:text-primary">
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    placeholder={placeholder}
                    className={`
            flex w-full min-w-0 flex-1 resize-none bg-transparent 
            text-gray-900 dark:text-white 
            focus:outline-0 focus:ring-0 border-none 
            h-full placeholder:text-gray-400 dark:placeholder:text-[#94c7a8]/70 
            px-4 text-base font-normal leading-normal
            ${icon && iconPosition === 'left' ? 'pl-2' : ''}
            ${icon && iconPosition === 'right' ? 'pr-2' : ''}
            ${inputClassName}
          `}
                    {...props}
                />

                {icon && iconPosition === 'right' && (
                    <div className="flex items-center justify-center pr-4 text-gray-400 dark:text-[#94c7a8] group-focus-within:text-primary">
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                )}
            </div>

            {(error || helper) && (
                <span className={`text-xs mt-1 ml-1 ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {error || helper}
                </span>
            )}
        </label>
    );
});

Input.displayName = 'Input';

export default Input;
