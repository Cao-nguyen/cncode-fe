'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Calendar,
    MapPin,
    School,
    GraduationCap,
    Award,
    Coins,
    Flame,
    Edit2,
    Save,
    X,
    Camera,
    BookOpen,
    Heart,
    MessageCircle,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// --- INTERFACES ---
interface IUser {
    _id: string;
    email: string;
    username: string;
    fullName: string;
    avatar: string;
    role: string;
    isOnboarded: boolean;
    class: string;
    province: string;
    school: string;
    birthday: string;
    bio: string;
    coins: number;
    streak: number;
    createdAt: string;
    updatedAt: string;
}

interface IAuthState {
    state: {
        user: IUser;
        token: string;
        coins: number;
        isAuthenticated: boolean;
    };
    version: number;
}

// Helper function to get user data
const getUserData = (): IUser | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed: IAuthState = JSON.parse(raw);
        return parsed?.state?.user ?? null;
    } catch (error) {
        console.error('Error parsing auth data:', error);
        return null;
    }
};

// Helper function to get edit form initial data
const getInitialEditForm = (user: IUser | null) => {
    if (!user) return {
        fullName: '',
        username: '',
        bio: '',
        class: '',
        school: '',
        province: '',
        birthday: ''
    };
    return {
        fullName: user.fullName || '',
        username: user.username || '',
        bio: user.bio || '',
        class: user.class || '',
        school: user.school || '',
        province: user.province || '',
        birthday: user.birthday ? user.birthday.split('T')[0] : ''
    };
};

export default function ProfilePage() {
    // Lazy initialization for user state
    const [user, setUser] = useState<IUser | null>(() => getUserData());
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Lazy initialization for edit form
    const [editForm, setEditForm] = useState(() => getInitialEditForm(user));

    // Update edit form when user changes
    useEffect(() => {
        setEditForm(getInitialEditForm(user));
    }, [user]);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleEditSubmit = async () => {
        if (!user) return;

        try {
            // Thay thế bằng API thực tế của bạn
            // const response = await fetch(`/api/users/${user._id}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(editForm)
            // });

            // Update local state
            setUser({
                ...user,
                fullName: editForm.fullName,
                username: editForm.username,
                bio: editForm.bio,
                class: editForm.class,
                school: editForm.school,
                province: editForm.province,
                birthday: editForm.birthday ? new Date(editForm.birthday).toISOString() : user.birthday
            });

            setIsEditing(false);
            toast.success('Cập nhật thông tin thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getRoleBadge = (role: string) => {
        if (!role) return null;
        switch (role) {
            case 'admin':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Administrator</span>;
            case 'teacher':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Giáo viên</span>;
            case 'user':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Học viên</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa đăng nhập</h3>
                    <p className="text-gray-400 text-sm mb-6">Vui lòng đăng nhập để xem trang cá nhân</p>
                    <Link href="/dang-nhap" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                                <User className="w-12 h-12 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <h1 className="text-2xl md:text-3xl font-black text-white">
                                            {user.fullName || user.username}
                                        </h1>
                                        {getRoleBadge(user.role)}
                                    </div>
                                    {user.username && (
                                        <p className="text-white/80 text-sm">@{user.username}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-5 py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                {isEditing ? "Hủy" : "Chỉnh sửa"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Coin & Streak */}
                        {(user.coins > 0 || user.streak > 0) && (
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                                {user.coins > 0 && (
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-6 h-6" />
                                            <span className="font-bold">CNcoins</span>
                                        </div>
                                        <div className="text-2xl font-black">{user.coins.toLocaleString()}</div>
                                    </div>
                                )}
                                {user.streak > 0 && (
                                    <div className={`flex items-center justify-between ${user.coins > 0 ? 'pt-4 border-t border-white/20' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <Flame className="w-5 h-5" />
                                            <span className="text-sm">Streak</span>
                                        </div>
                                        <div className="font-bold">{user.streak} ngày</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Personal Info */}
                        {(user.email || user.birthday || user.class || user.school || user.province) && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    Thông tin cá nhân
                                </h3>
                                <div className="space-y-3">
                                    {user.email && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Email</p>
                                                <p className="text-gray-900 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {user.birthday && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Ngày sinh</p>
                                                <p className="text-gray-900 font-medium">{formatDate(user.birthday)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {user.class && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Lớp</p>
                                                <p className="text-gray-900 font-medium">{user.class}</p>
                                            </div>
                                        </div>
                                    )}
                                    {user.school && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <School className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Trường học</p>
                                                <p className="text-gray-900 font-medium">{user.school}</p>
                                            </div>
                                        </div>
                                    )}
                                    {user.province && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Tỉnh/Thành phố</p>
                                                <p className="text-gray-900 font-medium">{user.province}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Bio & Edit Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Section */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Giới thiệu</h3>
                            {isEditing ? (
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                                    className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20 resize-none"
                                    rows={4}
                                />
                            ) : (
                                <p className="text-gray-600 leading-relaxed">
                                    {user.bio || "Chưa có giới thiệu. Hãy thêm giới thiệu để mọi người biết thêm về bạn!"}
                                </p>
                            )}
                        </div>

                        {/* Edit Form - Hiển thị khi đang chỉnh sửa */}
                        {isEditing && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                    Chỉnh sửa thông tin
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Họ và tên</label>
                                        <input
                                            type="text"
                                            value={editForm.fullName}
                                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Tên đăng nhập</label>
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Lớp</label>
                                        <input
                                            type="text"
                                            value={editForm.class}
                                            onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                            placeholder="Ví dụ: Lớp 11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Trường học</label>
                                        <input
                                            type="text"
                                            value={editForm.school}
                                            onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                            placeholder="Tên trường của bạn"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Tỉnh/Thành phố</label>
                                        <input
                                            type="text"
                                            value={editForm.province}
                                            onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                            placeholder="Tỉnh/Thành phố"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Ngày sinh</label>
                                        <input
                                            type="date"
                                            value={editForm.birthday}
                                            onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleEditSubmit}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}