
'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';


interface SelectOption {
    value: string;
    label: string;
    description?: string;
    avatar?: string;
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
    searchable?: boolean;
    showAvatar?: boolean;
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
    searchable = false,
    showAvatar = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selected = useMemo(() =>
        options.find(opt => opt.value === value) || null,
        [value, options]
    );

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        const query = searchQuery.toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(query) ||
            opt.description?.toLowerCase().includes(query)
        );
    }, [options, searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    const handleSelect = (option: SelectOption) => {
        if (onChange && !disabled) {
            onChange(option.value);
        }
        setIsOpen(false);
        setSearchQuery('');
    };

    const getAvatarFallback = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const labelClasses = 'block font-medium text-[var(--cn-text-sub)] mb-1 sm:mb-1.5 text-[11px] lg:text-[13px]';
    const buttonClasses = `w-full px-3 sm:px-4 py-2 text-left bg-[var(--cn-bg-card)] border rounded-[var(--cn-radius-sm)] flex items-center justify-between transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] lg:text-[14px] ${error
        ? 'border-[var(--cn-error)] focus:ring-[var(--cn-error)]/20'
        : active
            ? 'border-[var(--cn-primary)] ring-2 ring-[var(--cn-primary)]/20'
            : isOpen
                ? 'border-[var(--cn-primary)] ring-2 ring-[var(--cn-primary)]/20'
                : 'border-[var(--cn-border)] hover:border-[var(--cn-primary)]'
        }`;

    return (
        <div className="w-full" ref={dropdownRef}>
            {label && (
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-[var(--cn-error)] ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={buttonClasses}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {showAvatar && selected?.avatar && (
                            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-[var(--cn-bg-section)]">
                                <img
                                    src={selected.avatar}
                                    alt={selected.label}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {showAvatar && selected && !selected.avatar && (
                            <div className="w-6 h-6 rounded-full flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                    {getAvatarFallback(selected.label)}
                                </span>
                            </div>
                        )}
                        <span className={`truncate ${selected ? 'text-[var(--cn-text-main)]' : 'text-[var(--cn-text-muted)]'}`}>
                            {selected ? selected.label : placeholder}
                        </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--cn-text-muted)] transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-10 w-full mt-1 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] shadow-[var(--cn-shadow-md)] max-h-60 overflow-hidden flex flex-col">
                        {searchable && (
                            <div className="p-2 border-b border-[var(--cn-border)] sticky top-0 bg-[var(--cn-bg-card)]">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--cn-text-muted)]" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm kiếm..."
                                        className="w-full pl-8 pr-3 py-1.5 text-[12px] lg:text-[14px] bg-[var(--cn-bg-section)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--cn-primary)]/20 focus:border-[var(--cn-primary)]"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="overflow-auto max-h-52">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 sm:px-4 py-3 text-center text-[12px] lg:text-[14px] text-[var(--cn-text-muted)]">
                                    Không tìm thấy kết quả
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className="w-full px-3 sm:px-4 py-2 text-left hover:bg-[var(--cn-hover)] flex items-center justify-between group transition-colors"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {showAvatar && option.avatar && (
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[var(--cn-bg-section)]">
                                                    <img
                                                        src={option.avatar}
                                                        alt={option.label}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            {showAvatar && !option.avatar && (
                                                <div className="w-8 h-8 rounded-full flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400">
                                                        {getAvatarFallback(option.label)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[12px] lg:text-[14px] font-medium text-[var(--cn-text-main)] truncate">{option.label}</div>
                                                {option.description && (
                                                    <div className="text-[11px] lg:text-[13px] text-[var(--cn-text-muted)] truncate">{option.description}</div>
                                                )}
                                            </div>
                                        </div>
                                        {selected?.value === option.value && (
                                            <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--cn-primary)] flex-shrink-0 ml-2" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-[11px] lg:text-[13px] text-[var(--cn-error)]">{error}</p>}
        </div>
    );
};
