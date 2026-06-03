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
    Briefcase,
    Home,
    Flag
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

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

interface Post {
    _id: string;
    content: string;
    images?: string[];
    author: IUser;
    likes: string[];
    comments: number;
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { user: currentUser, token } = useAuthStore();

    const [profileUser, setProfileUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'favorites'>('posts');
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const isOwnProfile = currentUser?._id === profileUser?._id;

    useEffect(() => {
        fetchProfile();
        fetchPosts();
    }, [username]);

    const fetchProfile = async () => {
        try {
            if (currentUser && currentUser.username === username) {
                setProfileUser({
                    _id: currentUser._id,
                    email: currentUser.email,
                    username: currentUser.username || '',
                    fullName: currentUser.fullName,
                    avatar: currentUser.avatar || '',
                    coverPhoto: '',
                    role: currentUser.role,
                    isOnboarded: currentUser.isOnboarded || false,
                    class: '',
                    province: '',
                    school: '',
                    birthday: '',
                    bio: currentUser.bio || '',
                    coins: currentUser.coins || 0,
                    streak: currentUser.streak || 0,
                    createdAt: currentUser.createdAt instanceof Date ? currentUser.createdAt.toISOString() : new Date().toISOString(),
                    updatedAt: currentUser.updatedAt instanceof Date ? currentUser.updatedAt.toISOString() : new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Không thể tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            setPosts([]);
        } catch (error) {
            console.error('Error fetching posts:', error);
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

    const handleCreatePost = async () => {
        if (!newPost.trim()) {
            toast.error('Vui lòng nhập nội dung');
            return;
        }

        try {
            toast.success('Đã đăng bài viết');
            setNewPost('');
            setShowCreatePost(false);
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Có lỗi xảy ra');
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

    const formatPostDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Vừa xong';
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return formatDate(dateStr);
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
                                        <>
                                            <button
                                                onClick={() => setShowCreatePost(true)}
                                                className="px-4 py-2 bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] text-white rounded-lg font-medium transition-colors"
                                            >
                                                Tạo bài viết
                                            </button>
                                            <Link
                                                href="/settings"
                                                className="px-4 py-2 bg-[var(--cn-bg-hover)] hover:bg-[var(--cn-bg-hover-strong)] text-[var(--cn-text-main)] rounded-lg font-medium transition-colors"
                                            >
                                                Chỉnh sửa trang cá nhân
                                            </Link>
                                        </>
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
                                    <div className="flex items-start gap-3 text-sm">
                                        <Briefcase className="w-5 h-5 text-[var(--cn-text-sub)] mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-[var(--cn-text-main)]">
                                                Product Designer tại <span className="font-medium">FPT Software</span>
                                            </span>
                                        </div>
                                    </div>

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
                                                <span className="text-[var(--cn-text-main)]">
                                                    Lớp <span className="font-medium">{profileUser.class}</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 text-sm">
                                        <Home className="w-5 h-5 text-[var(--cn-text-sub)] mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-[var(--cn-text-main)]">
                                                Sống tại <span className="font-medium">Hà Nội</span>
                                            </span>
                                        </div>
                                    </div>

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
                                        <Heart className="w-5 h-5 text-[var(--cn-text-sub)] mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-[var(--cn-text-main)]">Độc thân</span>
                                        </div>
                                    </div>

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

                            {isOwnProfile && (
                                <button className="w-full mt-4 px-4 py-2 bg-[var(--cn-bg-hover)] hover:bg-[var(--cn-bg-hover-strong)] text-[var(--cn-text-main)] rounded-lg font-medium transition-colors text-sm">
                                    Chỉnh sửa chi tiết
                                </button>
                            )}
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
                            <>
                                {/* Create Post Box */}
                                {isOwnProfile && (
                                    <div className="bg-[var(--cn-bg-card)] rounded-xl p-4 border border-[var(--cn-border)] shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--cn-bg-hover)]">
                                                {profileUser.avatar ? (
                                                    <img src={profileUser.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-[var(--cn-text-sub)]" />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setShowCreatePost(true)}
                                                className="flex-1 px-4 py-2 bg-[var(--cn-bg-hover)] hover:bg-[var(--cn-bg-hover-strong)] rounded-full text-left text-[var(--cn-text-sub)] transition-colors"
                                            >
                                                Bạn đang nghĩ gì?
                                            </button>
                                        </div>
                                        <div className="border-t border-[var(--cn-border)] pt-3 grid grid-cols-3 gap-2">
                                            <button className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-[var(--cn-bg-hover)] rounded-lg transition-colors">
                                                <Video className="w-5 h-5 text-red-500" />
                                                <span className="text-sm font-medium text-[var(--cn-text-main)]">Video trực tiếp</span>
                                            </button>
                                            <button className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-[var(--cn-bg-hover)] rounded-lg transition-colors">
                                                <ImageIcon className="w-5 h-5 text-green-500" />
                                                <span className="text-sm font-medium text-[var(--cn-text-main)]">Ảnh/video</span>
                                            </button>
                                            <button className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-[var(--cn-bg-hover)] rounded-lg transition-colors">
                                                <Flag className="w-5 h-5 text-yellow-500" />
                                                <span className="text-sm font-medium text-[var(--cn-text-main)]">Sự kiện trong đời</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Create Post Modal */}
                                {showCreatePost && isOwnProfile && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-[var(--cn-bg-card)] rounded-xl max-w-lg w-full shadow-2xl">
                                            <div className="p-4 border-b border-[var(--cn-border)] flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-[var(--cn-text-main)]">Tạo bài viết</h3>
                                                <button
                                                    onClick={() => {
                                                        setShowCreatePost(false);
                                                        setNewPost('');
                                                    }}
                                                    className="p-2 hover:bg-[var(--cn-bg-hover)] rounded-full transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--cn-bg-hover)]">
                                                        {profileUser.avatar ? (
                                                            <img src={profileUser.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <User className="w-5 h-5 text-[var(--cn-text-sub)]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-[var(--cn-text-main)]">{profileUser.fullName}</span>
                                                </div>
                                                <textarea
                                                    value={newPost}
                                                    onChange={(e) => setNewPost(e.target.value)}
                                                    placeholder="Bạn đang nghĩ gì?"
                                                    className="w-full p-4 bg-[var(--cn-bg-main)] border border-[var(--cn-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--cn-primary)] text-[var(--cn-text-main)]"
                                                    rows={6}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleCreatePost}
                                                    disabled={!newPost.trim()}
                                                    className="w-full mt-4 px-4 py-2 bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Đăng
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Posts List */}
                                {posts.length === 0 ? (
                                    <div className="bg-[var(--cn-bg-card)] rounded-xl p-12 border border-[var(--cn-border)] shadow-sm text-center">
                                        <MessageCircle className="w-16 h-16 text-[var(--cn-text-sub)] mx-auto mb-4 opacity-30" />
                                        <h3 className="text-lg font-semibold text-[var(--cn-text-main)] mb-2">
                                            Chưa có bài viết nào
                                        </h3>
                                        <p className="text-[var(--cn-text-sub)] text-sm">
                                            {isOwnProfile ? 'Hãy tạo bài viết đầu tiên của bạn!' : 'Người dùng này chưa đăng bài viết nào'}
                                        </p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div key={post._id} className="bg-[var(--cn-bg-card)] rounded-xl p-6 border border-[var(--cn-border)] shadow-sm">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--cn-bg-hover)]">
                                                        {post.author.avatar ? (
                                                            <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <User className="w-5 h-5 text-[var(--cn-text-sub)]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[var(--cn-text-main)]">{post.author.fullName}</p>
                                                        <p className="text-xs text-[var(--cn-text-sub)]">{formatPostDate(post.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 hover:bg-[var(--cn-bg-hover)] rounded-lg transition-colors">
                                                    <MoreHorizontal className="w-5 h-5 text-[var(--cn-text-sub)]" />
                                                </button>
                                            </div>
                                            <p className="text-[var(--cn-text-main)] mb-4 whitespace-pre-wrap">{post.content}</p>
                                            {post.images && post.images.length > 0 && (
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    {post.images.map((img, idx) => (
                                                        <img key={idx} src={img} alt="" className="w-full rounded-lg" />
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-6 pt-4 border-t border-[var(--cn-border)]">
                                                <button className="flex items-center gap-2 text-[var(--cn-text-sub)] hover:text-[var(--cn-primary)] transition-colors">
                                                    <Heart className="w-5 h-5" />
                                                    <span className="text-sm">{post.likes.length}</span>
                                                </button>
                                                <button className="flex items-center gap-2 text-[var(--cn-text-sub)] hover:text-[var(--cn-primary)] transition-colors">
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span className="text-sm">{post.comments}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </>
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
