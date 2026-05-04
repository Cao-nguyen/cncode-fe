// app/admin/users/page.tsx
'use client';

import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { userApi, IUser, IUserFilters, IUserStats, IProvinceStat } from '@/lib/api/user.api';
import {
    Search,
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
    BarChart3,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
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
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomInput } from '@/components/custom/CustomInput';

const ROLE_OPTIONS = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'user', label: 'Người dùng' },
    { value: 'teacher', label: 'Giáo viên' },
    { value: 'admin', label: 'Admin' }
];

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'fullName', label: 'Tên' },
    { value: 'coins', label: 'Số xu' },
    { value: 'streak', label: 'Streak' },
    { value: 'province', label: 'Tỉnh/Thành phố' },
    { value: 'lastActiveAt', label: 'Hoạt động gần đây' }
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-xs sm:text-sm mb-1">{label}</p>
                <p className="text-xs sm:text-sm text-main">{payload[0]?.value?.toLocaleString() || 0} người dùng</p>
            </div>
        );
    }
    return null;
};

export default function AdminUsersPage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();

    const [users, setUsers] = useState<IUser[]>([]);
    const [pendingTeachers, setPendingTeachers] = useState<IUser[]>([]);
    const [stats, setStats] = useState<IUserStats | null>(null);
    const [provinceStats, setProvinceStats] = useState<IProvinceStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProvince, setLoadingProvince] = useState(true);
    const [loadingPending, setLoadingPending] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    const [filters, setFilters] = useState<IUserFilters>({
        search: '', role: '', status: '', sortBy: 'createdAt', sortOrder: 'desc'
    });

    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCoinModal, setShowCoinModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);

    const [selectedRole, setSelectedRole] = useState('');
    const [violationReason, setViolationReason] = useState('');
    const [violationAction, setViolationAction] = useState<'warn' | 'mute' | 'ban'>('warn');
    const [coinAmount, setCoinAmount] = useState(0);
    const [coinReason, setCoinReason] = useState('');
    const [actionLoading, setActionLoading] = useState<{ type: string; userId: string } | null>(null);

    const initialFetchDone = useRef(false);

    useEffect(() => {
        const checkScreen = () => {
            const width = window.innerWidth;
            setIsMobile(width < 640);
            setIsTablet(width >= 640 && width < 1024);
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const fetchUsers = useCallback(async (showLoading = true) => {
        if (!token) return;
        if (showLoading) setLoading(true);
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
            if (showLoading) setLoading(false);
        }
    }, [token, page, pageSize, filters]);

    const fetchPendingTeachers = useCallback(async () => {
        if (!token) return;
        setLoadingPending(true);
        try {
            const result = await userApi.getPendingTeachers(token);
            if (result.success) setPendingTeachers(result.data);
        } catch (error) {
            console.error('Failed to fetch pending teachers:', error);
        } finally {
            setLoadingPending(false);
        }
    }, [token]);

    const fetchStats = useCallback(async () => {
        if (!token) return;
        try {
            const result = await userApi.getUserStats(token);
            if (result.success) setStats(result.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, [token]);

    const fetchProvinceStats = useCallback(async () => {
        if (!token) return;
        setLoadingProvince(true);
        try {
            const result = await userApi.getUserStatsByProvince(token);
            if (result.success) setProvinceStats(result.data.stats);
        } catch (error) {
            console.error('Failed to fetch province stats:', error);
        } finally {
            setLoadingProvince(false);
        }
    }, [token]);

    useEffect(() => {
        if (token && !initialFetchDone.current) {
            initialFetchDone.current = true;
            Promise.all([fetchUsers(), fetchStats(), fetchProvinceStats(), fetchPendingTeachers()]);
        }
    }, [token]);

    useEffect(() => {
        if (initialFetchDone.current) {
            setPage(1);
            fetchUsers();
        }
    }, [filters, pageSize]);

    useEffect(() => {
        if (initialFetchDone.current && page > 0) fetchUsers();
    }, [page]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewUserRegistered = () => {
            fetchStats();
            fetchProvinceStats();
            if (activeTab === 'all' && page === 1) fetchUsers(false);
        };

        const handleRoleRequestNotification = () => {
            fetchPendingTeachers();
            fetchStats();
        };

        const handleCoinsUpdated = (data: { userId: string; coins: number }) => {
            setUsers(prev => prev.map(user => user._id === data.userId ? { ...user, coins: data.coins } : user));
            setPendingTeachers(prev => prev.map(user => user._id === data.userId ? { ...user, coins: data.coins } : user));
            fetchStats();
        };

        const handleRoleChanged = (data: { userId: string; newRole: string; oldRole: string; userName: string }) => {
            setUsers(prev => prev.map(user => user._id === data.userId ? { ...user, role: data.newRole as 'user' | 'teacher' | 'admin' } : user));
            if (data.newRole === 'teacher') {
                setPendingTeachers(prev => prev.filter(user => user._id !== data.userId));
            }
            fetchStats();
            fetchPendingTeachers();
        };

        const handleUserDeleted = (data: { userId: string; userName: string }) => {
            setUsers(prev => prev.filter(user => user._id !== data.userId));
            setPendingTeachers(prev => prev.filter(user => user._id !== data.userId));
            fetchStats();
            fetchProvinceStats();
            setTotalUsers(prev => prev - 1);
        };

        const handleStreakUpdated = (data: { userId: string; streak: number; totalCoins: number }) => {
            setUsers(prev => prev.map(user => user._id === data.userId ? { ...user, streak: data.streak, coins: data.totalCoins } : user));
            setPendingTeachers(prev => prev.map(user => user._id === data.userId ? { ...user, streak: data.streak, coins: data.totalCoins } : user));
            fetchStats();
        };

        socket.on('new_user_registered', handleNewUserRegistered);
        socket.on('role_request_notification', handleRoleRequestNotification);
        socket.on('coins_updated', handleCoinsUpdated);
        socket.on('role_changed', handleRoleChanged);
        socket.on('user_deleted', handleUserDeleted);
        socket.on('streak_updated', handleStreakUpdated);

        return () => {
            socket.off('new_user_registered', handleNewUserRegistered);
            socket.off('role_request_notification', handleRoleRequestNotification);
            socket.off('coins_updated', handleCoinsUpdated);
            socket.off('role_changed', handleRoleChanged);
            socket.off('user_deleted', handleUserDeleted);
            socket.off('streak_updated', handleStreakUpdated);
        };
    }, [socket, isConnected, activeTab, page, fetchStats, fetchProvinceStats, fetchUsers, fetchPendingTeachers]);

    const handleApproveTeacher = async (userId: string, approved: boolean) => {
        if (!token) return;
        setActionLoading({ type: 'approve', userId });
        try {
            const result = await userApi.approveTeacherRequest(userId, approved, token);
            if (result.success) {
                setPendingTeachers(prev => prev.filter(u => u._id !== userId));
                if (approved) {
                    setUsers(prev => {
                        const existingUserIndex = prev.findIndex(u => u._id === userId);
                        if (existingUserIndex !== -1) {
                            const updatedUsers = [...prev];
                            updatedUsers[existingUserIndex] = {
                                ...updatedUsers[existingUserIndex],
                                role: 'teacher',
                                requestedRole: null
                            };
                            return updatedUsers;
                        }
                        return prev;
                    });
                }
                fetchStats();
                if (activeTab === 'all' && page === 1) fetchUsers(false);
            }
        } catch (error) {
            console.error('Approve teacher error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleChangeRole = async () => {
        if (!selectedUser || !selectedRole || !token) return;
        setActionLoading({ type: 'role', userId: selectedUser._id });
        try {
            const result = await userApi.changeUserRole(selectedUser._id, selectedRole, token);
            if (result.success) {
                setUsers(prev => prev.map(user =>
                    user._id === selectedUser._id
                        ? { ...user, role: selectedRole as 'user' | 'teacher' | 'admin' }
                        : user
                ));
                if (selectedRole === 'teacher') {
                    setPendingTeachers(prev => prev.filter(user => user._id !== selectedUser._id));
                }
                setShowRoleModal(false);
                setSelectedUser(null);
                setSelectedRole('');
            }
        } catch (error) {
            console.error('Change role error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkViolation = async () => {
        if (!selectedUser || !violationReason || !token) return;
        setActionLoading({ type: 'violation', userId: selectedUser._id });
        try {
            const result = await userApi.markViolation(selectedUser._id, violationReason, violationAction, token);
            if (result.success) {
                setShowViolationModal(false);
                setViolationReason('');
                setViolationAction('warn');
            }
        } catch (error) {
            console.error('Mark violation error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAdjustCoins = async () => {
        if (!selectedUser || coinAmount === 0 || !token) return;
        setActionLoading({ type: 'coins', userId: selectedUser._id });
        try {
            const result = await userApi.adjustUserCoins(selectedUser._id, coinAmount, coinReason, token);
            if (result.success) {
                setUsers(prev => prev.map(user =>
                    user._id === selectedUser._id
                        ? { ...user, coins: user.coins + coinAmount }
                        : user
                ));
                setShowCoinModal(false);
                setCoinAmount(0);
                setCoinReason('');
            }
        } catch (error) {
            console.error('Adjust coins error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (user: IUser) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"? Hành động này không thể hoàn tác.`)) return;
        if (!token) return;
        setActionLoading({ type: 'delete', userId: user._id });
        try {
            await userApi.deleteUser(user._id, token);
        } catch (error) {
            console.error('Delete user error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap">Admin</span>;
            case 'teacher':
                return <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap">Giáo viên</span>;
            default:
                return <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-main text-white rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap">Người dùng</span>;
        }
    };

    const getPageNumbers = () => {
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

    const topProvinces = provinceStats.slice(0, 10);

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-main" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">Quản lý tất cả người dùng - Dữ liệu realtime</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="rounded-xl p-3 sm:p-4 shadow-sm border border-main/20 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-main mb-1 sm:mb-2">
                        <Users size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Tổng</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.total.toLocaleString() || 0}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 shadow-sm border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-green-500 mb-1 sm:mb-2">
                        <UserCheck size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Giáo viên</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.teachers.toLocaleString() || 0}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 shadow-sm border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-red-500 mb-1 sm:mb-2">
                        <Shield size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Admin</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.admins.toLocaleString() || 0}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 shadow-sm border border-yellow-200 dark:border-yellow-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-500 mb-1 sm:mb-2">
                        <UserPlus size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Chờ duyệt</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{pendingTeachers.length}{pendingTeachers.length > 0 && <span className="ml-1 text-xs text-yellow-600 animate-pulse">✨</span>}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 shadow-sm border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-purple-500 mb-1 sm:mb-2">
                        <UserPlus size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Mới (tuần)</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.newThisWeek.toLocaleString() || 0}</p>
                </div>
                <div className="rounded-xl p-3 sm:p-4 shadow-sm border border-main/20 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-main mb-1 sm:mb-2">
                        <Users size={isMobile ? 14 : 18} />
                        <span className="text-xs sm:text-sm">Hoạt động</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold">{stats?.activeToday.toLocaleString() || 0}</p>
                </div>
            </div>

            {/* Biểu đồ thống kê */}
            <div className="rounded-xl p-4 sm:p-5 shadow-sm border border-main/20 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <BarChart3 size={isMobile ? 18 : 20} className="text-main" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Thống kê người dùng theo tỉnh thành</h2>
                </div>
                {loadingProvince ? (
                    <div className="flex justify-center items-center h-48 sm:h-64">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-main" />
                    </div>
                ) : provinceStats.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">Chưa có dữ liệu thống kê theo tỉnh thành</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <div className="min-w-[500px]">
                                <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                    <BarChart data={topProvinces} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: isMobile ? 10 : 12 }} />
                                        <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                                        <Tooltip content={<CustomBarTooltip />} />
                                        <Legend />
                                        <Bar dataKey="count" fill="var(--color-main)" name="Số lượng người dùng" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-6 overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm">
                                <thead className="bg-main/5">
                                    <tr>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-main">#</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-main">Tỉnh/TP</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-main">Số lượng</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-main">Tỉ lệ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {provinceStats.map((province, idx) => {
                                        const percentage = totalUsers > 0 ? ((province.count / totalUsers) * 100).toFixed(1) : '0';
                                        return (
                                            <tr key={province._id} className="hover:bg-main/5 transition">
                                                <td className="p-2 sm:p-3">{idx + 1}</td>
                                                <td className="p-2 sm:p-3 font-medium">{province._id}</td>
                                                <td className="p-2 sm:p-3">{province.count.toLocaleString()} người</td>
                                                <td className="p-2 sm:p-3">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-main rounded-full" style={{ width: `${percentage}%` }} />
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
                <button onClick={() => setActiveTab('all')} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition ${activeTab === 'all' ? 'border-b-2 border-main text-main' : 'text-gray-500 hover:text-gray-700'}`}>
                    Tất cả người dùng <span className="ml-1 text-xs text-gray-400">({totalUsers})</span>
                </button>
                <button onClick={() => setActiveTab('pending')} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition flex items-center gap-1 ${activeTab === 'pending' ? 'border-b-2 border-main text-main' : 'text-gray-500 hover:text-gray-700'}`}>
                    Giáo viên chờ duyệt
                    {pendingTeachers.length > 0 && <span className="px-1.5 py-0.5 bg-main text-white rounded-full text-[10px] animate-pulse">{pendingTeachers.length}</span>}
                </button>
            </div>

            {/* Filters Panel - Luôn hiển thị */}
            <div className="rounded-xl p-4 sm:p-5 shadow-sm border border-main/20 bg-white dark:bg-gray-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <CustomInput
                            value={filters.search}
                            onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                            placeholder="Tìm kiếm..."
                        />
                    </div>
                    <CustomSelect
                        value={filters.role}
                        onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                        options={ROLE_OPTIONS}
                        placeholder="Chọn vai trò"
                    />
                    <CustomSelect
                        value={filters.sortBy}
                        onChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                        options={SORT_OPTIONS}
                        placeholder="Sắp xếp theo"
                    />
                    <CustomSelect
                        value={filters.sortOrder}
                        onChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as 'asc' | 'desc' }))}
                        options={[
                            { value: 'desc', label: 'Mới nhất' },
                            { value: 'asc', label: 'Cũ nhất' }
                        ]}
                        placeholder="Thứ tự"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-xl shadow-sm border border-main/20 overflow-hidden bg-white dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] lg:min-w-full">
                        <thead className="bg-main/5 border-b border-main/20">
                            <tr>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-main whitespace-nowrap">Người dùng</th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-main whitespace-nowrap">Vai trò</th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-main whitespace-nowrap">Tỉnh/TP</th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-main whitespace-nowrap">Xu</th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-main whitespace-nowrap">Streak</th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-main whitespace-nowrap">Tham gia</th>
                                <th className="text-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-main whitespace-nowrap">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-main/10">
                            {(activeTab === 'all' ? users : pendingTeachers).map((user) => (
                                <tr key={user._id} className="hover:bg-main/5 transition">
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-main/10 overflow-hidden flex-shrink-0">
                                                {user.avatar ? <Image src={user.avatar} alt={user.fullName} width={40} height={40} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-base sm:text-lg font-semibold text-main">{user.fullName.charAt(0).toUpperCase()}</div>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[200px]">{user.fullName}</p>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[110px] sm:max-w-[160px] lg:max-w-[180px]">{user.email}</p>
                                                {user.username && <p className="text-[10px] sm:text-xs text-main/60 truncate max-w-[110px] sm:max-w-[160px] lg:max-w-[180px]">@{user.username}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="inline-block w-fit">
                                                {getRoleBadge(user.role)}
                                            </div>
                                            {activeTab === 'pending' && user.requestedRole === 'teacher' && (
                                                <div className="flex flex-row items-center gap-1">
                                                    <button
                                                        onClick={() => handleApproveTeacher(user._id, true)}
                                                        disabled={actionLoading?.userId === user._id}
                                                        className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md text-[10px] sm:text-xs hover:bg-green-200 disabled:opacity-50 transition whitespace-nowrap"
                                                    >
                                                        {actionLoading?.userId === user._id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <CheckCircle size={10} />}
                                                        <span>Duyệt</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveTeacher(user._id, false)}
                                                        disabled={actionLoading?.userId === user._id}
                                                        className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] sm:text-xs hover:bg-red-200 disabled:opacity-50 transition whitespace-nowrap"
                                                    >
                                                        <XCircle size={10} />
                                                        <span>Từ chối</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} className="text-main/50 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate max-w-[80px] sm:max-w-[110px] lg:max-w-[130px]">{user.province || '---'}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center gap-1 sm:gap-1.5">
                                            <span className="font-semibold text-main text-sm sm:text-base whitespace-nowrap">{user.coins.toLocaleString()}</span>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowCoinModal(true); }}
                                                className="p-0.5 sm:p-1 text-gray-400 hover:text-main rounded transition flex-shrink-0"
                                                title="Điều chỉnh xu"
                                            >
                                                <Coins size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <span className="text-main text-sm sm:text-base font-medium whitespace-nowrap">{user.streak}</span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{format(new Date(user.createdAt), 'dd/MM/yyyy')}</span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                                                className="p-1 sm:p-1.5 text-main hover:bg-main/10 rounded-lg transition"
                                                title="Chi tiết"
                                            >
                                                <Eye size={isTablet ? 12 : 14} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowRoleModal(true); setSelectedRole(user.role); }}
                                                className="p-1 sm:p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                                                title="Đổi vai trò"
                                            >
                                                <UserCog size={isTablet ? 12 : 14} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowViolationModal(true); }}
                                                className="p-1 sm:p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                title="Vi phạm"
                                            >
                                                <AlertTriangle size={isTablet ? 12 : 14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={actionLoading?.userId === user._id}
                                                className="p-1 sm:p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                                                title="Xóa"
                                            >
                                                {actionLoading?.userId === user._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 size={isTablet ? 12 : 14} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'all' && users.length === 0 && !loading && (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Không có người dùng nào</td></tr>
                            )}
                            {activeTab === 'pending' && pendingTeachers.length === 0 && !loadingPending && (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Không có giáo viên nào chờ duyệt</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {activeTab === 'all' && totalPages > 1 && (
                    <div className="border-t border-main/20 px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm text-gray-600">Hiển thị</span>
                                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm border border-main/30 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-main">
                                    {PAGE_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                                <span className="text-xs sm:text-sm text-gray-600">người dùng</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 sm:p-2 border border-main/20 rounded-lg disabled:opacity-50 hover:bg-main/5"><ChevronsLeft size={isMobile ? 14 : 18} /></button>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 sm:p-2 border border-main/20 rounded-lg disabled:opacity-50 hover:bg-main/5"><ChevronLeft size={isMobile ? 14 : 18} /></button>
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    {getPageNumbers().map((pageNum, idx) => pageNum === '...' ? <span key={idx} className="px-1 sm:px-2 py-0.5 sm:py-1 text-gray-500 text-xs sm:text-sm">...</span> : <button key={pageNum} onClick={() => setPage(pageNum as number)} className={`min-w-[28px] sm:min-w-[36px] h-7 sm:h-9 px-1 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition ${page === pageNum ? 'bg-main text-white' : 'hover:bg-main/10 text-gray-700 border border-main/20'}`}>{pageNum}</button>)}
                                </div>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 sm:p-2 border border-main/20 rounded-lg disabled:opacity-50 hover:bg-main/5"><ChevronRight size={isMobile ? 14 : 18} /></button>
                                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1 sm:p-2 border border-main/20 rounded-lg disabled:opacity-50 hover:bg-main/5"><ChevronsRight size={isMobile ? 14 : 18} /></button>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalUsers)} trên tổng {totalUsers.toLocaleString()} người dùng</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowUserModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-[90%] sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-main/20" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-gray-900 p-3 sm:p-5 border-b border-main/20 flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-semibold text-main">Chi tiết người dùng</h2>
                            <button onClick={() => setShowUserModal(false)} className="p-1 sm:p-2 hover:bg-main/10 rounded-lg transition"><X size={isMobile ? 18 : 20} className="text-main" /></button>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-main/10 overflow-hidden">
                                    {selectedUser.avatar ? <Image src={selectedUser.avatar} alt={selectedUser.fullName} width={80} height={80} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-main">{selectedUser.fullName.charAt(0).toUpperCase()}</div>}
                                </div>
                                <div><h3 className="text-base sm:text-xl font-bold">{selectedUser.fullName}</h3><p className="text-xs sm:text-sm text-gray-500 break-words">{selectedUser.email}</p>{selectedUser.username && <p className="text-xs text-main">@{selectedUser.username}</p>}</div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div className="flex items-center gap-2"><Shield size={isMobile ? 14 : 16} className="text-main/60" /> Vai trò: {getRoleBadge(selectedUser.role)}</div>
                                <div className="flex items-center gap-2"><Coins size={isMobile ? 14 : 16} className="text-main/60" /> Xu: {selectedUser.coins.toLocaleString()}</div>
                                <div className="flex items-center gap-2"><Calendar size={isMobile ? 14 : 16} className="text-main/60" /> Streak: {selectedUser.streak} ngày</div>
                                <div className="flex items-center gap-2"><Mail size={isMobile ? 14 : 16} className="text-main/60" /> {selectedUser.email}</div>
                                <div className="flex items-center gap-2"><MapPin size={isMobile ? 14 : 16} className="text-main/60" /> {selectedUser.province || 'Chưa cập nhật'}</div>
                                {selectedUser.class && <div className="flex items-center gap-2"><GraduationCap size={isMobile ? 14 : 16} className="text-main/60" /> Lớp: {selectedUser.class}</div>}
                                {selectedUser.school && <div className="flex items-center gap-2"><School size={isMobile ? 14 : 16} className="text-main/60" /> {selectedUser.school}</div>}
                                {selectedUser.bio && <div className="sm:col-span-2 flex items-start gap-2"><div className="text-main/60 mt-0.5">📝</div><div className="text-gray-600 dark:text-gray-400">{selectedUser.bio}</div></div>}
                                <div className="sm:col-span-2 flex items-center gap-2 text-gray-500"><Calendar size={isMobile ? 14 : 16} /> Ngày tạo: {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowRoleModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-[90%] sm:max-w-md border border-main/20" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 sm:p-5 border-b border-main/20">
                            <h2 className="text-lg sm:text-xl font-semibold text-main">Đổi vai trò</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Người dùng: {selectedUser.fullName}</p>
                            <p className="text-xs text-main mt-1">Vai trò hiện tại: {getRoleBadge(selectedUser.role)}</p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Vai trò mới</label>
                                <CustomSelect
                                    value={selectedRole}
                                    onChange={(value) => setSelectedRole(value)}
                                    options={[
                                        { value: 'user', label: 'Người dùng' },
                                        { value: 'teacher', label: 'Giáo viên' },
                                        { value: 'admin', label: 'Admin' }
                                    ]}
                                    placeholder="Chọn vai trò"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowRoleModal(false)} className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-main/30 text-main rounded-lg hover:bg-main/5 text-sm transition">Hủy</button>
                                <button onClick={handleChangeRole} disabled={actionLoading?.type === 'role'} className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-main text-white rounded-lg hover:bg-main/80 text-sm transition disabled:opacity-50">
                                    {actionLoading?.type === 'role' ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showViolationModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowViolationModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-[90%] sm:max-w-md border border-main/20" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 sm:p-5 border-b border-main/20">
                            <h2 className="text-lg sm:text-xl font-semibold text-main">Đánh dấu vi phạm</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Người dùng: {selectedUser.fullName}</p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Hành động</label>
                                <CustomSelect
                                    value={violationAction}
                                    onChange={(value) => setViolationAction(value as 'warn' | 'mute' | 'ban')}
                                    options={[
                                        { value: 'warn', label: '⚠️ Cảnh cáo' },
                                        { value: 'mute', label: '🔇 Cấm chat (7 ngày)' },
                                        { value: 'ban', label: '🔴 Khóa tài khoản' }
                                    ]}
                                    placeholder="Chọn hành động"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Lý do</label>
                                <CustomTextarea
                                    value={violationReason}
                                    onChange={(value) => setViolationReason(value)}
                                    placeholder="Nhập lý do xử lý vi phạm..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowViolationModal(false)} className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-main/30 text-main rounded-lg hover:bg-main/5 text-sm transition">Hủy</button>
                                <button onClick={handleMarkViolation} disabled={actionLoading?.type === 'violation'} className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition disabled:opacity-50">
                                    {actionLoading?.type === 'violation' ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Điều chỉnh xu */}
            {showCoinModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCoinModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-[90%] sm:max-w-md border border-main/20" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 sm:p-5 border-b border-main/20">
                            <h2 className="text-lg sm:text-xl font-semibold text-main">Điều chỉnh số xu</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Người dùng: {selectedUser.fullName}</p>
                            <p className="text-xs text-main mt-1">Xu hiện tại: <span className="font-semibold">{selectedUser.coins.toLocaleString()}</span></p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Số xu (có thể âm)</label>
                                <CustomInput
                                    type="number"
                                    value={coinAmount.toString()}
                                    onChange={(value) => setCoinAmount(parseInt(value) || 0)}
                                    placeholder="Nhập số xu..."
                                />
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Nhập số dương để cộng, số âm để trừ</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Lý do</label>
                                <CustomTextarea
                                    value={coinReason}
                                    onChange={(value) => setCoinReason(value)}
                                    placeholder="Nhập lý do điều chỉnh..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCoinModal(false)} className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-main/30 text-main rounded-lg hover:bg-main/5 text-sm transition">Hủy</button>
                                <button onClick={handleAdjustCoins} disabled={actionLoading?.type === 'coins'} className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-main text-white rounded-lg hover:bg-main/80 text-sm transition disabled:opacity-50">
                                    {actionLoading?.type === 'coins' ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}