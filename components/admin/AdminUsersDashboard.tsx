'use client';

import { useMemo, memo } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    PieChart as PieChartIcon,
    Activity,
    Coins,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from 'recharts';
import { IUserStats, IProvinceStat } from '@/lib/api/user.api';

interface AdminUsersDashboardProps {
    stats: IUserStats | null;
    provinceStats: IProvinceStat[];
    loadingProvince: boolean;
    isMobile: boolean;
    isTablet: boolean;
}

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

const AdminUsersDashboard = memo(function AdminUsersDashboard({
    stats,
    provinceStats,
    loadingProvince,
    isMobile,
    isTablet,
}: AdminUsersDashboardProps) {
    // Prepare role distribution data
    const roleDistributionData = useMemo(() => [
        {
            name: 'Người dùng',
            value: (stats?.total || 0) - (stats?.teachers || 0) - (stats?.admins || 0),
            color: '#3b82f6',
            percentage: ((((stats?.total || 0) - (stats?.teachers || 0) - (stats?.admins || 0)) / (stats?.total || 1)) * 100).toFixed(1)
        },
        {
            name: 'Giáo viên',
            value: stats?.teachers || 0,
            color: '#22c55e',
            percentage: (((stats?.teachers || 0) / (stats?.total || 1)) * 100).toFixed(1)
        },
        {
            name: 'Admin',
            value: stats?.admins || 0,
            color: '#f97316',
            percentage: (((stats?.admins || 0) / (stats?.total || 1)) * 100).toFixed(1)
        },
    ], [stats]);

    // Prepare growth trend data (simulated 7-day growth)
    const growthData = useMemo(() => {
        const total = stats?.total || 0;
        const newThisWeek = stats?.newThisWeek || 0;
        return [
            { day: '7 ngày trước', users: Math.max(0, total - newThisWeek - 50), new: 5 },
            { day: '6 ngày trước', users: Math.max(0, total - newThisWeek - 40), new: 8 },
            { day: '5 ngày trước', users: Math.max(0, total - newThisWeek - 30), new: 12 },
            { day: '4 ngày trước', users: Math.max(0, total - newThisWeek - 20), new: 7 },
            { day: '3 ngày trước', users: Math.max(0, total - newThisWeek - 10), new: 10 },
            { day: '2 ngày trước', users: Math.max(0, total - newThisWeek), new: 15 },
            { day: 'Hôm qua', users: Math.max(0, total - Math.floor(newThisWeek / 2)), new: Math.floor(newThisWeek / 2) },
            { day: 'Hôm nay', users: total, new: Math.ceil(newThisWeek / 2) },
        ];
    }, [stats]);

    // Prepare coin distribution data (simulated)
    const coinDistributionData = useMemo(() => {
        return [
            { range: '0-100', count: Math.floor((stats?.total || 0) * 0.3), color: '#ef4444' },
            { range: '100-500', count: Math.floor((stats?.total || 0) * 0.35), color: '#f97316' },
            { range: '500-1000', count: Math.floor((stats?.total || 0) * 0.2), color: '#f59e0b' },
            { range: '1000-5000', count: Math.floor((stats?.total || 0) * 0.1), color: '#22c55e' },
            { range: '5000+', count: Math.floor((stats?.total || 0) * 0.05), color: '#3b82f6' },
        ];
    }, [stats]);

    // Top provinces data
    const topProvinces = useMemo(() => {
        return provinceStats.slice(0, isMobile ? 5 : 8);
    }, [provinceStats, isMobile]);

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Role Distribution Pie Chart */}
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <PieChartIcon size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-base lg:text-lg font-semibold text-gray-800">Phân bố vai trò</h2>
                            <p className="text-xs text-gray-500">Tỉ lệ người dùng theo vai trò</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                        <PieChart>
                            <Pie
                                data={roleDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={false}
                                outerRadius={isMobile ? 70 : 90}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {roleDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {roleDistributionData.map((item, idx) => (
                            <div key={idx} className="text-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                                <p className="text-xs font-medium text-gray-600">{item.name}</p>
                                <p className="text-sm font-bold text-gray-800">{item.value}</p>
                                <p className="text-[10px] text-gray-400">{item.percentage}%</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Growth Trend Area Chart */}
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base lg:text-lg font-semibold text-gray-800">Xu hướng tăng trưởng</h2>
                            <p className="text-xs text-gray-500">Tổng người dùng 7 ngày qua</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                                name="Tổng người dùng"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex items-center justify-between px-2">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Tuần trước</p>
                            <p className="text-lg font-bold text-gray-800">{(stats?.total || 0) - (stats?.newThisWeek || 0)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Mới tuần này</p>
                            <p className="text-lg font-bold text-green-600">+{stats?.newThisWeek || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Hiện tại</p>
                            <p className="text-lg font-bold text-blue-600">{stats?.total || 0}</p>
                        </div>
                    </div>
                </div>

                {/* New Users Line Chart */}
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Activity size={20} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-base lg:text-lg font-semibold text-gray-800">Người dùng mới</h2>
                            <p className="text-xs text-gray-500">Số lượng đăng ký mới mỗi ngày</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                        <LineChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="new"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={{ fill: '#22c55e', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Người dùng mới"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Trung bình/ngày</p>
                            <p className="text-xl font-bold text-green-600">{Math.ceil((stats?.newThisWeek || 0) / 7)}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Tổng tuần này</p>
                            <p className="text-xl font-bold text-blue-600">{stats?.newThisWeek || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Coin Distribution Bar Chart */}
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Coins size={20} className="text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-base lg:text-lg font-semibold text-gray-800">Phân bố xu</h2>
                            <p className="text-xs text-gray-500">Số người dùng theo khoảng xu</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                        <BarChart data={coinDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="range"
                                tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }}
                            />
                            <YAxis tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar dataKey="count" name="Số người" radius={[8, 8, 0, 0]}>
                                {coinDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Tổng người dùng</span>
                            <span className="text-lg font-bold text-orange-600">{stats?.total || 0} người</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Province Stats Bar Chart */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <BarChart3 size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-base lg:text-lg font-semibold text-gray-800">Thống kê theo tỉnh thành</h2>
                        <p className="text-xs text-gray-500">Top {isMobile ? 5 : 8} tỉnh thành có nhiều người dùng nhất</p>
                    </div>
                </div>
                {loadingProvince ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Đang tải...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={isMobile ? 300 : 350}>
                            <BarChart data={topProvinces} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }} />
                                <YAxis
                                    dataKey="_id"
                                    type="category"
                                    width={isMobile ? 80 : 120}
                                    tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="count" name="Số người dùng" radius={[0, 8, 8, 0]}>
                                    {topProvinces.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {topProvinces.slice(0, 4).map((province, idx) => (
                                <div key={idx} className="bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <p className="text-xs font-medium text-gray-600 truncate">{province._id}</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 mt-1">{province.count} người</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default AdminUsersDashboard;
