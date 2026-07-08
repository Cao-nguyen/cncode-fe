'use client';

import React, { forwardRef } from 'react';

interface CustomInputDateProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export const CustomInputDate = forwardRef<HTMLInputElement, CustomInputDateProps>(({
    label,
    placeholder = 'dd/mm/yyyy',
    value,
    onChange,
    error,
    required = false,
    disabled = false,
}, ref) => {
    const labelClasses = 'block font-medium text-[var(--cn-text-sub)] mb-1 sm:mb-1.5 text-[11px] lg:text-[13px]';
    const inputClasses = `w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border rounded-[var(--cn-radius-sm)] transition-all duration-200 outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] lg:text-[14px] ${error
        ? 'border-[var(--cn-error)] focus:border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20'
        : 'border-[var(--cn-border)] focus:border-[var(--cn-primary)] focus:ring-[var(--cn-primary)]/20'
    }`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-[var(--cn-error)] ml-1">*</span>}
                </label>
            )}
            <input
                ref={ref}
                type="date"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                disabled={disabled}
                className={inputClasses}
            />
            {error && <p className="mt-1 text-[11px] lg:text-[13px] text-[var(--cn-error)]">{error}</p>}
        </div>
    );
});

CustomInputDate.displayName = 'CustomInputDate';
