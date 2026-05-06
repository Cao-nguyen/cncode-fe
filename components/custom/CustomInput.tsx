// components/custom/CustomInput.tsx
'use client'

import React, { useState } from 'react';
import { Eye, EyeOff, Search, CheckCircle, Loader2 } from 'lucide-react';

interface CustomInputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error?: string;
    success?: boolean;
    icon?: React.ReactNode;
    type?: 'text' | 'email' | 'password' | 'tel' | 'search' | 'date';
    prefix?: string;
    suffix?: React.ReactNode;
    textarea?: boolean;
    rows?: number;
    filled?: boolean;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    error,
    success,
    icon,
    type = 'text',
    prefix,
    suffix,
    textarea = false,
    rows = 3,
    filled = false,
    maxLength,
    required = false,
    disabled = false,
    isLoading = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [charCount, setCharCount] = useState(value?.length || 0);

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const isFilled = filled || (value && value.length > 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onChange) {
            onChange(e);
        }
        if (maxLength && textarea) {
            setCharCount(e.target.value.length);
        }
    };

    // Font size: mobile/tablet = 12px, laptop = 14px
    const baseClasses = `w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border rounded-[var(--cn-radius-sm)] transition-all duration-200 outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] lg:text-[14px] ${error
        ? 'border-[var(--cn-error)] focus:border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20'
        : success
            ? 'border-[var(--cn-success)] bg-[var(--cn-success)]/5 focus:border-[var(--cn-success)] focus:ring-[var(--cn-success)]/20'
            : isFilled
                ? 'border-[var(--cn-primary)] bg-[var(--cn-primary)]/5 focus:border-[var(--cn-primary)] focus:ring-[var(--cn-primary)]/20'
                : 'border-[var(--cn-border)] focus:border-[var(--cn-primary)] focus:ring-[var(--cn-primary)]/20'
        } ${filled ? 'bg-[var(--cn-bg-section)]' : 'bg-[var(--cn-bg-card)]'} ${icon || prefix ? 'pl-8 sm:pl-10' : ''} ${type === 'password' || suffix ? 'pr-8 sm:pr-10' : ''
        }`;

    const labelClasses = 'block font-medium text-[var(--cn-text-sub)] mb-1 sm:mb-1.5 text-[11px] lg:text-[13px]';

    return (
        <div className="w-full">
            {label && (
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-[var(--cn-error)] ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {(icon || prefix) && (
                    <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
                        {prefix && (
                            <span className="text-[var(--cn-text-muted)] text-[12px] lg:text-[14px]">{prefix}</span>
                        )}
                        {icon && <div className="text-[var(--cn-text-muted)] w-3.5 h-3.5 lg:w-4 lg:h-4">{icon}</div>}
                    </div>
                )}
                {type === 'search' && !icon && (
                    <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-[var(--cn-text-muted)] w-3.5 h-3.5 lg:w-4 lg:h-4" />
                )}
                {textarea ? (
                    <textarea
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        rows={rows}
                        maxLength={maxLength}
                        disabled={disabled}
                        className={`${baseClasses} resize-none`}
                    />
                ) : (
                    <input
                        type={inputType}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        className={baseClasses}
                    />
                )}
                {(suffix || isLoading || success || (type === 'password')) && (
                    <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
                        {isLoading && <Loader2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--cn-primary)] animate-spin" />}
                        {success && <CheckCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--cn-success)]" />}
                        {type === 'password' && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)]"
                            >
                                {showPassword ? <EyeOff className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
                            </button>
                        )}
                        {suffix}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-[11px] lg:text-[13px] text-[var(--cn-error)]">{error}</p>}
            {success && !error && <p className="mt-1 text-[11px] lg:text-[13px] text-[var(--cn-success)]">✓ Hợp lệ</p>}
            {textarea && maxLength && (
                <div className="text-right text-[11px] lg:text-[13px] text-[var(--cn-text-muted)] mt-1">
                    {charCount}/{maxLength}
                </div>
            )}
        </div>
    );
};