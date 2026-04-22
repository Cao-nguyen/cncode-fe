'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, MoreHorizontal, Trash2, Flag, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { IComment, IPost, IReactions } from '@/types/post.type';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { postApi } from '@/lib/api/post.api';
import { useSocket } from '@/providers/socket.provider';

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

const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const getTotalReactions = (reactions: IReactions): number =>
    Object.values(reactions).reduce((sum, arr) => sum + arr.length, 0);

interface CommentItemProps {
    comment: IComment;
    post: IPost;
    onCommentUpdated: () => Promise<void>;
    isChild?: boolean;
}

export default function CommentItem({
    comment,
    post,
    onCommentUpdated,
    isChild = false,
}: CommentItemProps) {
    const { user, token } = useAuthStore();
    const { socket } = useSocket();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReactionPopup, setShowReactionPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [localReactions, setLocalReactions] = useState<IReactions>(comment.reactions);
    const [reportOpen, setReportOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [reporting, setReporting] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const reactionRef = useRef<HTMLDivElement>(null);

    // Lắng nghe reaction realtime từ socket
    useEffect(() => {
        if (!socket) return;

        const handleCommentReactionUpdate = (data: {
            commentId: string;
            reactions: IReactions;
            postSlug: string;
        }) => {
            if (data.commentId === comment._id) {
                setLocalReactions(data.reactions);
            }
        };

        socket.on('comment:reaction_updated', handleCommentReactionUpdate);

        return () => {
            socket.off('comment:reaction_updated', handleCommentReactionUpdate);
        };
    }, [socket, comment._id]);

    useEffect(() => {
        setLocalReactions(comment.reactions);
    }, [comment.reactions]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (reactionRef.current && !reactionRef.current.contains(e.target as Node)) {
                setShowReactionPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getUserId = (u: { _id?: string; id?: string } | null | undefined): string | undefined => {
        if (!u) return undefined;
        return u._id || u.id;
    };

    const currentUserId = getUserId(user);
    const commentUserId = getUserId(comment.user);
    const postAuthorId = getUserId(post.author);

    // Lấy reaction hiện tại của user
    const getUserCurrentReaction = (): { type: string; label: string } | null => {
        if (!currentUserId) return null;
        for (const r of REACTIONS) {
            if (localReactions[r.type as ReactionKey]?.includes(currentUserId)) {
                return { type: r.type, label: r.label };
            }
        }
        return null;
    };

    const userReaction = getUserCurrentReaction();
    const totalReactions = getTotalReactions(localReactions);

    const canDelete = !!(user && (
        currentUserId === commentUserId ||
        currentUserId === postAuthorId ||
        user.role === 'admin'
    ));

    const canEdit = !!(user && currentUserId === commentUserId);

    // Xử lý reaction với optimistic update
    const handleReaction = async (type: string) => {
        if (!token || !user || !currentUserId) {
            toast.error('Vui lòng đăng nhập để thả cảm xúc');
            return;
        }

        const key = type as ReactionKey;
        const currentReaction = userReaction;
        const isSameReaction = currentReaction?.type === type;

        // Optimistic update
        const newReactions = { ...localReactions };

        if (isSameReaction) {
            newReactions[key] = newReactions[key].filter((id) => id !== currentUserId);
        } else {
            REACTIONS.forEach(r => {
                newReactions[r.type as ReactionKey] = newReactions[r.type as ReactionKey].filter(
                    (id) => id !== currentUserId
                );
            });
            newReactions[key] = [...(newReactions[key] || []), currentUserId];
        }

        setLocalReactions(newReactions);
        setShowReactionPopup(false);

        try {
            await postApi.toggleCommentReaction(post._id, comment._id, type, token);
            // Không cần gọi onCommentUpdated, socket sẽ tự cập nhật
        } catch (error) {
            toast.error('Có lỗi xảy ra');
            setLocalReactions(comment.reactions);
        }
    };

    const handleReply = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để trả lời');
            return;
        }
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            const rootId = comment.parentId ?? comment._id;
            await postApi.addComment(post._id, replyContent, token, rootId);
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
        if (!token) return;
        try {
            await postApi.deleteComment(post._id, comment._id, token);
            await onCommentUpdated();
            toast.success('Đã xóa bình luận');
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleEditSubmit = async () => {
        if (!token || !editContent.trim()) return;
        setEditSubmitting(true);
        try {
            await postApi.editComment(post._id, comment._id, editContent, token);
            await onCommentUpdated();
            setIsEditing(false);
            toast.success('Đã cập nhật bình luận');
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setEditSubmitting(false);
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
            <div className={`flex gap-2 sm:gap-3 ${isChild ? 'ml-6 sm:ml-8 mt-2' : 'mt-4'}`}>
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 mt-0.5">
                    <AvatarImage src={comment.user?.avatar} />
                    <AvatarFallback>{comment.user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2.5 rounded-2xl inline-block max-w-full">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
                            <p className="font-semibold text-sm leading-tight">
                                {comment.user?.fullName || 'Người dùng'}
                            </p>
                            {commentUserId && postAuthorId && commentUserId === postAuthorId && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                    Tác giả
                                </span>
                            )}
                            {comment.editedAt && (
                                <span className="text-xs text-muted-foreground italic">
                                    (đã chỉnh sửa)
                                </span>
                            )}
                        </div>

                        {comment.replyToName && isChild && (
                            <span className="text-xs text-blue-500 font-medium">
                                @{comment.replyToName}{' '}
                            </span>
                        )}

                        {isEditing ? (
                            <div className="mt-1 space-y-2">
                                <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={2}
                                    className="text-sm rounded-xl resize-none bg-white dark:bg-gray-700 min-w-[200px]"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleEditSubmit}
                                        disabled={editSubmitting || !editContent.trim()}
                                    >
                                        {editSubmitting ? 'Đang lưu...' : 'Lưu'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditContent(comment.content);
                                        }}
                                    >
                                        <X size={14} className="mr-1" />
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
                                {comment.content}
                            </p>
                        )}
                    </div>

                    {/* Hiển thị reactions - chỉ hiển thị icon và số lượng */}
                    {totalReactions > 0 && (
                        <div className="flex items-center gap-1 mt-1 ml-1">
                            <div className="flex -space-x-1">
                                {REACTIONS.filter(
                                    (r) => localReactions[r.type as ReactionKey]?.length > 0,
                                )
                                    .slice(0, 3)
                                    .map((r) => (
                                        <Image
                                            key={r.type}
                                            src={r.icon}
                                            alt={r.type}
                                            width={16}
                                            height={16}
                                            className="w-4 h-4"
                                        />
                                    ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{totalReactions}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-3 mt-1 ml-1 flex-wrap">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(comment.createdAt)}
                        </span>

                        <div className="relative flex items-center" ref={reactionRef}>
                            <button
                                onClick={() => setShowReactionPopup((v) => !v)}
                                className={`text-xs font-semibold leading-none transition px-2 py-0.5 rounded-full ${userReaction
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {userReaction ? userReaction.label : 'Thích'}
                            </button>

                            {showReactionPopup && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-2 py-1.5 flex gap-0.5 z-50">
                                    {REACTIONS.map((reaction) => (
                                        <button
                                            key={reaction.type}
                                            onPointerDown={(e) => {
                                                e.preventDefault();
                                                handleReaction(reaction.type);
                                            }}
                                            title={reaction.label}
                                            className="w-8 h-8 hover:scale-125 active:scale-110 transition-transform duration-150 rounded-full flex items-center justify-center touch-manipulation"
                                        >
                                            <Image
                                                src={reaction.icon}
                                                alt={reaction.type}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowReplyInput((v) => !v)}
                            className="text-xs font-semibold leading-none text-muted-foreground hover:text-foreground transition px-2 py-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Trả lời
                        </button>

                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center text-muted-foreground hover:text-foreground transition p-0.5 rounded-full hover:bg-muted">
                                    <MoreHorizontal size={15} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                side="top"
                                sideOffset={4}
                                className="w-44 rounded-xl p-1"
                            >
                                {canEdit && (
                                    <DropdownMenuItem
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 cursor-pointer py-2 rounded-lg"
                                    >
                                        <Pencil size={14} />
                                        <span className="text-xs">Chỉnh sửa</span>
                                    </DropdownMenuItem>
                                )}
                                {canDelete && (
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 text-red-500 cursor-pointer py-2 rounded-lg"
                                    >
                                        <Trash2 size={14} />
                                        <span className="text-xs">Xóa bình luận</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => setReportOpen(true)}
                                    className="flex items-center gap-2 cursor-pointer py-2 rounded-lg"
                                >
                                    <Flag size={14} />
                                    <span className="text-xs">Báo cáo</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {showReplyInput && (
                        <div className="flex gap-2 mt-3">
                            <Avatar className="w-7 h-7 flex-shrink-0">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <Textarea
                                    placeholder={`Trả lời ${comment.user?.fullName}...`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows={2}
                                    className="text-sm rounded-2xl resize-none w-full"
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        onClick={handleReply}
                                        disabled={submitting || !replyContent.trim()}
                                    >
                                        {submitting ? 'Đang gửi...' : 'Gửi'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setShowReplyInput(false);
                                            setReplyContent('');
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isChild && comment.children && comment.children.length > 0 && (
                        <div className="mt-1 space-y-0">
                            {comment.children.map((child) => (
                                <CommentItem
                                    key={child._id}
                                    comment={child}
                                    post={post}
                                    onCommentUpdated={onCommentUpdated}
                                    isChild
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
                        <Button variant="ghost" onClick={() => setReportOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleReport} disabled={reporting || !selectedReason}>
                            {reporting ? 'Đang gửi...' : 'Gửi báo cáo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}