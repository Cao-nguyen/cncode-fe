// /components/custom/CustomSelect.tsx
'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
    description?: string;
}

interface CustomSelectProps {
    label?: string;
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    active?: boolean;
    error?: string;
    disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Chọn...',
    required = false,
    active = false,
    error,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selected = useMemo(() =>
        options.find(opt => opt.value === value) || null,
        [value, options]
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: SelectOption) => {
        if (onChange && !disabled) {
            onChange(option.value);
        }
        setIsOpen(false);
    };

    return (
        <div className="w-full" ref={dropdownRef}>
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-[var(--cn-text-sub)] mb-1.5 sm:mb-2">
                    {label}
                    {required && <span className="text-[var(--cn-error)] ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full px-4 py-2.5 text-left bg-[var(--cn-bg-card)] border rounded-[var(--cn-radius-sm)] flex items-center justify-between transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${error
                        ? 'border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20'
                        : active
                            ? 'border-[var(--cn-primary)] ring-2 ring-[var(--cn-primary)]/20'
                            : isOpen
                                ? 'border-[var(--cn-primary)] ring-2 ring-[var(--cn-primary)]/20'
                                : 'border-[var(--cn-border)] hover:border-[var(--cn-primary)]'
                        }`}
                >
                    <span className={selected ? 'text-[var(--cn-text-main)]' : 'text-[var(--cn-text-muted)]'}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[var(--cn-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-10 w-full mt-1 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] shadow-[var(--cn-shadow-md)] max-h-60 overflow-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className="w-full px-3 sm:px-4 py-2.5 text-left hover:bg-[var(--cn-hover)] flex items-center justify-between group transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="text-sm sm:text-base font-medium text-[var(--cn-text-main)]">{option.label}</div>
                                    {option.description && (
                                        <div className="text-xs text-[var(--cn-text-muted)]">{option.description}</div>
                                    )}
                                </div>
                                {selected?.value === option.value && (
                                    <Check className="w-4 h-4 text-[var(--cn-primary)] flex-shrink-0 ml-2" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {error && <p className="mt-1.5 text-xs text-[var(--cn-error)]">{error}</p>}
        </div>
    );
};