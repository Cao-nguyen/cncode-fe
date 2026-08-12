'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, Edit2, Loader2, Pin, Lock, Clock, MessageSquare } from 'lucide-react';
import { feedbackApi, getErrorMessage } from '@/lib/api/feedback.api';
import {
    Feedback,
    FeedbackCategory,
    CATEGORY_COLORS,
    CATEGORY_LABELS,
    STATUS_COLORS,
    STATUS_LABELS,
    PRIORITY_LABELS,
    CREATE_CATEGORY_OPTIONS,
} from '@/types/feedback.type';
import { useAuthStore } from '@/store/auth.store';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarImageProps, getAvatarUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FeedbackCardProps {
    feedback: Feedback;
    onUpdated?: () => void;
    onDeleted?: () => void;
}

function fmtDate(date: string) {
    const created = new Date(date);
    const diffMins = Math.floor((Date.now() - created.getTime()) / 60000);
    if (diffMins < 60) return `${Math.max(diffMins, 0)} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return created.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function FeedbackCard({ feedback, onUpdated, onDeleted }: FeedbackCardProps) {
    const { user, token } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [hasLiked, setHasLiked] = useState(!!feedback.userLiked);
    const [localReactCount, setLocalReactCount] = useState(feedback.reactCount || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editForm, setEditForm] = useState({
        title: feedback.title,
        content: feedback.content,
        category: feedback.category as FeedbackCategory,
    });

    useEffect(() => {
        setLocalReactCount(feedback.reactCount || 0);
        setHasLiked(!!feedback.userLiked);
    }, [feedback._id, feedback.reactCount, feedback.userLiked]);

    const isOwner = user?._id === feedback.userId?._id;
    const displayName = feedback.userId?.fullName || 'Người dùng';
    const canEdit = isOwner && !feedback.isLocked && !['completed', 'rejected'].includes(feedback.status);

    const handleLike = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để ủng hộ');
            return;
        }
        if (feedback.isLocked || isLiking) return;

        const wasLiked = hasLiked;
        setIsLiking(true);
        setHasLiked(!wasLiked);
        setLocalReactCount((prev) => (wasLiked ? prev - 1 : prev + 1));

        try {
            const result = await feedbackApi.reactFeedback(feedback._id);
            if (result.success && result.data) {
                setLocalReactCount(result.data.reactCount);
                setHasLiked(result.data.liked);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            setHasLiked(wasLiked);
            setLocalReactCount((prev) => (wasLiked ? prev + 1 : prev - 1));
            toast.error(getErrorMessage(error));
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await feedbackApi.deleteFeedback(feedback._id);
            toast.success('Đã xóa góp ý');
            setShowDeleteModal(false);
            onDeleted?.();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    };

    const handleEdit = async () => {
        if (!editForm.title.trim() || !editForm.content.trim()) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
            return;
        }
        setIsSubmitting(true);
        try {
            await feedbackApi.updateFeedback(feedback._id, editForm);
            toast.success('Cập nhật góp ý thành công');
            setIsEditing(false);
            onUpdated?.();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isEditing) {
        return (
            <article className="overflow-hidden rounded-xl border border-blue-200 bg-[var(--cn-bg-card)] shadow-sm">
                <div className="border-b border-[var(--cn-border)] px-4 py-3 md:px-5">
                    <p className="text-sm font-semibold text-[var(--cn-text-main)]">Chỉnh sửa góp ý</p>
                </div>
                <div className="space-y-4 px-4 py-4 md:px-5">
                    <CustomSelect
                        value={editForm.category}
                        onChange={(value) => setEditForm((prev) => ({ ...prev, category: value as FeedbackCategory }))}
                        options={CREATE_CATEGORY_OPTIONS}
                        placeholder="Danh mục"
                    />
                    <CustomInput
                        value={editForm.title}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Tiêu đề"
                    />
                    <CustomTextarea
                        value={editForm.content}
                        onChange={(value) => setEditForm((prev) => ({ ...prev, content: value }))}
                        placeholder="Nội dung"
                        rows={5}
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 rounded-lg border border-[var(--cn-border)] px-4 py-2 text-sm text-[var(--cn-text-sub)] transition hover:bg-[var(--cn-hover)]">
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleEdit}
                            disabled={isSubmitting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--cn-primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Lưu
                        </button>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <>
            <article className={cn(
                'group flex h-full flex-col overflow-hidden rounded-xl border bg-[var(--cn-bg-card)] shadow-sm transition',
                hasLiked
                    ? 'border-red-200/80 hover:shadow-md'
                    : 'border-[var(--cn-border)] hover:border-[var(--cn-primary)]/25 hover:shadow-md',
            )}>
                <div className="flex items-start justify-between gap-3 px-4 pt-4 md:px-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[feedback.category])}>
                            {CATEGORY_LABELS[feedback.category]}
                        </span>
                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', STATUS_COLORS[feedback.status])}>
                            {STATUS_LABELS[feedback.status]}
                        </span>
                        {feedback.priority === 'high' && (
                            <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                                {PRIORITY_LABELS.high}
                            </span>
                        )}
                        {feedback.isPinned && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                                <Pin className="h-3 w-3" /> Ghim
                            </span>
                        )}
                        {feedback.isLocked && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--cn-bg-section)] px-2 py-0.5 text-xs text-[var(--cn-text-muted)]">
                                <Lock className="h-3 w-3" /> Đã khóa
                            </span>
                        )}
                    </div>
                    {canEdit && (
                        <div className="flex shrink-0 items-center gap-0.5">
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="rounded-lg p-1.5 text-[var(--cn-text-muted)] transition hover:bg-[var(--cn-hover)] hover:text-blue-600"
                                title="Sửa"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="rounded-lg p-1.5 text-[var(--cn-text-muted)] transition hover:bg-red-50 hover:text-red-600"
                                title="Xóa"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 px-4 py-3 md:px-5">
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[var(--cn-text-main)] transition group-hover:text-[var(--cn-primary)] md:text-lg">
                        {feedback.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--cn-text-sub)]">
                        {feedback.content}
                    </p>

                    {feedback.adminResponse && (
                        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">Phản hồi admin</p>
                            <p className="line-clamp-2 text-sm text-gray-700">{feedback.adminResponse}</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto border-t border-[var(--cn-border)] px-4 py-3 md:px-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <Avatar className="h-7 w-7 shrink-0 border border-[var(--cn-border)]">
                                <AvatarImage src={getAvatarUrl(feedback.userId?.avatar)} alt={displayName} {...avatarImageProps} />
                                <AvatarFallback className="text-[10px]">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm font-medium text-[var(--cn-text-main)]">{displayName}</span>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-[var(--cn-text-muted)]">
                            <Clock className="h-3.5 w-3.5" />
                            {fmtDate(feedback.createdAt)}
                        </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--cn-text-sub)]">
                        {feedback.commentCount > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                                <MessageSquare className="h-4 w-4" />
                                {feedback.commentCount}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleLike}
                            disabled={isLiking || feedback.isLocked}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition disabled:opacity-50',
                                hasLiked ? 'text-red-500' : 'text-[var(--cn-text-sub)] hover:text-red-500',
                            )}
                        >
                            {isLiking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Heart
                                    className="h-4 w-4"
                                    data-filled={hasLiked ? 'true' : 'false'}
                                    fill={hasLiked ? 'currentColor' : 'none'}
                                />
                            )}
                            {localReactCount > 0 ? localReactCount : 'Ủng hộ'}
                        </button>
                    </div>
                </div>
            </article>

            <ConfirmModalDelete
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Xóa góp ý"
                message="Bạn có chắc muốn xóa góp ý này?"
                warning="Hành động này không thể hoàn tác."
                isDeleting={deleting}
            />
        </>
    );
}
