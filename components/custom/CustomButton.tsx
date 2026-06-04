
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline-primary' | 'outline';
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
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--cn-radius-sm)] transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<ButtonVariant, string> = {
        primary: 'bg-[var(--cn-primary)] text-white hover:bg-[var(--cn-primary-hover)]',
        secondary: 'bg-[var(--cn-bg-section)] text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)]',
        danger: 'bg-[var(--cn-error)] text-white hover:bg-[var(--cn-error)]/80',
        'outline-primary': 'border border-[var(--cn-primary)] text-[var(--cn-primary)] bg-transparent hover:bg-[var(--cn-primary)]/10',
        outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
    };

    const sizes: Record<ButtonSize, string> = {
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
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};
