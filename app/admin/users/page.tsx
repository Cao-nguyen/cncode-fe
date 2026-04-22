// app/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { userApi, IUser, IUserFilters, IUserStats, IProvinceStat } from '@/lib/api/user.api';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Users,
    UserCheck,
    UserPlus,
    Shield,
    Trash2,
    Coins,
    CheckCircle,
    XCircle,
    Eye,
    Mail,
    Calendar,
    MapPin,
    School,
    GraduationCap,
    ChevronsLeft,
    ChevronsRight,
    AlertTriangle,
    UserCog,
    X,
    BarChart3
} from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Constants
const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'user', label: 'Người dùng' },
    { value: 'teacher', label: 'Giáo viên' },
    { value: 'admin', label: 'Admin' }
];

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'fullName', label: 'Tên' },
    { value: 'coins', label: 'Số xu' },
    { value: 'streak', label: 'Streak' },
    { value: 'province', label: 'Tỉnh/Thành phố' },
    { value: 'lastActiveAt', label: 'Hoạt động gần đây' }
];

const PAGE_SIZE_OPTIONS: number[] = [10, 20, 50, 100];

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-xs sm:text-sm mb-1">{label}</p>
                <p className="text-xs sm:text-sm text-blue-600">
                    {payload[0]?.value?.toLocaleString() || 0} người dùng
                </p>
            </div>
        );
    }
    return null;
};

export default function AdminUsersPage() {
    const { token } = useAuthStore();
    const [users, setUsers] = useState<IUser[]>([]);
    const [pendingTeachers, setPendingTeachers] = useState<IUser[]>([]);
    const [stats, setStats] = useState<IUserStats | null>(null);
    const [provinceStats, setProvinceStats] = useState<IProvinceStat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingProvince, setLoadingProvince] = useState<boolean>(true);
    const [loadingPending, setLoadingPending] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [showUserModal, setShowUserModal] = useState<boolean>(false);
    const [showCoinModal, setShowCoinModal] = useState<boolean>(false);
    const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
    const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [violationReason, setViolationReason] = useState<string>('');
    const [violationAction, setViolationAction] = useState<'warn' | 'mute' | 'ban'>('warn');
    const [coinAmount, setCoinAmount] = useState<number>(0);
    const [coinReason, setCoinReason] = useState<string>('');
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [filters, setFilters] = useState<IUserFilters>({
        search: '',
        role: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async (): Promise<void> => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await userApi.getAllUsers(token, filters, page, pageSize);
            if (result.success) {
                setUsers(result.data);
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages);
                    setTotalUsers(result.pagination.total);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [token, page, pageSize, filters]);

    // Fetch pending teachers
    const fetchPendingTeachers = useCallback(async (): Promise<void> => {
        if (!token) return;
        setLoadingPending(true);
        try {
            const result = await userApi.getPendingTeachers(token);
            if (result.success) {
                setPendingTeachers(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch pending teachers:', error);
        } finally {
            setLoadingPending(false);
        }
    }, [token]);

    // Fetch stats
    const fetchStats = useCallback(async (): Promise<void> => {
        if (!token) return;
        try {
            const result = await userApi.getUserStats(token);
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, [token]);

    // Fetch province stats
    const fetchProvinceStats = useCallback(async (): Promise<void> => {
        if (!token) return;
        setLoadingProvince(true);
        try {
            const result = await userApi.getUserStatsByProvince(token);
            if (result.success) {
                setProvinceStats(result.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch province stats:', error);
        } finally {
            setLoadingProvince(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
        fetchStats();
        fetchProvinceStats();
        fetchPendingTeachers();
    }, [fetchUsers, fetchStats, fetchProvinceStats, fetchPendingTeachers]);

    // Handle approve teacher
    const handleApproveTeacher = async (userId: string, approved: boolean): Promise<void> => {
        if (!token) return;
        try {
            const result = await userApi.approveTeacherRequest(userId, approved, token);
            if (result.success) {
                toast.success(approved ? 'Đã duyệt giáo viên' : 'Đã từ chối yêu cầu');
                fetchUsers();
                fetchPendingTeachers();
                fetchStats();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    // Handle change role
    const handleChangeRole = async (): Promise<void> => {
        if (!selectedUser || !selectedRole || !token) return;

        try {
            const result = await userApi.changeUserRole(selectedUser._id, selectedRole, token);
            if (result.success) {
                toast.success(result.message || 'Đổi vai trò thành công');
                setShowRoleModal(false);
                fetchUsers();
                fetchStats();
                setSelectedUser(null);
                setSelectedRole('');
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    // Handle mark violation
    const handleMarkViolation = async (): Promise<void> => {
        if (!selectedUser || !violationReason || !token) {
            toast.error('Vui lòng nhập lý do');
            return;
        }

        try {
            const result = await userApi.markViolation(selectedUser._id, violationReason, violationAction, token);
            if (result.success) {
                toast.success(result.message || 'Đã xử lý vi phạm');
                setShowViolationModal(false);
                setViolationReason('');
                setViolationAction('warn');
                fetchUsers();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    // Handle adjust coins
    const handleAdjustCoins = async (): Promise<void> => {
        if (!selectedUser || coinAmount === 0 || !token) return;

        try {
            const result = await userApi.adjustUserCoins(selectedUser._id, coinAmount, coinReason, token);
            if (result.success) {
                toast.success(result.message || 'Điều chỉnh xu thành công');
                setShowCoinModal(false);
                setCoinAmount(0);
                setCoinReason('');
                fetchUsers();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    // Handle delete user
    const handleDeleteUser = async (user: IUser): Promise<void> => {
        if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`)) return;
        if (!token) return;

        try {
            const result = await userApi.deleteUser(user._id, token);
            if (result.success) {
                toast.success('Xóa người dùng thành công');
                fetchUsers();
                fetchStats();
                fetchProvinceStats();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Không xác định';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Không xác định';
            return formatDistanceToNow(date, { addSuffix: true, locale: vi });
        } catch {
            return 'Không xác định';
        }
    };

    const getRoleBadge = (role: string): React.ReactNode => {
        switch (role) {
            case 'admin':
                return <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-lg text-[10px] sm:text-xs font-medium">Admin</span>;
            case 'teacher':
                return <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-lg text-[10px] sm:text-xs font-medium">Giáo viên</span>;
            default:
                return <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-lg text-[10px] sm:text-xs font-medium">Người dùng</span>;
        }
    };

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = isMobile ? 3 : 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= (isMobile ? 2 : 3)) {
                for (let i = 1; i <= maxVisible; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - (isMobile ? 1 : 2)) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - (maxVisible - 1); i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = page - (isMobile ? 0 : 1); i <= page + (isMobile ? 0 : 1); i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const topProvinces: IProvinceStat[] = provinceStats.slice(0, 10);

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Quản lý tất cả người dùng trên hệ thống</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <Filter size={isMobile ? 16 : 18} />
                    <span>Bộ lọc</span>
                </button>
            </div>

            {/* Stats Cards - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-500 mb-1 sm:mb-2">
                        <Users size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Tổng</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.total.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-green-500 mb-1 sm:mb-2">
                        <UserCheck size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Giáo viên</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.teachers.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-red-500 mb-1 sm:mb-2">
                        <Shield size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Admin</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.admins.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-500 mb-1 sm:mb-2">
                        <UserPlus size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Chờ duyệt</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{pendingTeachers.length}</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-purple-500 mb-1 sm:mb-2">
                        <UserPlus size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Mới (tuần)</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.newThisWeek.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-orange-500 mb-1 sm:mb-2">
                        <Users size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Hoạt động</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.activeToday.toLocaleString() || 0}</p>
                </div>
            </div>

            {/* Biểu đồ thống kê theo tỉnh thành - Responsive */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 sm:p-5 shadow-sm border">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <BarChart3 size={isMobile ? 18 : 20} className="text-blue-500" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Thống kê người dùng theo tỉnh thành
                    </h2>
                </div>

                {loadingProvince ? (
                    <div className="flex justify-center items-center h-48 sm:h-64">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
                    </div>
                ) : provinceStats.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
                        Chưa có dữ liệu thống kê theo tỉnh thành
                    </div>
                ) : (
                    <>
                        <div className={`${isMobile ? 'overflow-x-auto' : ''}`}>
                            <div className={isMobile ? 'min-w-[500px]' : 'w-full'}>
                                <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                    <BarChart data={topProvinces} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="_id"
                                            angle={isMobile ? -45 : -45}
                                            textAnchor="end"
                                            height={isMobile ? 70 : 80}
                                            interval={0}
                                            tick={{ fontSize: isMobile ? 10 : 12 }}
                                        />
                                        <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                                        <Tooltip content={<CustomBarTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                                        <Bar
                                            dataKey="count"
                                            fill="#3b82f6"
                                            name="Số lượng người dùng"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-6 overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="text-left p-2 sm:p-3 font-semibold">STT</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold">Tỉnh/Thành phố</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold">Số lượng người dùng</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold">Tỉ lệ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {provinceStats.map((province, idx) => {
                                        const percentage = ((province.count / totalUsers) * 100).toFixed(1);
                                        return (
                                            <tr key={province._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                                <td className="p-2 sm:p-3">{idx + 1}</td>
                                                <td className="p-2 sm:p-3 font-medium">{province._id}</td>
                                                <td className="p-2 sm:p-3">{province.count.toLocaleString()} người</td>
                                                <td className="p-2 sm:p-3">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] sm:text-xs text-gray-500 w-10 sm:w-12">{percentage}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b overflow-x-auto">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition ${activeTab === 'all'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Tất cả người dùng
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition flex items-center gap-1 sm:gap-2 ${activeTab === 'pending'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Chờ duyệt giáo viên
                    {pendingTeachers.length > 0 && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] sm:text-xs">
                            {pendingTeachers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters Panel - Responsive */}
            {showFilters && (
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 sm:p-5 shadow-sm border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={isMobile ? 16 : 18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black"
                            />
                        </div>
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black"
                        >
                            {ROLE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.sortOrder}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black"
                        >
                            <option value="desc">Mới nhất</option>
                            <option value="asc">Cũ nhất</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Users Table - Responsive */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] sm:min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b">
                            <tr>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Người dùng</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Vai trò</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Tỉnh/TP</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Xu</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Streak</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Tham gia</th>
                                <th className="text-center px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(activeTab === 'all' ? users : pendingTeachers).map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                                {user.avatar ? (
                                                    <Image src={user.avatar} alt={user.fullName} width={40} height={40} className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-base sm:text-lg font-semibold">
                                                        {user.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{user.fullName}</p>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">{user.email}</p>
                                                {user.username && <p className="text-[10px] sm:text-xs text-gray-400">@{user.username}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="space-y-1">
                                            {getRoleBadge(user.role)}
                                            {activeTab === 'pending' && user.requestedRole === 'teacher' && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <button
                                                        onClick={() => handleApproveTeacher(user._id, true)}
                                                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-[10px] sm:text-xs hover:bg-green-200"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveTeacher(user._id, false)}
                                                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-700 rounded text-[10px] sm:text-xs hover:bg-red-200"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            <MapPin size={isMobile ? 12 : 14} className="text-gray-400" />
                                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                {user.province || <span className="text-gray-400">Chưa cập nhật</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-blue-600 text-sm sm:text-base">{user.coins.toLocaleString()}</span>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowCoinModal(true);
                                                }}
                                                className="p-0.5 sm:p-1 text-gray-400 hover:text-blue-600 rounded"
                                                title="Điều chỉnh xu"
                                            >
                                                <Coins size={isMobile ? 12 : 14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <span className="text-orange-600 dark:text-orange-400 font-medium text-sm sm:text-base">{user.streak} ngày</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowUserModal(true);
                                                }}
                                                className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={isMobile ? 14 : 18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowRoleModal(true);
                                                    setSelectedRole(user.role);
                                                }}
                                                className="p-1 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                                title="Đổi vai trò"
                                            >
                                                <UserCog size={isMobile ? 14 : 18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowViolationModal(true);
                                                }}
                                                className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Đánh dấu vi phạm"
                                            >
                                                <AlertTriangle size={isMobile ? 14 : 18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Xóa"
                                            >
                                                <Trash2 size={isMobile ? 14 : 18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Responsive */}
                {activeTab === 'all' && totalPages > 1 && (
                    <div className="border-t px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm text-gray-600">Hiển thị</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm border rounded-lg bg-white dark:bg-black"
                                >
                                    {PAGE_SIZE_OPTIONS.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                <span className="text-xs sm:text-sm text-gray-600">người dùng</span>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    className="p-1 sm:p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    <ChevronsLeft size={isMobile ? 14 : 18} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1 sm:p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    <ChevronLeft size={isMobile ? 14 : 18} />
                                </button>

                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    {getPageNumbers().map((pageNum, idx) => (
                                        pageNum === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-1 sm:px-2 py-0.5 sm:py-1 text-gray-500 text-xs sm:text-sm">...</span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum as number)}
                                                className={`min-w-[28px] sm:min-w-[36px] h-7 sm:h-9 px-1 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition ${page === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1 sm:p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    <ChevronRight size={isMobile ? 14 : 18} />
                                </button>
                                <button
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                    className="p-1 sm:p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    <ChevronsRight size={isMobile ? 14 : 18} />
                                </button>
                            </div>

                            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                                Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalUsers)} trên tổng {totalUsers.toLocaleString()} người dùng
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals - Giữ nguyên nhưng thêm responsive padding */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowUserModal(false)}>
                    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl w-full max-w-[90%] sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[#1c1c1c] p-3 sm:p-5 border-b flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-semibold">Chi tiết người dùng</h2>
                            <button onClick={() => setShowUserModal(false)} className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg">
                                <X size={isMobile ? 18 : 20} />
                            </button>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 overflow-hidden">
                                    {selectedUser.avatar ? (
                                        <Image src={selectedUser.avatar} alt={selectedUser.fullName} width={80} height={80} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold">
                                            {selectedUser.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-xl font-bold">{selectedUser.fullName}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 break-words">{selectedUser.email}</p>
                                    {selectedUser.username && <p className="text-xs text-gray-400">@{selectedUser.username}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Shield size={isMobile ? 14 : 16} /> Vai trò: {getRoleBadge(selectedUser.role)}
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Coins size={isMobile ? 14 : 16} /> Số xu: <span className="font-semibold text-blue-600">{selectedUser.coins.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Calendar size={isMobile ? 14 : 16} /> Streak: <span className="font-semibold text-orange-600">{selectedUser.streak} ngày</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Mail size={isMobile ? 14 : 16} /> Email: {selectedUser.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <MapPin size={isMobile ? 14 : 16} /> Tỉnh/TP: {selectedUser.province || 'Chưa cập nhật'}
                                </div>
                                {selectedUser.class && (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                        <GraduationCap size={isMobile ? 14 : 16} /> Lớp: {selectedUser.class}
                                    </div>
                                )}
                                {selectedUser.school && (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                        <School size={isMobile ? 14 : 16} /> Trường: {selectedUser.school}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Role Modal - Responsive */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowRoleModal(false)}>
                    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl w-full max-w-[90%] sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 sm:p-5 border-b">
                            <h2 className="text-lg sm:text-xl font-semibold">Đổi vai trò</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Người dùng: {selectedUser.fullName}</p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Vai trò mới</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg dark:bg-black"
                                >
                                    <option value="user">Người dùng</option>
                                    <option value="teacher">Giáo viên</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleChangeRole}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark Violation Modal - Responsive */}
            {showViolationModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowViolationModal(false)}>
                    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl w-full max-w-[90%] sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 sm:p-5 border-b">
                            <h2 className="text-lg sm:text-xl font-semibold">Đánh dấu vi phạm</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Người dùng: {selectedUser.fullName}</p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Hành động</label>
                                <select
                                    value={violationAction}
                                    onChange={(e) => setViolationAction(e.target.value as 'warn' | 'mute' | 'ban')}
                                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg dark:bg-black"
                                >
                                    <option value="warn">⚠️ Cảnh cáo</option>
                                    <option value="mute">🔇 Cấm chat (7 ngày)</option>
                                    <option value="ban">🔴 Khóa tài khoản</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Lý do</label>
                                <textarea
                                    value={violationReason}
                                    onChange={(e) => setViolationReason(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg dark:bg-black"
                                    rows={3}
                                    placeholder="Nhập lý do xử lý vi phạm..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowViolationModal(false)}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleMarkViolation}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Adjust Coins Modal - Responsive */}
            {showCoinModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCoinModal(false)}>
                    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl w-full max-w-[90%] sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 sm:p-5 border-b">
                            <h2 className="text-lg sm:text-xl font-semibold">Điều chỉnh số xu</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Người dùng: {selectedUser.fullName}</p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Số xu (có thể âm)</label>
                                <input
                                    type="number"
                                    value={coinAmount}
                                    onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg dark:bg-black"
                                    placeholder="Nhập số xu..."
                                />
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Nhập số dương để cộng, số âm để trừ</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Lý do</label>
                                <textarea
                                    value={coinReason}
                                    onChange={(e) => setCoinReason(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg dark:bg-black"
                                    rows={3}
                                    placeholder="Nhập lý do điều chỉnh..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCoinModal(false)}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAdjustCoins}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}