// components/custom/CustomToggle.tsx
'use client';

import React from 'react';

type ToggleColor = 'default' | 'success' | 'warning' | 'error';
type ToggleSize = 'small' | 'medium' | 'large';

interface CustomToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    color?: ToggleColor;
    size?: ToggleSize;
    className?: string;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
    color = 'default',
    size = 'medium',
    className = '',
}) => {
    const colors = {
        default: {
            on: 'bg-[var(--cn-primary)]',
            off: 'bg-gray-300',
        },
        success: {
            on: 'bg-green-500',
            off: 'bg-gray-300',
        },
        warning: {
            on: 'bg-yellow-500',
            off: 'bg-gray-300',
        },
        error: {
            on: 'bg-red-500',
            off: 'bg-gray-300',
        },
    };

    const sizes = {
        small: {
            toggle: 'w-8 h-4',
            circle: 'w-3 h-3',
            translate: 'translate-x-4',
        },
        medium: {
            toggle: 'w-11 h-6',
            circle: 'w-5 h-5',
            translate: 'translate-x-5.5',
        },
        large: {
            toggle: 'w-14 h-7',
            circle: 'w-6 h-6',
            translate: 'translate-x-7',
        },
    };

    const currentColor = colors[color];
    const currentSize = sizes[size];

    const handleClick = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <div className={`inline-flex items-center gap-3 ${className}`}>
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={`
                    relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
                    focus:outline-none
                    ${checked ? currentColor.on : currentColor.off}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${currentSize.toggle}
                `}
            >
                <span
                    className={`
                        inline-block rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out
                        ${currentSize.circle}
                        ${checked ? currentSize.translate : 'translate-x-0.5'}
                    `}
                />
            </button>
            {label && (
                <span className={`text-sm text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
                    {label}
                </span>
            )}
        </div>
    );
};