// components/feedback/FeedbackCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { IFeedback } from '@/lib/api/feedback.api';
import StatusBadge from '@/components/common/StatusBadge';
import { Heart, MessageCircle, Trash2, Calendar, Pencil, X, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomInput } from '@/components/custom/CustomInput';

interface FeedbackCardProps {
    feedback: IFeedback;
    onLike?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string, title: string, content: string, category: string) => Promise<void>;
    showAdminNote?: boolean;
    isAdmin?: boolean;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    bug: { label: 'Lỗi/Bug', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
    feature: { label: 'Tính năng mới', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
    improvement: { label: 'Cải tiến', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
    other: { label: 'Khác', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400' }
};

const CATEGORIES = [
    { value: 'bug', label: '🐛 Lỗi/Bug' },
    { value: 'feature', label: '✨ Tính năng mới' },
    { value: 'improvement', label: '⚡ Cải tiến' },
    { value: 'other', label: '💡 Khác' }
];

type CategoryType = 'bug' | 'feature' | 'improvement' | 'other';

export default function FeedbackCard({ feedback, onLike, onDelete, onEdit, showAdminNote = false, isAdmin = false }: FeedbackCardProps) {
    const { token, user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [likes, setLikes] = useState(feedback.likes);
    const [liked, setLiked] = useState(feedback.likedBy?.includes(user?._id || '') || false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: feedback.title,
        content: feedback.content,
        category: feedback.category as CategoryType
    });
    const [submitting, setSubmitting] = useState(false);

    const category = categoryLabels[feedback.category] || categoryLabels.other;
    const isOwnFeedback = user?._id === feedback.userId?._id;
    const canDelete = isAdmin || isOwnFeedback;
    const canEdit = isOwnFeedback && feedback.status !== 'completed' && feedback.status !== 'rejected';

    // Real-time like listener
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleLikeUpdate = (data: { feedbackId: string; likes: number; likedBy: string[]; userId: string; liked: boolean }) => {
            if (data.feedbackId === feedback._id) {
                setLikes(data.likes);
                const isCurrentlyLiked = data.likedBy.includes(user?._id || '');
                setLiked(isCurrentlyLiked);
            }
        };

        socket.on('feedback_liked', handleLikeUpdate);

        return () => {
            socket.off('feedback_liked', handleLikeUpdate);
        };
    }, [socket, isConnected, feedback._id, user?._id]);

    const handleLike = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để ủng hộ');
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        if (onLike) {
            await onLike(feedback._id);
        }
        setIsLiking(false);
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa góp ý này?')) return;

        setIsDeleting(true);
        if (onDelete) {
            await onDelete(feedback._id);
        }
        setIsDeleting(false);
    };

    const handleEdit = async () => {
        if (!editForm.title.trim()) {
            toast.warning('Vui lòng nhập tiêu đề');
            return;
        }
        if (!editForm.content.trim()) {
            toast.warning('Vui lòng nhập nội dung');
            return;
        }

        setSubmitting(true);
        if (onEdit) {
            await onEdit(feedback._id, editForm.title, editForm.content, editForm.category);
        }
        setIsEditing(false);
        setSubmitting(false);
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays === 1) return '1 ngày trước';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return format(created, 'dd/MM/yyyy', { locale: vi });
    };

    const userName = feedback.userId?.fullName || 'Người dùng';
    const userAvatar = feedback.userId?.avatar;
    const userInitial = userName !== 'Người dùng' ? userName.charAt(0).toUpperCase() : '?';

    // Edit mode
    if (isEditing) {
        return (
            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-4 sm:p-5 border border-[var(--cn-primary)]/30 shadow-[var(--cn-shadow-sm)]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--cn-text-main)]">Chỉnh sửa góp ý</h3>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-1 hover:bg-[var(--cn-hover)] rounded-[var(--cn-radius-sm)] transition text-[var(--cn-text-muted)]"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Danh mục</label>
                        <CustomSelect
                            value={editForm.category}
                            onChange={(value) => setEditForm(prev => ({ ...prev, category: value as CategoryType }))}
                            options={CATEGORIES.map(cat => ({ value: cat.value, label: cat.label }))}
                            placeholder="Chọn danh mục"
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Tiêu đề</label>
                        <CustomInput
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Nhập tiêu đề góp ý..."
                        />
                        <p className="text-right text-[10px] sm:text-xs text-[var(--cn-text-muted)] mt-1">
                            {editForm.title.length}/200
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Nội dung</label>
                        <textarea
                            value={editForm.content}
                            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Mô tả chi tiết ý kiến của bạn..."
                            rows={4}
                            maxLength={2000}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--cn-primary)]/20 focus:border-[var(--cn-primary)] text-sm text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] resize-none"
                        />
                        <p className="text-right text-[10px] sm:text-xs text-[var(--cn-text-muted)] mt-1">
                            {editForm.content.length}/2000
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 px-4 py-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-hover)] transition text-[var(--cn-text-sub)] text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleEdit}
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-4 sm:p-5 border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)] hover:shadow-[var(--cn-shadow-md)] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden">
                            {userAvatar ? (
                                <Image
                                    src={userAvatar}
                                    alt={userName}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--cn-primary)] font-semibold text-xs sm:text-sm">
                                    {userInitial}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-[var(--cn-text-main)] truncate">
                            {userName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${category.color}`}>
                                {category.label}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[var(--cn-text-muted)]">
                                <Calendar size={10} className="sm:w-3 sm:h-3" />
                                <span>{getTimeAgo(feedback.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <StatusBadge status={feedback.status} size="sm" />
                    {canEdit && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 text-[var(--cn-primary)] hover:bg-[var(--cn-primary)]/10 rounded-[var(--cn-radius-sm)] transition-colors"
                            title="Chỉnh sửa góp ý"
                        >
                            <Pencil size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-[var(--cn-radius-sm)] transition-colors disabled:opacity-50"
                            title="Xóa góp ý"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Trash2 size={14} className="sm:w-4 sm:h-4" />}
                        </button>
                    )}
                </div>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-[var(--cn-text-main)] mb-2 line-clamp-2">
                {feedback.title}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--cn-text-sub)] leading-relaxed mb-4 line-clamp-3">
                {feedback.content}
            </p>

            {showAdminNote && feedback.adminNote && (
                <div className="bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-sm)] p-2.5 sm:p-3 mb-4 border-l-4 border-[var(--cn-primary)]">
                    <p className="text-[10px] sm:text-xs text-[var(--cn-text-muted)] uppercase mb-1">Phản hồi từ admin</p>
                    <p className="text-xs sm:text-sm text-[var(--cn-text-sub)]">{feedback.adminNote}</p>
                </div>
            )}

            <div className="flex items-center gap-4 pt-3 border-t border-[var(--cn-border)]">
                <button
                    onClick={handleLike}
                    disabled={!token || isLiking}
                    className={`flex items-center gap-1 text-xs sm:text-sm transition-colors ${liked ? 'text-red-500' : 'text-[var(--cn-text-muted)] hover:text-red-500'
                        }`}
                >
                    <Heart data-filled={true} size={14} className={`sm:w-4 sm:h-4 ${liked ? 'fill-red-500' : ''}`} />
                    <span>{likes}</span>
                </button>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-[var(--cn-text-muted)]">
                    <MessageCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span>{likes} ủng hộ</span>
                </div>
            </div>
        </div>
    );
}