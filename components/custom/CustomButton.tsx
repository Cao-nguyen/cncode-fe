// components/custom/CustomButton.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline-primary';
type ButtonSize = 'small' | 'medium' | 'large';

interface CustomButtonProps {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    fullWidth?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    onClick,
    disabled = false,
    loading = false,
    className = '',
    fullWidth = false,
    type = 'button',
}) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--cn-radius-sm)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-[var(--cn-primary)] text-white hover:bg-[var(--cn-primary-hover)] focus:ring-[var(--cn-primary)]',
        secondary: 'bg-[var(--cn-bg-section)] text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)] focus:ring-[var(--cn-border)]',
        danger: 'bg-[var(--cn-error)] text-white hover:bg-[var(--cn-error)]/80 focus:ring-[var(--cn-error)]',
        'outline-primary': 'border-2 border-[var(--cn-primary)] text-[var(--cn-primary)] hover:bg-[var(--cn-hover-blue)] focus:ring-[var(--cn-primary)]',
    };

    const sizes = {
        small: 'px-2.5 py-1 text-[11px] lg:text-[13px]',
        medium: 'px-4 py-2 text-[12px] lg:text-[14px]',
        large: 'px-5 py-2.5 text-[13px] lg:text-[15px]',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        >
            {loading && <Loader2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 animate-spin" />}
            {children}
        </button>
    );
};