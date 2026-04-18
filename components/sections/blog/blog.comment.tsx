"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
    id: string;
    content: string;
    authorName: string;
    authorAvatar?: string;
}

interface BlogCommentProps {
    initialComments?: Comment[];
    currentUserAvatar?: string;
    currentUserName?: string;
}

export default function BlogComment({
    initialComments = [],
    currentUserAvatar = "/avatar.png",
    currentUserName = "U",
}: BlogCommentProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [value, setValue] = useState("");

    const handleSubmit = () => {
        if (!value.trim()) return;
        const newComment: Comment = {
            id: Date.now().toString(),
            content: value,
            authorName: currentUserName,
            authorAvatar: currentUserAvatar,
        };
        setComments([newComment, ...comments]);
        setValue("");
    };

    return (
        <div className="mt-10 space-y-6">
            <div className="flex gap-3">
                <Avatar className="w-9 h-9">
                    <AvatarImage src={currentUserAvatar} />
                    <AvatarFallback>{currentUserName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Viết bình luận..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit}>Gửi</Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-9 h-9">
                            <AvatarImage src={comment.authorAvatar} />
                            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted px-4 py-2 rounded-xl text-sm">
                            <p className="font-semibold text-xs mb-1">{comment.authorName}</p>
                            <p>{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}