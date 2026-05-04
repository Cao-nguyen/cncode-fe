import React, { useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

interface CustomInputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error?: string;
    icon?: React.ReactNode;
    type?: 'text' | 'email' | 'password' | 'tel' | 'search';
    prefix?: string;
    textarea?: boolean;
    rows?: number;
    filled?: boolean;
    maxLength?: number;
    required?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    error,
    icon,
    type = 'text',
    prefix,
    textarea = false,
    rows = 3,
    filled = false,
    maxLength,
    required = false,
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

    const baseClasses = `w-full px-4 py-2 rounded-lg border transition-all duration-200 outline-none focus:ring-2 ${error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : isFilled
            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        } ${filled ? 'bg-gray-50' : 'bg-white'} ${icon || prefix ? 'pl-10' : ''} ${type === 'password' ? 'pr-10' : ''
        }`;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {(icon || prefix) && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {prefix && (
                            <span className="text-gray-500 text-sm font-medium">{prefix}</span>
                        )}
                        {icon && <div className="text-gray-400">{icon}</div>}
                    </div>
                )}
                {type === 'search' && !icon && (
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                )}
                {textarea ? (
                    <textarea
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        rows={rows}
                        maxLength={maxLength}
                        className={`${baseClasses} resize-none`}
                    />
                ) : (
                    <input
                        type={inputType}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        className={baseClasses}
                    />
                )}
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {textarea && maxLength && (
                <div className="text-right text-xs text-gray-400 mt-1">
                    {charCount}/{maxLength}
                </div>
            )}
        </div>
    );
};