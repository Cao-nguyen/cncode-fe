import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    value,
    change,
    icon,
    trend,
}) => {
    const isPositive = trend === 'up' || (change && change > 0);
    const changeColor = isPositive ? 'text-[var(--cn-success)]' : 'text-[var(--cn-error)]';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-6 shadow-[var(--cn-shadow-sm)] border border-[var(--cn-border)] hover:shadow-[var(--cn-shadow-md)] transition-shadow duration-200">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-[var(--cn-text-sub)]">{title}</h3>
                {icon && <div className="text-[var(--cn-text-muted)]">{icon}</div>}
            </div>
            <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-[var(--cn-text-main)]">{value}</p>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
                        <TrendIcon className="w-3 h-3" />
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
            </div>
            {change !== undefined && (
                <p className="mt-2 text-xs text-[var(--cn-text-muted)]">
                    so với kỳ trước
                </p>
            )}
        </div>
    );
};