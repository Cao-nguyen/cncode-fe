'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { userApi, type IUser } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth.store';
import {
    User,
    Award,
    MapPin,
    GraduationCap,
    BookOpen,
    Calendar,
    FileText,
    CheckCircle,
    Loader2,
    LogOut,
} from 'lucide-react';

// Define proper type for current user display
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

const SettingsPage = () => {
    const router = useRouter();
    const { user: authUser, token, setUser, logout } = useAuthStore();
    const [user, setUserState] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const hasFetched = useRef(false);

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        class: '',
        province: '',
        school: '',
        birthday: '',
        bio: '',
    });

    // Role request states
    const [requestingRole, setRequestingRole] = useState(false);

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

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Convert authUser to DisplayUser safely without 'any'
    const getDisplayUser = (): DisplayUser | null => {
        if (user) {
            return {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                requestedRole: user.requestedRole,
                coins: user.coins,
                streak: user.streak,
                avatar: user.avatar,
                username: user.username,
                class: user.class,
                province: user.province,
                school: user.school,
                birthday: user.birthday,
                bio: user.bio,
            };
        }

        if (authUser) {
            const authUserAny = authUser as unknown as Record<string, unknown>;
            return {
                _id: authUserAny._id as string,
                fullName: authUserAny.fullName as string,
                email: authUserAny.email as string,
                role: authUserAny.role as 'user' | 'teacher' | 'admin',
                requestedRole: authUserAny.requestedRole as 'teacher' | null | undefined,
                coins: (authUserAny.coins as number) || 0,
                streak: (authUserAny.streak as number) || 0,
                avatar: authUserAny.avatar as string | undefined,
                username: authUserAny.username as string | undefined,
                class: authUserAny.class as string | undefined,
                province: authUserAny.province as string | undefined,
                school: authUserAny.school as string | undefined,
                birthday: authUserAny.birthday as string | undefined,
                bio: authUserAny.bio as string | undefined,
            };
        }

        return null;
    };

    const currentUser = getDisplayUser();

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
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 p-6">
                    <h1 className="text-2xl font-bold text-main">Cài đặt tài khoản</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý thông tin cá nhân</p>
                </div>

                {/* User Info Section */}
                <div className="flex flex-col items-center py-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white dark:bg-gray-900 ring-4 ring-gray-200 dark:ring-gray-700 flex items-center justify-center">
                        {currentUser.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={currentUser.avatar} alt={currentUser.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-gray-400" />
                        )}
                    </div>
                    <div className="mt-3 text-center">
                        <h2 className="font-semibold text-gray-900 dark:text-white">{currentUser.fullName}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-main text-white">
                            {currentUser.role === 'admin' && 'Quản trị viên'}
                            {currentUser.role === 'teacher' && 'Giáo viên'}
                            {currentUser.role === 'user' && 'Học viên'}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Profile Form */}
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white"
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
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white"
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
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white"
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
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white"
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
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white"
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
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Giới thiệu bản thân
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white resize-none"
                                    placeholder="Chia sẻ một chút về bản thân..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-main text-white rounded-lg hover:bg-main/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> : null}
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>

                    {/* Role Request Section */}
                    {currentUser.role === 'user' && (
                        <div className="mt-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-main" />
                                Nâng cấp tài khoản
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Đăng ký trở thành giáo viên để đăng tải bài giảng và chia sẻ kiến thức với cộng đồng.
                            </p>
                            {currentUser.requestedRole === 'teacher' ? (
                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="text-gray-700 dark:text-gray-300">Yêu cầu của bạn đã được gửi. Vui lòng chờ admin duyệt.</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRequestRole}
                                    disabled={requestingRole}
                                    className="px-6 py-2 bg-main text-white rounded-lg hover:bg-main/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {requestingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                    {requestingRole ? 'Đang gửi...' : 'Đăng ký làm giáo viên'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Account Stats */}
                    <div className="mt-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-main" />
                            Thống kê tài khoản
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="text-2xl font-bold text-main">{currentUser.coins}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Xu của bạn</div>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="text-2xl font-bold text-main">{currentUser.streak}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Ngày hoạt động liên tiếp</div>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;