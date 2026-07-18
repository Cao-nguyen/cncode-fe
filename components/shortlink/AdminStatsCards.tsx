
'use client';

import { useEffect } from 'react';
import { Link2, MousePointerClick, Sparkles, TrendingUp } from 'lucide-react';
import { useShortLinkStore } from '@/store/shortlink.store';

export function AdminStatsCards() {
    const { stats, isStatsLoading, fetchStats } = useShortLinkStore();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (isStatsLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-3 sm:p-4 border border-[var(--cn-border)] space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-200 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Tổng số link',
            value: stats?.totalLinks || 0,
            icon: <Link2 size={18} />,
            iconBg: 'var(--cn-primary-light)',
            iconColor: 'var(--cn-primary)',
        },
        {
            title: 'Tổng lượt click',
            value: stats?.totalClicks || 0,
            icon: <MousePointerClick size={18} />,
            iconBg: '#E6F4FB',
            iconColor: '#3BA4E8',
        },
        {
            title: 'Link đang hoạt động',
            value: stats?.activeLinks || 0,
            icon: <Sparkles size={18} />,
            iconBg: '#DCFCE7',
            iconColor: '#22C55E',
        },
        {
            title: 'Link tùy chỉnh',
            value: stats?.customLinks || 0,
            icon: <TrendingUp size={18} />,
            iconBg: '#FEF3C7',
            iconColor: '#F59E0B',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-3 sm:p-4 border border-[var(--cn-border)] hover:shadow-[var(--cn-shadow-sm)] transition-all"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-[var(--cn-text-muted)]">{card.title}</p>
                            <p className="text-lg sm:text-xl font-bold text-[var(--cn-text-main)] mt-1">
                                {card.value.toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                        >
                            {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

