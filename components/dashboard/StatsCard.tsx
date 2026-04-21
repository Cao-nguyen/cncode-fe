// components/admin/StatsCard.tsx
'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    subtitle?: string;
    subtitleColor?: 'green' | 'red' | 'blue';
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'indigo' | 'yellow' | 'red';
}

const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
    teal: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
};

const subtitleColorClasses: Record<string, string> = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
};

export default function StatsCard({
    title,
    value,
    icon: Icon,
    subtitle,
    subtitleColor = 'green',
    color = 'blue'
}: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {value.toLocaleString('vi-VN')}
                    </p>
                    {subtitle && (
                        <p className={cn("text-xs mt-1", subtitleColorClasses[subtitleColor])}>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={cn("p-3 rounded-xl", colorClasses[color])}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}