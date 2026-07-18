'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, TrendingUp, Calendar, MousePointerClick } from 'lucide-react';

interface ClickData {
    date: string;
    clicks: number;
}

interface ClickStatsChartProps {
    shortCode: string;
    isAdmin?: boolean;
}

export function ClickStatsChart({ shortCode, isAdmin = false }: ClickStatsChartProps) {
    const [data, setData] = useState<ClickData[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [totalClicks, setTotalClicks] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { shortlinkApi } = await import('@/lib/api/shortlink.api');
                const stats = isAdmin
                    ? await shortlinkApi.getLinkClickStats(shortCode, days)
                    : await shortlinkApi.getUserLinkClickStats(shortCode, days);
                setData(stats);
                setTotalClicks(stats.reduce((sum, item) => sum + item.clicks, 0));
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [shortCode, days, isAdmin]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <MousePointerClick size={48} className="text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Chưa có dữ liệu thống kê</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                        <MousePointerClick size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">Tổng clicks</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {totalClicks.toLocaleString('vi-VN')}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">Khoảng thời gian</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {days} ngày
                    </p>
                </div>
            </div>

            {/* Day Selector */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Thống kê:</span>
                {[7, 30, 90].map((d) => (
                    <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            days === d
                                ? 'bg-[var(--cn-primary)] text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {d} ngày
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-[var(--cn-bg-card)] rounded-xl border border-gray-200 dark:border-[var(--cn-border)] p-4">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-[var(--cn-primary)]" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--cn-text-main)]">
                        Biểu đồ lượt clicks theo ngày
                    </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            labelFormatter={(label: any) => formatDate(label)}
                            formatter={(value: any) => [value?.toLocaleString('vi-VN') || 0, 'Clicks']}
                        />
                        <Line
                            type="monotone"
                            dataKey="clicks"
                            stroke="var(--cn-primary)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--cn-primary)', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart Alternative */}
            <div className="bg-white dark:bg-[var(--cn-bg-card)] rounded-xl border border-gray-200 dark:border-[var(--cn-border)] p-4">
                <div className="flex items-center gap-2 mb-4">
                    <MousePointerClick size={18} className="text-[var(--cn-primary)]" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--cn-text-main)]">
                        Biểu đồ cột lượt clicks
                    </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            labelFormatter={(label: any) => formatDate(label)}
                            formatter={(value: any) => [value?.toLocaleString('vi-VN') || 0, 'Clicks']}
                        />
                        <Bar
                            dataKey="clicks"
                            fill="var(--cn-primary)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
