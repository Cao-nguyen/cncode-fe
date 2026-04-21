'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

interface BlogSidebarProps {
    authorName?: string;
    authorId?: string;
    authorBio?: string;
    likeCount?: number;
    commentCount?: number;
    liked?: boolean;
    bookmarked?: boolean;
    postId?: string;
    postTitle?: string;
    onLike?: () => Promise<void>;
    onComment?: () => void;
}

export default function BlogSidebar({
    authorName = 'Tác giả',
    authorId,
    authorBio = '',
    likeCount = 0,
    commentCount = 0,
    liked = false,
    bookmarked = false,
    postId,
    postTitle,
    onLike,
    onComment,
}: BlogSidebarProps) {
    const { user } = useAuthStore();

    const handleLike = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thích bài viết');
            return;
        }
        if (onLike) {
            // ✅ Chỉ gọi REST API - backend tự emit socket notification
            await onLike();
        }
    };

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-3">
                <div>
                    <h3 className="font-semibold text-[16px]">{authorName}</h3>
                    {authorBio && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{authorBio}</p>
                    )}
                </div>
                <Separator />
                <div className="flex gap-6 text-muted-foreground">
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-2 cursor-pointer transition"
                    >
                        <Heart
                            data-filled={liked ? "" : undefined}
                            size={22}
                            fill={liked ? '#ef4444' : 'none'}
                            className={liked ? 'text-red-500' : 'hover:text-red-500 transition'}
                        />
                        <span className={liked ? 'text-red-500' : ''}>{likeCount}</span>
                    </button>
                    <button
                        onClick={onComment}
                        className="flex items-center gap-2 hover:text-blue-500 cursor-pointer transition"
                    >
                        <MessageCircle size={22} />
                        <span>{commentCount}</span>
                    </button>
                    <div className="ml-auto flex items-center">
                        <Bookmark
                            data-filled={bookmarked ? "" : undefined}
                            size={22}
                            fill={bookmarked ? '#eab308' : 'none'}
                            className={bookmarked ? 'text-yellow-500' : 'text-muted-foreground'}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}