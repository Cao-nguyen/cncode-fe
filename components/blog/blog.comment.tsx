'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IComment, IPost, IUser } from '@/types/post.type';
import CommentItem from './CommentItem';

interface BlogCommentProps {
    post: IPost;
    comments: IComment[];
    currentUser: IUser | null;
    onSubmitComment: (content: string, parentId?: string | null) => Promise<void>;
    onDeleteComment: (commentId: string) => Promise<void>;
}

export default function BlogComment({
    post,
    comments,
    currentUser,
    onSubmitComment,
    onDeleteComment,
}: BlogCommentProps) {
    const [value, setValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!value.trim()) return;
        setSubmitting(true);
        await onSubmitComment(value, null);
        setValue('');
        setSubmitting(false);
    };

    const handleUpdated = async () => {
        await onDeleteComment('__refresh__');
    };

    return (
        <div id="comment-section" className="mt-10 space-y-6">
            <h3 className="text-lg font-semibold">Bình luận ({comments.length})</h3>

            <div className="flex gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={currentUser?.avatar || '/avatar.png'} />
                    <AvatarFallback>{currentUser?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        id="comment-input"
                        placeholder="Viết bình luận..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={3}
                        className="rounded-2xl resize-none"
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={submitting || !value.trim()}>
                            {submitting ? 'Đang gửi...' : 'Gửi'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            post={post}
                            onCommentUpdated={handleUpdated}
                            level={0}
                        />
                    ))
                )}
            </div>
        </div>
    );
}