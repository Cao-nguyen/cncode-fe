// app/admin/users/page.tsx
'use client';

import { CustomTextarea } from '@/components/custom/CustomTextarea';
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
    ShoppingCart,
    FileText,
    PieChart,
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
    ResponsiveContainer,
} from 'recharts';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomInput } from '@/components/custom/CustomInput';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'user', label: 'Người dùng' },
    { value: 'teacher', label: 'Giáo viên' },
    { value: 'admin', label: 'Admin' },
];

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'fullName', label: 'Tên' },
    { value: 'coins', label: 'Số xu' },
    { value: 'streak', label: 'Streak' },
    { value: 'province', label: 'Tỉnh/Thành phố' },
    { value: 'lastActiveAt', label: 'Hoạt động gần đây' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Card configs: icon, màu nền icon, màu icon, màu chart
// Bạn có thể thêm trendData thật từ API sau
const CARD_CONFIGS = [
    {
        key: 'total',
        title: 'Tổng người dùng',
        iconBgColor: '#EFF6FF',
        iconColor: '#3B82F6',
        chartColor: '#3B82F6',
        icon: <Users size={20} />,
    },
    {
        key: 'teachers',
        title: 'Giáo viên',
        iconBgColor: '#F0FDF4',
        iconColor: '#22C55E',
        chartColor: '#22C55E',
        icon: <UserCheck size={20} />,
    },
    {
        key: 'admins',
        title: 'Admin',
        iconBgColor: '#FFF7ED',
        iconColor: '#F97316',
        chartColor: '#F97316',
        icon: <Shield size={20} />,
    },
    {
        key: 'pending',
        title: 'Chờ duyệt',
        iconBgColor: '#F5F3FF',
        iconColor: '#8B5CF6',
        chartColor: '#8B5CF6',
        icon: <UserPlus size={20} />,
    },
    {
        key: 'newThisWeek',
        title: 'Mới (tuần)',
        iconBgColor: '#FDF2F8',
        iconColor: '#EC4899',
        chartColor: '#EC4899',
        icon: <UserPlus size={20} />,
    },
    {
        key: 'activeToday',
        title: 'Hoạt động hôm nay',
        iconBgColor: '#F0FDFA',
        iconColor: '#14B8A6',
        chartColor: '#14B8A6',
        icon: <Users size={20} />,
    },
];

// ─── Custom Tooltip for Bar Chart ────────────────────────────────────────────

const CustomBarTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-xs mb-0.5 text-gray-700 dark:text-gray-200">{label}</p>
                <p className="text-xs text-blue-500">{payload[0]?.value?.toLocaleString() || 0} người dùng</p>
            </div>
        );
    }
    return null;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

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
        search: '',
        role: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
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

    // ── Responsive ─────────────────────────────────────────────────────────────
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

    // ── Fetch Helpers ──────────────────────────────────────────────────────────
    const fetchUsers = useCallback(
        async (showLoading = true) => {
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
        },
        [token, page, pageSize, filters]
    );

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

    // ── Init Fetch ─────────────────────────────────────────────────────────────
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

    // ── Socket ─────────────────────────────────────────────────────────────────
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
            setUsers((prev) =>
                prev.map((user) => (user._id === data.userId ? { ...user, coins: data.coins } : user))
            );
            setPendingTeachers((prev) =>
                prev.map((user) => (user._id === data.userId ? { ...user, coins: data.coins } : user))
            );
            fetchStats();
        };

        const handleRoleChanged = (data: {
            userId: string;
            newRole: string;
            oldRole: string;
            userName: string;
        }) => {
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === data.userId
                        ? { ...user, role: data.newRole as 'user' | 'teacher' | 'admin' }
                        : user
                )
            );
            if (data.newRole === 'teacher') {
                setPendingTeachers((prev) => prev.filter((user) => user._id !== data.userId));
            }
            fetchStats();
            fetchPendingTeachers();
        };

        const handleUserDeleted = (data: { userId: string; userName: string }) => {
            setUsers((prev) => prev.filter((user) => user._id !== data.userId));
            setPendingTeachers((prev) => prev.filter((user) => user._id !== data.userId));
            fetchStats();
            fetchProvinceStats();
            setTotalUsers((prev) => prev - 1);
        };

        const handleStreakUpdated = (data: { userId: string; streak: number; totalCoins: number }) => {
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === data.userId
                        ? { ...user, streak: data.streak, coins: data.totalCoins }
                        : user
                )
            );
            setPendingTeachers((prev) =>
                prev.map((user) =>
                    user._id === data.userId
                        ? { ...user, streak: data.streak, coins: data.totalCoins }
                        : user
                )
            );
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

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleApproveTeacher = async (userId: string, approved: boolean) => {
        if (!token) return;
        setActionLoading({ type: 'approve', userId });
        try {
            const result = await userApi.approveTeacherRequest(userId, approved, token);
            if (result.success) {
                setPendingTeachers((prev) => prev.filter((u) => u._id !== userId));
                if (approved) {
                    setUsers((prev) => {
                        const idx = prev.findIndex((u) => u._id === userId);
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
                setUsers((prev) =>
                    prev.map((user) =>
                        user._id === selectedUser._id
                            ? { ...user, role: selectedRole as 'user' | 'teacher' | 'admin' }
                            : user
                    )
                );
                if (selectedRole === 'teacher') {
                    setPendingTeachers((prev) => prev.filter((user) => user._id !== selectedUser._id));
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
            const result = await userApi.markViolation(
                selectedUser._id,
                violationReason,
                violationAction,
                token
            );
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
            const result = await userApi.adjustUserCoins(
                selectedUser._id,
                coinAmount,
                coinReason,
                token
            );
            if (result.success) {
                setUsers((prev) =>
                    prev.map((user) =>
                        user._id === selectedUser._id
                            ? { ...user, coins: user.coins + coinAmount }
                            : user
                    )
                );
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
        if (
            !confirm(
                `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"? Hành động này không thể hoàn tác.`
            )
        )
            return;
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

    // ── Helpers ────────────────────────────────────────────────────────────────
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap">
                        Admin
                    </span>
                );
            case 'teacher':
                return (
                    <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap">
                        Giáo viên
                    </span>
                );
            default:
                return (
                    <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[var(--cn-primary)] text-white rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap">
                        Người dùng
                    </span>
                );
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
                for (let i = page - (isMobile ? 0 : 1); i <= page + (isMobile ? 0 : 1); i++)
                    pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    // Resolve stat value for each card
    const getCardValue = (key: string): number => {
        if (!stats && key !== 'pending') return 0;
        switch (key) {
            case 'total':
                return stats?.total ?? 0;
            case 'teachers':
                return stats?.teachers ?? 0;
            case 'admins':
                return stats?.admins ?? 0;
            case 'pending':
                return pendingTeachers.length;
            case 'newThisWeek':
                return stats?.newThisWeek ?? 0;
            case 'activeToday':
                return stats?.activeToday ?? 0;
            default:
                return 0;
        }
    };

    const topProvinces = provinceStats.slice(0, 10);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 sm:space-y-6 pb-8">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--cn-text-main)]">
                        Quản lý người dùng
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-0.5">
                        Quản lý tất cả người dùng · Dữ liệu realtime
                    </p>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {CARD_CONFIGS.map((cfg) => (
                    <DashboardCard
                        key={cfg.key}
                        title={cfg.title}
                        value={getCardValue(cfg.key)}
                        icon={cfg.icon}
                        iconBgColor={cfg.iconBgColor}
                        iconColor={cfg.iconColor}
                        chartColor={cfg.chartColor}
                    // trendData: truyền dữ liệu thực từ API nếu có
                    // change: truyền % thay đổi nếu API trả về
                    />
                ))}
            </div>

            {/* ── Province Chart ── */}
            <div className="rounded-[var(--cn-radius-md)] p-4 sm:p-5 shadow-[var(--cn-shadow-sm)] border border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <BarChart3
                        size={isMobile ? 18 : 20}
                        className="text-[var(--cn-primary)]"
                    />
                    <h2 className="text-base sm:text-lg font-semibold text-[var(--cn-text-main)]">
                        Thống kê người dùng theo tỉnh thành
                    </h2>
                </div>

                {loadingProvince ? (
                    <div className="flex justify-center items-center h-48 sm:h-64">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[var(--cn-primary)]" />
                    </div>
                ) : provinceStats.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-[var(--cn-text-muted)] text-sm sm:text-base">
                        Chưa có dữ liệu thống kê theo tỉnh thành
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <div className="min-w-[500px]">
                                <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                    <BarChart
                                        data={topProvinces}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--cn-border)"
                                        />
                                        <XAxis
                                            dataKey="_id"
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                            interval={0}
                                            tick={{
                                                fontSize: isMobile ? 10 : 12,
                                                fill: 'var(--cn-text-muted)',
                                            }}
                                        />
                                        <YAxis
                                            tick={{
                                                fontSize: isMobile ? 10 : 12,
                                                fill: 'var(--cn-text-muted)',
                                            }}
                                        />
                                        <Tooltip content={<CustomBarTooltip />} />
                                        <Legend
                                            wrapperStyle={{ color: 'var(--cn-text-muted)' }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="var(--cn-primary)"
                                            name="Số lượng người dùng"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Province table */}
                        <div className="mt-4 sm:mt-6 overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm">
                                <thead className="bg-[var(--cn-primary)]/5">
                                    <tr>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-[var(--cn-primary)]">#</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-[var(--cn-primary)]">Tỉnh/TP</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-[var(--cn-primary)]">Số lượng</th>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-[var(--cn-primary)]">Tỉ lệ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--cn-border)]">
                                    {provinceStats.map((province, idx) => {
                                        const percentage =
                                            totalUsers > 0
                                                ? ((province.count / totalUsers) * 100).toFixed(1)
                                                : '0';
                                        return (
                                            <tr
                                                key={province._id}
                                                className="hover:bg-[var(--cn-hover)] transition"
                                            >
                                                <td className="p-2 sm:p-3 text-[var(--cn-text-sub)]">
                                                    {idx + 1}
                                                </td>
                                                <td className="p-2 sm:p-3 font-medium text-[var(--cn-text-main)]">
                                                    {province._id}
                                                </td>
                                                <td className="p-2 sm:p-3 text-[var(--cn-text-sub)]">
                                                    {province.count.toLocaleString()} người
                                                </td>
                                                <td className="p-2 sm:p-3">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <div className="flex-1 h-1.5 sm:h-2 bg-[var(--cn-border)] rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[var(--cn-primary)] rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] sm:text-xs text-[var(--cn-text-muted)] w-10 sm:w-12">
                                                            {percentage}%
                                                        </span>
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

            {/* ── Tabs ── */}
            <div className="flex gap-2 border-b border-[var(--cn-border)] overflow-x-auto">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition ${activeTab === 'all'
                        ? 'border-b-2 border-[var(--cn-primary)] text-[var(--cn-primary)]'
                        : 'text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)]'
                        }`}
                >
                    Tất cả người dùng{' '}
                    <span className="ml-1 text-xs text-[var(--cn-text-muted)]">({totalUsers})</span>
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition flex items-center gap-1 ${activeTab === 'pending'
                        ? 'border-b-2 border-[var(--cn-primary)] text-[var(--cn-primary)]'
                        : 'text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)]'
                        }`}
                >
                    Giáo viên chờ duyệt
                    {pendingTeachers.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-[var(--cn-primary)] text-white rounded-full text-[10px] animate-pulse">
                            {pendingTeachers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="rounded-[var(--cn-radius-md)] p-4 sm:p-5 shadow-[var(--cn-shadow-sm)] border border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <CustomInputSearch
                        value={filters.search}
                        onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
                        onSearch={(value) => {
                            setFilters((prev) => ({ ...prev, search: value }));
                            setPage(1);
                        }}
                        placeholder="Tìm kiếm tên, email..."
                        size="medium"
                        variant="default"
                    />
                    <CustomSelect
                        value={filters.role}
                        onChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}
                        options={ROLE_OPTIONS}
                        placeholder="Chọn vai trò"
                    />
                    <CustomSelect
                        value={filters.sortBy}
                        onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                        options={SORT_OPTIONS}
                        placeholder="Sắp xếp theo"
                    />
                    <CustomSelect
                        value={filters.sortOrder}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                sortOrder: value as 'asc' | 'desc',
                            }))
                        }
                        options={[
                            { value: 'desc', label: 'Mới nhất' },
                            { value: 'asc', label: 'Cũ nhất' },
                        ]}
                        placeholder="Thứ tự"
                    />
                </div>
            </div>

            {/* ── Users Table ── */}
            <div className="rounded-[var(--cn-radius-md)] shadow-[var(--cn-shadow-sm)] border border-[var(--cn-border)] overflow-hidden bg-[var(--cn-bg-card)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] lg:min-w-full">
                        <thead className="bg-[var(--cn-primary)]/5 border-b border-[var(--cn-border)]">
                            <tr>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[var(--cn-primary)] whitespace-nowrap">
                                    Người dùng
                                </th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[var(--cn-primary)] whitespace-nowrap">
                                    Vai trò
                                </th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[var(--cn-primary)] whitespace-nowrap">
                                    Tỉnh/TP
                                </th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[var(--cn-primary)] whitespace-nowrap">
                                    Xu
                                </th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[var(--cn-primary)] whitespace-nowrap">
                                    Streak
                                </th>
                                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[var(--cn-primary)] whitespace-nowrap">
                                    Tham gia
                                </th>
                                <th className="text-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[var(--cn-primary)] whitespace-nowrap">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--cn-border)]">
                            {(activeTab === 'all' ? users : pendingTeachers).map((user) => (
                                <tr key={user._id} className="hover:bg-[var(--cn-hover)] transition">
                                    {/* Avatar + Name */}
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden flex-shrink-0">
                                                {user.avatar ? (
                                                    <Image
                                                        src={user.avatar}
                                                        alt={user.fullName}
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-base sm:text-lg font-semibold text-[var(--cn-primary)]">
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm sm:text-base text-[var(--cn-text-main)] truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[200px]">
                                                    {user.fullName}
                                                </p>
                                                <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] truncate max-w-[110px] sm:max-w-[160px] lg:max-w-[180px]">
                                                    {user.email}
                                                </p>
                                                {user.username && (
                                                    <p className="text-[10px] sm:text-xs text-[var(--cn-primary)]/60 truncate max-w-[110px] sm:max-w-[160px] lg:max-w-[180px]">
                                                        @{user.username}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="inline-block w-fit">
                                                {getRoleBadge(user.role)}
                                            </div>
                                            {activeTab === 'pending' &&
                                                user.requestedRole === 'teacher' && (
                                                    <div className="flex flex-row items-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                handleApproveTeacher(user._id, true)
                                                            }
                                                            disabled={
                                                                actionLoading?.userId === user._id
                                                            }
                                                            className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md text-[10px] sm:text-xs hover:bg-green-200 disabled:opacity-50 transition whitespace-nowrap"
                                                        >
                                                            {actionLoading?.userId === user._id ? (
                                                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                            ) : (
                                                                <CheckCircle size={10} />
                                                            )}
                                                            <span>Duyệt</span>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleApproveTeacher(user._id, false)
                                                            }
                                                            disabled={
                                                                actionLoading?.userId === user._id
                                                            }
                                                            className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] sm:text-xs hover:bg-red-200 disabled:opacity-50 transition whitespace-nowrap"
                                                        >
                                                            <XCircle size={10} />
                                                            <span>Từ chối</span>
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    </td>

                                    {/* Province */}
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center gap-1">
                                            <MapPin
                                                size={12}
                                                className="text-[var(--cn-text-muted)] flex-shrink-0"
                                            />
                                            <span className="text-xs sm:text-sm text-[var(--cn-text-sub)] truncate max-w-[80px] sm:max-w-[110px] lg:max-w-[130px]">
                                                {user.province || '---'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Coins */}
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center gap-1 sm:gap-1.5">
                                            <span className="font-semibold text-[var(--cn-primary)] text-sm sm:text-base whitespace-nowrap">
                                                {user.coins.toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowCoinModal(true);
                                                }}
                                                className="p-0.5 sm:p-1 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] rounded transition flex-shrink-0"
                                                title="Điều chỉnh xu"
                                            >
                                                <Coins size={12} />
                                            </button>
                                        </div>
                                    </td>

                                    {/* Streak */}
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <span className="text-[var(--cn-primary)] text-sm sm:text-base font-medium whitespace-nowrap">
                                            {user.streak}
                                        </span>
                                    </td>

                                    {/* Join date */}
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <span className="text-xs sm:text-sm text-[var(--cn-text-muted)] whitespace-nowrap">
                                            {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowUserModal(true);
                                                }}
                                                className="p-1 sm:p-1.5 text-[var(--cn-primary)] hover:bg-[var(--cn-primary)]/10 rounded-[var(--cn-radius-sm)] transition"
                                                title="Chi tiết"
                                            >
                                                <Eye size={isTablet ? 12 : 14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowRoleModal(true);
                                                    setSelectedRole(user.role);
                                                }}
                                                className="p-1 sm:p-1.5 text-purple-600 hover:bg-purple-100 rounded-[var(--cn-radius-sm)] transition"
                                                title="Đổi vai trò"
                                            >
                                                <UserCog size={isTablet ? 12 : 14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowViolationModal(true);
                                                }}
                                                className="p-1 sm:p-1.5 text-amber-600 hover:bg-amber-100 rounded-[var(--cn-radius-sm)] transition"
                                                title="Vi phạm"
                                            >
                                                <AlertTriangle size={isTablet ? 12 : 14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={actionLoading?.userId === user._id}
                                                className="p-1 sm:p-1.5 text-red-600 hover:bg-red-100 rounded-[var(--cn-radius-sm)] transition disabled:opacity-50"
                                                title="Xóa"
                                            >
                                                {actionLoading?.userId === user._id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Trash2 size={isTablet ? 12 : 14} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === 'all' && users.length === 0 && !loading && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-[var(--cn-text-muted)]"
                                    >
                                        Không có người dùng nào
                                    </td>
                                </tr>
                            )}
                            {activeTab === 'pending' &&
                                pendingTeachers.length === 0 &&
                                !loadingPending && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-8 text-[var(--cn-text-muted)]"
                                        >
                                            Không có giáo viên nào chờ duyệt
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {activeTab === 'all' && totalPages > 1 && (
                    <div className="border-t border-[var(--cn-border)] px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            {/* Page size */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm text-[var(--cn-text-muted)]">
                                    Hiển thị
                                </span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] focus:outline-none focus:border-[var(--cn-primary)]"
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-xs sm:text-sm text-[var(--cn-text-muted)]">
                                    người dùng
                                </span>
                            </div>

                            {/* Page buttons */}
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    className="p-1 sm:p-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] disabled:opacity-50 hover:bg-[var(--cn-hover)] transition"
                                >
                                    <ChevronsLeft
                                        size={isMobile ? 14 : 18}
                                        className="text-[var(--cn-text-sub)]"
                                    />
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1 sm:p-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] disabled:opacity-50 hover:bg-[var(--cn-hover)] transition"
                                >
                                    <ChevronLeft
                                        size={isMobile ? 14 : 18}
                                        className="text-[var(--cn-text-sub)]"
                                    />
                                </button>
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    {getPageNumbers().map((pageNum, idx) =>
                                        pageNum === '...' ? (
                                            <span
                                                key={idx}
                                                className="px-1 sm:px-2 py-0.5 sm:py-1 text-[var(--cn-text-muted)] text-xs sm:text-sm"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum as number)}
                                                className={`min-w-[28px] sm:min-w-[36px] h-7 sm:h-9 px-1 sm:px-2 rounded-[var(--cn-radius-sm)] text-xs sm:text-sm font-medium transition ${page === pageNum
                                                    ? 'bg-[var(--cn-primary)] text-white'
                                                    : 'hover:bg-[var(--cn-hover)] text-[var(--cn-text-sub)] border border-[var(--cn-border)]'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    )}
                                </div>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1 sm:p-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] disabled:opacity-50 hover:bg-[var(--cn-hover)] transition"
                                >
                                    <ChevronRight
                                        size={isMobile ? 14 : 18}
                                        className="text-[var(--cn-text-sub)]"
                                    />
                                </button>
                                <button
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                    className="p-1 sm:p-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] disabled:opacity-50 hover:bg-[var(--cn-hover)] transition"
                                >
                                    <ChevronsRight
                                        size={isMobile ? 14 : 18}
                                        className="text-[var(--cn-text-sub)]"
                                    />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="text-xs sm:text-sm text-[var(--cn-text-muted)] text-center sm:text-right">
                                Hiển thị {(page - 1) * pageSize + 1} -{' '}
                                {Math.min(page * pageSize, totalUsers)} trên tổng{' '}
                                {totalUsers.toLocaleString()} người dùng
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─────────────────── MODALS ─────────────────── */}

            {/* Modal: Chi tiết người dùng */}
            {showUserModal && selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowUserModal(false)}
                >
                    <div
                        className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-[90%] sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--cn-border)] shadow-[var(--cn-shadow-lg)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-[var(--cn-bg-card)] p-3 sm:p-5 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-semibold text-[var(--cn-primary)]">
                                Chi tiết người dùng
                            </h2>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="p-1 sm:p-2 hover:bg-[var(--cn-hover)] rounded-lg transition"
                            >
                                <X size={isMobile ? 18 : 20} className="text-[var(--cn-text-muted)]" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden">
                                    {selectedUser.avatar ? (
                                        <Image
                                            src={selectedUser.avatar}
                                            alt={selectedUser.fullName}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-[var(--cn-primary)]">
                                            {selectedUser.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-xl font-bold text-[var(--cn-text-main)]">
                                        {selectedUser.fullName}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] break-words">
                                        {selectedUser.email}
                                    </p>
                                    {selectedUser.username && (
                                        <p className="text-xs text-[var(--cn-primary)]">
                                            @{selectedUser.username}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <Shield size={isMobile ? 14 : 16} className="text-[var(--cn-text-muted)]" />
                                    Vai trò: {getRoleBadge(selectedUser.role)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Coins size={isMobile ? 14 : 16} className="text-[var(--cn-text-muted)]" />
                                    Xu: {selectedUser.coins.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar
                                        size={isMobile ? 14 : 16}
                                        className="text-[var(--cn-text-muted)]"
                                    />
                                    Streak: {selectedUser.streak} ngày
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={isMobile ? 14 : 16} className="text-[var(--cn-text-muted)]" />
                                    {selectedUser.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin
                                        size={isMobile ? 14 : 16}
                                        className="text-[var(--cn-text-muted)]"
                                    />
                                    {selectedUser.province || 'Chưa cập nhật'}
                                </div>
                                {selectedUser.class && (
                                    <div className="flex items-center gap-2">
                                        <GraduationCap
                                            size={isMobile ? 14 : 16}
                                            className="text-[var(--cn-text-muted)]"
                                        />
                                        Lớp: {selectedUser.class}
                                    </div>
                                )}
                                {selectedUser.school && (
                                    <div className="flex items-center gap-2">
                                        <School
                                            size={isMobile ? 14 : 16}
                                            className="text-[var(--cn-text-muted)]"
                                        />
                                        {selectedUser.school}
                                    </div>
                                )}
                                {selectedUser.bio && (
                                    <div className="sm:col-span-2 flex items-start gap-2">
                                        <div className="text-[var(--cn-text-muted)] mt-0.5">📝</div>
                                        <div className="text-[var(--cn-text-sub)]">{selectedUser.bio}</div>
                                    </div>
                                )}
                                <div className="sm:col-span-2 flex items-center gap-2 text-[var(--cn-text-muted)]">
                                    <Calendar size={isMobile ? 14 : 16} />
                                    Ngày tạo:{' '}
                                    {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Đổi vai trò */}
            {showRoleModal && selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowRoleModal(false)}
                >
                    <div
                        className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-[90%] sm:max-w-md border border-[var(--cn-border)] shadow-[var(--cn-shadow-lg)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3 sm:p-5 border-b border-[var(--cn-border)]">
                            <h2 className="text-lg sm:text-xl font-semibold text-[var(--cn-primary)]">
                                Đổi vai trò
                            </h2>
                            <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-1">
                                Người dùng: {selectedUser.fullName}
                            </p>
                            <p className="text-xs text-[var(--cn-primary)] mt-1">
                                Vai trò hiện tại: {getRoleBadge(selectedUser.role)}
                            </p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">
                                    Vai trò mới
                                </label>
                                <CustomSelect
                                    value={selectedRole}
                                    onChange={(value) => setSelectedRole(value)}
                                    options={[
                                        { value: 'user', label: 'Người dùng' },
                                        { value: 'teacher', label: 'Giáo viên' },
                                        { value: 'admin', label: 'Admin' },
                                    ]}
                                    placeholder="Chọn vai trò"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-[var(--cn-border)] text-[var(--cn-primary)] rounded-lg hover:bg-[var(--cn-hover)] text-sm transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleChangeRole}
                                    disabled={actionLoading?.type === 'role'}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--cn-primary)] text-white rounded-lg hover:bg-[var(--cn-primary-hover)] text-sm transition disabled:opacity-50"
                                >
                                    {actionLoading?.type === 'role' ? (
                                        <Loader2 className="w-4 h-4 animate-spin inline" />
                                    ) : (
                                        'Xác nhận'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Vi phạm */}
            {showViolationModal && selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowViolationModal(false)}
                >
                    <div
                        className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-[90%] sm:max-w-md border border-[var(--cn-border)] shadow-[var(--cn-shadow-lg)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3 sm:p-5 border-b border-[var(--cn-border)]">
                            <h2 className="text-lg sm:text-xl font-semibold text-[var(--cn-primary)]">
                                Đánh dấu vi phạm
                            </h2>
                            <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-1">
                                Người dùng: {selectedUser.fullName}
                            </p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">
                                    Hành động
                                </label>
                                <CustomSelect
                                    value={violationAction}
                                    onChange={(value) =>
                                        setViolationAction(value as 'warn' | 'mute' | 'ban')
                                    }
                                    options={[
                                        { value: 'warn', label: '⚠️ Cảnh cáo' },
                                        { value: 'mute', label: '🔇 Cấm chat (7 ngày)' },
                                        { value: 'ban', label: '🔴 Khóa tài khoản' },
                                    ]}
                                    placeholder="Chọn hành động"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">
                                    Lý do
                                </label>
                                <CustomTextarea
                                    value={violationReason}
                                    onChange={(value) => setViolationReason(value)}
                                    placeholder="Nhập lý do xử lý vi phạm..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowViolationModal(false)}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-[var(--cn-border)] text-[var(--cn-primary)] rounded-lg hover:bg-[var(--cn-hover)] text-sm transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleMarkViolation}
                                    disabled={actionLoading?.type === 'violation'}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition disabled:opacity-50"
                                >
                                    {actionLoading?.type === 'violation' ? (
                                        <Loader2 className="w-4 h-4 animate-spin inline" />
                                    ) : (
                                        'Xác nhận'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Điều chỉnh xu */}
            {showCoinModal && selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowCoinModal(false)}
                >
                    <div
                        className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-[90%] sm:max-w-md border border-[var(--cn-border)] shadow-[var(--cn-shadow-lg)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3 sm:p-5 border-b border-[var(--cn-border)]">
                            <h2 className="text-lg sm:text-xl font-semibold text-[var(--cn-primary)]">
                                Điều chỉnh số xu
                            </h2>
                            <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-1">
                                Người dùng: {selectedUser.fullName}
                            </p>
                            <p className="text-xs text-[var(--cn-primary)] mt-1">
                                Xu hiện tại:{' '}
                                <span className="font-semibold">
                                    {selectedUser.coins.toLocaleString()}
                                </span>
                            </p>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">
                                    Số xu (có thể âm)
                                </label>
                                <CustomInput
                                    value={coinAmount.toString()}
                                    onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                                    placeholder="Nhập số xu..."
                                />
                                <p className="text-[10px] sm:text-xs text-[var(--cn-text-muted)] mt-1">
                                    Nhập số dương để cộng, số âm để trừ
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">
                                    Lý do
                                </label>
                                <CustomTextarea
                                    value={coinReason}
                                    onChange={(value) => setCoinReason(value)}
                                    placeholder="Nhập lý do điều chỉnh..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCoinModal(false)}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-[var(--cn-border)] text-[var(--cn-primary)] rounded-lg hover:bg-[var(--cn-hover)] text-sm transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAdjustCoins}
                                    disabled={actionLoading?.type === 'coins'}
                                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--cn-primary)] text-white rounded-lg hover:bg-[var(--cn-primary-hover)] text-sm transition disabled:opacity-50"
                                >
                                    {actionLoading?.type === 'coins' ? (
                                        <Loader2 className="w-4 h-4 animate-spin inline" />
                                    ) : (
                                        'Xác nhận'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}