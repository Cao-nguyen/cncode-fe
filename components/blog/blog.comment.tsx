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
}

export default function BlogComment({
    post,
    comments,
    currentUser,
    onSubmitComment,
}: BlogCommentProps) {
    const [value, setValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!value.trim()) return;
        setSubmitting(true);
        try {
            await onSubmitComment(value, null);
            setValue('');
            // ✅ KHÔNG cần refresh — socket emit comment:new sẽ tự cập nhật danh sách
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div id="comment-section" className="mt-10 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Bình luận <span className="text-main">({comments.length})</span>
            </h3>

            <div className="flex gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={currentUser?.avatar || '/avatar.png'} />
                    <AvatarFallback className="bg-main/10 text-main">
                        {currentUser?.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        id="comment-input"
                        placeholder="Viết bình luận..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={3}
                        className="rounded-2xl resize-none focus:border-main focus:ring-main/20"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || !value.trim()}
                            className="bg-main hover:bg-main-dark text-white transition-all duration-200"
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            post={post}
                            isChild={false}
                        />
                    ))
                )}
            </div>
        </div>
    );
}