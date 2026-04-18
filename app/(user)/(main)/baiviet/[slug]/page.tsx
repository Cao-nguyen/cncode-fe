'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Eye, Heart, Clock, Share2, Bookmark, Flag, Facebook, Copy, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { postApi } from '@/lib/api/post.api';
import { IPost } from '@/types/post.type';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import CommentItem from '@/components/blog/CommentItem';

export default function PostDetailPage(): React.ReactElement {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { user, token } = useAuthStore();

    const [post, setPost] = useState<IPost | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [liked, setLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(0);
    const [commentContent, setCommentContent] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);

    const fetchPost = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const result = await postApi.getPostBySlug(slug);
            if (result.success) {
                setPost(result.data);
                setLikesCount(result.data.likes);
                if (user) {
                    setLiked(result.data.likedBy.includes(user.id));
                }
            } else {
                toast.error('Không tìm thấy bài viết');
                router.push('/baiviet');
            }
        } catch (error) {
            console.error('Failed to fetch post:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    }, [slug, router, user]);

    useEffect(() => {
        if (slug) {
            fetchPost();
        }
    }, [slug, fetchPost]);

    const handleLike = async (): Promise<void> => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để thích bài viết');
            router.push('/login');
            return;
        }
        if (!post) return;
        try {
            const result = await postApi.likePost(post._id, token);
            if (result.success) {
                setLiked(result.data.liked);
                setLikesCount(result.data.likes);
            }
        } catch (error) {
            console.error('Failed to like post:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleAddComment = async (): Promise<void> => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để bình luận');
            router.push('/login');
            return;
        }
        if (!post) return;
        if (!commentContent.trim()) {
            toast.error('Vui lòng nhập nội dung bình luận');
            return;
        }
        setSubmitting(true);
        try {
            await postApi.addComment(post._id, commentContent, token);
            await fetchPost();
            setCommentContent('');
            toast.success('Đã thêm bình luận');
        } catch (error) {
            console.error('Failed to add comment:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyLink = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Đã sao chép liên kết');
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    const shareFacebook = (): void => {
        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1660889691575547';
        const postUrl = encodeURIComponent(window.location.href);
        const redirectUri = encodeURIComponent(window.location.href);
        const facebookUrl = `https://www.facebook.com/dialog/feed?app_id=${appId}&display=popup&link=${postUrl}&redirect_uri=${redirectUri}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    };

    const formatDate = (date: string): string => {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return d.toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy bài viết</h1>
                    <button onClick={() => router.push('/baiviet')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
            <div className="container mx-auto px-5 lg:px-10 max-w-6xl">
                <div className="mb-4">
                    <button onClick={() => router.push('/baiviet')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                        ← Quay lại
                    </button>
                </div>

                <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {post.thumbnail && (
                        <div className="relative w-full h-64 md:h-96">
                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="p-6 md:p-8">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                                {post.category}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>

                        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={post.author.avatar} />
                                    <AvatarFallback>{post.author.fullName?.charAt(0) || 'A'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author.fullName || 'Tác giả'}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(post.createdAt)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {post.readTime} phút đọc
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={12} />
                                            {post.views} lượt xem
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${liked ? 'text-red-500 bg-red-50 dark:bg-red-950/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                                    <span>{likesCount}</span>
                                </button>

                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={shareFacebook} className="cursor-pointer">
                                            <Facebook size={16} className="mr-2 text-blue-600" />
                                            Chia sẻ Facebook
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                                            <Copy size={16} className="mr-2" />
                                            Sao chép liên kết
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSaved(!saved)} className="cursor-pointer">
                                            <Bookmark size={16} className="mr-2" />
                                            {saved ? 'Đã lưu' : 'Lưu bài viết'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer text-red-500">
                                            <Flag size={16} className="mr-2" />
                                            Báo cáo
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <article className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bình luận</h3>

                            <div className="flex gap-3 mb-6">
                                <Avatar className="w-9 h-9 flex-shrink-0">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Textarea
                                        placeholder="Viết bình luận..."
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        rows={3}
                                        disabled={submitting}
                                    />
                                    <div className="flex justify-end">
                                        <Button onClick={handleAddComment} size="sm" disabled={submitting}>
                                            {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {post.comments.map((comment) => (
                                    <CommentItem key={comment._id} comment={comment} post={post} onCommentUpdated={fetchPost} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}