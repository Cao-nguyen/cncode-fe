// app/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { userApi, IUser, IUserFilters, IUserStats, IProvinceStat } from '@/lib/api/user.api';
import {
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
    Search,
    Settings,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'user', label: 'Người dùng' },
    { value: 'teacher', label: 'Giáo viên' },
    { value: 'admin', label: 'Admin' }
];

const STATUS_SELECT_OPTIONS = [
    { value: 'warn', label: '⚠️ Cảnh cáo' },
    { value: 'mute', label: '🔇 Cấm chat (7 ngày)' },
    { value: 'ban', label: '🔴 Khóa tài khoản' }
];

const getRoleBadge = (role: string) => {
    switch (role) {
        case 'admin':
            return <span className="inline-flex px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium whitespace-nowrap">Admin</span>;
        case 'teacher':
            return <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">Giáo viên</span>;
        default:
            return <span className="inline-flex px-2 py-0.5 bg-[var(--cn-primary)] text-white rounded-full text-xs font-medium whitespace-nowrap">Người dùng</span>;
    }
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

    // Responsive
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

    // Socket
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
                        const idx = prev.findIndex(u => u._id === userId);
                        if (idx !== -1) {
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], role: 'teacher', requestedRole: null };
                            return updated;
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
                setUsers(prev => prev.map(user => user._id === selectedUser._id ? { ...user, role: selectedRole as 'user' | 'teacher' | 'admin' } : user));
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
                setUsers(prev => prev.map(user => user._id === selectedUser._id ? { ...user, coins: user.coins + coinAmount } : user));
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
        if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`)) return;
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

    const getUserInitial = (user: IUser) => user.fullName?.charAt(0).toUpperCase() || '?';
    const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy', { locale: vi });

    const cardConfigs = [
        { key: 'total', title: 'Tổng người dùng', value: stats?.total || 0, iconBgColor: '#EFF6FF', iconColor: '#3B82F6', icon: <Users size={18} /> },
        { key: 'teachers', title: 'Giáo viên', value: stats?.teachers || 0, iconBgColor: '#F0FDF4', iconColor: '#22C55E', icon: <UserCheck size={18} /> },
        { key: 'admins', title: 'Admin', value: stats?.admins || 0, iconBgColor: '#FFF7ED', iconColor: '#F97316', icon: <Shield size={18} /> },
        { key: 'pending', title: 'Chờ duyệt', value: pendingTeachers.length, iconBgColor: '#F5F3FF', iconColor: '#8B5CF6', icon: <UserPlus size={18} /> },
        { key: 'newWeek', title: 'Mới (tuần)', value: stats?.newThisWeek || 0, iconBgColor: '#FDF2F8', iconColor: '#EC4899', icon: <UserPlus size={18} /> },
        { key: 'activeToday', title: 'Hoạt động hôm nay', value: stats?.activeToday || 0, iconBgColor: '#F0FDFA', iconColor: '#14B8A6', icon: <Users size={18} /> },
    ];

    if (loading && users.length === 0) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" /></div>;
    }

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">Quản lý người dùng</h1>
                    <p className="text-sm text-[var(--cn-text-muted)] mt-1">Quản lý tất cả người dùng trên hệ thống</p>
                </div>
                <div className="bg-[var(--cn-primary)]/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-[var(--cn-primary)]">Tổng: {totalUsers} người</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {cardConfigs.map((card) => (
                    <DashboardCard
                        key={card.key}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        iconBgColor={card.iconBgColor}
                        iconColor={card.iconColor}
                        change={0}
                        trend="neutral"
                    />
                ))}
            </div>

            {/* Biểu đồ thống kê theo tỉnh thành */}
            <div className="bg-[var(--cn-bg-card)] rounded-xl p-4 shadow-sm border border-[var(--cn-border)]">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={20} className="text-[var(--cn-primary)]" />
                    <h2 className="text-base font-semibold text-[var(--cn-text-main)]">Thống kê người dùng theo tỉnh thành</h2>
                </div>

                {loadingProvince ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" />
                    </div>
                ) : provinceStats.length === 0 ? (
                    <div className="text-center py-8 text-[var(--cn-text-muted)]">
                        Chưa có dữ liệu thống kê theo tỉnh thành
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <div className="min-w-[500px]">
                                <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                    <BarChart data={provinceStats.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--cn-border)" />
                                        <XAxis dataKey="_id" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--cn-text-muted)' }} />
                                        <YAxis tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--cn-text-muted)' }} />
                                        <Tooltip content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-[var(--cn-bg-card)] p-2 rounded-lg shadow-lg border border-[var(--cn-border)]">
                                                        <p className="font-semibold text-xs mb-1">{label}</p>
                                                        <p className="text-xs text-[var(--cn-primary)]">{payload[0]?.value?.toLocaleString()} người dùng</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Legend wrapperStyle={{ color: 'var(--cn-text-muted)' }} />
                                        <Bar dataKey="count" fill="var(--cn-primary)" name="Số lượng người dùng" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bảng tỉnh thành */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--cn-primary)]/5">
                                    <tr>
                                        <th className="text-left p-3 font-semibold text-[var(--cn-primary)]">#</th>
                                        <th className="text-left p-3 font-semibold text-[var(--cn-primary)]">Tỉnh/TP</th>
                                        <th className="text-left p-3 font-semibold text-[var(--cn-primary)]">Số lượng</th>
                                        <th className="text-left p-3 font-semibold text-[var(--cn-primary)]">Tỉ lệ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--cn-border)]">
                                    {provinceStats.map((province, idx) => {
                                        const percentage = totalUsers > 0 ? ((province.count / totalUsers) * 100).toFixed(1) : '0';
                                        return (
                                            <tr key={province._id} className="hover:bg-[var(--cn-hover)] transition">
                                                <td className="p-3 text-[var(--cn-text-sub)]">{idx + 1}</td>
                                                <td className="p-3 font-medium text-[var(--cn-text-main)]">{province._id}</td>
                                                <td className="p-3 text-[var(--cn-text-sub)]">{province.count.toLocaleString()} người</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-[var(--cn-border)] rounded-full overflow-hidden">
                                                            <div className="h-full bg-[var(--cn-primary)] rounded-full" style={{ width: `${percentage}%` }} />
                                                        </div>
                                                        <span className="text-xs text-[var(--cn-text-muted)] w-12">{percentage}%</span>
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
            <div className="flex gap-2 border-b border-[var(--cn-border)]">
                <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'all' ? 'border-b-2 border-[var(--cn-primary)] text-[var(--cn-primary)]' : 'text-[var(--cn-text-muted)]'}`}>
                    Tất cả người dùng <span className="ml-1 text-xs">({totalUsers})</span>
                </button>
                <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-sm font-medium transition flex items-center gap-1 ${activeTab === 'pending' ? 'border-b-2 border-[var(--cn-primary)] text-[var(--cn-primary)]' : 'text-[var(--cn-text-muted)]'}`}>
                    Giáo viên chờ duyệt
                    {pendingTeachers.length > 0 && <span className="px-1.5 py-0.5 bg-[var(--cn-primary)] text-white rounded-full text-xs animate-pulse">{pendingTeachers.length}</span>}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[var(--cn-bg-card)] rounded-xl p-4 shadow-sm border border-[var(--cn-border)]">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <CustomInputSearch
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={filters.search}
                            onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                            onSearch={(value) => { setFilters(prev => ({ ...prev, search: value })); setPage(1); }}
                            size="medium"
                            variant="default"
                        />
                    </div>
                    <div className="w-48">
                        <CustomSelect
                            value={filters.role}
                            onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                            options={ROLE_OPTIONS}
                            placeholder="Chọn vai trò"
                        />
                    </div>
                    <button onClick={() => fetchUsers()} className="px-5 py-2.5 bg-[var(--cn-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--cn-primary-hover)] transition flex items-center gap-2">
                        <Search size={16} /> Tìm kiếm
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--cn-bg-card)] rounded-xl shadow-sm border border-[var(--cn-border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-[var(--cn-primary)]/5 border-b border-[var(--cn-border)]">
                            <tr>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Người dùng</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Vai trò</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Tỉnh/TP</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Xu</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Streak</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Tham gia</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--cn-border)]">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)] mx-auto" /><p className="text-sm text-[var(--cn-text-muted)] mt-3">Đang tải dữ liệu...</p></td></tr>
                            ) : (activeTab === 'all' ? users : pendingTeachers).length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16"><Users size={48} className="text-[var(--cn-text-muted)] mx-auto" /><p className="text-gray-400 mt-2">Không có người dùng nào</p></td></tr>
                            ) : (activeTab === 'all' ? users : pendingTeachers).map((user) => (
                                <tr key={user._id} className="hover:bg-[var(--cn-hover)] transition cursor-pointer group" onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[var(--cn-primary)]/10 flex items-center justify-center">
                                                {user.avatar ? (
                                                    <Image src={user.avatar} alt={user.fullName} width={36} height={36} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-semibold text-[var(--cn-primary)]">{getUserInitial(user)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--cn-text-main)]">{user.fullName}</p>
                                                <p className="text-xs text-[var(--cn-text-muted)]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="inline-flex w-fit">
                                                {getRoleBadge(user.role)}
                                            </div>
                                            {activeTab === 'pending' && user.requestedRole === 'teacher' && (
                                                <div className="flex gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); handleApproveTeacher(user._id, true); }} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 whitespace-nowrap"><CheckCircle size={10} className="inline mr-0.5" /> Duyệt</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleApproveTeacher(user._id, false); }} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 whitespace-nowrap"><XCircle size={10} className="inline mr-0.5" /> Từ chối</button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} className="text-[var(--cn-text-muted)] flex-shrink-0" />
                                            <span className="text-sm text-[var(--cn-text-sub)] truncate max-w-[120px]">{user.province || '---'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-[var(--cn-primary)]">{user.coins.toLocaleString()}</span>
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowCoinModal(true); }} className="p-1 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] rounded transition"><Coins size={14} /></button>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><span className="text-[var(--cn-primary)] font-medium">{user.streak}</span></td>
                                    <td className="px-5 py-4"><span className="text-sm text-[var(--cn-text-muted)]">{formatDate(user.createdAt)}</span></td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => { setSelectedUser(user); setShowUserModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Eye size={16} /></button>
                                            <button onClick={() => { setSelectedUser(user); setShowRoleModal(true); setSelectedRole(user.role); }} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition"><Settings size={16} /></button>
                                            <button onClick={() => { setSelectedUser(user); setShowViolationModal(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><AlertTriangle size={16} /></button>
                                            <button onClick={() => handleDeleteUser(user)} disabled={actionLoading?.userId === user._id} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {activeTab === 'all' && totalPages > 1 && (
                    <div className="border-t border-[var(--cn-border)] px-5 py-4 flex items-center justify-between">
                        <div className="text-sm text-[var(--cn-text-muted)]">Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalUsers)} trên {totalUsers}</div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronsLeft size={16} /></button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronLeft size={16} /></button>
                            <span className="px-3 text-sm font-medium text-[var(--cn-text-main)]">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronRight size={16} /></button>
                            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronsRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowUserModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-[var(--cn-bg-card)] px-6 py-4 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[var(--cn-text-main)]">Chi tiết người dùng</h3>
                            <button onClick={() => setShowUserModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] hover:bg-[var(--cn-hover)] transition"><X size={18} className="text-[var(--cn-text-muted)]" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4 p-4 bg-[var(--cn-bg-section)] rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-[var(--cn-primary)]/20 flex items-center justify-center text-[var(--cn-primary)] text-xl font-bold">{getUserInitial(selectedUser)}</div>
                                <div><p className="font-semibold text-[var(--cn-text-main)] text-lg">{selectedUser.fullName}</p><p className="text-sm text-[var(--cn-text-muted)]">{selectedUser.email}</p>{selectedUser.username && <p className="text-xs text-[var(--cn-primary)]">@{selectedUser.username}</p>}</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2"><Shield size={14} className="text-[var(--cn-text-muted)]" /> Vai trò: {getRoleBadge(selectedUser.role)}</div>
                                <div className="flex items-center gap-2"><Coins size={14} className="text-[var(--cn-text-muted)]" /> Xu: {selectedUser.coins.toLocaleString()}</div>
                                <div className="flex items-center gap-2"><Calendar size={14} className="text-[var(--cn-text-muted)]" /> Streak: {selectedUser.streak}</div>
                                <div className="flex items-center gap-2"><Mail size={14} className="text-[var(--cn-text-muted)]" /> {selectedUser.email}</div>
                                <div className="flex items-center gap-2"><MapPin size={14} className="text-[var(--cn-text-muted)]" /> {selectedUser.province || 'Chưa cập nhật'}</div>
                                {selectedUser.class && <div className="flex items-center gap-2"><GraduationCap size={14} className="text-[var(--cn-text-muted)]" /> Lớp: {selectedUser.class}</div>}
                                {selectedUser.school && <div className="flex items-center gap-2"><School size={14} className="text-[var(--cn-text-muted)]" /> {selectedUser.school}</div>}
                                {selectedUser.bio && <div className="md:col-span-2 flex items-start gap-2"><span className="text-[var(--cn-text-muted)]">📝</span><span className="text-[var(--cn-text-sub)]">{selectedUser.bio}</span></div>}
                                <div className="md:col-span-2 text-[var(--cn-text-muted)]">Ngày tạo: {formatDate(selectedUser.createdAt)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowRoleModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[var(--cn-text-main)]">Đổi vai trò</h3>
                            <button onClick={() => setShowRoleModal(false)} className="p-1 hover:bg-[var(--cn-hover)] rounded-lg transition"><X size={20} className="text-[var(--cn-text-muted)]" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div><label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Vai trò mới</label><CustomSelect value={selectedRole} onChange={setSelectedRole} options={[{ value: 'user', label: 'Người dùng' }, { value: 'teacher', label: 'Giáo viên' }, { value: 'admin', label: 'Admin' }]} placeholder="Chọn vai trò" /></div>
                            <div className="flex gap-3"><button onClick={() => setShowRoleModal(false)} className="flex-1 px-4 py-2.5 border border-[var(--cn-border)] rounded-xl text-[var(--cn-text-sub)] font-medium hover:bg-[var(--cn-hover)] transition">Hủy</button><button onClick={handleChangeRole} disabled={actionLoading?.type === 'role'} className="flex-1 px-4 py-2.5 bg-[var(--cn-primary)] text-white rounded-xl font-medium hover:bg-[var(--cn-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-2">{actionLoading?.type === 'role' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}{actionLoading?.type === 'role' ? 'Đang xử lý...' : 'Xác nhận'}</button></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Coin Modal */}
            {showCoinModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCoinModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-[var(--cn-border)] flex justify-between items-center"><h3 className="text-xl font-semibold text-[var(--cn-text-main)]">Điều chỉnh xu</h3><button onClick={() => setShowCoinModal(false)} className="p-1 hover:bg-[var(--cn-hover)] rounded-lg transition"><X size={20} className="text-[var(--cn-text-muted)]" /></button></div>
                        <div className="p-6 space-y-5">
                            <div><label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Số xu (±)</label><input type="number" value={coinAmount} onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)} placeholder="Nhập số xu..." className="w-full px-4 py-2.5 border border-[var(--cn-border)] rounded-xl text-[var(--cn-text-main)] focus:border-[var(--cn-primary)] focus:outline-none" /><p className="text-xs text-[var(--cn-text-muted)] mt-1">Nhập số dương để cộng, số âm để trừ</p></div>
                            <div><label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Lý do</label><CustomTextarea value={coinReason} onChange={setCoinReason} placeholder="Nhập lý do..." rows={3} maxLength={500} /></div>
                            <div className="flex gap-3"><button onClick={() => setShowCoinModal(false)} className="flex-1 px-4 py-2.5 border border-[var(--cn-border)] rounded-xl text-[var(--cn-text-sub)] font-medium hover:bg-[var(--cn-hover)] transition">Hủy</button><button onClick={handleAdjustCoins} disabled={actionLoading?.type === 'coins'} className="flex-1 px-4 py-2.5 bg-[var(--cn-primary)] text-white rounded-xl font-medium hover:bg-[var(--cn-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-2">{actionLoading?.type === 'coins' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}{actionLoading?.type === 'coins' ? 'Đang xử lý...' : 'Xác nhận'}</button></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Violation Modal */}
            {showViolationModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowViolationModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[var(--cn-text-main)]">Xử lý vi phạm</h3>
                            <button onClick={() => setShowViolationModal(false)} className="p-1 hover:bg-[var(--cn-hover)] rounded-lg transition"><X size={20} className="text-[var(--cn-text-muted)]" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Hành động</label>
                                <CustomSelect
                                    value={violationAction}
                                    onChange={(value: string) => setViolationAction(value as 'warn' | 'mute' | 'ban')}
                                    options={STATUS_SELECT_OPTIONS}
                                    placeholder="Chọn hành động"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Lý do</label>
                                <CustomTextarea value={violationReason} onChange={setViolationReason} placeholder="Nhập lý do..." rows={3} maxLength={500} />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowViolationModal(false)} className="flex-1 px-4 py-2.5 border border-[var(--cn-border)] rounded-xl text-[var(--cn-text-sub)] font-medium hover:bg-[var(--cn-hover)] transition">Hủy</button>
                                <button onClick={handleMarkViolation} disabled={actionLoading?.type === 'violation'} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                    {actionLoading?.type === 'violation' ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle size={16} />}
                                    {actionLoading?.type === 'violation' ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}