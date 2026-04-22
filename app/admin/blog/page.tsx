'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Plus,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Search,
    X,
    Loader2,
    Check,
    Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { postApi } from '@/lib/api/post.api';
import { useAuthStore } from '@/store/auth.store';
import { IPost } from '@/types/post.type';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Mở rộng interface IPost để thêm rejectionReason
interface IPostWithReason extends IPost {
    rejectionReason?: string;
}

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

export default function AdminBlogPage() {
    const { token, user } = useAuthStore();
    const [posts, setPosts] = useState<IPostWithReason[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [reviewDialog, setReviewDialog] = useState<{ isOpen: boolean; post: IPostWithReason | null; action: 'approve' | 'reject' | null }>({
        isOpen: false,
        post: null,
        action: null,
    });
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPosts = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const result = await postApi.adminGetAllPosts(token, {
                status: statusFilter === 'all' ? undefined : statusFilter,
                search: searchTerm || undefined,
                limit: 100,
            });

            if (result.success) {
                setPosts(result.data);
            } else {
                toast.error(result.message || 'Lỗi khi tải bài viết');
            }
        } catch (error) {
            console.error('Fetch posts error:', error);
            toast.error('Lỗi khi tải bài viết');
        } finally {
            setLoading(false);
        }
    }, [token, statusFilter, searchTerm]);

    useEffect(() => {
        if (token && user?.role === 'admin') {
            fetchPosts();
        }
    }, [token, user, fetchPosts]);

    const handleDelete = async () => {
        if (!deleteTarget || !token) return;
        setIsDeleting(true);
        try {
            const result = await postApi.adminDeletePost(deleteTarget.id, token);
            if (result.success) {
                toast.success('Xóa bài viết thành công');
                setPosts(posts.filter(p => p._id !== deleteTarget.id));
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleReview = async () => {
        if (!reviewDialog.post || !token) return;
        if (reviewDialog.action === 'reject' && !rejectReason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }

        setIsSubmitting(true);
        try {
            const newStatus = reviewDialog.action === 'approve' ? 'published' : 'rejected';
            const result = await postApi.adminReviewPost(reviewDialog.post._id, {
                status: newStatus,
                rejectionReason: reviewDialog.action === 'reject' ? rejectReason : undefined
            }, token);

            if (result.success) {
                toast.success(reviewDialog.action === 'approve' ? 'Đã duyệt bài viết' : 'Đã từ chối bài viết');
                fetchPosts();
                setReviewDialog({ isOpen: false, post: null, action: null });
                setRejectReason('');
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pendingPosts = posts.filter(p => p.status === 'pending');
    const otherPosts = posts.filter(p => p.status !== 'pending');

    if (loading) {
        return (
            <div className="min-h-screen py-10">
                <div className="container mx-auto px-5 lg:px-10">
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10">
            <div className="container mx-auto px-5 lg:px-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý bài viết</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý tất cả bài viết trên hệ thống</p>
                    </div>
                    <Link
                        href="/admin/blog/create"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        <span>Viết bài mới</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] rounded-xl">
                            <SelectValue placeholder="Lọc theo trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="pending">Chờ duyệt</SelectItem>
                            <SelectItem value="published">Đã duyệt</SelectItem>
                            <SelectItem value="rejected">Bị từ chối</SelectItem>
                            <SelectItem value="draft">Bản nháp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Bài viết chờ duyệt */}
                {statusFilter === 'all' && pendingPosts.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-yellow-500" />
                            Bài viết chờ duyệt ({pendingPosts.length})
                        </h2>
                        <div className="grid gap-4">
                            {pendingPosts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onDelete={(id, title) => setDeleteTarget({ id, title })}
                                    onReview={(post, action) => setReviewDialog({ isOpen: true, post, action })}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Các bài viết khác */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        {statusFilter === 'all' ? 'Tất cả bài viết' : 'Kết quả tìm kiếm'}
                    </h2>
                    {otherPosts.length === 0 ? (
                        <div className="bg-white dark:bg-[#171717] rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Không có bài viết</h3>
                            <p className="text-gray-600 dark:text-gray-400">Chưa có bài viết nào trong danh sách này</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {otherPosts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onDelete={(id, title) => setDeleteTarget({ id, title })}
                                    onReview={(post, action) => setReviewDialog({ isOpen: true, post, action })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Delete Dialog */}
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

            {/* Review Dialog */}
            <Dialog open={reviewDialog.isOpen} onOpenChange={(open) => !open && setReviewDialog({ isOpen: false, post: null, action: null })}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {reviewDialog.action === 'approve' ? 'Duyệt bài viết' : 'Từ chối bài viết'}
                        </DialogTitle>
                        <DialogDescription>
                            {reviewDialog.action === 'approve'
                                ? `Bạn có chắc chắn muốn duyệt bài viết "${reviewDialog.post?.title}"?`
                                : `Vui lòng nhập lý do từ chối bài viết "${reviewDialog.post?.title}"`}
                        </DialogDescription>
                    </DialogHeader>

                    {reviewDialog.action === 'reject' && (
                        <div className="py-4">
                            <Textarea
                                placeholder="Nhập lý do từ chối..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                className="rounded-xl resize-none"
                            />
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setReviewDialog({ isOpen: false, post: null, action: null })}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant={reviewDialog.action === 'approve' ? 'default' : 'destructive'}
                            onClick={handleReview}
                            disabled={isSubmitting || (reviewDialog.action === 'reject' && !rejectReason.trim())}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                reviewDialog.action === 'approve' ? 'Duyệt bài' : 'Từ chối'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Component PostCard
function PostCard({ post, onDelete, onReview }: {
    post: IPostWithReason;
    onDelete: (id: string, title: string) => void;
    onReview: (post: IPostWithReason, action: 'approve' | 'reject') => void;
}) {
    const StatusBadge = getStatusBadge(post.status);
    const StatusIcon = StatusBadge.icon;

    return (
        <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4 p-5">
                <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                        width={128}
                        height={128}
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
                                {post.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tác giả: {post.author?.fullName || 'Unknown'}
                            </p>
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

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span>Lượt xem: {post.views.toLocaleString()}</span>
                        <span>Lượt thích: {post.likes.toLocaleString()}</span>
                        <span>Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/baiviet/${post.slug}`}
                            target="_blank"
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Eye size={14} />
                            Xem
                        </Link>
                        <Link
                            href={`/admin/blog/edit/${post._id}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <Edit size={14} />
                            Sửa
                        </Link>
                        {post.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => onReview(post, 'approve')}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                >
                                    <Check size={14} />
                                    Duyệt
                                </button>
                                <button
                                    onClick={() => onReview(post, 'reject')}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <X size={14} />
                                    Từ chối
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => onDelete(post._id, post.title)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <Trash2 size={14} />
                            Xóa
                        </button>
                    </div>

                    {post.status === 'rejected' && post.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-400">
                                <strong>Lý do từ chối:</strong> {post.rejectionReason}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}