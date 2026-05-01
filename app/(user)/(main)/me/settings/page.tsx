'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { userApi, type IUser } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import {
    User,
    Award,
    MapPin,
    GraduationCap,
    BookOpen,
    Calendar,
    CheckCircle,
    Loader2,
    LogOut,
    Trash2,
    AlertTriangle,
    X,
    Coins,
    Flame,
} from 'lucide-react';

interface FormData {
    fullName: string;
    username: string;
    class: string;
    province: string;
    school: string;
    birthday: string;
    bio: string;
}

interface DisplayUser {
    _id: string;
    fullName: string;
    email: string;
    role: 'user' | 'teacher' | 'admin';
    requestedRole?: 'teacher' | null;
    coins: number;
    streak: number;
    avatar?: string;
    username?: string;
    class?: string;
    province?: string;
    school?: string;
    birthday?: string;
    bio?: string;
}

interface RoleChangedPayload {
    newRole: 'user' | 'teacher' | 'admin';
}

interface CoinsUpdatedPayload {
    coins: number;
    userId: string;
}

const SettingsPage = () => {
    const router = useRouter();
    const { user: authUser, token, setUser, logout, updateCoins, updateStreak } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [user, setUserState] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

    const [requestingRole, setRequestingRole] = useState(false);

    // Lắng nghe role change realtime
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRoleChanged = (data: RoleChangedPayload) => {
            if (user && data.newRole !== user.role) {
                const roleLabel = data.newRole === 'teacher' ? 'Giáo viên' : data.newRole === 'admin' ? 'Quản trị viên' : 'Người dùng';
                toast.info(`Vai trò của bạn đã được cập nhật thành ${roleLabel}`);
                fetchUserProfile();
            }
        };

        socket.on('role_changed', handleRoleChanged);

        return () => {
            socket.off('role_changed', handleRoleChanged);
        };
    }, [socket, isConnected, user]);

    // Lắng nghe coins updated realtime
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleCoinsUpdated = (data: CoinsUpdatedPayload) => {
            if (user && data.userId === user._id && data.coins !== user.coins) {
                const diff = data.coins - user.coins;
                updateCoins(diff);
                setUserState(prev => prev ? { ...prev, coins: data.coins } : null);
                if (diff > 0) {
                    toast.success(`+${diff} xu!`);
                } else if (diff < 0) {
                    toast.info(`${diff} xu`);
                }
            }
        };

        socket.on('coins_updated', handleCoinsUpdated);

        return () => {
            socket.off('coins_updated', handleCoinsUpdated);
        };
    }, [socket, isConnected, user, updateCoins]);

    // Lắng nghe streak updated realtime
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleStreakUpdated = (data: { streak: number; userId: string; totalCoins: number }) => {
            if (user && data.userId === user._id && data.streak !== user.streak) {
                updateStreak(data.streak);
                setUserState(prev => prev ? { ...prev, streak: data.streak, coins: data.totalCoins } : null);
                toast.success(`🔥 Streak: ${data.streak} ngày liên tiếp!`);
            }
        };

        socket.on('streak_updated', handleStreakUpdated);

        return () => {
            socket.off('streak_updated', handleStreakUpdated);
        };
    }, [socket, isConnected, user, updateStreak]);

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
                setFormData({
                    fullName: response.data.fullName || '',
                    username: response.data.username || '',
                    class: response.data.class || '',
                    province: response.data.province || '',
                    school: response.data.school || '',
                    birthday: response.data.birthday ? response.data.birthday.split('T')[0] : '',
                    bio: response.data.bio || '',
                });
            } else {
                toast.error(response.message || 'Không thể tải thông tin');
                if (response.message?.includes('Unauthorized')) {
                    logout();
                    router.push('/login');
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Không thể tải thông tin người dùng');
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setSaving(true);
            const response = await userApi.updateProfile(formData, token);
            if (response.success && response.data) {
                toast.success('Cập nhật thông tin thành công');
                setUserState(response.data);
                // Không setUser ở đây vì kiểu dữ liệu không khớp
            } else {
                toast.error(response.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật');
        } finally {
            setSaving(false);
        }
    };

    const handleRequestRole = async () => {
        if (!token) return;

        try {
            setRequestingRole(true);
            const response = await userApi.requestRoleChange(token);
            if (response.success) {
                toast.success('Đã gửi yêu cầu lên admin. Vui lòng chờ duyệt.');
                await fetchUserProfile();
            } else {
                toast.error(response.message || 'Gửi yêu cầu thất bại');
            }
        } catch (error) {
            console.error('Request role error:', error);
            toast.error('Đã xảy ra lỗi khi gửi yêu cầu');
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
                toast.success('Tài khoản đã được xóa vĩnh viễn');
                await logout();
                router.push('/');
            } else {
                toast.error(response.message || 'Xóa tài khoản thất bại');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            toast.error('Đã xảy ra lỗi khi xóa tài khoản');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Chuyển đổi từ IUser sang DisplayUser
    const getDisplayUserFromIUser = (userData: IUser): DisplayUser => {
        return {
            _id: userData._id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
            requestedRole: userData.requestedRole,
            coins: userData.coins,
            streak: userData.streak,
            avatar: userData.avatar,
            username: userData.username,
            class: userData.class,
            province: userData.province,
            school: userData.school,
            birthday: userData.birthday,
            bio: userData.bio,
        };
    };

    const currentUser: DisplayUser | null = user ? getDisplayUserFromIUser(user) : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-main" />
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-main">Cài đặt tài khoản</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quản lý thông tin cá nhân</p>
                </div>

                {/* User Info Section */}
                <div className="flex flex-col items-center py-6 sm:py-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white dark:bg-gray-900 ring-4 ring-gray-200 dark:ring-gray-700 flex items-center justify-center">
                        {currentUser.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={currentUser.avatar} alt={currentUser.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                        )}
                    </div>
                    <div className="mt-3 text-center">
                        <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">{currentUser.fullName}</h2>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all px-2">{currentUser.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-main text-white">
                            {currentUser.role === 'admin' && 'Quản trị viên'}
                            {currentUser.role === 'teacher' && 'Giáo viên'}
                            {currentUser.role === 'user' && 'Học viên'}
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    {/* Profile Form */}
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
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                    placeholder="Nhập họ và tên"
                                    required
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
                                    placeholder="Nhập tên người dùng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Lớp
                                </label>
                                <input
                                    type="text"
                                    name="class"
                                    value={formData.class}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                    placeholder="Ví dụ: 12A1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tỉnh/Thành phố
                                </label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white text-sm sm:text-base"
                                    placeholder="Nhập tỉnh/thành phố"
                                />
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
                                    placeholder="Nhập tên trường"
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
                                    className="w-full px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
                                    placeholder="Chia sẻ một chút về bản thân..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 sm:px-6 py-2 bg-main text-white rounded-lg hover:bg-main/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {saving ? <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> : null}
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>

                    {/* Role Request Section */}
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
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Yêu cầu của bạn đã được gửi. Vui lòng chờ admin duyệt.</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRequestRole}
                                    disabled={requestingRole}
                                    className="px-4 sm:px-6 py-2 bg-main text-white rounded-lg hover:bg-main/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                                >
                                    {requestingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                    {requestingRole ? 'Đang gửi...' : 'Đăng ký làm giáo viên'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Account Stats */}
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
                                <div className="text-xl sm:text-2xl font-bold text-main">{currentUser.coins.toLocaleString()}</div>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-1 text-orange-500 mb-1">
                                    <Flame className="w-4 h-4" />
                                    <span className="text-xs text-gray-500">Streak</span>
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-orange-500">{currentUser.streak} ngày</div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Account Section */}
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

                    {/* Logout Button */}
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

            {/* Delete Confirmation Modal */}
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
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition"
                                    disabled={deleting}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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