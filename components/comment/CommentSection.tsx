'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { commentApi, CommentType } from '@/lib/api/comment.api';
import CommentItem from './CommentItem';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { DeleteConfirmModal } from '@/components/custom/DeleteConfirmModal';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface CommentSectionProps {
    targetType: 'post' | 'lesson' | 'workspace' | 'task' | 'feedback' | 'feed' | 'short_video' | 'blog';
    targetId: string;
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
    const { user, token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchComments = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        try {
            setLoading(true);
            const result = await commentApi.getComments(targetType, targetId, pageNum, 20);

            if (result.success) {
                const commentsWithReplies = await Promise.all(
                    (result.data || []).map(async (comment: CommentType) => {
                        if (comment.replyCount > 0) {
                            const repliesResult = await commentApi.getReplies(comment._id, 1, 10);
                            if (repliesResult.success) {
                                return { ...comment, replies: repliesResult.data };
                            }
                        }
                        return { ...comment, replies: [] };
                    })
                );

                if (append) {
                    setComments(prev => [...prev, ...commentsWithReplies]);
                } else {
                    setComments(commentsWithReplies);
                }
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages);
                    setHasMore(result.pagination.page < result.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error('Fetch comments error:', error);
            toast.error('Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    }, [targetType, targetId]);

    useEffect(() => {
        fetchComments(1);
    }, [fetchComments]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewComment = (newComment: CommentType) => {
            if (!newComment.parentId) {
                setComments(prev => [newComment, ...prev]);
            } else {
                setComments(prev => prev.map(comment => {
                    if (comment._id === newComment.parentId) {
                        const updatedReplies = [newComment, ...(comment.replies || [])];
                        return { ...comment, replies: updatedReplies, replyCount: (comment.replyCount || 0) + 1 };
                    }
                    return comment;
                }));
            }
        };

        const handleCommentUpdated = (updatedComment: CommentType) => {
            setComments(prev => prev.map(c => c._id === updatedComment._id ? updatedComment : c));
        };

        const handleCommentDeleted = (commentId: string) => {
            setComments(prev => prev.filter(c => c._id !== commentId));
        };

        socket.on(`comment_created_${targetType}_${targetId}`, handleNewComment);
        socket.on(`comment_updated_${targetType}_${targetId}`, handleCommentUpdated);
        socket.on(`comment_deleted_${targetType}_${targetId}`, handleCommentDeleted);

        return () => {
            socket.off(`comment_created_${targetType}_${targetId}`, handleNewComment);
            socket.off(`comment_updated_${targetType}_${targetId}`, handleCommentUpdated);
            socket.off(`comment_deleted_${targetType}_${targetId}`, handleCommentDeleted);
        };
    }, [socket, isConnected, targetType, targetId]);

    const handleSubmitComment = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để bình luận');
            return;
        }
        if (!newComment.trim()) {
            toast.warning('Vui lòng nhập nội dung');
            return;
        }

        setSubmitting(true);
        try {
            const result = await commentApi.createComment(token, {
                targetType,
                targetId,
                content: newComment.trim()
            });

            if (result.success) {
                setNewComment('');
                toast.success('Bình luận thành công');
                fetchComments(1);
            } else {
                toast.error(result.message || 'Bình luận thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (commentId: string, type: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        try {
            const result = await commentApi.reactToComment(token, commentId, type);
            if (result.success) {
                const updateComment = (comment: CommentType): CommentType => {
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            reactions: result.data.reactionCounts,
                            userReaction: result.data.reacted ? result.data.reactionType : null
                        };
                    }
                    if (comment.replies) {
                        return { ...comment, replies: comment.replies.map(reply => updateComment(reply)) };
                    }
                    return comment;
                };
                setComments(prev => prev.map(comment => updateComment(comment)));
            }
        } catch (error) {
            toast.error('Không thể thả cảm xúc');
        }
    };

    const handleReply = async (parentId: string, content: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        try {
            const result = await commentApi.createComment(token, {
                targetType,
                targetId,
                parentId,
                content
            });

            if (result.success) {
                toast.success('Phản hồi thành công');
                fetchComments(1);
            }
        } catch (error) {
            toast.error('Phản hồi thất bại');
        }
    };

    const handleEdit = async (commentId: string, content: string) => {
        if (!token) return;

        try {
            const result = await commentApi.updateComment(token, commentId, content);
            if (result.success) {
                toast.success('Cập nhật thành công');
                fetchComments(page);
            }
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!token) return;
        setCommentToDelete(commentId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!token || !commentToDelete) return;

        setIsDeleting(true);
        try {
            const result = await commentApi.deleteComment(token, commentToDelete);
            if (result.success) {
                toast.success('Xóa bình luận thành công');
                setDeleteModalOpen(false);
                setCommentToDelete(null);
                fetchComments(page);
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch (error) {
            toast.error('Xóa thất bại');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReport = async (commentId: string, reason: string, description?: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        try {
            const result = await commentApi.reportComment(token, commentId, reason, description);
            if (result.success) {
                toast.success('Đã gửi báo cáo, cảm ơn bạn');
            }
        } catch (error) {
            toast.error('Gửi báo cáo thất bại');
        }
    };

    const loadMore = () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchComments(nextPage, true);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Bình luận ({comments.length})
            </h3>

            {user ? (
                <div className="flex gap-3 mb-6">
                    <div className="flex-shrink-0">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.fullName || 'User'}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base"
                            style={{ display: user.avatar ? 'none' : 'flex' }}
                        >
                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <CustomTextarea
                            value={newComment}
                            onChange={setNewComment}
                            placeholder="Viết bình luận..."
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSubmitComment}
                                disabled={submitting || !newComment.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Gửi bình luận
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 mb-6 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                        <a href="/login" className="text-blue-500 hover:underline">Đăng nhập</a> để bình luận
                    </p>
                </div>
            )}

            {loading && comments.length === 0 ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <p>Chưa có bình luận nào</p>
                    <p className="text-sm mt-1">Hãy là người đầu tiên bình luận!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            onLike={handleLike}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReport={handleReport}
                        />
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="text-center mt-4">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="text-sm text-blue-500 hover:text-blue-600 transition"
                    >
                        {loading ? 'Đang tải...' : 'Xem thêm bình luận'}
                    </button>
                </div>
            )}

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setCommentToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Xóa bình luận"
                message="Bạn có chắc chắn muốn xóa bình luận này không?"
                warning="Bình luận đã xóa sẽ không thể khôi phục."
                isDeleting={isDeleting}
            />
        </div>
    );
}
