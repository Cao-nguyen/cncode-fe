"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Reply } from "lucide-react";

interface FormattedComment {
    id: string;
    content: string;
    authorName: string;
    authorAvatar: string;
    createdAt: string;
    parentId: string | null;
    replyToName?: string;
    children?: FormattedComment[];
}

interface BlogCommentProps {
    initialComments?: FormattedComment[];
    currentUserAvatar?: string;
    currentUserName?: string;
    currentUserId?: string;
    onSubmitComment?: (content: string, parentId?: string | null, replyToName?: string) => void;
    onDeleteComment?: (commentId: string) => void;
}

export default function BlogComment({
    initialComments = [],
    currentUserAvatar = "/avatar.png",
    currentUserName = "U",
    currentUserId,
    onSubmitComment,
    onDeleteComment,
}: BlogCommentProps) {
    const [comments, setComments] = useState<FormattedComment[]>(initialComments);
    const [value, setValue] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

    const handleSubmit = async () => {
        if (!value.trim()) return;
        if (!onSubmitComment) return;

        setSubmitting(true);
        await onSubmitComment(value, replyTo?.id, replyTo?.name);
        setValue("");
        setReplyTo(null);
        setSubmitting(false);
    };

    const handleReply = (commentId: string, authorName: string) => {
        setReplyTo({ id: commentId, name: authorName });
        document.getElementById("comment-input")?.focus();
    };

    const handleCancelReply = () => {
        setReplyTo(null);
    };

    const CommentItem = ({ comment, depth = 0 }: { comment: FormattedComment; depth?: number }) => {
        const [showReplyInput, setShowReplyInput] = useState(false);
        const [replyContent, setReplyContent] = useState("");
        const [replying, setReplying] = useState(false);

        const handleSubmitReply = async () => {
            if (!replyContent.trim() || !onSubmitComment) return;
            setReplying(true);
            await onSubmitComment(replyContent, comment.id, comment.authorName);
            setReplyContent("");
            setShowReplyInput(false);
            setReplying(false);
        };

        return (
            <div className={`flex gap-3 ${depth > 0 ? "ml-8 mt-3" : "mt-4"}`}>
                <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="bg-muted px-4 py-2 rounded-xl text-sm">
                        <p className="font-semibold text-xs mb-1">
                            {comment.authorName}
                            {comment.replyToName && (
                                <span className="font-normal text-muted-foreground">
                                    {" "}
                                    trả lời{" "}
                                    <span className="font-medium">@{comment.replyToName}</span>
                                </span>
                            )}
                        </p>
                        <p>{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-2">
                        <button
                            onClick={() => handleReply(comment.id, comment.authorName)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
                        >
                            <Reply size={14} />
                            <span>Trả lời</span>
                        </button>
                        {currentUserId === comment.authorName && onDeleteComment && (
                            <button
                                onClick={() => onDeleteComment(comment.id)}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition"
                            >
                                <Trash size={14} />
                                <span>Xóa</span>
                            </button>
                        )}
                    </div>
                    {showReplyInput && (
                        <div className="mt-3 flex gap-2">
                            <Textarea
                                placeholder={`Trả lời ${comment.authorName}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="text-sm"
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSubmitReply} disabled={replying}>
                                    Gửi
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setShowReplyInput(false)}>
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    )}
                    {comment.children?.map((child) => (
                        <CommentItem key={child.id} comment={child} depth={depth + 1} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div id="comment-section" className="mt-10 space-y-6">
            <h3 className="text-lg font-semibold">Bình luận ({comments.length})</h3>

            <div className="flex gap-3">
                <Avatar className="w-9 h-9">
                    <AvatarImage src={currentUserAvatar} />
                    <AvatarFallback>{currentUserName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    {replyTo && (
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded-lg flex items-center justify-between">
                            <span>Đang trả lời @{replyTo.name}</span>
                            <button
                                onClick={handleCancelReply}
                                className="text-xs hover:text-red-500 transition"
                            >
                                Hủy
                            </button>
                        </div>
                    )}
                    <Textarea
                        id="comment-input"
                        placeholder={replyTo ? `Trả lời ${replyTo.name}...` : "Viết bình luận..."}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={3}
                    />
                    <div className="flex justify-end gap-2">
                        <Button onClick={handleSubmit} disabled={submitting || !value.trim()}>
                            {submitting ? "Đang gửi..." : "Gửi"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
                {comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </div>
                )}
            </div>
        </div>
    );
}