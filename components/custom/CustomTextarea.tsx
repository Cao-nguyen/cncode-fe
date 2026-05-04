// components/custom/CustomTextarea.tsx
'use client';

import React, { useState } from 'react';

interface CustomTextareaProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    rows?: number;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
}

export const CustomTextarea: React.FC<CustomTextareaProps> = ({
    label,
    placeholder,
    value = '',
    onChange,
    error,
    rows = 4,
    maxLength,
    required = false,
    disabled = false,
}) => {
    const [charCount, setCharCount] = useState(value.length);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (maxLength && newValue.length > maxLength) return;
        setCharCount(newValue.length);
        onChange?.(newValue);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-[var(--cn-text-sub)] mb-1.5">
                    {label}
                    {required && <span className="text-[var(--cn-error)] ml-1">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                disabled={disabled}
                className={`w-full px-4 py-2.5 bg-[var(--cn-bg-card)] border rounded-[var(--cn-radius-sm)] transition-all duration-200 outline-none focus:ring-2 resize-none text-sm sm:text-base text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] disabled:opacity-50 disabled:cursor-not-allowed ${error
                    ? 'border-[var(--cn-error)] focus:border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20'
                    : 'border-[var(--cn-border)] focus:border-[var(--cn-primary)] focus:ring-[var(--cn-primary)]/20'
                    }`}
            />
            {error && <p className="mt-1.5 text-xs text-[var(--cn-error)]">{error}</p>}
            {maxLength && (
                <div className="text-right text-[10px] sm:text-xs text-[var(--cn-text-muted)] mt-1">
                    {charCount}/{maxLength}
                </div>
            )}
        </div>
    );
};