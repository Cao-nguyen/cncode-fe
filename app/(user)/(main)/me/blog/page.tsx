'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { blogApi, Blog } from '@/lib/api/blog.api';
import { toast } from 'sonner';
import { Plus, Edit, Eye, Heart, Clock, Loader2, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { CustomButton } from '@/components/custom/CustomButton';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';

const CATEGORIES = [
    { value: 'technology', label: 'Công nghệ' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'news', label: 'Tin tức' },
    { value: 'contest', label: 'Cuộc thi' },
    { value: 'other', label: 'Khác' }
];

export default function MyBlogsPage() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState<Blog | null>(null);

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchMyBlogs();
    }, [page, token]);

    const fetchMyBlogs = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await blogApi.getMyBlogs({ page, limit: 12 });
            if (res.success) {
                setBlogs(res.data);
                setTotalPages(res.pagination.totalPages);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const res = await blogApi.deleteBlog(deleteConfirm._id);
            if (res.success) {
                toast.success('Xóa bài viết thành công');
                setDeleteConfirm(null);
                fetchMyBlogs();
            } else {
                toast.error(res.message || 'Không thể xóa bài viết');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa bài viết');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const stripHtml = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const getExcerpt = (content: string, maxLength: number = 150) => {
        const text = stripHtml(content);
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--cn-text-main)' }}>
                                Bài viết của tôi
                            </h1>
                            <p style={{ color: 'var(--cn-text-sub)' }}>Quản lý các bài viết bạn đã tạo</p>
                        </div>
                        <CustomButton onClick={() => router.push('/blog/create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo bài viết
                        </CustomButton>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--cn-primary)' }} />
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20 rounded-xl" style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                            <Edit className="w-8 h-8" style={{ color: 'var(--cn-text-sub)' }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--cn-text-main)' }}>Chưa có bài viết nào</h3>
                        <p className="mb-6" style={{ color: 'var(--cn-text-sub)' }}>Bắt đầu chia sẻ kiến thức của bạn ngay hôm nay!</p>
                        <CustomButton onClick={() => router.push('/blog/create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo bài viết đầu tiên
                        </CustomButton>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <div
                                    key={blog._id}
                                    className="rounded-xl overflow-hidden transition group flex flex-col"
                                    style={{
                                        backgroundColor: 'var(--cn-bg-card)',
                                        border: '1px solid var(--cn-border)',
                                        boxShadow: 'var(--cn-shadow-sm)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--cn-shadow-lg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--cn-shadow-sm)'}
                                >
                                    {blog.thumbnail && (
                                        <Link href={`/blog/${blog.slug}`}>
                                            <div className="w-full h-[200px] overflow-hidden relative" style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                                                <img
                                                    src={blog.thumbnail}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                                    style={{ aspectRatio: '1500/1000' }}
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <span className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
                                                        style={{
                                                            backgroundColor: 'rgba(59, 130, 246, 0.9)',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {CATEGORIES.find(c => c.value === blog.category)?.label || 'Khác'}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--cn-text-sub)' }}>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDate(blog.publishedAt || blog.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" />
                                                {blog.viewCount}
                                            </div>
                                        </div>

                                        <Link href={`/blog/${blog.slug}`}>
                                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 transition min-h-[3.5rem] text-justify"
                                                style={{ color: 'var(--cn-text-main)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cn-primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cn-text-main)'}
                                            >
                                                {blog.title}
                                            </h3>
                                        </Link>

                                        <div className="mb-4 flex-1 min-h-[4.5rem] overflow-hidden">
                                            <p className="text-sm line-clamp-3 text-justify" style={{ color: 'var(--cn-text-sub)' }}>
                                                {blog.excerpt || getExcerpt(blog.content)}
                                            </p>
                                        </div>

                                        {/* Status and Actions */}
                                        <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--cn-border)' }}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {blog.isPublished ? (
                                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                                            Đã xuất bản
                                                        </span>
                                                    ) : blog.needsReview ? (
                                                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                                                            <RefreshCw className="w-3 h-3" />
                                                            Chờ duyệt lại
                                                        </span>
                                                    ) : blog.rejectionReason ? (
                                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                                            Bị từ chối
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                                                            Bản nháp
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="w-4 h-4 text-red-500" data-filled={true} />
                                                        <span className="text-sm" style={{ color: 'var(--cn-text-sub)' }}>{blog.likeCount}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        href={`/blog/edit/${blog._id}`}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" style={{ color: 'var(--cn-text-sub)' }} />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(blog)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Rejection Reason */}
                                            {blog.rejectionReason && (
                                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">Lý do từ chối:</p>
                                                            <p className="text-xs text-red-700 dark:text-red-400">{blog.rejectionReason}</p>
                                                            {!blog.needsReview && (
                                                                <Link
                                                                    href={`/blog/edit/${blog._id}`}
                                                                    className="inline-flex items-center gap-1 mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                    Chỉnh sửa và gửi lại
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <CustomButton
                                    variant="secondary"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Trước
                                </CustomButton>
                                <span className="px-4 py-2 flex items-center text-sm" style={{ color: 'var(--cn-text-sub)' }}>
                                    Trang {page} / {totalPages}
                                </span>
                                <CustomButton
                                    variant="secondary"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Sau
                                </CustomButton>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmModalDelete
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={handleDelete}
                    title="Xác nhận xóa"
                    message={`Bạn có chắc chắn muốn xóa bài viết "${deleteConfirm.title}"?`}
                />
            )}
        </div>
    );
}