'use client';

import React, { forwardRef } from 'react';

interface CustomInputTimeProps {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    min?: number;
    max?: number;
    placeholder?: string;
}

export const CustomInputTime = forwardRef<HTMLInputElement, CustomInputTimeProps>(({
    label,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    min = 0,
    max = 23,
    placeholder = '00',
}, ref) => {
    const labelClasses = 'block font-medium text-[var(--cn-text-sub)] mb-1 sm:mb-1.5 text-[11px] lg:text-[13px]';
    const inputClasses = `w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border rounded-[var(--cn-radius-sm)] transition-all duration-200 outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] lg:text-[14px] ${error
        ? 'border-[var(--cn-error)] focus:border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20'
        : 'border-[var(--cn-border)] focus:border-[var(--cn-primary)] focus:ring-[var(--cn-primary)]/20'
    }`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        
        // Ensure it's a number
        if (newValue && !/^\d+$/.test(newValue)) {
            return;
        }
        
        // Validate range
        const numValue = parseInt(newValue, 10);
        if (numValue > max) {
            return;
        }
        
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        
        // Pad with leading zero on blur
        if (newValue && newValue.length === 1) {
            newValue = newValue.padStart(2, '0');
            if (onChange) {
                onChange(newValue);
            }
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
                type="text"
                inputMode="numeric"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                min={min}
                max={max}
                className={inputClasses}
            />
            {error && <p className="mt-1 text-[11px] lg:text-[13px] text-[var(--cn-error)]">{error}</p>}
        </div>
    );
});

CustomInputTime.displayName = 'CustomInputTime';
