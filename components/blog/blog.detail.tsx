'use client';

import BlogBreadcrumb from './blog.breadcrumb';
import BlogActions from './blog.action';
import BlogComment from './blog.comment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BlogSidebarMobile from './blog.sidebar.m';
import { IPost, IComment } from '@/types/post.type';
import { IUser } from '@/types/post.type';
import { Eye } from 'lucide-react';

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
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export default function BlogDetail({
    post,
    comments,
    likeCount,
    liked,
    bookmarked,
    currentUser,
    onLike,
    onBookmarkChange,
    onSubmitComment,
    onDeleteComment,
}: BlogDetailProps) {
    const handleBookmarkFromMobile = () => {
        onBookmarkChange(!bookmarked);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <BlogBreadcrumb title={post.title} />

            <h1 className="text-[26px] md:text-[32px] font-bold leading-[1.3]">{post.title}</h1>

            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="flex-shrink-0">
                        <AvatarImage src={post.author.avatar || '/avatar.png'} />
                        <AvatarFallback>{post.author.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{post.author.fullName}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>·</span>
                            <span>{post.readTime} phút đọc</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {post.views.toLocaleString('vi-VN')}
                            </span>
                        </div>
                    </div>
                </div>
                <BlogActions
                    postId={post._id}
                    isBookmarked={bookmarked}
                    onBookmarkChange={onBookmarkChange}
                />
            </div>

            <article
                className="space-y-5 text-[16px] leading-7 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="block lg:hidden">
                <BlogSidebarMobile
                    authorName={post.author.fullName}
                    authorBio={post.author.bio || ''}
                    likeCount={likeCount}
                    commentCount={comments.length}
                    liked={liked}
                    bookmarked={bookmarked}
                    onLike={onLike}
                    onComment={() => {
                        document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onBookmark={handleBookmarkFromMobile}
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
    );
}