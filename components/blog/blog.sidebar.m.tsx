'use client';

import { Heart, MessageCircle } from 'lucide-react';

interface BlogSidebarMobileProps {
    likeCount?: number;
    commentCount?: number;
    liked?: boolean;
    onLike?: () => void;
    onComment?: () => void;
}

export default function BlogSidebarMobile({
    likeCount = 0,
    commentCount = 0,
    liked = false,
    onLike,
    onComment,
}: BlogSidebarMobileProps) {
    return (
        <div className="flex items-center justify-center gap-6 py-4 border-t border-b">
            <button
                onClick={onLike}
                className="flex items-center gap-1 transition"
            >
                <Heart
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
                className="flex items-center gap-1 text-muted-foreground"
            >
                <MessageCircle size={22} />
                <span className="text-sm">{commentCount}</span>
            </button>
        </div>
    );
}