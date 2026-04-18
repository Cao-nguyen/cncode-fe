'use client'

import { Heart, MessageCircle } from "lucide-react";

interface BlogSidebarMobileProps {
    likeCount?: number;
    commentCount?: number;
}

export default function BlogSidebarMobile({ likeCount = 0, commentCount = 0 }: BlogSidebarMobileProps) {
    return (
        <div className="flex items-center justify-center gap-6 py-4 border-t border-b">
            <div className="flex items-center gap-1 text-muted-foreground">
                <Heart size={22} />
                <span className="text-sm">{likeCount}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle size={22} />
                <span className="text-sm">{commentCount}</span>
            </div>
        </div>
    );
}