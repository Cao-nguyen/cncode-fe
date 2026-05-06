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

    const labelClasses = 'block font-medium text-[var(--cn-text-sub)] mb-1 sm:mb-1.5 text-[11px] lg:text-[13px]';
    const textareaClasses = `w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border rounded-[var(--cn-radius-sm)] transition-all duration-200 outline-none focus:ring-2 resize-none disabled:opacity-50 disabled:cursor-not-allowed text-[12px] lg:text-[14px] ${error
        ? 'border-[var(--cn-error)] focus:border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20'
        : 'border-[var(--cn-border)] focus:border-[var(--cn-primary)] focus:ring-[var(--cn-primary)]/20'
        }`;

    return (
        <div className="w-full">
            {label && (
                <label className={labelClasses}>
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
                className={textareaClasses}
            />
            {error && <p className="mt-1 text-[11px] lg:text-[13px] text-[var(--cn-error)]">{error}</p>}
            {maxLength && (
                <div className="text-right text-[11px] lg:text-[13px] text-[var(--cn-text-muted)] mt-1">
                    {charCount}/{maxLength}
                </div>
            )}
        </div>
    );
};