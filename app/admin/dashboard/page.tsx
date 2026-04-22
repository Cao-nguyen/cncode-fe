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
import { IAdminDashboard, ICategoryStat } from '@/types/dashboard.type';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Định nghĩa type cho payload của tooltip
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

// Định nghĩa type cho props của renderCustomizedLabel
interface PieLabelRenderProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
    payload: {
        _id: string;
        count: number;
        totalDownloads: number;
        avgRating: number;
    };
}

// Custom tooltip component cho LineChart, AreaChart, BarChart
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-sm mb-1">{label}</p>
                {payload.map((item, idx) => {
                    const isRevenue = item.name === 'revenue' || item.name === 'Doanh thu';
                    const formattedValue = isRevenue
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value)
                        : new Intl.NumberFormat('vi-VN').format(item.value);

                    return (
                        <p key={idx} className="text-sm" style={{ color: item.color }}>
                            {item.name}: {formattedValue}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

// Custom tooltip cho PieChart
const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        const value = payload[0]?.value;
        if (data && value !== undefined) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-sm mb-1 capitalize">{String(data._id || '')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
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

// Custom label cho PieChart - ĐÃ FIX LỖI TYPE
const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, outerRadius, payload } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#888888"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-xs"
        >
            {`${payload._id}: ${payload.count}`}
        </text>
    );
};

export default function AdminDashboardPage() {
    const { token } = useAuthStore();
    const [dashboard, setDashboard] = useState<IAdminDashboard | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatNumber = (value: number): string => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Không thể tải dữ liệu</p>
                <button
                    onClick={fetchDashboard}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tổng quan</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Phân tích toàn bộ hoạt động của nền tảng</p>
            </div>

            {/* Stats Cards - Hàng 1: Người dùng & Doanh thu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatsCard
                    title="Tổng người dùng"
                    value={dashboard.overview.users.total}
                    icon={Users}
                    subtitle={`+${formatNumber(dashboard.overview.users.thisMonth)} tháng này`}
                    subtitleColor="green"
                    color="blue"
                />
                <StatsCard
                    title="Doanh thu"
                    value={dashboard.overview.revenue.total}
                    icon={DollarSign}
                    subtitle={`+${formatCurrency(dashboard.overview.revenue.thisMonth)} tháng này`}
                    subtitleColor="green"
                    color="green"
                />
                <StatsCard
                    title="Sản phẩm"
                    value={dashboard.overview.content.products.published}
                    icon={Package}
                    subtitle={`+${dashboard.overview.content.products.newThisMonth} mới`}
                    subtitleColor="blue"
                    color="purple"
                />
                <StatsCard
                    title="Bài viết"
                    value={dashboard.overview.content.posts.published}
                    icon={FileText}
                    subtitle={`+${dashboard.overview.content.posts.newThisMonth} mới`}
                    subtitleColor="blue"
                    color="orange"
                />
            </div>

            {/* Stats Cards - Hàng 2: Giáo viên & Đơn hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatsCard
                    title="Giáo viên"
                    value={dashboard.overview.users.teachers}
                    icon={UserPlus}
                    color="teal"
                />
                <StatsCard
                    title="Đơn hàng"
                    value={dashboard.overview.revenue.totalOrders}
                    icon={ShoppingBag}
                    subtitle={`+${formatNumber(dashboard.overview.revenue.ordersThisMonth)} tháng này`}
                    subtitleColor="green"
                    color="indigo"
                />
                <StatsCard
                    title="Người dùng hoạt động"
                    value={dashboard.overview.users.activeToday}
                    icon={Activity}
                    subtitle="Hôm nay"
                    subtitleColor="blue"
                    color="yellow"
                />
                <StatsCard
                    title="Xu tiêu thụ"
                    value={dashboard.overview.revenue.xuSpentThisMonth}
                    icon={TrendingUp}
                    subtitle="Tháng này"
                    subtitleColor="blue"
                    color="red"
                />
            </div>

            {/* Biểu đồ doanh thu */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Biểu đồ doanh thu</h2>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dashboard.charts.revenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis yAxisId="left" tickFormatter={(v: number) => `${v / 1000000}M`} stroke="#6b7280" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            name="Doanh thu"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="orders"
                            stroke="#10b981"
                            name="Số đơn hàng"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Biểu đồ tăng trưởng người dùng và nội dung */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tăng trưởng người dùng</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dashboard.charts.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
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

                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nội dung mới</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboard.charts.content}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="products" fill="#8b5cf6" name="Sản phẩm" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="posts" fill="#f59e0b" name="Bài viết" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Thống kê theo danh mục */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thống kê theo danh mục</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={dashboard.categoryStats}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={renderCustomizedLabel}
                                outerRadius={100}
                                dataKey="count"
                                nameKey="_id"
                            >
                                {dashboard.categoryStats.map((_, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                        {dashboard.categoryStats.map((cat: ICategoryStat, idx: number) => (
                            <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                    />
                                    <span className="font-medium capitalize text-gray-900 dark:text-white">{cat._id}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(cat.count)} sản phẩm</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatNumber(cat.totalDownloads)} lượt tải • ⭐ {cat.avgRating.toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top sản phẩm và bài viết */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top sản phẩm */}
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Package size={20} className="text-purple-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top sản phẩm bán chạy</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {dashboard.topProducts.map((product, idx: number) => (
                            <div key={product._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</p>
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Download size={12} /> {formatNumber(product.downloadCount)} lượt tải
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star size={12} /> {product.rating.toFixed(1)}
                                            </span>
                                            <span>{formatCurrency(product.price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {dashboard.topProducts.length === 0 && (
                            <div className="p-8 text-center text-gray-500">Chưa có sản phẩm nào</div>
                        )}
                    </div>
                </div>

                {/* Top bài viết */}
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <FileText size={20} className="text-orange-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top bài viết nổi bật</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {dashboard.topPosts.map((post, idx: number) => (
                            <div key={post._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center font-bold text-orange-600 dark:text-orange-400">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{post.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Bởi {post.author?.fullName || 'Unknown'}
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Eye size={12} /> {formatNumber(post.views)} lượt xem
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Activity size={12} /> {formatNumber(post.likes)} thích
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {dashboard.topPosts.length === 0 && (
                            <div className="p-8 text-center text-gray-500">Chưa có bài viết nào</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}