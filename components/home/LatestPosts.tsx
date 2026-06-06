'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Clock, Eye, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { blogApi } from '@/lib/api/blog.api';
import { Blog } from '@/types/blog.type';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'technology', label: 'Công nghệ' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'news', label: 'Tin tức' },
    { value: 'contest', label: 'Cuộc thi' },
    { value: 'other', label: 'Khác' }
];

export default function LatestPosts() {
    const [posts, setPosts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(3);
    const [viewportWidth, setViewportWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateItemsPerView = () => {
            const w = window.innerWidth;
            if (w < 768) {
                setItemsPerView(1);
            } else if (w < 1024) {
                setItemsPerView(2);
            } else {
                setItemsPerView(3);
            }
        };

        updateItemsPerView();
        window.addEventListener('resize', updateItemsPerView);
        return () => window.removeEventListener('resize', updateItemsPerView);
    }, []);

    useEffect(() => {
        const updateViewportWidth = () => {
            if (containerRef.current) {
                setViewportWidth(containerRef.current.offsetWidth);
            }
        };

        updateViewportWidth();
        window.addEventListener('resize', updateViewportWidth);
        return () => window.removeEventListener('resize', updateViewportWidth);
    }, []);

    useEffect(() => {
        const fetchLatestPosts = async () => {
            try {
                setLoading(true);
                const response = await blogApi.getBlogs({
                    page: 1,
                    limit: 6,
                    sort: '-createdAt'
                });

                if (response.success && response.data) {
                    setPosts(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch latest posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestPosts();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const stripHtml = (html: string) => {
        if (typeof window === 'undefined') return html;
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const getExcerpt = (content: string, maxLength: number = 150) => {
        const text = stripHtml(content);
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - itemsPerView));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(posts.length - itemsPerView, prev + itemsPerView));
    };

    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex + itemsPerView < posts.length;

    // Tính toán carousel
    const gap = 24; // px
    const slideWidth = viewportWidth > 0
        ? (viewportWidth - (itemsPerView - 1) * gap) / itemsPerView
        : 0;

    const translateX = -(slideWidth + gap) * currentIndex;

    if (loading) {
        return (
            <div className="py-12">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">
                        Bài viết mới nhất
                    </h2>
                    <p className="text-sm text-[var(--cn-text-muted)] mt-2">
                        Khám phá kiến thức và kinh nghiệm từ cộng đồng
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
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
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-12">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">
                        Bài viết mới nhất
                    </h2>
                    <p className="text-sm text-[var(--cn-text-muted)] mt-2">
                        Khám phá kiến thức và kinh nghiệm từ cộng đồng
                    </p>
                </div>
                <div className="text-center py-20">
                    <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--cn-border)' }} />
                    <p style={{ color: 'var(--cn-text-sub)' }}>Chưa có bài viết nào</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">
                    Bài viết mới nhất
                </h2>
                <p className="text-sm text-[var(--cn-text-muted)] mt-2">
                    Khám phá kiến thức và kinh nghiệm từ cộng đồng
                </p>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handlePrev}
                    disabled={!canGoPrev}
                    className="flex w-10 h-10 flex-shrink-0 items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                    style={{
                        backgroundColor: 'var(--cn-bg-card)',
                        border: '2px solid var(--cn-border)',
                        color: 'var(--cn-primary)',
                        borderRadius: '8px'
                    }}
                >
                    <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                </button>

                <div ref={containerRef} className="flex-1 overflow-hidden">
                    <div
                        className="flex gap-6 transition-transform duration-500 ease-out"
                        style={{
                            transform: `translateX(${translateX}px)`
                        }}
                    >
                        {posts.map((blog) => (
                            <Link
                                key={blog._id}
                                href={`/blog/${blog.slug}`}
                                className="flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 group flex flex-col cursor-pointer"
                                style={{
                                    width: slideWidth > 0 ? `${slideWidth}px` : `${100 / itemsPerView}%`,
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
                                            src={blog.thumbnail}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 transition-colors duration-300 min-h-[3.5rem] text-justify"
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
                </div>

                <button
                    onClick={handleNext}
                    disabled={!canGoNext}
                    className="flex w-10 h-10 flex-shrink-0 items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                    style={{
                        backgroundColor: 'var(--cn-bg-card)',
                        border: '2px solid var(--cn-border)',
                        color: 'var(--cn-primary)',
                        borderRadius: '8px'
                    }}
                >
                    <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}