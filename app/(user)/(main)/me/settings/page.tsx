// app/settings/page.tsx
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
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomButton } from '@/components/custom/CustomButton';

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

const CLASSES: string[] = [
    ...Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`),
    'Sinh viên',
    'Khác'
];

const PROVINCE_OPTIONS = PROVINCES.map(p => ({ value: p, label: p }));
const CLASS_OPTIONS = CLASSES.map(c => ({ value: c, label: c }));

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
    class?: string;
    province?: string;
    school?: string;
    birthday?: string;
    bio?: string;
    requestedRole?: 'teacher' | null;
}

const toISOString = (value: Date | undefined): string =>
    value instanceof Date ? value.toISOString() : new Date().toISOString();

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

    useEffect(() => {
        if (!storeUser || !user) return;
        const converted = storeUserToIUser(storeUser);

        const roleChanged = converted.role !== user.role;
        const requestedRoleChanged = converted.requestedRole !== user.requestedRole;

        if (roleChanged || requestedRoleChanged) {
            setUserState(converted);
            setFormData(userToFormData(converted));
        }
    }, [storeUser, user]);

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

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRoleRequestResolved = (data: { approved: boolean; newRole: string }) => {
            setUserState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    role: data.newRole as IUser['role'],
                    requestedRole: null,
                };
            });
            fetchUserProfile();
        };

        socket.on('role_request_resolved', handleRoleRequestResolved);
        return () => { socket.off('role_request_resolved', handleRoleRequestResolved); };
    }, [socket, isConnected, fetchUserProfile]);

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

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const currentUser: IUser | null = user ?? (storeUser ? storeUserToIUser(storeUser) : null);

    if (loading) return <Loading text="Đang tải thông tin..." />;
    if (!currentUser) return null;

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
            default: return 'bg-[var(--cn-primary)] text-white';
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)] overflow-hidden">

                {/* Header */}
                <div className="border-b border-[var(--cn-border)] p-4 sm:p-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--cn-primary)]">Cài đặt tài khoản</h1>
                    <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-1">Quản lý thông tin cá nhân</p>
                </div>

                {/* Avatar + name */}
                <div className="flex flex-col items-center py-6 sm:py-8 border-b border-[var(--cn-border)] bg-[var(--cn-bg-section)]">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[var(--cn-bg-card)] ring-4 ring-[var(--cn-border)] flex items-center justify-center">
                        {currentUser.avatar ? (
                            <Image
                                src={currentUser.avatar}
                                alt={currentUser.fullName}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--cn-text-muted)]" />
                        )}
                    </div>
                    <div className="mt-3 text-center">
                        <h2 className="font-semibold text-[var(--cn-text-main)] text-base sm:text-lg">
                            {currentUser.fullName}
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] break-all px-2">
                            {currentUser.email}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(currentUser.role)}`}>
                                {getRoleLabel(currentUser.role)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <CustomInput
                                label="Họ và tên"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                required
                            />
                            <CustomInput
                                label="Tên người dùng"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                placeholder="username"
                                prefix="@"
                            />
                            <CustomSelect
                                label="Lớp"
                                value={formData.class}
                                onChange={(value) => handleInputChange('class', value)}
                                options={CLASS_OPTIONS}
                                placeholder="Chọn lớp"
                            />
                            <CustomSelect
                                label="Tỉnh/Thành phố"
                                value={formData.province}
                                onChange={(value) => handleInputChange('province', value)}
                                options={PROVINCE_OPTIONS}
                                placeholder="Chọn tỉnh/thành phố"
                            />
                            <CustomInput
                                label="Trường học"
                                value={formData.school}
                                onChange={(e) => handleInputChange('school', e.target.value)}
                                placeholder="Nhập tên trường"
                            />
                            <CustomInput
                                label="Ngày sinh"
                                type="date"
                                value={formData.birthday}
                                onChange={(e) => handleInputChange('birthday', e.target.value)}
                            />
                            <div className="sm:col-span-2">
                                <CustomTextarea
                                    label="Giới thiệu bản thân"
                                    value={formData.bio}
                                    onChange={(value) => handleInputChange('bio', value)}
                                    placeholder="Chia sẻ một chút về bản thân..."
                                    rows={4}
                                    maxLength={500}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--cn-border)]">
                            <CustomButton
                                type="submit"
                                variant="primary"
                                loading={saving}
                                disabled={saving}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </CustomButton>
                        </div>
                    </form>

                    {/* Nâng cấp tài khoản */}
                    {currentUser.role === 'user' && (
                        <div className="mt-6 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-md)] p-4 sm:p-6 border border-[var(--cn-border)]">
                            <h3 className="text-base sm:text-lg font-semibold text-[var(--cn-text-main)] mb-3 sm:mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-[var(--cn-primary)]" />
                                Nâng cấp tài khoản
                            </h3>
                            <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mb-4">
                                Đăng ký trở thành giáo viên để đăng tải bài giảng và chia sẻ kiến thức với cộng đồng.
                            </p>
                            {currentUser.requestedRole === 'teacher' ? (
                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-[var(--cn-radius-sm)] border border-green-200 dark:border-green-800">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-[var(--cn-text-sub)]">
                                        Yêu cầu của bạn đã được gửi. Vui lòng chờ admin duyệt.
                                    </span>
                                </div>
                            ) : (
                                <CustomButton
                                    onClick={handleRequestRole}
                                    disabled={requestingRole}
                                    loading={requestingRole}
                                    variant="primary"
                                >
                                    {requestingRole ? 'Đang gửi...' : 'Đăng ký làm giáo viên'}
                                </CustomButton>
                            )}
                        </div>
                    )}

                    {/* Thống kê tài khoản */}
                    <div className="mt-6 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-md)] p-4 sm:p-6 border border-[var(--cn-border)]">
                        <h3 className="text-base sm:text-lg font-semibold text-[var(--cn-text-main)] mb-3 sm:mb-4 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-[var(--cn-primary)]" />
                            Thống kê tài khoản
                        </h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-3 bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)]">
                                <div className="flex items-center gap-1 text-[var(--cn-primary)] mb-1">
                                    <Coins className="w-4 h-4" />
                                    <span className="text-[10px] sm:text-xs text-[var(--cn-text-muted)]">Xu của bạn</span>
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-[var(--cn-primary)]">
                                    {currentUser.coins.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-3 bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)]">
                                <div className="flex items-center gap-1 text-orange-500 mb-1">
                                    <Flame className="w-4 h-4" />
                                    <span className="text-[10px] sm:text-xs text-[var(--cn-text-muted)]">Streak</span>
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-orange-500">
                                    {currentUser.streak} ngày
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Xóa tài khoản */}
                    <div className="mt-6 bg-red-50 dark:bg-red-950/20 rounded-[var(--cn-radius-md)] p-4 sm:p-6 border border-red-200 dark:border-red-800">
                        <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 mb-3 sm:mb-4 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Xóa tài khoản
                        </h3>
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mb-4">
                            Cảnh báo: Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                        </p>
                        <CustomButton
                            onClick={() => setShowDeleteConfirm(true)}
                            variant="danger"
                        >
                            <Trash2 className="w-4 h-4" />
                            Xóa tài khoản vĩnh viễn
                        </CustomButton>
                    </div>

                    {/* Đăng xuất */}
                    <div className="mt-6 pt-4 border-t border-[var(--cn-border)]">
                        <CustomButton
                            onClick={handleLogout}
                            variant="secondary"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </CustomButton>
                    </div>
                </div>
            </div>

            {/* Modal xác nhận xóa tài khoản */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-md border border-red-200 dark:border-red-800 shadow-[var(--cn-shadow-lg)]">
                        <div className="p-4 sm:p-5 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                <h2 className="text-lg font-semibold">Xác nhận xóa tài khoản</h2>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="p-1 hover:bg-[var(--cn-hover)] rounded-[var(--cn-radius-sm)] transition"
                            >
                                <X className="w-5 h-5 text-[var(--cn-text-muted)]" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-5 space-y-4">
                            <p className="text-[var(--cn-text-sub)] text-sm">
                                Bạn có chắc chắn muốn xóa tài khoản <strong className="text-[var(--cn-text-main)]">{currentUser.fullName}</strong>?
                            </p>
                            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-[var(--cn-radius-sm)] border border-red-200 dark:border-red-800">
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
                                <CustomButton
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Hủy
                                </CustomButton>
                                <CustomButton
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    loading={deleting}
                                    variant="danger"
                                    className="flex-1"
                                >
                                    {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;