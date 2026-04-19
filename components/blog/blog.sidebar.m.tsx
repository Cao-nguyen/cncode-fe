'use client';

import { Heart, MessageCircle, Bookmark } from 'lucide-react';

interface BlogSidebarMobileProps {
    authorName?: string;
    authorBio?: string;
    likeCount?: number;
    commentCount?: number;
    liked?: boolean;
    bookmarked?: boolean;
    onLike?: () => void;
    onComment?: () => void;
    onBookmark?: () => void;
}

export default function BlogSidebarMobile({
    authorName,
    authorBio,
    likeCount = 0,
    commentCount = 0,
    liked = false,
    bookmarked = false,
    onLike,
    onComment,
    onBookmark,
}: BlogSidebarMobileProps) {
    return (
        <div className="space-y-3 py-4 border-t border-b">
            {(authorName || authorBio) && (
                <div className="px-1">
                    {authorName && (
                        <p className="text-sm font-semibold">{authorName}</p>
                    )}
                    {authorBio && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{authorBio}</p>
                    )}
                </div>
            )}

            <div className="flex items-center gap-6">
                <button
                    onClick={onLike}
                    className="flex items-center gap-1.5 transition"
                >
                    <Heart
                        data-filled={liked ? "" : undefined}
                        size={22}
                        fill={liked ? '#ef4444' : 'none'}
                        className={liked ? 'text-red-500' : 'text-muted-foreground'}
                    />
                    <span className={`text-sm ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {likeCount}
                    </span>
                </button>

                <button
                    onClick={onComment}
                    className="flex items-center gap-1.5 text-muted-foreground"
                >
                    <MessageCircle size={22} />
                    <span className="text-sm">{commentCount}</span>
                </button>

                <button
                    onClick={onBookmark}
                    className="flex items-center gap-1.5 ml-auto transition"
                >
                    <Bookmark
                        data-filled={bookmarked ? "" : undefined}
                        size={22}
                        fill={bookmarked ? '#eab308' : 'none'}
                        className={bookmarked ? 'text-yellow-500' : 'text-muted-foreground'}
                    />
                </button>
            </div>
        </div>
    );
}