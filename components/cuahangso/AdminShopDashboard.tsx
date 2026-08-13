'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    PieChart as PieChartIcon,
    ShoppingBag,
    Coins,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend,
} from 'recharts';
import type { ShopAdminStats } from '@/lib/api/shop.api';
import { formatVndAxis, formatVndCompact } from '@/lib/utils/currency.utils';

const COLORS = ['#2563EB', '#EA580C', '#7C3AED', '#64748B', '#059669', '#DC2626', '#D97706', '#0891B2'];

function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, [breakpoint]);

    return isMobile;
}

function truncateLabel(text: string, max = 22) {
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1)}…`;
}

function shortMonthLabel(label: string) {
    const match = label.match(/thg\s*(\d+)\s*(\d+)/i);
    if (match) return `T${match[1]}/${match[2].slice(-2)}`;
    return label.length > 8 ? `${label.slice(0, 7)}…` : label;
}

interface AdminShopDashboardProps {
    stats: ShopAdminStats | null;
}

export const AdminShopDashboard = memo(function AdminShopDashboard({ stats }: AdminShopDashboardProps) {
    const isMobile = useIsMobile();
    const chartHeight = isMobile ? 240 : 300;

    const topProductsData = useMemo(
        () =>
            (stats?.topProducts || []).map((item) => ({
                name: truncateLabel(item.title, isMobile ? 14 : 22),
                fullTitle: item.title,
                purchases: item.purchases,
                revenue: item.revenue,
            })),
        [stats?.topProducts, isMobile],
    );

    const categoryProductData = useMemo(
        () =>
            (stats?.categoryCounts || []).map((item, index) => ({
                name: item._id || 'Khác',
                value: item.count,
                color: COLORS[index % COLORS.length],
            })),
        [stats?.categoryCounts],
    );

    const categoryRevenueData = useMemo(
        () =>
            (stats?.categoryRevenue || []).map((item, index) => ({
                name: item.category,
                revenue: item.revenue,
                orders: item.orders,
                color: COLORS[index % COLORS.length],
            })),
        [stats?.categoryRevenue],
    );

    const revenueTrend = useMemo(
        () =>
            (stats?.revenueTrend || []).map((point) => ({
                ...point,
                label: isMobile ? shortMonthLabel(point.label) : point.label,
            })),
        [stats?.revenueTrend, isMobile],
    );

    const legendStyle = {
        fontSize: isMobile ? 11 : 12,
        paddingTop: isMobile ? 4 : 8,
    };

    return (
        <div className="mb-6 space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-[#141414] sm:p-4 lg:p-6">
                    <div className="mb-3 flex items-center gap-2 sm:mb-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                            <BarChart3 size={18} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">
                                Sản phẩm bán chạy
                            </h2>
                            <p className="text-xs text-gray-500">Top theo lượt mua</p>
                        </div>
                    </div>
                    {topProductsData.length === 0 ? (
                        <p className="py-12 text-center text-sm text-gray-400 sm:py-16">Chưa có dữ liệu bán hàng</p>
                    ) : (
                        <div className="w-full min-w-0">
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <BarChart
                                    data={topProductsData}
                                    layout="vertical"
                                    margin={{
                                        left: isMobile ? 0 : 4,
                                        right: isMobile ? 4 : 12,
                                        top: 4,
                                        bottom: 4,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                        tickFormatter={(v) => (Number(v) >= 1000 ? formatVndAxis(Number(v)) : String(v))}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={isMobile ? 72 : 108}
                                        tick={{ fontSize: isMobile ? 10 : 11 }}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload?.length) return null;
                                            const row = payload[0].payload as (typeof topProductsData)[number];
                                            return (
                                                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md dark:border-gray-700 dark:bg-[#1a1a1a]">
                                                    <p className="mb-1 max-w-[180px] font-medium text-gray-900 dark:text-gray-100">
                                                        {row.fullTitle}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-300">Lượt mua: {row.purchases}</p>
                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        Doanh thu: {formatVndCompact(row.revenue)}
                                                    </p>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Legend wrapperStyle={legendStyle} />
                                    <Bar
                                        dataKey="purchases"
                                        name="Lượt mua"
                                        fill="#2563EB"
                                        radius={[0, 4, 4, 0]}
                                        maxBarSize={isMobile ? 18 : 24}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-[#141414] sm:p-4 lg:p-6">
                    <div className="mb-3 flex items-center gap-2 sm:mb-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 sm:h-10 sm:w-10">
                            <TrendingUp size={18} className="text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">
                                Doanh thu 6 tháng
                            </h2>
                            <p className="text-xs text-gray-500">Theo đơn hoàn tất</p>
                        </div>
                    </div>
                    <div className="w-full min-w-0">
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <AreaChart
                                data={revenueTrend}
                                margin={{
                                    left: isMobile ? -8 : 0,
                                    right: isMobile ? 4 : 8,
                                    top: 4,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="shopRevenueFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                    interval={isMobile ? 1 : 0}
                                />
                                <YAxis
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                    tickFormatter={formatVndAxis}
                                    width={isMobile ? 36 : 48}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'orders') return [value, 'Đơn hàng'];
                                        return [formatVndCompact(Number(value)), 'Doanh thu'];
                                    }}
                                />
                                <Legend wrapperStyle={legendStyle} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Doanh thu"
                                    stroke="#059669"
                                    fill="url(#shopRevenueFill)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-[#141414] sm:p-4 lg:p-6">
                    <div className="mb-3 flex items-center gap-2 sm:mb-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 sm:h-10 sm:w-10">
                            <Coins size={18} className="text-violet-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">
                                Doanh thu theo danh mục
                            </h2>
                            <p className="text-xs text-gray-500">Theo loại sản phẩm</p>
                        </div>
                    </div>
                    {categoryRevenueData.length === 0 ? (
                        <p className="py-12 text-center text-sm text-gray-400 sm:py-16">Chưa có doanh thu</p>
                    ) : (
                        <div className="w-full min-w-0">
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <BarChart
                                    data={categoryRevenueData}
                                    margin={{
                                        left: isMobile ? -8 : 0,
                                        right: 4,
                                        bottom: isMobile ? 8 : 0,
                                        top: 4,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                        interval={0}
                                        angle={isMobile ? -28 : 0}
                                        textAnchor={isMobile ? 'end' : 'middle'}
                                        height={isMobile ? 52 : 30}
                                    />
                                    <YAxis
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                        tickFormatter={formatVndAxis}
                                        width={isMobile ? 36 : 48}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === 'orders') return [value, 'Đơn hàng'];
                                            return [formatVndCompact(Number(value)), 'Doanh thu'];
                                        }}
                                    />
                                    <Legend wrapperStyle={legendStyle} />
                                    <Bar dataKey="revenue" name="Doanh thu" radius={[4, 4, 0, 0]} maxBarSize={isMobile ? 40 : 56}>
                                        {categoryRevenueData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-[#141414] sm:p-4 lg:p-6">
                    <div className="mb-3 flex items-center gap-2 sm:mb-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 sm:h-10 sm:w-10">
                            <PieChartIcon size={18} className="text-orange-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">
                                Sản phẩm theo danh mục
                            </h2>
                            <p className="text-xs text-gray-500">Tổng số đăng bán</p>
                        </div>
                    </div>
                    {categoryProductData.length === 0 ? (
                        <p className="py-12 text-center text-sm text-gray-400 sm:py-16">Chưa có sản phẩm</p>
                    ) : (
                        <div className="w-full min-w-0">
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <PieChart>
                                    <Pie
                                        data={categoryProductData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={isMobile ? 72 : 96}
                                        innerRadius={isMobile ? 28 : 0}
                                        label={isMobile ? false : ({ name, percent }) =>
                                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                        }
                                        labelLine={!isMobile}
                                    >
                                        {categoryProductData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value, 'Sản phẩm']} />
                                    <Legend wrapperStyle={legendStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {(stats?.topProducts?.length ?? 0) > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-[#141414] sm:p-4 lg:p-6">
                    <div className="mb-3 flex items-center gap-2 sm:mb-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 sm:h-10 sm:w-10">
                            <ShoppingBag size={18} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">
                                Bảng xếp hạng bán chạy
                            </h2>
                            <p className="text-xs text-gray-500">Chi tiết top sản phẩm</p>
                        </div>
                    </div>

                    {isMobile ? (
                        <div className="space-y-2">
                            {stats!.topProducts.map((item, index) => (
                                <div
                                    key={String(item.productId)}
                                    className="rounded-lg border border-gray-100 px-3 py-3 dark:border-gray-800"
                                >
                                    <div className="mb-2 flex items-start gap-2">
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-900/40">
                                            <p className="text-gray-400">Mua</p>
                                            <p className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">{item.purchases}</p>
                                        </div>
                                        <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-900/40">
                                            <p className="text-gray-400">Doanh thu</p>
                                            <p className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
                                                {formatVndCompact(item.revenue)}
                                            </p>
                                        </div>
                                        <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-900/40">
                                            <p className="text-gray-400">Tải</p>
                                            <p className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">{item.downloads ?? 0}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
                                        <th className="px-3 py-2">#</th>
                                        <th className="px-3 py-2">Sản phẩm</th>
                                        <th className="px-3 py-2">Danh mục</th>
                                        <th className="px-3 py-2 text-right">Lượt mua</th>
                                        <th className="px-3 py-2 text-right">Doanh thu</th>
                                        <th className="px-3 py-2 text-right">Lượt tải</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {stats!.topProducts.map((item, index) => (
                                        <tr key={String(item.productId)} className="text-gray-700 dark:text-gray-300">
                                            <td className="px-3 py-3 font-medium text-gray-400">{index + 1}</td>
                                            <td className="max-w-[240px] truncate px-3 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                {item.title}
                                            </td>
                                            <td className="px-3 py-3">{item.category}</td>
                                            <td className="px-3 py-3 text-right tabular-nums">{item.purchases}</td>
                                            <td className="px-3 py-3 text-right tabular-nums">{formatVndCompact(item.revenue)}</td>
                                            <td className="px-3 py-3 text-right tabular-nums">{item.downloads ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
