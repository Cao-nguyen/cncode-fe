// components/ui/CustomTextarea.tsx
'use client';

import { useState } from "react";

interface CustomTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    className?: string;
}

export default function CustomTextarea({ value, onChange, placeholder, rows = 4, maxLength, className = '' }: CustomTextareaProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm text-gray-700 dark:text-gray-300 resize-none transition-all focus:outline-none ${isFocused
                    ? 'border-main ring-2 ring-main/20'
                    : 'border-gray-200 dark:border-gray-700'
                    }`}
            />
            {maxLength && (
                <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {value.length}/{maxLength}
                </div>
            )}
        </div>
    );
}