'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Eye, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { blogApi } from '@/lib/api/blog.api';
import { Blog } from '@/types/blog.type';
import { useHorizontalMarquee } from '@/hooks/useHorizontalMarquee';
import { getImageUrl } from '@/lib/utils/imageUrl';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'technology', label: 'Công nghệ' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'news', label: 'Tin tức' },
    { value: 'contest', label: 'Cuộc thi' },
    { value: 'other', label: 'Khác' },
];

const GAP = 24;

function BlogCard({
    blog,
    className,
    style,
    onDragClick,
    hasImageError,
    onImageError,
}: {
    blog: Blog;
    className?: string;
    style?: React.CSSProperties;
    onDragClick?: (e: React.MouseEvent) => void;
    hasImageError?: boolean;
    onImageError?: () => void;
}) {
    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const stripHtml = (html: string) => {
        if (typeof window === 'undefined') return html;
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const getExcerpt = (content: string, maxLength = 150) => {
        const text = stripHtml(content);
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    return (
        <Link
            href={`/blog/${blog.slug}`}
            className={`flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 group flex flex-col cursor-pointer ${className ?? ''}`}
            style={{
                backgroundColor: 'var(--cn-bg-card)',
                border: '1px solid var(--cn-border)',
                boxShadow: 'var(--cn-shadow-sm)',
                ...style,
            }}
            onClick={onDragClick}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--cn-shadow-lg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--cn-shadow-sm)'; }}
            draggable={false}
        >
            {blog.thumbnail && !hasImageError ? (
                <div className="w-full h-[200px] overflow-hidden relative" style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                    <img
                        src={getImageUrl(blog.thumbnail)}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                        style={{ aspectRatio: '1500/1000' }}
                        draggable={false}
                        onError={onImageError}
                    />
                    <div className="absolute top-3 right-3">
                        <span
                            className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.9)', color: 'white' }}
                        >
                            {CATEGORIES.find(c => c.value === blog.category)?.label || 'Khác'}
                        </span>
                    </div>
                </div>
            ) : blog.thumbnail && hasImageError ? (
                <div className="w-full h-[200px] overflow-hidden relative flex items-center justify-center" style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                    <div className="text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--cn-text-muted)' }} />
                        <p className="text-xs" style={{ color: 'var(--cn-text-muted)' }}>Không thể tải ảnh</p>
                    </div>
                    <div className="absolute top-3 right-3">
                        <span
                            className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.9)', color: 'white' }}
                        >
                            {CATEGORIES.find(c => c.value === blog.category)?.label || 'Khác'}
                        </span>
                    </div>
                </div>
            ) : null}
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

                <h3
                    className="text-lg font-semibold mb-2 line-clamp-2 transition-colors duration-300 min-h-[3.5rem] text-justify"
                    style={{ color: 'var(--cn-text-main)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cn-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--cn-text-main)'; }}
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
                                src={getImageUrl(blog.author.avatar)}
                                alt={blog.author.fullName}
                                className="w-8 h-8 rounded-full object-cover pointer-events-none"
                                draggable={false}
                            />
                        )}
                        <span className="font-medium">{blog.author.fullName}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function LatestPosts() {
    const [posts, setPosts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDesktop, setIsDesktop] = useState(false);
    const [page, setPage] = useState(0);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    const itemsPerView = 3;
    const gap = GAP;

    const {
        containerRef,
        isDragging,
        dragMovedRef,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onMouseEnter,
        onMouseLeave,
        onTouchStart,
        onTouchEnd,
    } = useHorizontalMarquee({ enabled: !isDesktop && !loading && posts.length > 0 });

    useEffect(() => {
        const updateViewport = () => setIsDesktop(window.innerWidth >= 1024);
        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    useEffect(() => {
        setPage(0);
    }, [isDesktop]);

    useEffect(() => {
        const fetchLatestPosts = async () => {
            try {
                setLoading(true);
                const response = await blogApi.getBlogs({ page: 1, limit: 6, sort: '-createdAt' });
                if (response.success && response.data) setPosts(response.data);
            } catch (error) {
                console.error('Failed to fetch latest posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLatestPosts();
    }, []);

    const n = posts.length;
    const totalPages = n > 0 ? n - itemsPerView + 1 : 0;
    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;
    const translateX = `calc(-${page} * (100% + ${gap}px) / ${itemsPerView})`;

    const handlePrev = () => setPage(p => Math.max(0, p - 1));
    const handleNext = () => setPage(p => Math.min(totalPages - 1, p + 1));

    const handleImageError = (blogId: string) => {
        setImageErrors(prev => ({ ...prev, [blogId]: true }));
    };

    const preventClickIfDragged = useCallback((e: React.MouseEvent) => {
        if (dragMovedRef.current) {
            e.preventDefault();
            dragMovedRef.current = false;
        }
    }, [dragMovedRef]);

    const loopPosts = [...posts, ...posts];

    const header = (
        <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">Bài viết mới nhất</h2>
            <p className="text-sm text-[var(--cn-text-muted)] mt-2">Khám phá kiến thức và kinh nghiệm từ cộng đồng</p>
        </div>
    );

    const btnClass = 'flex w-10 h-10 flex-shrink-0 items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 border-2 border-[var(--cn-border)]';
    const btnStyle = { backgroundColor: 'var(--cn-bg-card)', color: 'var(--cn-primary)', borderRadius: '8px' };

    if (loading) {
        return (
            <div className="py-12">
                {header}
                <div className={`flex items-center gap-4 ${isDesktop ? '' : 'overflow-hidden'}`}>
                    {isDesktop && <div className="w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />}
                    <div className={`flex-1 ${isDesktop ? 'grid grid-cols-3 gap-6' : 'flex gap-4 overflow-hidden'}`}>
                        {[...Array(isDesktop ? 3 : 2)].map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-xl overflow-hidden flex-shrink-0 ${isDesktop ? '' : 'w-[85vw] max-w-[340px] md:w-[calc(50vw-2rem)]'}`}
                                style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
                            >
                                <div className="w-full h-[200px] bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                    {isDesktop && <div className="w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />}
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-12">
                {header}
                <div className="text-center py-20">
                    <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--cn-border)' }} />
                    <p style={{ color: 'var(--cn-text-sub)' }}>Chưa có bài viết nào</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {header}

            {isDesktop ? (
                <div className="flex items-center gap-4">
                    <button onClick={handlePrev} disabled={!canGoPrev} className={btnClass} style={btnStyle}>
                        <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                    </button>

                    <div className="flex-1 overflow-hidden">
                        <div
                            className="flex gap-6 transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(${translateX})` }}
                        >
                            {posts.map(blog => (
                                <BlogCard
                                    key={blog._id}
                                    blog={blog}
                                    hasImageError={imageErrors[blog._id]}
                                    onImageError={() => handleImageError(blog._id)}
                                    style={{
                                        width: `calc((100% - ${(itemsPerView - 1) * gap}px) / ${itemsPerView})`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button onClick={handleNext} disabled={!canGoNext} className={btnClass} style={btnStyle}>
                        <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className={`no-scrollbar overflow-x-auto select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
                    style={{ touchAction: 'pan-y' }}
                >
                    <div className="flex w-max gap-4 px-1">
                        {loopPosts.map((blog, index) => (
                            <BlogCard
                                key={`${blog._id}-${index}`}
                                blog={blog}
                                hasImageError={imageErrors[blog._id]}
                                onImageError={() => handleImageError(blog._id)}
                                className="w-[300px] sm:w-[320px] md:w-[360px] shrink-0"
                                onDragClick={preventClickIfDragged}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
