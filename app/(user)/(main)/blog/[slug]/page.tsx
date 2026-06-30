'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { blogApi, Blog } from '@/lib/api/blog.api';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Eye, User, Loader2, Heart, Bookmark, MessageCircle } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import CommentSection from '@/components/comment/CommentSection';
import { useAuthStore } from '@/store/auth.store';
import { SendGiftButton } from '@/components/gift/SendGiftButton';
import { BlogGiftList } from '@/components/gift/BlogGiftList';

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token } = useAuthStore();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const viewCountedRef = React.useRef(false);

    useEffect(() => {
        fetchBlog();

        // Cleanup: Tăng viewCount khi user thoát khỏi trang
        return () => {
            const slug = params.slug as string;
            const sessionKey = `blog_viewed_${slug}`;

            // Kiểm tra đã count trong session chưa
            if (!sessionStorage.getItem(sessionKey) && !viewCountedRef.current) {
                viewCountedRef.current = true;
                sessionStorage.setItem(sessionKey, 'true');

                // Gọi API tăng viewCount
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/increment-view/${slug}`, {
                    method: 'POST',
                    keepalive: true,
                }).catch(() => {
                    // Ignore errors
                });
            }
        };
    }, [params.slug]);

    useEffect(() => {
        if (blog && token) {
            checkInteraction();
        }
    }, [blog, token]);

    const fetchBlog = async () => {
        try {
            const res = await blogApi.getBlogBySlug(params.slug as string);
            if (res.success) {
                setBlog(res.data);
                setLikeCount(res.data.likeCount);
            } else {
                toast.error('Không tìm thấy bài viết');
                router.push('/blog');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
            router.push('/blog');
        } finally {
            setLoading(false);
        }
    };

    const checkInteraction = async () => {
        if (!blog || !token) return;
        try {
            const res = await blogApi.checkInteraction(blog._id);
            if (res.success) {
                setLiked(res.data.liked);
                setBookmarked(res.data.bookmarked);
            }
        } catch (error) {
            console.error('Check interaction error:', error);
        }
    };

    const handleLike = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để thích bài viết');
            return;
        }
        if (!blog) return;

        try {
            const res = await blogApi.toggleLike(blog._id);
            if (res.success) {
                setLiked(res.liked);
                setLikeCount(prev => res.liked ? prev + 1 : prev - 1);
                toast.success(res.message);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleBookmark = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để lưu bài viết');
            return;
        }
        if (!blog) return;

        try {
            const res = await blogApi.toggleBookmark(blog._id);
            if (res.success) {
                setBookmarked(res.bookmarked);
                toast.success(res.message);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>

                <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {blog.author.fullName}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(blog.publishedAt || blog.createdAt)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                {blog.viewCount} lượt xem
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none mb-8">
                            <StaticContent content={blog.content} />
                        </div>

                        {blog.tags && blog.tags.length > 0 && (
                            <div className="mb-8 pb-6 border-b border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Like & Bookmark Actions */}
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${liked
                                    ? 'border-red-200 bg-red-50 text-red-500'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <Heart
                                    className="w-5 h-5"
                                    data-filled={liked}
                                    fill={liked ? 'currentColor' : 'none'}
                                />
                                <span className="text-sm font-medium">{likeCount}</span>
                            </button>

                            <button
                                onClick={handleBookmark}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${bookmarked
                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-500'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <Bookmark
                                    className="w-5 h-5"
                                    data-filled={bookmarked}
                                    fill={bookmarked ? 'currentColor' : 'none'}
                                />
                                <span className="text-sm font-medium">Lưu</span>
                            </button>

                            <SendGiftButton 
                                recipientId={blog.author._id}
                                recipientName={blog.author.fullName}
                                targetType="post"
                                targetId={blog._id}
                            />

                            <div className="flex items-center gap-2 px-4 py-2 text-gray-600">
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{blog.commentCount} bình luận</span>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <CommentSection targetType="blog" targetId={blog._id} />
                        
                        {/* Gift List */}
                        <BlogGiftList blogId={blog._id} />
                    </div>
                </article>
            </div>
        </div>
    );
}