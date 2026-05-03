'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, type IUser } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import Loading from '@/components/common/Loading';
import {
    User,
    Award,
    Loader2,
    LogOut,
    Trash2,
    AlertTriangle,
    X,
    Coins,
    Flame,
    CheckCircle,
} from 'lucide-react';
import Image from 'next/image';

interface FormData {
    fullName: string;
    username: string;
    class: string;
    province: string;
    school: string;
    birthday: string;
    bio: string;
}

const PROVINCES: string[] = [
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng',
    'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
    'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh',
    'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên',
    'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng',
    'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
    'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
    'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
    'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
    'Thừa Thiên Huế', 'Tiền Giang', 'TP Hồ Chí Minh', 'Trà Vinh',
    'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];

const CLASSES: string[] = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

// Mirrors the store's User type exactly — timestamps are Date, not string.
// Extended with optional profile fields the API may populate after a fetch.
interface StoreUser {
    _id: string;
    fullName: string;
    email: string;
    username?: string;
    role: 'user' | 'teacher' | 'admin';
    coins: number;
    streak: number;
    avatar?: string;
    lastActiveAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    // Profile-only fields not always present in the base store shape
    class?: string;
    province?: string;
    school?: string;
    birthday?: string;
    bio?: string;
    requestedRole?: 'teacher' | null;
}

// Helper: safely convert Date | undefined to ISO string
const toISOString = (value: Date | undefined): string =>
    value instanceof Date ? value.toISOString() : new Date().toISOString();

// Helper: extract a plain IUser from the store user shape
const storeUserToIUser = (u: StoreUser): IUser => ({
    _id: u._id,
    fullName: u.fullName,
    email: u.email,
    username: u.username,
    role: u.role,
    coins: u.coins,
    streak: u.streak,
    avatar: u.avatar,
    class: u.class,
    province: u.province,
    school: u.school,
    birthday: u.birthday,
    bio: u.bio,
    requestedRole: u.requestedRole ?? null,
    isOnboarded: true,
    lastActiveAt: toISOString(u.lastActiveAt),
    createdAt: toISOString(u.createdAt),
    updatedAt: toISOString(u.updatedAt),
});

const isoToDateInput = (value?: string): string =>
    value ? value.split('T')[0] : '';

const userToFormData = (u: IUser): FormData => ({
    fullName: u.fullName ?? '',
    username: u.username ?? '',
    class: u.class ?? '',
    province: u.province ?? '',
    school: u.school ?? '',
    birthday: isoToDateInput(u.birthday),
    bio: u.bio ?? '',
});

const SettingsPage = () => {
    const router = useRouter();
    const { token, logout, updateCoins, updateStreak, user: rawStoreUser, setUser } = useAuthStore();
    const { socket, isConnected } = useSocket();

    // Cast once at the boundary — StoreUser mirrors the actual store User shape.
    const storeUser = rawStoreUser as unknown as StoreUser | null;

    const [user, setUserState] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [requestingRole, setRequestingRole] = useState(false);
    const hasFetched = useRef(false);

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        username: '',
        class: '',
        province: '',
        school: '',
        birthday: '',
        bio: '',
    });

    // ─── Fetch profile ────────────────────────────────────────────────────────

    const fetchUserProfile = useCallback(async () => {
        if (!token) {
            router.push('/login');
            return;
        }
        try {
            setLoading(true);
            const response = await userApi.getProfile(token);
            if (response.success && response.data) {
                setUserState(response.data);
                setFormData(userToFormData(response.data));
            } else if (
                response.message?.includes('Unauthorized') ||
                response.message?.includes('invalid token')
            ) {
                logout();
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    }, [token, logout, router]);

    useEffect(() => {
        if (token && !hasFetched.current) {
            hasFetched.current = true;
            fetchUserProfile();
        }
    }, [token, fetchUserProfile]);

    // ─── Sync store → local state khi role hoặc requestedRole thay đổi ────────
    useEffect(() => {
        if (!storeUser || !user) return;
        const converted = storeUserToIUser(storeUser);

        // FIX: so sánh thêm requestedRole để bắt được cả trường hợp rejected
        // (role không đổi nhưng requestedRole đã được reset về null)
        const roleChanged = converted.role !== user.role;
        const requestedRoleChanged = converted.requestedRole !== user.requestedRole;

        if (roleChanged || requestedRoleChanged) {
            setUserState(converted);
            setFormData(userToFormData(converted));
        }
    }, [storeUser, user]);

    // ─── Socket: role_changed ─────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRoleChanged = (data: { userId: string; newRole: string; oldRole: string }) => {
            if (user && data.userId === user._id && data.newRole !== user.role) {
                fetchUserProfile();
            }
        };

        socket.on('role_changed', handleRoleChanged);
        return () => { socket.off('role_changed', handleRoleChanged); };
    }, [socket, isConnected, user, fetchUserProfile]);

    // ─── Socket: role_request_resolved ───────────────────────────────────────
    // FIX: Lắng nghe event mới từ backend khi admin approve/reject request.
    // Cập nhật trực tiếp local state để UI phản ánh ngay lập tức,
    // đồng thời fetch lại để đảm bảo data đồng bộ hoàn toàn.
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRoleRequestResolved = (data: { approved: boolean; newRole: string }) => {
            // Cập nhật local state ngay để UI phản hồi tức thì
            setUserState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    role: data.newRole as IUser['role'],
                    requestedRole: null,
                };
            });
            // Fetch lại để đảm bảo đồng bộ hoàn toàn với server
            fetchUserProfile();
        };

        socket.on('role_request_resolved', handleRoleRequestResolved);
        return () => { socket.off('role_request_resolved', handleRoleRequestResolved); };
    }, [socket, isConnected, fetchUserProfile]);

    // ─── Socket: coins_updated ────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleCoinsUpdated = (data: { coins: number; userId: string }) => {
            if (!user || data.userId !== user._id || data.coins === user.coins) return;
            updateCoins(data.coins - user.coins);
            setUserState(prev => prev ? { ...prev, coins: data.coins } : null);
        };

        socket.on('coins_updated', handleCoinsUpdated);
        return () => { socket.off('coins_updated', handleCoinsUpdated); };
    }, [socket, isConnected, user, updateCoins]);

    // ─── Socket: streak_updated ───────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleStreakUpdated = (data: { streak: number; userId: string; totalCoins: number }) => {
            if (!user || data.userId !== user._id || data.streak === user.streak) return;
            updateStreak(data.streak);
            setUserState(prev => prev ? { ...prev, streak: data.streak, coins: data.totalCoins } : null);
        };

        socket.on('streak_updated', handleStreakUpdated);
        return () => { socket.off('streak_updated', handleStreakUpdated); };
    }, [socket, isConnected, user, updateStreak]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        try {
            setSaving(true);
            const response = await userApi.updateProfile(formData, token);
            if (response.success && response.data) {
                setUserState(response.data);
                if (rawStoreUser) {
                    setUser({
                        ...rawStoreUser,
                        fullName: response.data.fullName,
                        username: response.data.username,
                    });
                }
            }
        } catch (error) {
            console.error('Update profile error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleRequestRole = async () => {
        if (!token) return;
        try {
            setRequestingRole(true);
            const response = await userApi.requestRoleChange(token);
            if (response.success) await fetchUserProfile();
        } catch (error) {
            console.error('Request role error:', error);
        } finally {
            setRequestingRole(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!token) return;
        try {
            setDeleting(true);
            const response = await userApi.deleteOwnAccount(token);
            if (response.success) {
                await logout();
                router.push('/');
            }
        } catch (error) {
            console.error('Delete account error:', error);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // ─── Derived state ────────────────────────────────────────────────────────

    const currentUser: IUser | null = user ?? (storeUser ? storeUserToIUser(storeUser) : null);

    if (loading) return <Loading text="Đang tải thông tin..." />;
    if (!currentUser) return null;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Quản trị viên';
            case 'teacher': return 'Giáo viên';
            default: return 'Học viên';
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
            case 'teacher': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
            default: return 'bg-main text-white';
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-main">Cài đặt tài khoản</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quản lý thông tin cá nhân</p>
                </div>

                {/* Avatar + name */}
                <div className="flex flex-col items-center py-6 sm:py-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white dark:bg-gray-900 ring-4 ring-gray-200 dark:ring-gray-700 flex items-center justify-center">
                        {currentUser.avatar ? (
                            <Image
                                src={currentUser.avatar}
                                alt={currentUser.fullName}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                        )}
                    </div>
                    <div className="mt-3 text-center">
                        <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                            {currentUser.fullName}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all px-2">
                            {currentUser.email}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium">
                            <span className={`px-2 py-0.5 rounded-full ${getRoleBadgeClass(currentUser.role)}`}>
                                {getRoleLabel(currentUser.role)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tên người dùng
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Lớp
                                </label>
                                <select
                                    name="class"
                                    value={formData.class}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                >
                                    <option value="">Chọn lớp</option>
                                    {CLASSES.map(cls => (
                                        <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tỉnh/Thành phố
                                </label>
                                <select
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {PROVINCES.map(province => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Trường học
                                </label>
                                <input
                                    type="text"
                                    name="school"
                                    value={formData.school}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Giới thiệu bản thân
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Chia sẻ một chút về bản thân..."
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 sm:px-6 py-2 bg-main text-white rounded-lg hover:bg-main/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {saving && <Loader2 className="w-4 h-4 inline animate-spin mr-2" />}
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>

                    {/* Nâng cấp tài khoản */}
                    {currentUser.role === 'user' && (
                        <div className="mt-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-main" />
                                Nâng cấp tài khoản
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Đăng ký trở thành giáo viên để đăng tải bài giảng và chia sẻ kiến thức với cộng đồng.
                            </p>
                            {currentUser.requestedRole === 'teacher' ? (
                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Yêu cầu của bạn đã được gửi. Vui lòng chờ admin duyệt.
                                    </span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRequestRole}
                                    disabled={requestingRole}
                                    className="px-4 sm:px-6 py-2 bg-main text-white rounded-lg hover:bg-main/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                                >
                                    {requestingRole
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Award className="w-4 h-4" />}
                                    {requestingRole ? 'Đang gửi...' : 'Đăng ký làm giáo viên'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Thống kê tài khoản */}
                    <div className="mt-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-main" />
                            Thống kê tài khoản
                        </h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-1 text-main mb-1">
                                    <Coins className="w-4 h-4" />
                                    <span className="text-xs text-gray-500">Xu của bạn</span>
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-main">
                                    {currentUser.coins.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-1 text-orange-500 mb-1">
                                    <Flame className="w-4 h-4" />
                                    <span className="text-xs text-gray-500">Streak</span>
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-orange-500">
                                    {currentUser.streak} ngày
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Xóa tài khoản */}
                    <div className="mt-6 bg-red-50 dark:bg-red-950/20 rounded-lg p-4 sm:p-6 border border-red-200 dark:border-red-800">
                        <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 mb-3 sm:mb-4 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Xóa tài khoản
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                            Cảnh báo: Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                        </p>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                        >
                            <Trash2 className="w-4 h-4" />
                            Xóa tài khoản vĩnh viễn
                        </button>
                    </div>

                    {/* Đăng xuất */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal xác nhận xóa tài khoản */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md border border-red-200 dark:border-red-800 shadow-xl">
                        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                <h2 className="text-lg font-semibold">Xác nhận xóa tài khoản</h2>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-5 space-y-4">
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                                Bạn có chắc chắn muốn xóa tài khoản <strong>{currentUser.fullName}</strong>?
                            </p>
                            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                    ⚠️ Hành động này sẽ xóa vĩnh viễn:
                                </p>
                                <ul className="text-xs text-red-600 dark:text-red-400 mt-2 space-y-1 list-disc list-inside">
                                    <li>Tất cả thông tin cá nhân</li>
                                    <li>Lịch sử hoạt động</li>
                                    <li>Bài viết và bình luận</li>
                                    <li>Điểm xu và thành tích</li>
                                </ul>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {deleting
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Trash2 className="w-4 h-4" />}
                                    {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;