'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { postApi } from '@/lib/api/post.api';
import { IPost } from '@/types/post.type';

export default function BlogPage(): React.ReactElement {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchPosts = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const result = await postApi.getPosts({
                page: page,
                limit: 8,
                status: 'published'
            });

            if (result.success) {
                setPosts(result.data);
                if (result.pagination) {
                    setTotalPosts(result.pagination.total);
                    setTotalPages(result.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error('Fetch posts error:', error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const filteredPosts = useMemo((): IPost[] => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return posts;
        return posts.filter((post) => {
            return (
                post.title.toLowerCase().includes(query) ||
                post.description.toLowerCase().includes(query) ||
                post.author.fullName.toLowerCase().includes(query)
            );
        });
    }, [searchTerm, posts]);

    const formatReadTime = (minutes: number): string => {
        if (minutes < 1) return '1 phút đọc';
        return `${minutes} phút đọc`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return date.toLocaleDateString('vi-VN');
    };

    if (loading && posts.length === 0) {
        return (
            <main className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <Skeleton className="h-9 w-64 mb-2" />
                            <Skeleton className="h-5 w-96" />
                        </div>
                        <div className="flex w-full max-w-lg gap-3">
                            <Skeleton className="h-10 w-[60%] lg:w-[74%] rounded-3xl" />
                            <Skeleton className="h-10 w-28 rounded-3xl" />
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="rounded-2xl overflow-hidden border">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                            Tất cả bài viết
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Tìm nhanh bài viết theo tiêu đề, nội dung hoặc tác giả.
                        </p>
                    </div>

                    <div className="flex w-full max-w-lg gap-3">
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm bài viết..."
                            className="w-[60%] lg:w-[74%] rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-800"
                        />

                        <Link
                            href="/me/baiviet/create"
                            className="flex items-center gap-2 rounded-3xl bg-black dark:bg-white px-3 py-2 text-sm text-white dark:text-black shadow hover:opacity-90 transition"
                        >
                            <Plus size={20} />
                            <span>Tạo blog</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                {filteredPosts.length} bài viết
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <BlogCard
                            key={post._id}
                            title={post.title}
                            description={post.description}
                            image={post.thumbnail}
                            time={formatReadTime(post.readTime)}
                            author={post.author.fullName}
                            avatar={post.author.avatar || '/avatar.png'}
                            category={post.category}
                            link={`/baiviet/${post.slug}`}
                        />
                    ))
                ) : (
                    <div className="col-span-full rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        {searchTerm ? 'Không tìm thấy bài viết phù hợp. Thử thay đổi từ khóa tìm kiếm.' : 'Chưa có bài viết nào.'}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={page >= totalPages}
                        className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Sau
                    </button>
                </div>
            )}
        </main>
    );
}