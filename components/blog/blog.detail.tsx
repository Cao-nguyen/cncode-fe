'use client';

import BlogBreadcrumb from './blog.breadcrumb';
import BlogActions from './blog.action';
import BlogComment from './blog.comment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BlogSidebarMobile from './blog.sidebar.m';
import { IPost, IComment, IUser } from '@/types/post.type';
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
    return (
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
                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
                           prose-img:rounded-xl prose-img:w-full prose-img:max-w-full
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
                    onLike={onLike}
                    onComment={() => {
                        document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
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
    );
}