// components/custom/CustomInputSearch.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, Loader2 } from 'lucide-react';

interface SearchSuggestion {
    id: string;
    label: string;
    type?: string;
}

interface CustomInputSearchProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (query: string) => void;
    onClear?: () => void;
    suggestions?: SearchSuggestion[];
    onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
    isLoading?: boolean;
    showMic?: boolean;
    onMicClick?: () => void;
    recentSearches?: string[];
    className?: string;
    autoFocus?: boolean;
    debounceDelay?: number;
    maxSuggestions?: number;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'filled' | 'outline';
}

export const CustomInputSearch: React.FC<CustomInputSearchProps> = ({
    placeholder = 'Tìm kiếm...',
    value = '',
    onChange,
    onSearch,
    onClear,
    suggestions = [],
    onSelectSuggestion,
    isLoading = false,
    showMic = false,
    onMicClick,
    recentSearches = [],
    className = '',
    autoFocus = false,
    debounceDelay = 300,
    maxSuggestions = 6,
    size = 'medium',
    variant = 'default',
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showRecent, setShowRecent] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, debounceDelay);
        return () => clearTimeout(handler);
    }, [inputValue, debounceDelay]);

    useEffect(() => {
        if (debouncedValue !== value) {
            onSearch?.(debouncedValue);
            onChange?.(debouncedValue);
        }
    }, [debouncedValue]);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setShowRecent(false);
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setShowSuggestions(true);
        setShowRecent(false);
    };

    const handleClear = () => {
        setInputValue('');
        onChange?.('');
        onSearch?.('');
        onClear?.();
        inputRef.current?.focus();
        setShowSuggestions(false);
        setShowRecent(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSearch?.(inputValue);
            setShowSuggestions(false);
            setShowRecent(false);
        }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setInputValue(suggestion.label);
        onChange?.(suggestion.label);
        onSearch?.(suggestion.label);
        onSelectSuggestion?.(suggestion);
        setShowSuggestions(false);
        setShowRecent(false);
    };

    const handleRecentClick = (recent: string) => {
        setInputValue(recent);
        onChange?.(recent);
        onSearch?.(recent);
        setShowSuggestions(false);
        setShowRecent(false);
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (inputValue.length === 0 && recentSearches.length > 0) {
            setShowRecent(true);
        } else if (inputValue.length > 0 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return 'px-3 py-1.5 text-sm';
            case 'large':
                return 'px-5 py-3 text-lg';
            default: // medium - đồng bộ py-2.5 với CustomSelect
                return 'px-4 py-2.5 text-base';
        }
    };

    const getVariantClasses = () => {
        const baseClasses = 'w-full rounded-[var(--cn-radius-sm)] transition-all duration-200 outline-none';
        const focusClasses = 'focus:ring-2 focus:ring-[var(--cn-primary)]/20 focus:border-[var(--cn-primary)]';

        switch (variant) {
            case 'filled':
                return `${baseClasses} bg-[var(--cn-bg-section)] border border-transparent hover:bg-[var(--cn-hover)] ${focusClasses}`;
            case 'outline':
                return `${baseClasses} bg-transparent border-2 border-[var(--cn-border)] hover:border-[var(--cn-primary)] ${focusClasses}`;
            default:
                return `${baseClasses} bg-[var(--cn-bg-card)] border border-[var(--cn-border)] hover:border-[var(--cn-primary)] ${focusClasses}`;
        }
    };

    const allSuggestions = [...suggestions].slice(0, maxSuggestions);
    const hasSuggestions = allSuggestions.length > 0;
    const hasRecent = recentSearches.length > 0;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[var(--cn-primary)] animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-[var(--cn-text-muted)]" />
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={`${getSizeClasses()} ${getVariantClasses()} pl-9 ${inputValue ? 'pr-20' : 'pr-9'}`}
                />

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {showMic && onMicClick && (
                        <button
                            type="button"
                            onClick={onMicClick}
                            className="p-1 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] transition-colors rounded-full hover:bg-[var(--cn-hover)]"
                            title="Tìm kiếm bằng giọng nói"
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    )}

                    {inputValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)] transition-colors rounded-full hover:bg-[var(--cn-hover)]"
                            title="Xóa"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </form>

            {(showSuggestions && hasSuggestions) || (showRecent && hasRecent) ? (
                <div className="absolute z-10 w-full mt-1 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] shadow-[var(--cn-shadow-md)] overflow-hidden animate-slideDown">
                    {showRecent && hasRecent && (
                        <div>
                            <div className="px-4 py-2 bg-[var(--cn-bg-section)] border-b border-[var(--cn-border)]">
                                <span className="text-xs font-medium text-[var(--cn-text-muted)] uppercase">Tìm kiếm gần đây</span>
                            </div>
                            {recentSearches.slice(0, 5).map((recent, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRecentClick(recent)}
                                    className="w-full px-4 py-2 text-left hover:bg-[var(--cn-hover)] flex items-center gap-2 transition-colors"
                                >
                                    <Search className="w-3 h-3 text-[var(--cn-text-muted)]" />
                                    <span className="text-sm text-[var(--cn-text-main)]">{recent}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {showSuggestions && hasSuggestions && (
                        <div>
                            {showRecent && hasRecent && (
                                <div className="border-t border-[var(--cn-border)]"></div>
                            )}
                            <div className="px-4 py-2 bg-[var(--cn-bg-section)] border-b border-[var(--cn-border)]">
                                <span className="text-xs font-medium text-[var(--cn-text-muted)] uppercase">Gợi ý</span>
                            </div>
                            {allSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full px-4 py-2 text-left hover:bg-[var(--cn-hover)] transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Search className="w-3 h-3 text-[var(--cn-text-muted)] group-hover:text-[var(--cn-primary)]" />
                                            <span className="text-sm text-[var(--cn-text-main)] group-hover:text-[var(--cn-primary)]">
                                                {suggestion.label}
                                            </span>
                                        </div>
                                        {suggestion.type && (
                                            <span className="text-xs text-[var(--cn-text-muted)]">{suggestion.type}</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}

            {isLoading && inputValue && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-[var(--cn-primary)] animate-spin" />
                </div>
            )}
        </div>
    );
};