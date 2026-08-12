'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { commentApi, CommentType } from '@/lib/api/comment.api';
import CommentItem from './CommentItem';
import { CustomTextCmt } from '@/components/custom/CustomTextCmt';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isCommentContentEmpty } from '@/lib/comment-content';

interface CommentSectionProps {
    targetType: 'post' | 'lesson' | 'workspace' | 'task' | 'feedback' | 'feed' | 'short_video' | 'blog';
    targetId: string;
    onCommentCountChange?: (count: number) => void;
}

const normalizeReactions = (raw: unknown): Record<string, number> => {
    if (!raw || typeof raw !== 'object') return {};
    return { ...(raw as Record<string, number>) };
};

const updateCommentInTree = (
    items: CommentType[],
    commentId: string,
    updater: (comment: CommentType) => CommentType,
): CommentType[] =>
    items.map((item) => {
        if (item._id === commentId) return updater(item);
        if (item.replies?.length) {
            return { ...item, replies: updateCommentInTree(item.replies, commentId, updater) };
        }
        return item;
    });

const removeCommentFromTree = (items: CommentType[], commentId: string): CommentType[] =>
    items
        .filter((item) => item._id !== commentId)
        .map((item) => ({
            ...item,
            replies: item.replies ? removeCommentFromTree(item.replies, commentId) : [],
            replyCount: item.replies?.some((r) => r._id === commentId)
                ? Math.max(0, (item.replyCount || 0) - 1)
                : item.replyCount,
        }));

export default function CommentSection({ targetType, targetId, onCommentCountChange }: CommentSectionProps) {
    const { user, token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [newAttachments, setNewAttachments] = useState<string[]>([]);
    const [isCommentExpanded, setIsCommentExpanded] = useState(false);
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

                // Notify parent about comment count change
                if (result.pagination?.total !== undefined) {
                    onCommentCountChange?.(result.pagination.total);
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
                setComments(prev => {
                    const updated = [newComment, ...prev];
                    onCommentCountChange?.(updated.length);
                    return updated;
                });
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
            setComments((prev) => updateCommentInTree(prev, updatedComment._id, (c) => ({
                ...c,
                ...updatedComment,
                replies: c.replies,
            })));
        };

        const handleCommentDeleted = (commentId: string) => {
            setComments((prev) => {
                const updated = removeCommentFromTree(prev, commentId);
                onCommentCountChange?.(updated.length);
                return updated;
            });
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
        if (isCommentContentEmpty(newComment) && newAttachments.length === 0) {
            toast.warning('Vui lòng nhập nội dung hoặc đính kèm media');
            return;
        }

        setSubmitting(true);
        try {
            const result = await commentApi.createComment(token, {
                targetType,
                targetId,
                content: newComment,
                attachments: newAttachments,
            });

            if (result.success) {
                setNewComment('');
                setNewAttachments([]);
                setIsCommentExpanded(false);
                toast.success('Bình luận thành công');
                setComments((prev) => [{ ...result.data, replies: [] }, ...prev]);
                onCommentCountChange?.(comments.length + 1);
            } else {
                toast.error(result.message || 'Bình luận thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelComment = () => {
        setNewComment('');
        setNewAttachments([]);
        setIsCommentExpanded(false);
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
                            reactions: normalizeReactions(result.data.reactionCounts),
                            userReaction: result.data.reacted ? result.data.reactionType : null,
                        };
                    }
                    if (comment.replies) {
                        return { ...comment, replies: comment.replies.map((reply) => updateComment(reply)) };
                    }
                    return comment;
                };
                setComments((prev) => prev.map((comment) => updateComment(comment)));
            } else {
                toast.error(result.message || 'Không thể thả cảm xúc');
            }
        } catch (error) {
            toast.error('Không thể thả cảm xúc');
        }
    };

    const handleReply = async (parentId: string, content: string, replyAttachments: string[] = []) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        if (isCommentContentEmpty(content) && replyAttachments.length === 0) {
            toast.warning('Vui lòng nhập nội dung hoặc đính kèm media');
            return;
        }

        try {
            const result = await commentApi.createComment(token, {
                targetType,
                targetId,
                parentId,
                content,
                attachments: replyAttachments,
            });

            if (result.success) {
                toast.success('Phản hồi thành công');
                const rootId = result.data.parentId || parentId;
                setComments((prev) => updateCommentInTree(prev, rootId, (c) => {
                    const exists = c.replies?.some((r) => r._id === result.data._id);
                    if (exists) return c;
                    return {
                        ...c,
                        replies: [...(c.replies || []), result.data],
                        replyCount: (c.replyCount || 0) + 1,
                    };
                }));
            } else {
                toast.error(result.message || 'Phản hồi thất bại');
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
                setComments((prev) => updateCommentInTree(prev, commentId, (c) => ({
                    ...c,
                    content,
                    isEdited: true,
                    editedAt: new Date().toISOString(),
                })));
            } else {
                toast.error(result.message || 'Cập nhật thất bại');
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
                setComments((prev) => removeCommentFromTree(prev, commentToDelete));
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

    const handleLoadMoreReplies = async (commentId: string) => {
        try {
            const result = await commentApi.getReplies(commentId, 1, 50);
            if (result.success) {
                setComments((prev) => updateCommentInTree(prev, commentId, (c) => ({
                    ...c,
                    replies: result.data || [],
                })));
            }
        } catch {
            toast.error('Không thể tải thêm phản hồi');
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
        <div className="bg-white rounded-xl pt-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Bình luận ({comments.length})
            </h3>

            {user ? (
                <div className="flex gap-3 mb-6">
                    <div className="flex-shrink-0">
                        {user.avatar ? (
                            <img
                                src={getImageUrl(user.avatar)}
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
                    <div className="flex-1 min-w-0 w-full">
                        <CustomTextCmt
                            value={newComment}
                            onChange={setNewComment}
                            attachments={newAttachments}
                            onAttachmentsChange={setNewAttachments}
                            placeholder="Viết bình luận..."
                            rows={3}
                            onSubmit={handleSubmitComment}
                            onCancel={handleCancelComment}
                            cancelLabel="Hủy"
                            isSubmitting={submitting}
                        />
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
                            onLoadMoreReplies={handleLoadMoreReplies}
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
                isDeleting={isDeleting}
            />
        </div>
    );
}
