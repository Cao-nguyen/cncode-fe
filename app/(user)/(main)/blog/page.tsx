'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { blogApi, Blog } from '@/lib/api/blog.api';
import { toast } from 'sonner';
import { Clock, Eye, Loader2, BookOpen, FileText, Plus } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { useAuthStore } from '@/store/auth.store';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'technology', label: 'Công nghệ' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'news', label: 'Tin tức' },
    { value: 'contest', label: 'Cuộc thi' },
    { value: 'other', label: 'Khác' }
];

export default function BlogPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        fetchBlogs();
    }, [page, category, search]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await blogApi.getBlogs({
                page,
                limit: 12,
                category: category === 'all' ? undefined : category,
                search: search || undefined
            });
            if (res.success) {
                setBlogs(res.data);
                setTotalPages(res.pagination.totalPages);
            }
        } catch (error) {
            toast.error('Không thể tải bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
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
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--cn-text-main)' }}>
                                <FileText className="w-8 h-8" style={{ color: 'var(--cn-primary)' }} />
                                Blog CNcode
                            </h1>
                            <p style={{ color: 'var(--cn-text-sub)' }}>Chia sẻ kiến thức và kinh nghiệm lập trình</p>
                        </div>
                        {user && (
                            <CustomButton onClick={() => router.push('/blog/create')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo bài viết
                            </CustomButton>
                        )}
                    </div>
                </div>

                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                            <CustomInputSearch
                                placeholder="Tìm kiếm bài viết..."
                                value={search}
                                onChange={handleSearch}
                                size="medium"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <CustomSelect
                                value={category}
                                onChange={(value) => setCategory(value)}
                                options={CATEGORIES}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}>
                                <div className="w-full h-[200px] bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>
                                    <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--cn-border)' }} />
                        <p style={{ color: 'var(--cn-text-sub)' }}>Chưa có bài viết nào</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <Link
                                    key={blog._id}
                                    href={`/blog/${blog.slug}`}
                                    className="rounded-xl overflow-hidden transition group flex flex-col cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--cn-bg-card)',
                                        border: '1px solid var(--cn-border)',
                                        boxShadow: 'var(--cn-shadow-sm)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--cn-shadow-lg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--cn-shadow-sm)'}
                                >
                                    {blog.thumbnail && (
                                        <div className="w-full h-[200px] overflow-hidden relative" style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                                            <img
                                                src={(() => {
                                                    if (!blog.thumbnail) return '';
                                                    // Extract messageId from URL if it's a proxy URL
                                                    const messageIdMatch = blog.thumbnail.match(/\/proxy\/file\/(\d+)/);
                                                    if (messageIdMatch) {
                                                        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/proxy/file/${messageIdMatch[1]}`;
                                                    }
                                                    // If it's already a full URL, replace backend URL with NEXT_PUBLIC_API_URL
                                                    if (blog.thumbnail.startsWith('http')) {
                                                        return blog.thumbnail.replace(/https?:\/\/[^\/]+/, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
                                                    }
                                                    // Otherwise, assume it's a messageId
                                                    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/proxy/file/${blog.thumbnail}`;
                                                })()}
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

                                        <h3 className="text-lg font-semibold mb-2 line-clamp-2 transition min-h-[3.5rem] text-justify"
                                            style={{ color: 'var(--cn-text-main)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cn-primary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cn-text-main)'}
                                        >
                                            {blog.title}
                                        </h3>

                                        <div className="mb-4 flex-1 min-h-[4.5rem] overflow-hidden">
                                            <p className="text-sm line-clamp-3 text-justify" style={{ color: 'var(--cn-text-sub)' }}>
                                                {blog.excerpt || getExcerpt(blog.content)}
                                            </p>
                                        </div>

                                        <div className="pt-3" style={{ borderTop: '1px solid var(--cn-border)' }}>
                                            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--cn-text-main)' }}>
                                                {blog.author.avatar && (
                                                    <img
                                                        src={blog.author.avatar}
                                                        alt={blog.author.fullName}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                )}
                                                <span className="font-medium">{blog.author.fullName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
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
        </div>
    );
}