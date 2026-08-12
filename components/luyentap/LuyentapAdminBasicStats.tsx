'use client';

import React from 'react';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Users,
} from 'lucide-react';
import { DashboardCard } from '@/components/custom/DashboardCard';
import type { AdminExerciseBasicStats } from '@/lib/api/luyentap.api';
import { formatScoreValue } from '@/lib/luyentap/exercise-display.utils';

interface LuyentapAdminBasicStatsProps {
    stats: AdminExerciseBasicStats;
}

export default function LuyentapAdminBasicStats({ stats }: LuyentapAdminBasicStatsProps) {
    const lowLabel = formatScoreValue(stats.lowScoreThreshold);
    const passLabel = formatScoreValue(stats.passScore);

    return (
        <section className="mb-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Chỉ số thống kê cơ bản
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <DashboardCard
                    title="Số người đăng ký thi"
                    value={stats.registeredCount}
                    icon={<Users className="h-5 w-5" />}
                    iconBgColor="#EEF2FF"
                    iconColor="#4F46E5"
                    accentColor="#4F46E5"
                />
                <DashboardCard
                    title="Tổng lượt làm"
                    value={stats.totalAttempts}
                    change={stats.registeredCount > 0 ? stats.completionRate : undefined}
                    trend={stats.completionRate >= 50 ? 'up' : stats.completionRate > 0 ? 'neutral' : 'down'}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    iconBgColor="#ECFDF5"
                    iconColor="#059669"
                    accentColor="#059669"
                />
                <DashboardCard
                    title="Số người chưa thi và đang thi"
                    value={stats.inProgressCount}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    iconBgColor="#FEF2F2"
                    iconColor="#DC2626"
                    accentColor="#DC2626"
                    description={stats.inProgressCount > 0 ? 'Đang làm dở hoặc chưa nộp' : '—'}
                />
                <DashboardCard
                    title={`Số thí sinh đạt điểm < ${lowLabel}`}
                    value={stats.belowLowScoreCount}
                    icon={<AlertCircle className="h-5 w-5" />}
                    iconBgColor="#FFF7ED"
                    iconColor="#EA580C"
                    accentColor="#EA580C"
                />
                <DashboardCard
                    title={`Số thí sinh đạt điểm ≥ ${passLabel}`}
                    value={stats.passCount}
                    icon={<TrendingUp className="h-5 w-5" />}
                    iconBgColor="#EEF2FF"
                    iconColor="#2563EB"
                    accentColor="#2563EB"
                    description={`Ngưỡng đạt ${stats.passThreshold}%`}
                />
            </div>
        </section>
    );
}
