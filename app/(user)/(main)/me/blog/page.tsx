'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { blogApi, Blog } from '@/lib/api/blog.api';
import { toast } from 'sonner';
import { Plus, Edit, Eye, Heart, MessageCircle, Calendar, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function MyBlogsPage() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Bài viết của tôi</h1>
                        <p className="text-gray-500 mt-1">Quản lý các bài viết bạn đã tạo</p>
                    </div>
                    <Link
                        href="/blog/create"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo bài viết
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Edit className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có bài viết nào</h3>
                        <p className="text-gray-500 mb-6">Bắt đầu chia sẻ kiến thức của bạn ngay hôm nay!</p>
                        <Link
                            href="/blog/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo bài viết đầu tiên
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6">
                            {blogs.map(blog => (
                                <div key={blog._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                                    <div className="flex gap-4 p-6">
                                        {blog.thumbnail && (
                                            <Link href={`/blog/${blog.slug}`} className="flex-shrink-0">
                                                <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-100">
                                                    <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
                                                </div>
                                            </Link>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <Link href={`/blog/${blog.slug}`} className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition line-clamp-2">
                                                        {blog.title}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${blog.isPublished
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {blog.isPublished ? 'Đã xuất bản' : 'Nháp'}
                                                    </span>
                                                    <Link
                                                        href={`/blog/edit/${blog._id}`}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4 text-gray-600" />
                                                    </Link>
                                                </div>
                                            </div>

                                            {blog.excerpt && (
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                    {blog.excerpt}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(blog.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    {blog.viewCount}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-4 h-4" />
                                                    {blog.likeCount}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="w-4 h-4" />
                                                    {blog.commentCount}
                                                </div>
                                            </div>

                                            {blog.tags && blog.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {blog.tags.slice(0, 3).map((tag, index) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                    {blog.tags.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                                                            +{blog.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2 text-gray-600">
                                    Trang {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}