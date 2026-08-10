'use client';

import { useEffect, useState } from 'react';
import { useShortLinkStore } from '@/store/shortlink.store';
import { Link2, MousePointerClick, Clock, CheckCircle } from 'lucide-react';

export function UserStatsOverview() {
    const { userStats, isUserStatsLoading, fetchUserStats } = useShortLinkStore();

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    if (isUserStatsLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-sm sm:text-base font-semibold text-[var(--cn-text-main)]">
                    Thống kê tổng quan
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] p-4">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!userStats) {
        return null;
    }

    const { totalLinks, totalClicks, expiredLinks, activeLinks } = userStats;

    return (
        <div className="space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-[var(--cn-text-main)]">
                Thống kê tổng quan
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] p-4 hover:border-[var(--cn-primary)] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Link2 size={16} className="text-[var(--cn-primary)]" />
                        <span className="text-xs font-medium text-[var(--cn-text-muted)] uppercase">Link đã tạo</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--cn-text-main)]">
                        {totalLinks}
                    </p>
                </div>
                <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] p-4 hover:border-[var(--cn-primary)] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <MousePointerClick size={16} className="text-[var(--cn-primary)]" />
                        <span className="text-xs font-medium text-[var(--cn-text-muted)] uppercase">Lượt clicks</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--cn-text-main)]">
                        {totalClicks.toLocaleString('vi-VN')}
                    </p>
                </div>
                <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] p-4 hover:border-[var(--cn-primary)] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-red-500" />
                        <span className="text-xs font-medium text-[var(--cn-text-muted)] uppercase">Link hết hạn</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--cn-text-main)]">
                        {expiredLinks}
                    </p>
                </div>
                <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] p-4 hover:border-[var(--cn-primary)] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span className="text-xs font-medium text-[var(--cn-text-muted)] uppercase">Link hoạt động</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--cn-text-main)]">
                        {activeLinks}
                    </p>
                </div>
            </div>
        </div>
    );
}
