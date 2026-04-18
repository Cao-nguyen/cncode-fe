'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, Reply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { IComment, IPost } from '@/types/post.type';
import { INotification } from '@/types/notification.type';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { postApi } from '@/lib/api/post.api';
import { useSocket } from '@/providers/socket.provider';

const REACTIONS = [
    { type: 'like', icon: '/icons/like.svg', label: 'Thích' },
    { type: 'love', icon: '/icons/love.svg', label: 'Yêu thích' },
    { type: 'care', icon: '/icons/care.svg', label: 'Quan tâm' },
    { type: 'haha', icon: '/icons/haha.svg', label: 'Haha' },
    { type: 'wow', icon: '/icons/wow.svg', label: 'Wow' },
    { type: 'sad', icon: '/icons/sad.svg', label: 'Buồn' },
    { type: 'angry', icon: '/icons/angry.svg', label: 'Phẫn nộ' }
];

type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

interface CommentItemProps {
    comment: IComment;
    post: IPost;
    onCommentUpdated: () => void;
    level?: number;
}

export default function CommentItem({ comment, post, onCommentUpdated, level = 0 }: CommentItemProps) {
    const { user, token } = useAuthStore();
    const { socket } = useSocket();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReactionPopup, setShowReactionPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [localReactions, setLocalReactions] = useState(comment.reactions);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalReactions(comment.reactions);
    }, [comment.reactions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setShowReactionPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: INotification) => {
            if (notification.type === 'reaction' && notification.commentId === comment._id) {
                onCommentUpdated();
            }
        };

        socket.on('new_notification', handleNewNotification);
        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, comment._id, onCommentUpdated]);

    const getUserReaction = () => {
        if (!user) return null;
        for (const reaction of REACTIONS) {
            const reactionKey = reaction.type as ReactionType;
            if (localReactions?.[reactionKey]?.includes(user.id)) {
                return reaction;
            }
        }
        return null;
    };

    const userReaction = getUserReaction();
    const canDelete = user && (user.id === comment.user._id || user.id === post.author._id || user.role === 'admin');

    const handleReaction = async (type: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để thả cảm xúc');
            return;
        }

        const reactionKey = type as ReactionType;
        const hasReacted = localReactions?.[reactionKey]?.includes(user!.id);

        setLocalReactions(prev => {
            const newReactions = { ...prev };
            if (hasReacted) {
                newReactions[reactionKey] = newReactions[reactionKey].filter(id => id !== user!.id);
            } else {
                for (const key of Object.keys(newReactions)) {
                    newReactions[key as ReactionType] = newReactions[key as ReactionType].filter(id => id !== user!.id);
                }
                newReactions[reactionKey] = [...(newReactions[reactionKey] || []), user!.id];
            }
            return newReactions;
        });

        try {
            await postApi.toggleCommentReaction(post._id, comment._id, type, token);
            onCommentUpdated();
        } catch (error) {
            console.error('Failed to react:', error);
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
        if (!replyContent.trim()) {
            toast.error('Vui lòng nhập nội dung');
            return;
        }
        setSubmitting(true);
        try {
            await postApi.addComment(post._id, replyContent, token, comment._id);
            setReplyContent('');
            setShowReplyInput(false);
            onCommentUpdated();
            toast.success('Đã thêm phản hồi');
        } catch (error) {
            console.error('Failed to reply:', error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
        try {
            await postApi.deleteComment(post._id, comment._id, token!);
            onCommentUpdated();
            toast.success('Đã xóa bình luận');
        } catch (error) {
            console.error('Failed to delete comment:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return d.toLocaleDateString('vi-VN');
    };

    const getReplyText = () => {
        if (comment.replyToName && level === 0) {
            return `@${comment.replyToName} `;
        }
        return '';
    };

    return (
        <div className={`relative ${level > 0 ? 'ml-8 mt-3' : ''}`}>
            <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user?.avatar} />
                    <AvatarFallback>{comment.user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">{comment.user?.fullName || 'Người dùng'}</p>
                                {comment.user?._id === post.author._id && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                        Tác giả
                                    </span>
                                )}
                            </div>
                            {canDelete && (
                                <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 break-words">
                            {getReplyText()}
                            {comment.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="relative">
                                <button
                                    onClick={() => setShowReactionPopup(!showReactionPopup)}
                                    className="text-xs text-gray-500 hover:text-blue-500 transition flex items-center gap-1"
                                >
                                    {userReaction ? (
                                        <img src={userReaction.icon} alt="" className="w-4 h-4" />
                                    ) : (
                                        <Heart size={12} />
                                    )}
                                    <span>Thích</span>
                                </button>
                                {showReactionPopup && (
                                    <div
                                        ref={popupRef}
                                        className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 flex gap-1 z-50"
                                    >
                                        {REACTIONS.map((reaction) => (
                                            <button
                                                key={reaction.type}
                                                onClick={() => handleReaction(reaction.type)}
                                                className="w-10 h-10 hover:scale-125 transition-transform duration-200 rounded-full flex items-center justify-center"
                                                title={reaction.label}
                                            >
                                                <img src={reaction.icon} alt={reaction.type} className="w-7 h-7" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowReplyInput(!showReplyInput)}
                                className="text-xs text-gray-500 hover:text-blue-500 transition flex items-center gap-1"
                            >
                                <Reply size={12} />
                                <span>Trả lời</span>
                            </button>
                        </div>
                        {userReaction && (
                            <div className="flex items-center gap-1 mt-1">
                                <img src={userReaction.icon} alt="" className="w-4 h-4" />
                                <span className="text-xs text-gray-500">Bạn đã bày tỏ cảm xúc</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-2">{formatDate(comment.createdAt)}</p>

                    {showReplyInput && (
                        <div className="flex gap-2 mt-3 ml-8">
                            <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea
                                    placeholder={`Trả lời ${comment.user?.fullName}...`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows={2}
                                    className="text-sm"
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={handleReply} disabled={submitting}>
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

                    {comment.children && comment.children.length > 0 && (
                        <div className="mt-3">
                            {comment.children.map((child) => (
                                <CommentItem
                                    key={child._id}
                                    comment={child}
                                    post={post}
                                    onCommentUpdated={onCommentUpdated}
                                    level={level + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}