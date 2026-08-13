
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
    description?: string;
    accentColor?: string;
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
    description,
    accentColor,
}) => {
    const isPositive = trend === 'up' || (change && change > 0);
    const isNegative = trend === 'down' || (change && change < 0);
    const changeColor = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400';
    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
    const displayChange = change ? Math.abs(change) : null;
    const borderAccent = accentColor || iconColor;

    return (
        <div
            className="group relative overflow-hidden bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            style={{ borderTopWidth: 3, borderTopColor: borderAccent }}
        >
            <div
                className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full opacity-[0.07] transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: borderAccent }}
            />

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: iconBgColor, color: iconColor }}
                    >
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
                        <div className="mt-0.5 inline-flex max-w-full items-baseline gap-1">
                            <span className="truncate text-2xl font-bold leading-tight text-gray-900 sm:text-[28px]">
                                {prefix}
                                {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
                            </span>
                            {suffix ? (
                                <span className="shrink-0 text-sm font-semibold text-gray-500 sm:text-base">
                                    {suffix.trim()}
                                </span>
                            ) : null}
                        </div>
                        {description && (
                            <p className="text-xs text-gray-400 mt-1.5 truncate">{description}</p>
                        )}
                    </div>
                </div>

                {displayChange !== null && (
                    <div className={`flex items-center gap-0.5 text-xs font-semibold flex-shrink-0 ${changeColor}`}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span>{displayChange}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};
