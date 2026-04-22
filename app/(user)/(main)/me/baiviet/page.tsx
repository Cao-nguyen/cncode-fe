'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Plus, FileText, AlertCircle, CheckCircle, Clock, Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { postApi } from '@/lib/api/post.api';
import { useAuthStore } from '@/store/auth.store';
import { IPost } from '@/types/post.type';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'published':
            return { label: 'Đã duyệt', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircle };
        case 'pending':
            return { label: 'Chờ duyệt', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: Clock };
        case 'rejected':
            return { label: 'Bị từ chối', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: AlertCircle };
        case 'draft':
            return { label: 'Bản nháp', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400', icon: FileText };
        default:
            return { label: status, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400', icon: AlertCircle };
    }
};

export default function MyPostsPage() {
    const { token, user } = useAuthStore();
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPosts = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await postApi.getUserPosts(token);

            if (result.success) {
                setPosts(result.data || []);
            } else {
                setError(result.message || 'Không thể tải bài viết');
                toast.error(result.message || 'Lỗi khi tải bài viết');
            }
        } catch (error: any) {
            console.error('Fetch posts error:', error);
            setError(error.message || 'Có lỗi xảy ra khi tải bài viết');
            toast.error('Lỗi khi tải bài viết');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDelete = async () => {
        if (!deleteTarget || !token) return;

        setIsDeleting(true);
        try {
            const result = await postApi.deletePost(deleteTarget.id, token);
            if (result.success) {
                toast.success('Xóa bài viết thành công');
                setPosts(prev => prev.filter(p => p._id !== deleteTarget.id));
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi xóa');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
                <div className="container mx-auto px-5 lg:px-10">
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
                        <p className="text-gray-500">Đang tải bài viết...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
                <div className="container mx-auto px-5 lg:px-10">
                    <div className="bg-white dark:bg-[#171717] rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                        <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lỗi tải bài viết</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={fetchPosts}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
            <div className="container mx-auto px-5 lg:px-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bài viết của tôi</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý các bài viết bạn đã đăng</p>
                    </div>
                    <Link
                        href="/me/baiviet/create"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        <span>Viết bài mới</span>
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <div className="bg-white dark:bg-[#171717] rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                        <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chưa có bài viết</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Bạn chưa viết bài nào</p>
                        <Link
                            href="/me/baiviet/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Viết bài ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {posts.map((post) => {
                            const StatusBadge = getStatusBadge(post.status);
                            const StatusIcon = StatusBadge.icon;

                            return (
                                <div
                                    key={post._id}
                                    className="bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-800"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4 p-5">
                                        <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                            <Image
                                                width={128}
                                                height={128}
                                                src={post.thumbnail || '/placeholder.jpg'}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder.jpg';
                                                }}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
                                                        {post.title}
                                                    </h3>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${StatusBadge.color}`}>
                                                        <StatusIcon size={12} />
                                                        <span>{StatusBadge.label}</span>
                                                    </div>
                                                    {post.reportCount > 0 && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ml-2">
                                                            <Flag size={12} />
                                                            <span>{post.reportCount} báo cáo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-3">
                                                <span>Lượt xem: {post.views?.toLocaleString() || 0}</span>
                                                <span>Lượt thích: {post.likes?.toLocaleString() || 0}</span>
                                                <span>Ngày đăng: {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <Link
                                                    href={`/baiviet/${post.slug}`}
                                                    target="_blank"
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    Xem
                                                </Link>
                                                <Link
                                                    href={`/me/baiviet/edit/${post._id}`}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                >
                                                    <Edit size={14} />
                                                    Sửa
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget({ id: post._id, title: post.title })}
                                                    disabled={isDeleting && deleteTarget?.id === post._id}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isDeleting && deleteTarget?.id === post._id ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" />
                                                            Đang xóa...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 size={14} />
                                                            Xóa
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {post.status === 'rejected' && (post as any).rejectionReason && (
                                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                                    <p className="text-sm text-red-700 dark:text-red-400">
                                                        <strong>Lý do từ chối:</strong> {(post as any).rejectionReason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => !isDeleting && setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa bài viết"
                message={`Bạn có chắc chắn muốn xóa bài viết "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
                confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
                cancelText="Hủy"
                isConfirmLoading={isDeleting}
            />
        </div>
    );
}