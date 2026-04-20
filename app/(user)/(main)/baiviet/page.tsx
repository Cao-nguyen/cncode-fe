'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { postApi } from '@/lib/api/post.api';
import { IPost } from '@/types/post.type';

const LIMIT = 8;

function BlogCardSkeleton() {
    return (
        <div className="rounded-2xl overflow-hidden border">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-32" />
            </div>
        </div>
    );
}

export default function BlogPage(): React.ReactElement {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const abortRef = useRef<AbortController | null>(null);

    const fetchPosts = useCallback(async (currentPage: number): Promise<void> => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        try {
            const result = await postApi.getPosts({
                page: currentPage,
                limit: LIMIT,
                status: 'published',
            });

            if (result.success) {
                setPosts(result.data);
                if (result.pagination) {
                    setTotalPosts(result.pagination.total);
                    setTotalPages(result.pagination.totalPages);
                }
            }
        } catch {
            // bỏ qua lỗi abort
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts(page);
    }, [fetchPosts, page]);

    const filteredPosts = useMemo((): IPost[] => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return posts;
        return posts.filter(
            (post) =>
                post.title.toLowerCase().includes(query) ||
                post.description.toLowerCase().includes(query) ||
                post.author.fullName.toLowerCase().includes(query),
        );
    }, [searchTerm, posts]);

    const formatReadTime = (minutes: number): string => {
        if (minutes < 1) return '1 phút đọc';
        return `${minutes} phút đọc`;
    };

    return (
        <main className="px-4 py-5 sm:px-5 lg:px-10 mx-auto">
            {/* Header với title bên trái, search + button bên phải */}
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        Tất cả bài viết
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Khám phá kiến thức công nghệ và đổi mới sáng tạo
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <Input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm bài viết..."
                            className="w-full md:w-80 pl-10 rounded-full border-slate-200 dark:border-slate-700 focus:border-black dark:focus:border-white"
                        />
                    </div>
                    <Link href="/me/baiviet/create">
                        <Button className="rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90">
                            <Plus size={18} className="mr-1" />
                            Tạo blog
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                {loading ? (
                    <Skeleton className="h-4 w-24" />
                ) : (
                    `${filteredPosts.length} bài viết`
                )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    [...Array(LIMIT)].map((_, i) => <BlogCardSkeleton key={i} />)
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <BlogCard
                            key={post._id}
                            title={post.title}
                            description={post.description}
                            image={post.thumbnail}
                            createdAt={post.createdAt}
                            author={post.author.fullName}
                            avatar={post.author.avatar || '/avatar.png'}
                            link={`/baiviet/${post.slug}`}
                        />
                    ))
                ) : (
                    <div className="col-span-full rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        {searchTerm
                            ? 'Không tìm thấy bài viết phù hợp. Thử thay đổi từ khóa tìm kiếm.'
                            : 'Chưa có bài viết nào.'}
                    </div>
                )}
            </div>

            {totalPages > 1 && !loading && (
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
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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