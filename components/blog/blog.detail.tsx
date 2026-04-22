'use client';

import { useRef, useState, useEffect } from 'react';
import BlogBreadcrumb from './blog.breadcrumb';
import BlogActions from './blog.action';
import BlogComment from './blog.comment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BlogSidebarMobile from './blog.sidebar.m';
import { IPost, IComment, IUser } from '@/types/post.type';
import { Eye, Heart } from 'lucide-react';
import ImagePreview from '@/components/common/ImagePreview';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { postApi } from '@/lib/api/post.api';

interface BlogDetailProps {
    post: IPost;
    comments: IComment[];
    likeCount: number;
    liked: boolean;
    bookmarked: boolean;
    currentUser: IUser | null;
    onLike: () => void;
    onBookmarkChange: (bookmarked: boolean) => void;
    onSubmitComment: (content: string, parentId?: string | null) => Promise<void>;
    onDeleteComment: (commentId: string) => Promise<void>;
    onImagePreview?: (src: string) => void;
}

const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

// Hàm lấy tất cả ảnh từ nội dung HTML
const extractAllImages = (html: string): string[] => {
    const matches = html.match(/<img[^>]+src=["']([^"']+)["']/gi);
    if (!matches) return [];

    return matches.map(match => {
        const srcMatch = match.match(/src=["']([^"']+)["']/);
        return srcMatch ? srcMatch[1] : '';
    }).filter(src => src);
};

export default function BlogDetail({
    post,
    comments,
    likeCount: initialLikeCount,
    liked: initialLiked,
    bookmarked,
    currentUser,
    onLike,
    onBookmarkChange,
    onSubmitComment,
    onDeleteComment,
}: BlogDetailProps) {
    const articleRef = useRef<HTMLElement>(null);
    const { token } = useAuthStore();

    // State cho image preview
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [previewIndex, setPreviewIndex] = useState<number>(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Local state for optimistic updates
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiking, setIsLiking] = useState(false);

    // Lấy tất cả ảnh từ nội dung bài viết
    const allImages = extractAllImages(post.content);

    // Xử lý click vào ảnh trong bài viết
    useEffect(() => {
        const container = articleRef.current;
        if (!container) return;

        const handleImageClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                const clickedSrc = (target as HTMLImageElement).src;
                const index = allImages.findIndex(img => img === clickedSrc);
                if (index !== -1) {
                    setPreviewImages(allImages);
                    setPreviewIndex(index);
                    setIsPreviewOpen(true);
                } else {
                    // Nếu ảnh không nằm trong danh sách (có thể do lazy load), mở ảnh đơn
                    setPreviewImages([clickedSrc]);
                    setPreviewIndex(0);
                    setIsPreviewOpen(true);
                }
            }
        };

        container.addEventListener('click', handleImageClick);

        // Thêm cursor zoom-in cho tất cả ảnh
        container.querySelectorAll('img').forEach((img) => {
            img.style.cursor = 'zoom-in';
        });

        return () => container.removeEventListener('click', handleImageClick);
    }, [allImages, post.content]);

    const handleLikeClick = async () => {
        if (!token || !currentUser) {
            toast.error('Vui lòng đăng nhập để thích bài viết');
            return;
        }

        if (isLiking) return;
        setIsLiking(true);

        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            const result = await postApi.likePost(post._id, token);
            if (result.success) {
                if (result.data.liked !== newLiked) {
                    setLiked(result.data.liked);
                    setLikeCount(result.data.likes);
                }
                onLike();
            } else {
                setLiked(!newLiked);
                setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
                toast.error('Có lỗi xảy ra');
            }
        } catch (error) {
            setLiked(!newLiked);
            setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <>
            <div className="w-full max-w-3xl mx-auto space-y-6 min-w-0">
                <BlogBreadcrumb title={post.title} />

                <h1 className="text-2xl md:text-[32px] font-bold leading-[1.3] break-words">
                    {post.title}
                </h1>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Avatar className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                            <AvatarImage src={post.author.avatar || '/avatar.png'} />
                            <AvatarFallback>{post.author.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{post.author.fullName}</p>
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 text-xs text-muted-foreground">
                                <span className="whitespace-nowrap">{formatDate(post.createdAt)}</span>
                                <span>·</span>
                                <span className="flex items-center gap-0.5 whitespace-nowrap">
                                    <Eye size={11} />
                                    {post.views.toLocaleString('vi-VN')}
                                </span>
                                <span>·</span>
                                <button
                                    onClick={handleLikeClick}
                                    disabled={isLiking}
                                    className={`flex items-center gap-0.5 transition disabled:opacity-50 ${liked ? 'text-red-500' : 'hover:text-red-500'
                                        }`}
                                >
                                    <Heart
                                        size={12}
                                        fill={liked ? '#ef4444' : 'none'}
                                        className={liked ? 'text-red-500' : ''}
                                    />
                                    <span>{likeCount.toLocaleString('vi-VN')} lượt thích</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <BlogActions
                            postId={post._id}
                            isBookmarked={bookmarked}
                            onBookmarkChange={onBookmarkChange}
                        />
                    </div>
                </div>

                <article
                    ref={articleRef}
                    className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
                               prose-img:rounded-xl prose-img:w-full prose-img:max-w-full
                               prose-img:cursor-zoom-in
                               prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:text-sm
                               prose-table:block prose-table:overflow-x-auto
                               overflow-hidden break-words"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="lg:hidden">
                    <BlogSidebarMobile
                        authorName={post.author.fullName}
                        authorBio={post.author.bio || ''}
                        likeCount={likeCount}
                        commentCount={comments.length}
                        liked={liked}
                        bookmarked={bookmarked}
                        onLike={handleLikeClick}
                        onComment={() => {
                            document
                                .getElementById('comment-section')
                                ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        onBookmark={() => onBookmarkChange(!bookmarked)}
                    />
                </div>

                <BlogComment
                    post={post}
                    comments={comments}
                    currentUser={currentUser}
                    onSubmitComment={onSubmitComment}
                    onDeleteComment={onDeleteComment}
                />
            </div>

            {/* Image Preview với hỗ trợ nhiều ảnh */}
            {isPreviewOpen && previewImages.length > 0 && (
                <ImagePreview
                    images={previewImages}
                    initialIndex={previewIndex}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setPreviewImages([]);
                        setPreviewIndex(0);
                    }}
                />
            )}
        </>
    );
}