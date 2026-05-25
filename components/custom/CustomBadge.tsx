// components/custom/CustomBadge.tsx
'use client';

import React from 'react';

interface CustomBadgeProps {
    children: React.ReactNode;
    variant?: 'grade10' | 'grade11' | 'grade12' | 'other' | 'solved' | 'pending' | 'admin' | 'expert';
    size?: 'sm' | 'md';
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({ children, variant = 'other', size = 'md' }) => {
    const variants = {
        grade10: 'bg-blue-100 text-blue-700',
        grade11: 'bg-green-100 text-green-700',
        grade12: 'bg-purple-100 text-purple-700',
        other: 'bg-gray-100 text-gray-700',
        solved: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-yellow-100 text-yellow-700',
        admin: 'bg-red-100 text-red-700',
        expert: 'bg-orange-100 text-orange-700',
    };

    const sizes = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-0.5 text-xs',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};