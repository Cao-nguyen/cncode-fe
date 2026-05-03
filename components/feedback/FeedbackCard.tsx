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
import CustomSelect from '@/components/ui/CustomSelect';
import CustomInput from '@/components/ui/CustomInput';
import CustomTextarea from '@/components/ui/CustomTextarea';

interface FeedbackCardProps {
    feedback: IFeedback;
    onLike?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string, title: string, content: string, category: string) => Promise<void>;
    showAdminNote?: boolean;
    isAdmin?: boolean;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    bug: { label: 'Lỗi/Bug', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    feature: { label: 'Tính năng mới', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    improvement: { label: 'Cải tiến', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    other: { label: 'Khác', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' }
};

const CATEGORIES = [
    { value: 'bug' as const, label: '🐛 Lỗi/Bug' },
    { value: 'feature' as const, label: '✨ Tính năng mới' },
    { value: 'improvement' as const, label: '⚡ Cải tiến' },
    { value: 'other' as const, label: '💡 Khác' }
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
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-main/30 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chỉnh sửa góp ý</h3>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={20} data-filled={true} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Danh mục</label>
                        <CustomSelect
                            value={editForm.category}
                            onChange={(value) => setEditForm(prev => ({ ...prev, category: value as CategoryType }))}
                            options={CATEGORIES.map(cat => ({ value: cat.value, label: cat.label }))}
                            placeholder="Chọn danh mục"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tiêu đề</label>
                        <CustomInput
                            value={editForm.title}
                            onChange={(value) => setEditForm(prev => ({ ...prev, title: value }))}
                            placeholder="Nhập tiêu đề góp ý..."
                            maxLength={200}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nội dung</label>
                        <CustomTextarea
                            value={editForm.content}
                            onChange={(value) => setEditForm(prev => ({ ...prev, content: value }))}
                            placeholder="Mô tả chi tiết ý kiến của bạn..."
                            rows={4}
                            maxLength={2000}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleEdit}
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 bg-main text-white rounded-xl hover:bg-main/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" data-filled={true} /> : <Send size={16} data-filled={true} />}
                            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-main/10 overflow-hidden">
                            {userAvatar ? (
                                <Image
                                    src={userAvatar}
                                    alt={userName}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-main font-semibold text-sm">
                                    {userInitial}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {userName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${category.color}`}>
                                {category.label}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar size={12} data-filled={true} />
                                <span>{getTimeAgo(feedback.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={feedback.status} size="sm" />
                    {canEdit && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 text-main hover:bg-main/10 rounded-lg transition-colors"
                            title="Chỉnh sửa góp ý"
                        >
                            <Pencil size={16} data-filled={true} />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa góp ý"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" data-filled={true} /> : <Trash2 size={16} data-filled={true} />}
                        </button>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feedback.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {feedback.content}
            </p>

            {showAdminNote && feedback.adminNote && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 border-l-4 border-main">
                    <p className="text-xs text-gray-500 uppercase mb-1">Phản hồi từ admin</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{feedback.adminNote}</p>
                </div>
            )}

            <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={handleLike}
                    disabled={!token || isLiking}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                >
                    <Heart size={16} className={liked ? 'fill-red-500' : ''} data-filled={liked} />
                    <span>{likes}</span>
                </button>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <MessageCircle size={14} data-filled={false} />
                    <span>{likes} ủng hộ</span>
                </div>
            </div>
        </div>
    );
}