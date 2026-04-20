'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { userApi, IUser } from '@/lib/api/user.api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, User, GraduationCap, MapPin, School, Cake, FileText, AtSign, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const { token, user, setAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [requestingRole, setRequestingRole] = useState(false);
    const [formData, setFormData] = useState<Partial<IUser>>({
        fullName: '',
        username: '',
        class: '',
        province: '',
        school: '',
        birthday: '',
        bio: ''
    });

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const result = await userApi.getProfile(token!);
            if (result.success) {
                const userData = result.data;
                setFormData({
                    fullName: userData.fullName || '',
                    username: userData.username || '',
                    class: userData.class || '',
                    province: userData.province || '',
                    school: userData.school || '',
                    birthday: userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
                    bio: userData.bio || ''
                });
            }
        } catch {
            toast.error('Lỗi khi tải thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await userApi.updateProfile(formData, token!);
            if (result.success) {
                toast.success('Cập nhật thông tin thành công');
                if (user) {
                    setAuth({ ...user, ...result.data }, token!);
                }
            } else {
                toast.error(result.message || 'Cập nhật thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestRole = async () => {
        setRequestingRole(true);
        try {
            const result = await userApi.requestRoleChange(token!);
            if (result.success) {
                toast.success('Đã gửi yêu cầu lên admin');

                if (user) {
                    setAuth({ ...user, requestedRole: 'teacher' }, token!);
                }
            } else {
                toast.error(result.message || 'Gửi yêu cầu thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setRequestingRole(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
                <div className="container mx-auto px-5 lg:px-10">
                    <div className="flex justify-center items-center h-64">
                        <Loader2 size={40} className="animate-spin text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
            <div className="container mx-auto px-5 lg:px-10 max-w-4xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
                >
                    <ArrowLeft size={20} />
                    Quay lại
                </Link>

                <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt tài khoản</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Cập nhật thông tin cá nhân của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <User size={14} className="inline mr-1" />
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <AtSign size={14} className="inline mr-1" />
                                    Tên người dùng
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Tên người dùng sẽ hiển thị công khai</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <GraduationCap size={14} className="inline mr-1" />
                                    Lớp
                                </label>
                                <input
                                    type="text"
                                    name="class"
                                    value={formData.class}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Lớp 11"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <MapPin size={14} className="inline mr-1" />
                                    Tỉnh/Thành phố
                                </label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Vĩnh Long"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <School size={14} className="inline mr-1" />
                                    Trường học
                                </label>
                                <input
                                    type="text"
                                    name="school"
                                    value={formData.school}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: THPT Tân Quới"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <Cake size={14} className="inline mr-1" />
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <FileText size={14} className="inline mr-1" />
                                Giới thiệu bản thân
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Chia sẻ một chút về bản thân bạn..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>


                    <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Shield size={18} />
                                    Vai trò hiện tại: {' '}
                                    {user?.role === 'user' && 'Thành viên'}
                                    {user?.role === 'teacher' && 'Giáo viên'}
                                    {user?.role === 'admin' && 'Quản trị viên'}
                                </h3>
                                {user?.role === 'user' && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {user?.requestedRole === 'teacher'
                                            ? '✅ Đã gửi yêu cầu lên admin, vui lòng chờ duyệt'
                                            : 'Bạn có thể đăng ký trở thành giáo viên để đăng bài viết và sản phẩm'}
                                    </p>
                                )}
                                {user?.role === 'teacher' && (
                                    <p className="text-sm text-green-600 mt-1">
                                        ✅ Bạn đã là giáo viên, có thể đăng bài viết và sản phẩm
                                    </p>
                                )}
                            </div>
                            {user?.role === 'user' && user?.requestedRole !== 'teacher' && (
                                <button
                                    type="button"
                                    onClick={handleRequestRole}
                                    disabled={requestingRole}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {requestingRole ? <Loader2 size={16} className="animate-spin" /> : 'Đăng ký làm giáo viên'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}