'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Flag, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { IComment, IPost, IReactions } from '@/types/post.type';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { postApi } from '@/lib/api/post.api';

const REACTIONS = [
    { type: 'like', icon: '/icons/like.svg', label: 'Thích' },
    { type: 'love', icon: '/icons/love.svg', label: 'Yêu thích' },
    { type: 'care', icon: '/icons/care.svg', label: 'Quan tâm' },
    { type: 'haha', icon: '/icons/haha.svg', label: 'Haha' },
    { type: 'wow', icon: '/icons/wow.svg', label: 'Wow' },
    { type: 'sad', icon: '/icons/sad.svg', label: 'Buồn' },
    { type: 'angry', icon: '/icons/angry.svg', label: 'Phẫn nộ' },
];

const REPORT_REASONS = [
    'Nội dung spam',
    'Ngôn ngữ thù địch',
    'Quấy rối hoặc bắt nạt',
    'Thông tin sai lệch',
    'Lý do khác',
];

type ReactionKey = keyof IReactions;

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getTotalReactions = (reactions: IReactions): number =>
    Object.values(reactions).reduce((sum, arr) => sum + arr.length, 0);

interface CommentItemProps {
    comment: IComment;
    post: IPost;
    onCommentUpdated: () => Promise<void>;
    level?: number;
}

export default function CommentItem({ comment, post, onCommentUpdated, level = 0 }: CommentItemProps) {
    const { user, token } = useAuthStore();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReactionPopup, setShowReactionPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [localReactions, setLocalReactions] = useState<IReactions>(comment.reactions);
    const [reportOpen, setReportOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [reporting, setReporting] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalReactions(comment.reactions);
    }, [comment.reactions]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setShowReactionPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getUserReaction = () => {
        if (!user) return null;
        return REACTIONS.find((r) =>
            localReactions[r.type as ReactionKey]?.includes(user.id)
        ) ?? null;
    };

    const userReaction = getUserReaction();
    const totalReactions = getTotalReactions(localReactions);
    const canDelete = user && (
        user.id === comment.user._id ||
        user.id === post.author._id ||
        user.role === 'admin'
    );

    const handleReaction = async (type: string) => {
        if (!token || !user) {
            toast.error('Vui lòng đăng nhập để thả cảm xúc');
            return;
        }
        const key = type as ReactionKey;
        const hasReacted = localReactions[key]?.includes(user.id);

        setLocalReactions((prev) => {
            const next = { ...prev };
            if (hasReacted) {
                next[key] = next[key].filter((id) => id !== user.id);
            } else {
                (Object.keys(next) as ReactionKey[]).forEach((k) => {
                    next[k] = next[k].filter((id) => id !== user.id);
                });
                next[key] = [...(next[key] || []), user.id];
            }
            return next;
        });

        try {
            await postApi.toggleCommentReaction(post._id, comment._id, type, token);
            await onCommentUpdated();
        } catch {
            toast.error('Có lỗi xảy ra');
            setLocalReactions(comment.reactions);
        }
        setShowReactionPopup(false);
    };

    const handleReply = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để trả lời');
            return;
        }
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            await postApi.addComment(post._id, replyContent, token, comment._id);
            setReplyContent('');
            setShowReplyInput(false);
            await onCommentUpdated();
            toast.success('Đã thêm phản hồi');
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
        try {
            await postApi.deleteComment(post._id, comment._id, token!);
            await onCommentUpdated();
            toast.success('Đã xóa bình luận');
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleReport = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để báo cáo');
            return;
        }
        if (!selectedReason) {
            toast.error('Vui lòng chọn lý do');
            return;
        }
        setReporting(true);
        try {
            await postApi.reportComment(post._id, comment._id, selectedReason, token);
            toast.success('Đã gửi báo cáo');
            setReportOpen(false);
            setSelectedReason('');
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setReporting(false);
        }
    };

    return (
        <>
            <div className={`flex gap-3 ${level > 0 ? 'ml-10 mt-3' : 'mt-4'}`}>
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user?.avatar} />
                    <AvatarFallback>{comment.user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-2xl inline-block max-w-full">
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-sm">{comment.user?.fullName || 'Người dùng'}</p>
                            {comment.user?._id === post.author._id && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                    Tác giả
                                </span>
                            )}
                        </div>
                        {comment.replyToName && level > 0 && (
                            <span className="text-xs text-blue-500 font-medium">@{comment.replyToName} </span>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{comment.content}</p>
                    </div>

                    {totalReactions > 0 && (
                        <div className="flex items-center gap-1 mt-1 ml-1">
                            <div className="flex -space-x-1">
                                {REACTIONS.filter((r) => localReactions[r.type as ReactionKey]?.length > 0)
                                    .slice(0, 3)
                                    .map((r) => (
                                        <img key={r.type} src={r.icon} alt={r.type} className="w-4 h-4" />
                                    ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{totalReactions}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mt-1 ml-1">
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>

                        <div className="relative" ref={popupRef}>
                            <button
                                onClick={() => setShowReactionPopup(!showReactionPopup)}
                                className={`text-xs font-semibold transition ${userReaction ? 'text-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {userReaction ? userReaction.label : 'Thích'}
                            </button>
                            {showReactionPopup && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-3 py-2 flex gap-1 z-50">
                                    {REACTIONS.map((reaction) => (
                                        <button
                                            key={reaction.type}
                                            onClick={() => handleReaction(reaction.type)}
                                            title={reaction.label}
                                            className="w-9 h-9 hover:scale-125 transition-transform duration-150 rounded-full flex items-center justify-center"
                                        >
                                            <img src={reaction.icon} alt={reaction.type} className="w-7 h-7" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                        >
                            Trả lời
                        </button>

                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-xs font-semibold text-muted-foreground hover:text-red-500 transition flex items-center gap-1"
                            >
                                <Trash2 size={12} />
                                Xóa
                            </button>
                        )}

                        <button
                            onClick={() => setReportOpen(true)}
                            className="text-xs font-semibold text-muted-foreground hover:text-red-500 transition flex items-center gap-1"
                        >
                            <Flag size={12} />
                            Báo cáo
                        </button>
                    </div>

                    {showReplyInput && (
                        <div className="flex gap-2 mt-3">
                            <Avatar className="w-7 h-7 flex-shrink-0">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea
                                    placeholder={`Trả lời ${comment.user?.fullName}...`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows={2}
                                    className="text-sm rounded-2xl resize-none"
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={handleReply} disabled={submitting || !replyContent.trim()}>
                                        {submitting ? 'Đang gửi...' : 'Gửi'}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setShowReplyInput(false); setReplyContent(''); }}>
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {comment.children && comment.children.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {comment.children.map((child) => (
                                <CommentItem
                                    key={child._id}
                                    comment={child}
                                    post={post}
                                    onCommentUpdated={onCommentUpdated}
                                    level={1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Báo cáo bình luận</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <p className="text-sm text-muted-foreground">Chọn lý do báo cáo:</p>
                        {REPORT_REASONS.map((reason) => (
                            <button
                                key={reason}
                                onClick={() => setSelectedReason(reason)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition flex items-center justify-between border ${selectedReason === reason
                                    ? 'border-black dark:border-white bg-muted font-medium'
                                    : 'border-transparent hover:bg-muted'
                                    }`}
                            >
                                {reason}
                                {selectedReason === reason && <Check size={15} />}
                            </button>
                        ))}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setReportOpen(false)}>Hủy</Button>
                        <Button onClick={handleReport} disabled={reporting || !selectedReason}>
                            {reporting ? 'Đang gửi...' : 'Gửi báo cáo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}