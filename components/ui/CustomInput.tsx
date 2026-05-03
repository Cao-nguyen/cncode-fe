// components/ui/CustomInput.tsx
'use client';

import { useState } from 'react';

interface CustomInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    maxLength?: number;
    className?: string;
}

export default function CustomInput({ value, onChange, placeholder, type = 'text', maxLength, className = '' }: CustomInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm text-gray-700 dark:text-gray-300 transition-all focus:outline-none ${isFocused
                    ? 'border-main ring-2 ring-main/20'
                    : 'border-gray-200 dark:border-gray-700'
                    }`}
            />
            {maxLength && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {value.length}/{maxLength}
                </div>
            )}
        </div>
    );
}