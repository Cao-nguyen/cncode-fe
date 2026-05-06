// components/custom/DashboardCard.tsx
'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
    trend?: 'up' | 'down' | 'neutral';
    suffix?: string;
    prefix?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    value,
    change,
    icon,
    iconBgColor = '#EFF6FF',
    iconColor = '#3B82F6',
    trend = 'neutral',
    suffix = '',
    prefix = '',
}) => {
    const isPositive = trend === 'up' || (change && change > 0);
    const isNegative = trend === 'down' || (change && change < 0);
    const changeColor = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400';
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
    const displayChange = change ? Math.abs(change) : null;

    const formattedValue = `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`;

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: iconBgColor, color: iconColor }}
                    >
                        {icon}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">{title}</p>
                        <p className="text-xl font-bold text-gray-800">{formattedValue}</p>
                    </div>
                </div>
                {displayChange !== null && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${changeColor}`}>
                        <TrendIcon className="w-3 h-3" />
                        <span>{displayChange}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};