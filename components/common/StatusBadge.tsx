// components/common/StatusBadge.tsx
'use client';

import { Clock, Eye, CheckCircle, Wrench, Trophy, XCircle } from 'lucide-react';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: {
        label: 'Chờ xử lý',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        icon: <Clock size={12} data-filled={true} />
    },
    viewed: {
        label: 'Đã xem',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Eye size={12} data-filled={true} />
    },
    approved: {
        label: 'Đã duyệt',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle size={12} data-filled={true} />
    },
    in_progress: {
        label: 'Đang cải tiến',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <Wrench size={12} data-filled={true} />
    },
    completed: {
        label: 'Hoàn thành',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <Trophy size={12} data-filled={true} />
    },
    rejected: {
        label: 'Từ chối',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <XCircle size={12} data-filled={true} />
    }
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.pending;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px] sm:text-xs gap-1',
        md: 'px-2.5 py-1 text-sm gap-1.5',
        lg: 'px-3 py-1.5 text-base gap-2'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${config.color}`}>
            {config.icon}
            <span>{config.label}</span>
        </span>
    );
}