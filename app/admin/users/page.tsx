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
    X,
    BarChart3,
    Search,
    Settings,
    Flame,
} from 'lucide-react';

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
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import AdminUsersDashboard from '@/components/admin/AdminUsersDashboard';
import { getImageUrl } from '@/lib/utils/imageUrl';

const PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE = 10;

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
            return <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">Người dùng</span>;
    }
};

function AdminUsersPageContent() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();

    const [users, setUsers] = useState<IUser[]>([]);
    const [pendingTeachers, setPendingTeachers] = useState<IUser[]>([]);
    const [stats, setStats] = useState<IUserStats | null>(null);
    const [provinceStats, setProvinceStats] = useState<IProvinceStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProvince, setLoadingProvince] = useState(true);
    const [loadingPending, setLoadingPending] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    const [filters, setFilters] = useState<IUserFilters>({
        search: '', role: '', status: '', sortBy: 'createdAt', sortOrder: 'desc'
    });
    const [searchInput, setSearchInput] = useState('');

    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCoinModal, setShowCoinModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [showTeacherDetailModal, setShowTeacherDetailModal] = useState(false);
    const [selectedPendingTeacher, setSelectedPendingTeacher] = useState<IUser | null>(null);
    const [deleteUserTarget, setDeleteUserTarget] = useState<IUser | null>(null);

    const [selectedRole, setSelectedRole] = useState('');
    const [violationReason, setViolationReason] = useState('');
    const [violationAction, setViolationAction] = useState<'warn' | 'mute' | 'ban'>('warn');
    const [coinAmount, setCoinAmount] = useState(0);
    const [coinReason, setCoinReason] = useState('');
    const [actionLoading, setActionLoading] = useState<{ type: string; userId: string } | null>(null);

    const initialFetchDone = useRef(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const fetchUsers = useCallback(async (showLoading = true, keepExistingData = false) => {
        if (!token) return;
        if (showLoading && !keepExistingData) setLoading(true);
        if (!keepExistingData) setIsTableLoading(true);
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
            if (showLoading && !keepExistingData) setLoading(false);
            setIsTableLoading(false);
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
            Promise.all([fetchUsers(true, false), fetchStats(), fetchProvinceStats(), fetchPendingTeachers()]);
        }
    }, [token]);

    useEffect(() => {
        if (initialFetchDone.current) {
            setPage(1);
            fetchUsers(true, true);
        }
    }, [filters, pageSize]);

    useEffect(() => {
        if (initialFetchDone.current && page > 0) fetchUsers(true, true);
    }, [page]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: value }));
            setPage(1);
        }, 300);
    };

    // Socket
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewUserRegistered = () => {
            fetchStats();
            fetchProvinceStats();
            if (activeTab === 'all' && page === 1) fetchUsers(false, true);
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
                if (activeTab === 'all' && page === 1) fetchUsers(false, true);
                toast.success(approved ? 'Đã duyệt giáo viên' : 'Đã từ chối');
            }
        } catch (error) {
            console.error('Approve teacher error:', error);
            toast.error('Có lỗi xảy ra');
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
                toast.success('Đã đổi vai trò thành công');
            }
        } catch (error) {
            console.error('Change role error:', error);
            toast.error('Có lỗi xảy ra');
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
                toast.success('Đã xử lý vi phạm');
            }
        } catch (error) {
            console.error('Mark violation error:', error);
            toast.error('Có lỗi xảy ra');
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
                toast.success(`Đã ${coinAmount > 0 ? 'cộng' : 'trừ'} ${Math.abs(coinAmount)} xu`);
            }
        } catch (error) {
            console.error('Adjust coins error:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteUserTarget || !token) return;
        setActionLoading({ type: 'delete', userId: deleteUserTarget._id });
        try {
            await userApi.deleteUser(deleteUserTarget._id, token);
            setDeleteUserTarget(null);
            toast.success('Đã xóa người dùng');
        } catch (error) {
            console.error('Delete user error:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExportExcel = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/users/admin/users/export`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Export failed');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'danh_sach_nguoi_dung.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Xuất Excel thất bại');
        }
    };

    const handleViewTeacherDetail = (user: IUser) => {
        setSelectedPendingTeacher(user);
        setShowTeacherDetailModal(true);
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
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý tất cả người dùng trên hệ thống</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-blue-600">Tổng: {totalUsers} người</span>
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
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={20} className="text-blue-500" />
                    <h2 className="text-base font-semibold text-gray-800">Thống kê người dùng theo tỉnh thành</h2>
                </div>

                {loadingProvince ? (
                    <div className="h-[450px] flex items-center justify-center">
                        <div className="w-full space-y-4 px-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${Math.random() * 60 + 40}%` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : provinceStats.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        Chưa có dữ liệu thống kê theo tỉnh thành
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <div className="min-w-[600px]">
                                <ResponsiveContainer width="100%" height={isMobile ? 350 : 450}>
                                    <BarChart data={provinceStats} margin={{ top: 20, right: 30, left: 20, bottom: isMobile ? 100 : 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="_id"
                                            angle={-45}
                                            textAnchor="end"
                                            height={isMobile ? 100 : 80}
                                            interval={0}
                                            tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
                                        />
                                        <YAxis tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }} />
                                        <Tooltip content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
                                                        <p className="font-semibold text-xs mb-1 text-gray-800">{label}</p>
                                                        <p className="text-xs text-blue-500">{payload[0]?.value?.toLocaleString()} người dùng</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Legend wrapperStyle={{ color: '#6b7280' }} />
                                        <Bar dataKey="count" fill="#3b82f6" name="Số lượng người dùng" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="mt-6 overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-blue-50 sticky top-0">
                                    <tr>
                                        <th className="text-left p-3 font-semibold text-blue-600">#</th>
                                        <th className="text-left p-3 font-semibold text-blue-600">Tỉnh/TP</th>
                                        <th className="text-left p-3 font-semibold text-blue-600">Số lượng</th>
                                        <th className="text-left p-3 font-semibold text-blue-600">Tỉ lệ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {provinceStats.map((province, idx) => {
                                        const percentage = totalUsers > 0 ? ((province.count / totalUsers) * 100).toFixed(1) : '0';
                                        return (
                                            <tr key={province._id} className="hover:bg-gray-50 transition">
                                                <td className="p-3 text-gray-500">{idx + 1}</td>
                                                <td className="p-3 font-medium text-gray-800">{province._id}</td>
                                                <td className="p-3 text-gray-600">{province.count.toLocaleString()} người</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                                                        </div>
                                                        <span className="text-xs text-gray-400 w-12">{percentage}%</span>
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

            {/* Dashboard Charts */}
            <AdminUsersDashboard
                stats={stats}
                provinceStats={provinceStats}
                loadingProvince={loadingProvince}
                isMobile={isMobile}
                isTablet={isTablet}
            />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => {
                        setActiveTab('all');
                        setPage(1);
                    }}
                    className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                >
                    Tất cả người dùng <span className="ml-1 text-xs">({totalUsers})</span>
                </button>
                <button
                    onClick={() => {
                        setActiveTab('pending');
                        setPage(1);
                    }}
                    className={`px-4 py-2 text-sm font-medium transition flex items-center gap-1 ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                >
                    Giáo viên chờ duyệt
                    {pendingTeachers.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs animate-pulse">{pendingTeachers.length}</span>
                    )}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <CustomInput
                            type="text"
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            icon={<Search size={16} />}
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
                    <CustomButton
                        onClick={handleExportExcel}
                        className="bg-green-500 hover:bg-green-600 text-white"
                    >
                        Xuất Excel
                    </CustomButton>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left">
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Người dùng</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Vai trò</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Tỉnh/TP</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Xu</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Streak</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Tham gia</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isTableLoading && activeTab === 'all' && users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                        <p className="text-sm text-gray-500 mt-3">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : (activeTab === 'all' ? users : pendingTeachers).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16">
                                        <Users size={48} className="text-gray-300 mx-auto" />
                                        <p className="text-gray-400 mt-2">Không có người dùng nào</p>
                                    </td>
                                </tr>
                            ) : (activeTab === 'all' ? users : pendingTeachers).map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition cursor-pointer group" onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                {user.avatar ? (
                                                    <img src={getImageUrl(user.avatar)} alt={user.fullName} width={36} height={36} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-semibold text-blue-600">{getUserInitial(user)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
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
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleViewTeacherDetail(user); }}
                                                        className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 whitespace-nowrap"
                                                    >
                                                        <Eye size={10} className="inline mr-0.5" /> Xem thông tin
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 truncate max-w-[120px]">{user.province || '---'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-blue-600">{user.coins.toLocaleString()}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowCoinModal(true); }}
                                                className="p-1 text-gray-400 hover:text-blue-500 rounded transition"
                                            >
                                                <Coins size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1">
                                            <Flame size={14} className="text-orange-400" />
                                            <span className="text-blue-600 font-medium">{user.streak}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowRoleModal(true); setSelectedRole(user.role); }}
                                                className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition"
                                                title="Đổi vai trò"
                                            >
                                                <Settings size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowViolationModal(true); }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Xử lý vi phạm"
                                            >
                                                <AlertTriangle size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteUserTarget(user)}
                                                disabled={actionLoading?.type === 'delete' && actionLoading?.userId === user._id}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                title="Xóa tài khoản"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {activeTab === 'all' && totalPages > 1 && (
                    <div className="border-t border-gray-200 px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="text-sm text-gray-500">
                            Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalUsers)} trên {totalUsers}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {getPageNumbers().map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => typeof p === 'number' && setPage(p)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${page === p
                                        ? 'bg-blue-500 text-white'
                                        : typeof p === 'number'
                                            ? 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                                            : 'text-gray-400 cursor-default'
                                        }`}
                                    disabled={typeof p !== 'number'}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Teacher Detail Modal - Dùng Avatar từ shadcn UI */}
            {showTeacherDetailModal && selectedPendingTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowTeacherDetailModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Thông tin giáo viên</h3>
                            <button onClick={() => setShowTeacherDetailModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Avatar className="w-12 h-12">
                                    {selectedPendingTeacher.avatar ? (
                                        <AvatarImage src={getImageUrl(selectedPendingTeacher.avatar)} alt={selectedPendingTeacher.fullName} />
                                    ) : null}
                                    <AvatarFallback className="bg-blue-500 text-white text-lg font-bold">
                                        {getUserInitial(selectedPendingTeacher)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-gray-800">{selectedPendingTeacher.fullName}</p>
                                    <p className="text-sm text-gray-500">{selectedPendingTeacher.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <span className="text-gray-400">Tên giáo viên: </span>
                                    <span className="text-gray-700 font-medium">{selectedPendingTeacher.teacherName || selectedPendingTeacher.fullName}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-400">Đơn vị công tác: </span>
                                    <span className="text-gray-700">{selectedPendingTeacher.teacherWorkUnit || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-400">Email: </span>
                                    <span className="text-gray-700">{selectedPendingTeacher.email}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-400">Ngày đăng ký: </span>
                                    <span className="text-gray-700">{formatDate(selectedPendingTeacher.createdAt)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <CustomButton
                                    onClick={() => {
                                        setShowTeacherDetailModal(false);
                                        handleApproveTeacher(selectedPendingTeacher._id, true);
                                    }}
                                    loading={actionLoading?.type === 'approve' && actionLoading?.userId === selectedPendingTeacher._id}
                                    className="flex-1"
                                >
                                    <CheckCircle size={16} /> Duyệt
                                </CustomButton>
                                <CustomButton
                                    onClick={() => {
                                        setShowTeacherDetailModal(false);
                                        handleApproveTeacher(selectedPendingTeacher._id, false);
                                    }}
                                    loading={actionLoading?.type === 'approve' && actionLoading?.userId === selectedPendingTeacher._id}
                                    variant="danger"
                                    className="flex-1"
                                >
                                    <XCircle size={16} /> Từ chối
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowUserModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Chi tiết người dùng</h3>
                            <button onClick={() => setShowUserModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <Avatar className="w-14 h-14">
                                    {selectedUser.avatar ? (
                                        <AvatarImage src={getImageUrl(selectedUser.avatar)} alt={selectedUser.fullName} />
                                    ) : null}
                                    <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                                        {getUserInitial(selectedUser)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-gray-800 text-lg">{selectedUser.fullName}</p>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    {selectedUser.username && <p className="text-xs text-blue-500">@{selectedUser.username}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-gray-400" />
                                    <span>Vai trò: </span>
                                    {getRoleBadge(selectedUser.role)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Coins size={14} className="text-gray-400" />
                                    <span>Xu: <span className="font-semibold text-blue-600">{selectedUser.coins.toLocaleString()}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flame size={14} className="text-gray-400" />
                                    <span>Streak: <span className="font-semibold text-orange-500">{selectedUser.streak} ngày</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-gray-400" />
                                    <span>{selectedUser.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span>{selectedUser.province || 'Chưa cập nhật'}</span>
                                </div>
                                {selectedUser.class && (
                                    <div className="flex items-center gap-2">
                                        <GraduationCap size={14} className="text-gray-400" />
                                        <span>Lớp: {selectedUser.class}</span>
                                    </div>
                                )}
                                {selectedUser.school && (
                                    <div className="flex items-center gap-2">
                                        <School size={14} className="text-gray-400" />
                                        <span>{selectedUser.school}</span>
                                    </div>
                                )}
                                {selectedUser.bio && (
                                    <div className="md:col-span-2 flex items-start gap-2">
                                        <span className="text-gray-400">📝</span>
                                        <span className="text-gray-600">{selectedUser.bio}</span>
                                    </div>
                                )}
                                <div className="md:col-span-2 text-gray-400 text-xs">
                                    Ngày tạo: {formatDate(selectedUser.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowRoleModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Đổi vai trò</h3>
                            <button onClick={() => setShowRoleModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Vai trò mới</label>
                                <CustomSelect
                                    value={selectedRole}
                                    onChange={setSelectedRole}
                                    options={[
                                        { value: 'user', label: 'Người dùng' },
                                        { value: 'teacher', label: 'Giáo viên' },
                                        { value: 'admin', label: 'Admin' }
                                    ]}
                                    placeholder="Chọn vai trò"
                                />
                            </div>
                            <div className="flex gap-3">
                                <CustomButton variant="secondary" onClick={() => setShowRoleModal(false)} className="flex-1">
                                    Hủy
                                </CustomButton>
                                <CustomButton
                                    onClick={handleChangeRole}
                                    loading={actionLoading?.type === 'role'}
                                    className="flex-1"
                                >
                                    {actionLoading?.type === 'role' ? 'Đang xử lý...' : 'Xác nhận'}
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Coin Modal */}
            {showCoinModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCoinModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Điều chỉnh xu</h3>
                            <button onClick={() => setShowCoinModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Số xu (±)</label>
                                <CustomInput
                                    type="number"
                                    value={coinAmount}
                                    onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                                    placeholder="Nhập số xu (dương để cộng, âm để trừ)..."
                                />
                                <p className="text-xs text-gray-400 mt-1">Nhập số dương để cộng, số âm để trừ</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Lý do</label>
                                <CustomTextarea
                                    value={coinReason}
                                    onChange={setCoinReason}
                                    placeholder="Nhập lý do..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex gap-3">
                                <CustomButton variant="secondary" onClick={() => setShowCoinModal(false)} className="flex-1">
                                    Hủy
                                </CustomButton>
                                <CustomButton
                                    onClick={handleAdjustCoins}
                                    loading={actionLoading?.type === 'coins'}
                                    className="flex-1"
                                >
                                    {actionLoading?.type === 'coins' ? 'Đang xử lý...' : 'Xác nhận'}
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Violation Modal */}
            {showViolationModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowViolationModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Xử lý vi phạm</h3>
                            <button onClick={() => setShowViolationModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Hành động</label>
                                <CustomSelect
                                    value={violationAction}
                                    onChange={(value: string) => setViolationAction(value as 'warn' | 'mute' | 'ban')}
                                    options={STATUS_SELECT_OPTIONS}
                                    placeholder="Chọn hành động"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Lý do</label>
                                <CustomTextarea
                                    value={violationReason}
                                    onChange={setViolationReason}
                                    placeholder="Nhập lý do vi phạm..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex gap-3">
                                <CustomButton variant="secondary" onClick={() => setShowViolationModal(false)} className="flex-1">
                                    Hủy
                                </CustomButton>
                                <CustomButton
                                    onClick={handleMarkViolation}
                                    loading={actionLoading?.type === 'violation'}
                                    variant="danger"
                                    className="flex-1"
                                >
                                    {actionLoading?.type === 'violation' ? 'Đang xử lý...' : 'Xác nhận'}
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete User Confirm Modal */}
            <ConfirmModalDelete isOpen={!!deleteUserTarget}
                onClose={() => setDeleteUserTarget(null)}
                onConfirm={handleDeleteUser}
                title="Xóa người dùng"
                message={`Bạn có chắc chắn muốn xóa người dùng "${deleteUserTarget?.fullName}"?`}
                warning="Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
                isDeleting={actionLoading?.type === 'delete'}
            />
        </div>
    );
}

export default function AdminUsersPage() {
    return <AdminUsersPageContent />;
}
