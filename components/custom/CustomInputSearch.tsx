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

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, debounceDelay);

        return () => clearTimeout(handler);
    }, [inputValue, debounceDelay]);

    // Trigger search on debounced value change
    useEffect(() => {
        if (debouncedValue !== value) {
            onSearch?.(debouncedValue);
            onChange?.(debouncedValue);
        }
    }, [debouncedValue]);

    // Update input value when prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Handle click outside
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
            default:
                return 'px-4 py-2 text-base';
        }
    };

    const getVariantClasses = () => {
        const baseClasses = 'w-full rounded-lg transition-all duration-200 outline-none';
        const focusClasses = 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

        switch (variant) {
            case 'filled':
                return `${baseClasses} bg-gray-100 border border-transparent hover:bg-gray-200 ${focusClasses}`;
            case 'outline':
                return `${baseClasses} bg-transparent border-2 border-gray-300 hover:border-gray-400 ${focusClasses}`;
            default:
                return `${baseClasses} bg-white border border-gray-300 hover:border-gray-400 ${focusClasses}`;
        }
    };

    const allSuggestions = [...suggestions].slice(0, maxSuggestions);
    const hasSuggestions = allSuggestions.length > 0;
    const hasRecent = recentSearches.length > 0;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <form onSubmit={handleSubmit} className="relative">
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                    )}
                </div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={`${getSizeClasses()} ${getVariantClasses()} pl-9 ${inputValue ? 'pr-20' : 'pr-9'
                        }`}
                />

                {/* Action Buttons */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {showMic && onMicClick && (
                        <button
                            type="button"
                            onClick={onMicClick}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
                            title="Tìm kiếm bằng giọng nói"
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    )}

                    {inputValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                            title="Xóa"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {(showSuggestions && hasSuggestions) || (showRecent && hasRecent) ? (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-slideDown">
                    {/* Recent Searches */}
                    {showRecent && hasRecent && (
                        <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <span className="text-xs font-medium text-gray-500 uppercase">Tìm kiếm gần đây</span>
                            </div>
                            {recentSearches.slice(0, 5).map((recent, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRecentClick(recent)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                    <Search className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-700">{recent}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Search Suggestions */}
                    {showSuggestions && hasSuggestions && (
                        <div>
                            {showRecent && hasRecent && (
                                <div className="border-t border-gray-100"></div>
                            )}
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <span className="text-xs font-medium text-gray-500 uppercase">Gợi ý</span>
                            </div>
                            {allSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Search className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                                            <span className="text-sm text-gray-700 group-hover:text-blue-600">
                                                {suggestion.label}
                                            </span>
                                        </div>
                                        {suggestion.type && (
                                            <span className="text-xs text-gray-400">{suggestion.type}</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}

            {/* Loading Overlay */}
            {isLoading && inputValue && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );
};