'use client';

import React, { forwardRef, useCallback } from 'react';

interface CustomInputHourMinuteProps {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    compact?: boolean;
}

function normalizeHourMinute(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidHourMinute(value: string): boolean {
    if (!value) return true;
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) return false;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export const CustomInputHourMinute = forwardRef<HTMLInputElement, CustomInputHourMinuteProps>(({
    label,
    value = '',
    onChange,
    error,
    required = false,
    disabled = false,
    placeholder = '14:30',
    compact = false,
}, ref) => {
    const labelClasses = 'block font-medium text-[var(--cn-text-sub)] mb-1 sm:mb-1.5 text-[11px] lg:text-[13px]';
    const inputClasses = `w-full px-3 sm:px-4 py-2 bg-[var(--cn-bg-card)] border rounded-[var(--cn-radius-sm)] transition-all duration-200 outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] lg:text-[14px] font-mono tracking-wide ${error
        ? 'border-[var(--cn-error)] focus:border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20'
        : 'border-[var(--cn-border)] focus:border-[var(--cn-primary)] focus:ring-[var(--cn-primary)]/20'
    }`;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(normalizeHourMinute(e.target.value));
    }, [onChange]);

    const handleBlur = useCallback(() => {
        if (!value || !onChange) return;
        if (/^\d{1,2}$/.test(value)) {
            const hours = Math.min(23, parseInt(value, 10));
            onChange(`${String(hours).padStart(2, '0')}:00`);
            return;
        }
        if (/^\d{2}$/.test(value) && parseInt(value, 10) <= 23) {
            onChange(`${value}:00`);
            return;
        }
        if (/^(\d{2}):(\d{1,2})$/.test(value)) {
            const [h, m] = value.split(':');
            const hours = Math.min(23, parseInt(h, 10));
            const minutes = Math.min(59, parseInt(m, 10));
            onChange(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
        }
    }, [onChange, value]);

    const invalid = value.length > 0 && !isValidHourMinute(value);

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
                maxLength={5}
                className={inputClasses}
            />
            {(error || invalid) && (
                <p className="mt-0.5 text-[11px] text-[var(--cn-error)]">
                    {error || 'Giờ:phút 24h (VD: 14:30)'}
                </p>
            )}
            {!compact && !error && !invalid && (
                <p className="mt-0.5 text-[11px] text-gray-400">24h — VD: 08:00</p>
            )}
        </div>
    );
});

CustomInputHourMinute.displayName = 'CustomInputHourMinute';

export function combineDateAndTime(date: string, time: string): string | null {
    if (!date || !time || !isValidHourMinute(time)) return null;
    return new Date(`${date}T${time}:00`).toISOString();
}

export function splitDateAndTime(value?: string | Date | null): { date: string; time: string } {
    if (!value) return { date: '', time: '' };
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return { date: '', time: '' };
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
}
