'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
    User,
    Mail,
    Calendar,
    MapPin,
    School,
    GraduationCap,
    Coins,
    Flame,
    Camera,
    Heart,
    MessageCircle,
    MoreHorizontal,
    UserPlus,
    MessageSquare,
    Image as ImageIcon,
    Globe,
    Video,
    MapPinned,
    ChevronDown,
    Home,
    Flag
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import PostFeed from '@/components/forum/PostFeed';
import { IForumPost } from '@/lib/api/forum.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface IUser {
    _id: string;
    email: string;
    username: string;
    fullName: string;
    avatar: string;
    coverPhoto?: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;
    const { user: currentUser, token } = useAuthStore();

    const [profileUser, setProfileUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'favorites'>('posts');
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const isOwnProfile = currentUser?._id === profileUser?._id;

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/user/profile/${username}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const data = await response.json();

            if (data.success && data.data) {
                setProfileUser(data.data);
            } else {
                setProfileUser(null);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Không thể tải thông tin người dùng');
            setProfileUser(null);
        } finally {
            setLoading(false);
        }
    };


    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh không được vượt quá 5MB');
            return;
        }

        setUploadingCover(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                toast.success('Đã cập nhật ảnh bìa');

                if (profileUser) {
                    setProfileUser({
                        ...profileUser,
                        coverPhoto: base64
                    });
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading cover:', error);
            toast.error('Có lỗi xảy ra khi tải ảnh lên');
        } finally {
            setUploadingCover(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh không được vượt quá 5MB');
            return;
        }

        setUploadingAvatar(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                toast.success('Đã cập nhật ảnh đại diện');

                if (profileUser) {
                    setProfileUser({
                        ...profileUser,
                        avatar: base64
                    });
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Có lỗi xảy ra khi tải ảnh lên');
        } finally {
            setUploadingAvatar(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--cn-bg-main)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--cn-text-sub)]">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-[var(--cn-bg-main)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-[var(--cn-bg-card)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-[var(--cn-text-sub)]" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--cn-text-main)] mb-2">Không tìm thấy người dùng</h3>
                    <p className="text-[var(--cn-text-sub)] text-sm mb-6">Người dùng này không tồn tại hoặc đã bị xóa</p>
                    <Link href="/" className="px-6 py-2 bg-[var(--cn-primary)] text-white rounded-xl hover:bg-[var(--cn-primary-hover)] transition-colors inline-block">
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--cn-bg-main)]">
            {/* Cover Photo */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="relative w-full bg-[var(--cn-bg-card)] rounded-2xl overflow-hidden" style={{ aspectRatio: '1500/800', maxHeight: '500px' }}>
                    {profileUser.coverPhoto ? (
                        <img
                            src={profileUser.coverPhoto}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
                    )}

                    {isOwnProfile && (
                        <>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                disabled={uploadingCover}
                                className="absolute bottom-4 right-4 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {uploadingCover ? 'Đang tải...' : 'Chỉnh sửa ảnh bìa'}
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Profile Header */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-[var(--cn-bg-card)] border-b border-[var(--cn-border)] shadow-lg rounded-2xl">
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                            {/* Avatar */}
                            <div className="relative -mt-16 md:-mt-20">
                                <div className="relative">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--cn-bg-card)] bg-[var(--cn-bg-card)] overflow-hidden shadow-xl">
                                        {profileUser.avatar ? (
                                            <img
                                                src={profileUser.avatar}
                                                alt={profileUser.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                                <User className="w-16 h-16 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    {isOwnProfile && (
                                        <>
                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => avatarInputRef.current?.click()}
                                                disabled={uploadingAvatar}
                                                className="absolute bottom-2 right-2 p-2 bg-[var(--cn-bg-card)] hover:bg-[var(--cn-bg-hover)] rounded-full shadow-lg border-2 border-[var(--cn-border)] transition-colors"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--cn-text-main)] mb-2">
                                        {profileUser.fullName}
                                    </h1>
                                    {profileUser.bio && (
                                        <p className="text-sm text-[var(--cn-text-sub)] max-w-2xl">
                                            {profileUser.bio}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    {isOwnProfile ? (
                                        <button
                                            onClick={() => router.push('/forum/thongtin')}
                                            className="px-4 py-2 bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] text-white rounded-lg font-medium transition-colors"
                                        >
                                            Tạo bài viết
                                        </button>
                                    ) : (
                                        <>
                                            <button className="px-4 py-2 bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                                                <UserPlus className="w-4 h-4" />
                                                Kết bạn
                                            </button>
                                            <button className="px-4 py-2 bg-[var(--cn-bg-hover)] hover:bg-[var(--cn-bg-hover-strong)] text-[var(--cn-text-main)] rounded-lg font-medium transition-colors flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Nhắn tin
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-6 mt-6 border-t border-[var(--cn-border)] pt-2">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === 'posts'
                                    ? 'text-[var(--cn-primary)]'
                                    : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                                    }`}
                            >
                                Bài viết
                                {activeTab === 'posts' && (
                                    <div className="absolute bottom-0 -left-1 -right-1 h-0.5 bg-[var(--cn-primary)] rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('friends')}
                                className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === 'friends'
                                    ? 'text-[var(--cn-primary)]'
                                    : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                                    }`}
                            >
                                Bạn bè
                                {activeTab === 'friends' && (
                                    <div className="absolute bottom-0 -left-1 -right-1 h-0.5 bg-[var(--cn-primary)] rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('favorites')}
                                className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === 'favorites'
                                    ? 'text-[var(--cn-primary)]'
                                    : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                                    }`}
                            >
                                Yêu thích
                                {activeTab === 'favorites' && (
                                    <div className="absolute bottom-0 -left-1 -right-1 h-0.5 bg-[var(--cn-primary)] rounded-full" />
                                )}
                            </button>
                            <div className="ml-auto">
                                <button className="p-2 hover:bg-[var(--cn-bg-hover)] rounded-lg transition-colors">
                                    <MoreHorizontal className="w-5 h-5 text-[var(--cn-text-sub)]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Intro Card */}
                        <div className="bg-[var(--cn-bg-card)] rounded-xl p-6 border border-[var(--cn-border)] shadow-sm">
                            <h3 className="text-lg font-bold text-[var(--cn-text-main)] mb-4">Giới thiệu</h3>
                            <div className="space-y-4">
                                {profileUser.bio && (
                                    <p className="text-sm text-[var(--cn-text-main)] text-center">
                                        {profileUser.bio}
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {profileUser.school && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <School className="w-5 h-5 text-[var(--cn-text-sub)] mt-0.5" />
                                            <div className="flex-1">
                                                <span className="text-[var(--cn-text-main)]">
                                                    Đã học tại <span className="font-medium">{profileUser.school}</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {profileUser.class && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <GraduationCap className="w-5 h-5 text-[var(--cn-text-sub)] mt-0.5" />
                                            <div className="flex-1">
                                                <span className="text-[var(--cn-text-main)] font-medium">
                                                    {profileUser.class}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {profileUser.province && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <MapPin className="w-5 h-5 text-[var(--cn-text-sub)] mt-0.5" />
                                            <div className="flex-1">
                                                <span className="text-[var(--cn-text-main)]">
                                                    Đến từ <span className="font-medium">{profileUser.province}</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 text-sm">
                                        <Globe className="w-5 h-5 text-[var(--cn-text-sub)] mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-[var(--cn-text-main)]">
                                                Tham gia vào {formatDate(profileUser.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        {(profileUser.coins > 0 || profileUser.streak > 0) && (
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
                                {profileUser.coins > 0 && (
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-6 h-6" />
                                            <span className="font-bold">CNcoins</span>
                                        </div>
                                        <div className="text-2xl font-black">{profileUser.coins.toLocaleString()}</div>
                                    </div>
                                )}
                                {profileUser.streak > 0 && (
                                    <div className={`flex items-center justify-between ${profileUser.coins > 0 ? 'pt-4 border-t border-white/20' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <Flame className="w-5 h-5" />
                                            <span className="text-sm">Streak</span>
                                        </div>
                                        <div className="font-bold">{profileUser.streak} ngày</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Friends Preview */}
                        <div className="bg-[var(--cn-bg-card)] rounded-xl p-6 border border-[var(--cn-border)] shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[var(--cn-text-main)]">Bạn bè</h3>
                                <Link href={`/p/${username}/friends`} className="text-sm text-[var(--cn-primary)] hover:underline">
                                    Xem tất cả
                                </Link>
                            </div>
                            <p className="text-sm text-[var(--cn-text-sub)] text-center py-8">
                                Chưa có bạn bè
                            </p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {activeTab === 'posts' && (
                            <div className="space-y-4">
                                {isOwnProfile && (
                                    <div
                                        onClick={() => router.push('/forum/thongtin')}
                                        className="bg-[var(--cn-bg-card)] rounded-2xl shadow-sm border border-[var(--cn-border)] p-3 sm:p-4 mb-4 cursor-pointer hover:bg-[var(--cn-bg-section)] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                                                <AvatarImage src={currentUser?.avatar} />
                                                <AvatarFallback className="text-sm sm:text-base font-bold bg-[var(--cn-primary)] text-white">
                                                    {currentUser?.fullName?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 bg-[var(--cn-bg-section)] rounded-full px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-500">
                                                {currentUser?.fullName}, hôm nay bạn nghĩ gì?
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <PostFeed />
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="bg-[var(--cn-bg-card)] rounded-xl p-12 border border-[var(--cn-border)] shadow-sm text-center">
                                <User className="w-16 h-16 text-[var(--cn-text-sub)] mx-auto mb-4 opacity-30" />
                                <h3 className="text-lg font-semibold text-[var(--cn-text-main)] mb-2">
                                    Chưa có bạn bè
                                </h3>
                                <p className="text-[var(--cn-text-sub)] text-sm">
                                    {isOwnProfile ? 'Hãy thêm bạn bè để kết nối!' : 'Người dùng này chưa có bạn bè nào'}
                                </p>
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="bg-[var(--cn-bg-card)] rounded-xl p-12 border border-[var(--cn-border)] shadow-sm text-center">
                                <Heart className="w-16 h-16 text-[var(--cn-text-sub)] mx-auto mb-4 opacity-30" />
                                <h3 className="text-lg font-semibold text-[var(--cn-text-main)] mb-2">
                                    Chưa có nội dung yêu thích
                                </h3>
                                <p className="text-[var(--cn-text-sub)] text-sm">
                                    {isOwnProfile ? 'Hãy thêm nội dung yêu thích của bạn!' : 'Người dùng này chưa có nội dung yêu thích nào'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
