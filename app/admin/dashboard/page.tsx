// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { dashboardApi } from '@/lib/api/dashboard.api';
import StatsCard from '@/components/dashboard/StatsCard';
import {
    Users,
    DollarSign,
    Package,
    FileText,
    UserPlus,
    ShoppingBag,
    Activity,
    Eye,
    TrendingUp,
    Star,
    Download
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { IAdminDashboard, ICategoryStat } from '@/types/dashboard.type';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

type TimeRange = 'today' | 'week' | 'month' | 'year';

interface TooltipPayloadItem {
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: {
        _id?: string;
        count?: number;
        totalDownloads?: number;
        avgRating?: number;
        month?: string;
        revenue?: number;
        orders?: number;
        users?: number;
        teachers?: number;
        products?: number;
        posts?: number;
    };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                <p className="font-semibold mb-1">{label}</p>
                {payload.map((item, idx) => {
                    const isRevenue = item.name === 'revenue' || item.name === 'Doanh thu';
                    const formattedValue = isRevenue
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value)
                        : new Intl.NumberFormat('vi-VN').format(item.value);

                    return (
                        <p key={idx} className="text-xs sm:text-sm" style={{ color: item.color }}>
                            {item.name}: {formattedValue}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        const value = payload[0]?.value;
        if (data && value !== undefined) {
            return (
                <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-xs sm:text-sm mb-1 capitalize">{String(data._id || '')}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        Số lượng: {new Intl.NumberFormat('vi-VN').format(value)} sản phẩm
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Lượt tải: {new Intl.NumberFormat('vi-VN').format(data.totalDownloads || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Đánh giá: ⭐ {data.avgRating?.toFixed(1) || 0}
                    </p>
                </div>
            );
        }
    }
    return null;
};

const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, outerRadius, payload } = props;

    if (cx === undefined || cy === undefined || midAngle === undefined || outerRadius === undefined) {
        return null;
    }

    const data = payload as unknown as { _id: string; count: number };
    if (!data || !data._id) {
        return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = Number(outerRadius) * 1.1;
    const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
    const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return null;
    }

    return (
        <text
            x={x}
            y={y}
            fill="#888888"
            textAnchor={x > Number(cx) ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-[10px] sm:text-xs"
        >
            {`${data._id}: ${data.count}`}
        </text>
    );
};

export default function AdminDashboardPage() {
    const { token } = useAuthStore();
    const [dashboard, setDashboard] = useState<IAdminDashboard | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchDashboard = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const result = await dashboardApi.getAdminDashboard(token);
            if (result.success) {
                setDashboard(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Lọc dữ liệu theo thời gian
    const getFilteredData = () => {
        if (!dashboard) return null;

        const now = new Date();
        let filteredRevenue = dashboard.charts.revenue;
        let filteredUserGrowth = dashboard.charts.userGrowth;
        let filteredContent = dashboard.charts.content;

        if (timeRange === 'today') {
            // Chỉ lấy dữ liệu hôm nay
            const todayStr = now.toLocaleDateString('vi-VN');
            filteredRevenue = dashboard.charts.revenue.filter(item => item.month.includes(todayStr));
            filteredUserGrowth = dashboard.charts.userGrowth.filter(item => item.month.includes(todayStr));
            filteredContent = dashboard.charts.content.filter(item => item.month.includes(todayStr));
        } else if (timeRange === 'week') {
            // Lấy 7 ngày gần nhất
            filteredRevenue = dashboard.charts.revenue.slice(-7);
            filteredUserGrowth = dashboard.charts.userGrowth.slice(-7);
            filteredContent = dashboard.charts.content.slice(-7);
        } else if (timeRange === 'month') {
            // Lấy 30 ngày gần nhất
            filteredRevenue = dashboard.charts.revenue.slice(-30);
            filteredUserGrowth = dashboard.charts.userGrowth.slice(-30);
            filteredContent = dashboard.charts.content.slice(-30);
        } else if (timeRange === 'year') {
            // Lấy 12 tháng
            filteredRevenue = dashboard.charts.revenue;
            filteredUserGrowth = dashboard.charts.userGrowth;
            filteredContent = dashboard.charts.content;
        }

        return {
            ...dashboard,
            charts: {
                revenue: filteredRevenue,
                userGrowth: filteredUserGrowth,
                content: filteredContent
            }
        };
    };

    const filteredDashboard = getFilteredData();

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatNumber = (value: number): string => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const getTimeRangeLabel = (range: TimeRange): string => {
        switch (range) {
            case 'today': return 'Hôm nay';
            case 'week': return 'Tuần này';
            case 'month': return 'Tháng này';
            case 'year': return 'Năm này';
            default: return 'Tháng này';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!dashboard || !filteredDashboard) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Không thể tải dữ liệu</p>
                <button
                    onClick={fetchDashboard}
                    className="mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            {/* Header với bộ lọc thời gian */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 bg-gray-100 dark:bg-[#0a0a0a] z-10 py-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Tổng quan</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                        Phân tích toàn bộ hoạt động của nền tảng
                    </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-[#1c1c1c] rounded-lg p-1 shadow-sm">
                    {(['today', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md transition ${timeRange === range
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            {getTimeRangeLabel(range)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards - Grid 2 cột trên mobile */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <StatsCard
                    title="Tổng người dùng"
                    value={filteredDashboard.overview.users.total}
                    icon={Users}
                    subtitle={`+${formatNumber(filteredDashboard.overview.users.thisMonth)} tháng này`}
                    subtitleColor="green"
                    color="blue"
                />
                <StatsCard
                    title="Doanh thu"
                    value={filteredDashboard.overview.revenue.total}
                    icon={DollarSign}
                    subtitle={`+${formatCurrency(filteredDashboard.overview.revenue.thisMonth)} tháng này`}
                    subtitleColor="green"
                    color="green"
                />
                <StatsCard
                    title="Sản phẩm"
                    value={filteredDashboard.overview.content.products.published}
                    icon={Package}
                    subtitle={`+${filteredDashboard.overview.content.products.newThisMonth} mới`}
                    subtitleColor="blue"
                    color="purple"
                />
                <StatsCard
                    title="Bài viết"
                    value={filteredDashboard.overview.content.posts.published}
                    icon={FileText}
                    subtitle={`+${filteredDashboard.overview.content.posts.newThisMonth} mới`}
                    subtitleColor="blue"
                    color="orange"
                />
                <StatsCard
                    title="Giáo viên"
                    value={filteredDashboard.overview.users.teachers}
                    icon={UserPlus}
                    color="teal"
                />
                <StatsCard
                    title="Đơn hàng"
                    value={filteredDashboard.overview.revenue.totalOrders}
                    icon={ShoppingBag}
                    subtitle={`+${formatNumber(filteredDashboard.overview.revenue.ordersThisMonth)} tháng này`}
                    subtitleColor="green"
                    color="indigo"
                />
                <StatsCard
                    title="Người dùng hoạt động"
                    value={filteredDashboard.overview.users.activeToday}
                    icon={Activity}
                    subtitle="Hôm nay"
                    subtitleColor="blue"
                    color="yellow"
                />
                <StatsCard
                    title="Xu tiêu thụ"
                    value={filteredDashboard.overview.revenue.xuSpentThisMonth}
                    icon={TrendingUp}
                    subtitle="Tháng này"
                    subtitleColor="blue"
                    color="red"
                />
            </div>

            {/* Biểu đồ doanh thu */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Biểu đồ doanh thu
                </h2>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[500px] sm:min-w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={filteredDashboard.charts.revenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6b7280"
                                    fontSize={isMobile ? 10 : 12}
                                    interval={isMobile ? 1 : 0}
                                    angle={isMobile ? -45 : 0}
                                    textAnchor={isMobile ? "end" : "middle"}
                                    height={isMobile ? 50 : 30}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(v: number) => isMobile ? `${v / 1000000}M` : `${v / 1000000}M`}
                                    stroke="#6b7280"
                                    fontSize={isMobile ? 10 : 12}
                                    width={isMobile ? 40 : 60}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#6b7280"
                                    fontSize={isMobile ? 10 : 12}
                                    width={isMobile ? 40 : 60}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    name="Doanh thu"
                                    strokeWidth={2}
                                    dot={{ r: isMobile ? 2 : 4 }}
                                    activeDot={{ r: isMobile ? 4 : 6 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#10b981"
                                    name="Số đơn hàng"
                                    strokeWidth={2}
                                    dot={{ r: isMobile ? 2 : 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Biểu đồ tăng trưởng người dùng và nội dung */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Tăng trưởng người dùng
                    </h2>
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[400px] sm:min-w-full">
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={filteredDashboard.charts.userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#6b7280"
                                        fontSize={isMobile ? 10 : 12}
                                        interval={isMobile ? 1 : 0}
                                        angle={isMobile ? -45 : 0}
                                        textAnchor={isMobile ? "end" : "middle"}
                                        height={isMobile ? 50 : 30}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        fontSize={isMobile ? 10 : 12}
                                        width={isMobile ? 40 : 60}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stackId="1"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        name="Người dùng"
                                        fillOpacity={0.6}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="teachers"
                                        stackId="1"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        name="Giáo viên"
                                        fillOpacity={0.6}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Nội dung mới
                    </h2>
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[400px] sm:min-w-full">
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={filteredDashboard.charts.content}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#6b7280"
                                        fontSize={isMobile ? 10 : 12}
                                        interval={isMobile ? 1 : 0}
                                        angle={isMobile ? -45 : 0}
                                        textAnchor={isMobile ? "end" : "middle"}
                                        height={isMobile ? 50 : 30}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        fontSize={isMobile ? 10 : 12}
                                        width={isMobile ? 40 : 60}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                                    <Bar dataKey="products" fill="#8b5cf6" name="Sản phẩm" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="posts" fill="#f59e0b" name="Bài viết" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thống kê theo danh mục */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Thống kê theo danh mục
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="w-full h-[250px] sm:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboard.categoryStats}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={!isMobile}
                                    label={!isMobile ? renderCustomizedLabel : undefined}
                                    outerRadius={isMobile ? 70 : 100}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {dashboard.categoryStats.map((_, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                                    layout={isMobile ? "horizontal" : "vertical"}
                                    align={isMobile ? "center" : "right"}
                                    verticalAlign={isMobile ? "bottom" : "middle"}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        {dashboard.categoryStats.map((cat: ICategoryStat, idx: number) => (
                            <div key={cat._id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div
                                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                    />
                                    <span className="text-xs sm:text-sm font-medium capitalize text-gray-900 dark:text-white">
                                        {cat._id}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatNumber(cat.count)} sản phẩm
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                        {formatNumber(cat.totalDownloads)} lượt tải • ⭐ {cat.avgRating.toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top sản phẩm và bài viết - HIỂN THỊ ĐẦY ĐỦ TÊN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Top sản phẩm */}
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-3 sm:p-5 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1c1c1c] z-10">
                        <div className="flex items-center gap-2">
                            <Package size={isMobile ? 16 : 20} className="text-purple-500" />
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                Top sản phẩm bán chạy
                            </h2>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
                        {dashboard.topProducts.map((product, idx: number) => (
                            <div key={product._id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">
                                            {product.name}
                                        </p>
                                        <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                            <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                                                <Download size={isMobile ? 10 : 12} /> {formatNumber(product.downloadCount)} lượt tải
                                            </span>
                                            <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                                                <Star size={isMobile ? 10 : 12} /> {product.rating.toFixed(1)}
                                            </span>
                                            <span className="whitespace-nowrap">{formatCurrency(product.price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {dashboard.topProducts.length === 0 && (
                            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">Chưa có sản phẩm nào</div>
                        )}
                    </div>
                </div>

                {/* Top bài viết */}
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-3 sm:p-5 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1c1c1c] z-10">
                        <div className="flex items-center gap-2">
                            <FileText size={isMobile ? 16 : 20} className="text-orange-500" />
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                Top bài viết nổi bật
                            </h2>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
                        {dashboard.topPosts.map((post, idx: number) => (
                            <div key={post._id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center font-bold text-orange-600 dark:text-orange-400 text-xs sm:text-sm flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">
                                            {post.title}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                            Bởi {post.author?.fullName || 'Unknown'}
                                        </p>
                                        <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                            <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                                                <Eye size={isMobile ? 10 : 12} /> {formatNumber(post.views)} lượt xem
                                            </span>
                                            <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                                                <Activity size={isMobile ? 10 : 12} /> {formatNumber(post.likes)} thích
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {dashboard.topPosts.length === 0 && (
                            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">Chưa có bài viết nào</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}