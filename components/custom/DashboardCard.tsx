'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import {
    AreaChart,
    Area,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DashboardCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendData?: { date: string; value: number }[];
    suffix?: string;
    prefix?: string;
    chartColor?: string;
    showInfo?: boolean;
}

const CustomTooltip = ({
    active,
    payload,
    label,
    chartColor,
}: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
    chartColor?: string;
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 px-2 py-1.5 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-400">{label}</p>
                <p className="text-xs font-semibold" style={{ color: chartColor || '#3b82f6' }}>
                    {payload[0]?.value?.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    value,
    change,
    changeLabel = 'so với kỳ trước',
    icon,
    iconBgColor = '#EFF6FF',
    iconColor = '#3B82F6',
    trend = 'neutral',
    trendData,
    suffix = '',
    prefix = '',
    chartColor = '#3B82F6',
    showInfo = true,
}) => {
    const isPositive = trend === 'up' || (change !== undefined && change > 0);
    const isNegative = trend === 'down' || (change !== undefined && change < 0);
    const displayChange = change !== undefined ? Math.abs(change) : null;

    const formattedValue = `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`;

    // Generate gradient id unique per card
    const gradientId = `grad-${title.replace(/\s+/g, '-')}`;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200 flex flex-col gap-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                {/* Icon */}
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: iconBgColor }}
                >
                    <span style={{ color: iconColor }}>{icon}</span>
                </div>
                {showInfo && (
                    <Info size={14} className="text-gray-300 cursor-pointer hover:text-gray-400 transition" />
                )}
            </div>

            {/* Title */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {title}
            </p>

            {/* Value */}
            <p className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">
                {formattedValue}
            </p>

            {/* Change */}
            {displayChange !== null && (
                <div className="flex items-center gap-1">
                    {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    ) : isNegative ? (
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                        <Minus className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span
                        className={`text-xs font-semibold ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400'
                            }`}
                    >
                        {isPositive ? '↑' : isNegative ? '↓' : ''} {displayChange}%
                    </span>
                    <span className="text-xs text-gray-400">{changeLabel}</span>
                </div>
            )}

            {/* Mini Chart */}
            {trendData && trendData.length > 0 && (
                <div className="-mx-5 -mb-5 h-16 mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.18} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={chartColor}
                                strokeWidth={2}
                                fill={`url(#${gradientId})`}
                                dot={false}
                                activeDot={{ r: 4, fill: chartColor, strokeWidth: 2, stroke: '#fff' }}
                            />
                            <Tooltip
                                content={<CustomTooltip chartColor={chartColor} />}
                                cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};