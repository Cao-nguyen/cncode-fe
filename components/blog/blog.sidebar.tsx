'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle } from "lucide-react";

interface BlogSidebarProps {
    authorName?: string;
    authorBio?: string;
    likeCount?: number;
    commentCount?: number;
    onLike?: () => void;
    onComment?: () => void;
}

export default function BlogSidebar({
    authorName = "Lùng Lọc Lỗi",
    authorBio = "Đeo kính để soi Bug cho rõ, nhớ mày để nhắc Dev sửa cho kỹ. Với tôi, chạy được thôi là chưa đủ! 😳💻",
    likeCount = 0,
    commentCount = 0,
    onLike,
    onComment,
}: BlogSidebarProps) {
    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-3">
                <div>
                    <h3 className="font-semibold text-[16px]">{authorName}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{authorBio}</p>
                </div>
                <Separator />
                <div className="flex gap-6 text-muted-foreground">
                    <button
                        onClick={onLike}
                        className="flex items-center gap-2 hover:text-red-500 cursor-pointer transition"
                    >
                        <Heart size={22} />
                        <span>{likeCount}</span>
                    </button>
                    <button
                        onClick={onComment}
                        className="flex items-center gap-2 hover:text-blue-500 cursor-pointer transition"
                    >
                        <MessageCircle size={22} />
                        <span>{commentCount}</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}