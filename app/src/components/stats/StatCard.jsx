import React from 'react';

const StatCard = ({
    icon,
    iconColor = 'text-primary',
    label,
    value,
    unit,
    change,
    changeType = 'positive',
    size = 'md',
    className = '',
}) => {
    const sizes = {
        sm: {
            container: 'p-3',
            icon: 'text-xl',
            value: 'text-lg',
            label: 'text-[10px]',
        },
        md: {
            container: 'p-4',
            icon: 'text-[24px]',
            value: 'text-2xl',
            label: 'text-xs',
        },
        lg: {
            container: 'p-5',
            icon: 'text-[28px]',
            value: 'text-3xl',
            label: 'text-sm',
        },
    };

    const s = sizes[size];

    return (
        <div
            className={`
        flex flex-col justify-between gap-1 rounded-2xl 
        bg-white dark:bg-surface-dark 
        shadow-sm ring-1 ring-gray-200 dark:ring-white/5
        ${s.container}
        ${className}
      `}
        >
            <div className="flex items-start justify-between">
                <span className={`material-symbols-outlined ${iconColor} ${s.icon}`}>
                    {icon}
                </span>
                {change && (
                    <span
                        className={`
              text-xs font-bold px-2 py-1 rounded-full
              ${changeType === 'positive'
                                ? 'text-primary bg-primary/10'
                                : 'text-red-500 bg-red-500/10'
                            }
            `}
                    >
                        {changeType === 'positive' ? '+' : ''}{change}
                    </span>
                )}
            </div>

            <div className="mt-2">
                <p className={`text-gray-500 dark:text-gray-400 font-medium ${s.label}`}>
                    {label}
                </p>
                <p className={`font-bold tracking-tight text-slate-900 dark:text-white ${s.value}`}>
                    {value}
                    {unit && (
                        <span className="text-sm font-normal text-gray-400 ml-1">
                            {unit}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default StatCard;
