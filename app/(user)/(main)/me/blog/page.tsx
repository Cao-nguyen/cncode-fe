// app/me/blog/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Hash,
    CheckCircle,
    Clock,
    Archive,
    TrendingUp,
    MessageCircle,
    Heart
} from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    thumbnail: string | null;
    description: string;
    hashtags: string[];
    status: 'published' | 'draft' | 'archived';
    views: number;
    likes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
}

export default function MyBlogPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Mock data
    useEffect(() => {
        loadMockData();
    }, []);

    const loadMockData = () => {
        setIsLoading(true);
        setTimeout(() => {
            const mockPosts: BlogPost[] = [
                {
                    id: '1',
                    title: 'Hướng dẫn sử dụng Next.js 14 mới nhất',
                    content: '<p>Nội dung bài viết...</p>',
                    thumbnail: 'https://picsum.photos/id/1/400/240',
                    description: 'Next.js 14 mang đến nhiều tính năng mới thú vị như Server Actions, Partial Prerendering...',
                    hashtags: ['nextjs', 'react', 'webdev'],
                    status: 'published',
                    views: 1250,
                    likes: 89,
                    comments: 12,
                    createdAt: '2024-01-15T10:00:00Z',
                    updatedAt: '2024-01-15T10:00:00Z',
                },
                {
                    id: '2',
                    title: 'Tailwind CSS Tips and Tricks cho người mới',
                    content: '<p>Nội dung bài viết...</p>',
                    thumbnail: 'https://picsum.photos/id/2/400/240',
                    description: 'Những mẹo hay khi sử dụng Tailwind CSS giúp bạn code nhanh hơn...',
                    hashtags: ['tailwindcss', 'css', 'design'],
                    status: 'published',
                    views: 890,
                    likes: 45,
                    comments: 8,
                    createdAt: '2024-01-10T14:30:00Z',
                    updatedAt: '2024-01-10T14:30:00Z',
                },
                {
                    id: '3',
                    title: 'TypeScript cho người mới bắt đầu - Từ A đến Z',
                    content: '<p>Nội dung bài viết...</p>',
                    thumbnail: null,
                    description: 'Học TypeScript từ cơ bản đến nâng cao với nhiều ví dụ thực tế...',
                    hashtags: ['typescript', 'javascript', 'programming'],
                    status: 'draft',
                    views: 0,
                    likes: 0,
                    comments: 0,
                    createdAt: '2024-01-20T09:00:00Z',
                    updatedAt: '2024-01-20T09:00:00Z',
                },
                {
                    id: '4',
                    title: 'React Performance Optimization: Best Practices',
                    content: '<p>Nội dung bài viết...</p>',
                    thumbnail: 'https://picsum.photos/id/4/400/240',
                    description: 'Tối ưu hiệu suất React application với memo, useCallback, useMemo...',
                    hashtags: ['react', 'performance', 'webdev'],
                    status: 'archived',
                    views: 320,
                    likes: 28,
                    comments: 5,
                    createdAt: '2023-12-05T11:00:00Z',
                    updatedAt: '2023-12-05T11:00:00Z',
                },
            ];
            setPosts(mockPosts);
            setIsLoading(false);
        }, 500);
    };

    // Filter posts
    useEffect(() => {
        let result = [...posts];

        if (searchTerm) {
            result = result.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (activeTab !== 'all') {
            result = result.filter(post => post.status === activeTab);
        }

        setFilteredPosts(result);
    }, [posts, searchTerm, activeTab]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'draft': return <Clock className="w-3.5 h-3.5" />;
            case 'archived': return <Archive className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'text-green-600 bg-green-50';
            case 'draft': return 'text-yellow-600 bg-yellow-50';
            case 'archived': return 'text-gray-500 bg-gray-100';
            default: return '';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'published': return 'Đã đăng';
            case 'draft': return 'Bản nháp';
            case 'archived': return 'Đã lưu trữ';
            default: return '';
        }
    };

    const tabs = [
        { id: 'all', label: 'Tất cả', icon: null },
        { id: 'published', label: 'Đã đăng', icon: CheckCircle },
        { id: 'draft', label: 'Nháp', icon: Clock },
        { id: 'archived', label: 'Lưu trữ', icon: Archive },
    ];

    const getCount = (status: string) => {
        if (status === 'all') return posts.length;
        return posts.filter(p => p.status === status).length;
    };

    const handleDelete = (post: BlogPost) => {
        setSelectedPost(post);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedPost) {
            setPosts(posts.filter(p => p.id !== selectedPost.id));
            setShowDeleteModal(false);
            setSelectedPost(null);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--cn-bg-main)]">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[var(--cn-primary)]/5 to-transparent border-b border-[var(--cn-border)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">
                                Bài viết của tôi
                            </h1>
                            <p className="text-sm text-[var(--cn-text-muted)] mt-1">
                                Quản lý tất cả bài viết bạn đã tạo
                            </p>
                        </div>
                        <Link href="/blog/create">
                            <CustomButton variant="primary" size="medium" className="!px-5">
                                <Plus className="w-4 h-4" />
                                <span>Viết bài mới</span>
                            </CustomButton>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Search Bar */}
                <div className="mb-6">
                    <CustomInput
                        placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung hoặc hashtag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                        filled
                    />
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 border-b border-[var(--cn-border)] mb-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const count = getCount(tab.id);
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all relative
                                    ${isActive
                                        ? 'text-[var(--cn-primary)]'
                                        : 'text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)]'
                                    }
                                `}
                            >
                                {Icon && <Icon className="w-3.5 h-3.5" />}
                                <span>{tab.label}</span>
                                <span className={`
                                    text-xs px-1.5 py-0.5 rounded-full
                                    ${isActive
                                        ? 'bg-[var(--cn-primary)]/10 text-[var(--cn-primary)]'
                                        : 'bg-[var(--cn-bg-section)] text-[var(--cn-text-muted)]'
                                    }
                                `}>
                                    {count}
                                </span>
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--cn-primary)] rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-[var(--cn-bg-section)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-[var(--cn-text-muted)]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--cn-text-main)] mb-1">
                            {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có bài viết nào'}
                        </h3>
                        <p className="text-sm text-[var(--cn-text-muted)]">
                            {searchTerm
                                ? 'Thử tìm kiếm với từ khóa khác'
                                : 'Hãy tạo bài viết đầu tiên của bạn'}
                        </p>
                        {!searchTerm && (
                            <Link href="/blog/create" className="inline-block mt-4">
                                <CustomButton variant="primary" size="medium">
                                    <Plus className="w-4 h-4" />
                                    <span>Tạo bài viết ngay</span>
                                </CustomButton>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredPosts.map((post) => (
                            <div
                                key={post.id}
                                className="group bg-[var(--cn-bg-card)] rounded-xl border border-[var(--cn-border)] hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Thumbnail */}
                                    {post.thumbnail && (
                                        <div className="md:w-56 lg:w-64 h-48 md:h-auto relative bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                                            <Image
                                                src={post.thumbnail}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 p-5">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <Link href={`/blog/${post.id}`} className="flex-1">
                                                <h3 className="text-lg font-semibold text-[var(--cn-text-main)] hover:text-[var(--cn-primary)] transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)} flex-shrink-0`}>
                                                {getStatusIcon(post.status)}
                                                <span>{getStatusText(post.status)}</span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-[var(--cn-text-sub)] mb-3 line-clamp-2">
                                            {post.description}
                                        </p>

                                        {/* Hashtags */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {post.hashtags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[var(--cn-primary-light)] text-[var(--cn-primary)] rounded-full text-xs"
                                                >
                                                    <Hash className="w-2.5 h-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {post.hashtags.length > 3 && (
                                                <span className="text-xs text-[var(--cn-text-muted)]">
                                                    +{post.hashtags.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--cn-text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(post.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {post.views.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-3 h-3" />
                                                {post.likes.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" />
                                                {post.comments}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col justify-end gap-1 p-3 border-t md:border-t-0 md:border-l border-[var(--cn-border)] bg-[var(--cn-bg-section)]">
                                        <button
                                            onClick={() => router.push(`/blog/${post.id}`)}
                                            className="p-2 rounded-lg hover:bg-white transition-colors group/btn"
                                            title="Xem bài viết"
                                        >
                                            <Eye className="w-4 h-4 text-[var(--cn-text-muted)] group-hover/btn:text-[var(--cn-primary)]" />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/me/blog/edit/${post.id}`)}
                                            className="p-2 rounded-lg hover:bg-white transition-colors group/btn"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit className="w-4 h-4 text-[var(--cn-text-muted)] group-hover/btn:text-[var(--cn-primary)]" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post)}
                                            className="p-2 rounded-lg hover:bg-white transition-colors group/btn"
                                            title="Xóa bài viết"
                                        >
                                            <Trash2 className="w-4 h-4 text-[var(--cn-text-muted)] group-hover/btn:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--cn-bg-card)] rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-xl animate-slideUp">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-center text-[var(--cn-text-main)] mb-2">
                                Xóa bài viết?
                            </h3>
                            <p className="text-sm text-center text-[var(--cn-text-sub)] mb-6">
                                Bạn có chắc chắn muốn xóa "<span className="font-medium text-[var(--cn-text-main)]">{selectedPost.title}</span>"?<br />
                                Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 border border-[var(--cn-border)] rounded-lg text-sm font-medium text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)] transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}