// components/feedback/FeedbackCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, Edit2, Loader2 } from 'lucide-react';
import { IFeedback } from '@/lib/api/feedback.api';
import { useAuthStore } from '@/store/auth.store';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { toast } from 'sonner';
import { feedbackApi } from '@/lib/api/feedback.api';
import Image from 'next/image';
import { DeleteConfirmModal } from '@/components/custom/DeleteConfirmModal'; // ✅ Import đúng

type FeedbackCategory = 'bug' | 'ui_ux' | 'feature_request' | 'performance' | 'security' | 'other';

interface FeedbackCardProps {
    feedback: IFeedback;
    onLikeSuccess?: (feedbackId: string, newReactCount: number, likedBy: string[]) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string, title: string, content: string, category: string) => void;
    showActions?: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    bug: { label: 'Lỗi/Bug', color: 'text-red-600', bg: 'bg-red-50' },
    ui_ux: { label: 'UI/UX', color: 'text-purple-600', bg: 'bg-purple-50' },
    feature_request: { label: 'Tính năng mới', color: 'text-green-600', bg: 'bg-green-50' },
    performance: { label: 'Hiệu năng', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    security: { label: 'Bảo mật', color: 'text-orange-600', bg: 'bg-orange-50' },
    other: { label: 'Khác', color: 'text-gray-600', bg: 'bg-gray-50' }
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Chờ xử lý', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    viewed: { label: 'Đã xem', color: 'text-blue-600', bg: 'bg-blue-50' },
    approved: { label: 'Đã duyệt', color: 'text-green-600', bg: 'bg-green-50' },
    improving: { label: 'Đang cải tiến', color: 'text-purple-600', bg: 'bg-purple-50' },
    completed: { label: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    rejected: { label: 'Từ chối', color: 'text-red-600', bg: 'bg-red-50' }
};

const EDIT_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
    { value: 'bug', label: 'Lỗi/Bug' },
    { value: 'ui_ux', label: 'UI/UX' },
    { value: 'feature_request', label: 'Tính năng mới' },
    { value: 'performance', label: 'Hiệu năng' },
    { value: 'security', label: 'Bảo mật' },
    { value: 'other', label: 'Khác' }
];

export default function FeedbackCard({
    feedback,
    onLikeSuccess,
    onDelete,
    onEdit,
    showActions = true
}: FeedbackCardProps) {
    const { user, token } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [localReactCount, setLocalReactCount] = useState(feedback.reactCount || 0);
    const [hasLiked, setHasLiked] = useState(() => {
        if (!user?._id || !feedback.likedBy) return false;
        return feedback.likedBy.includes(user._id);
    });
    const [editForm, setEditForm] = useState<{
        title: string;
        content: string;
        category: FeedbackCategory;
    }>({
        title: feedback.title,
        content: feedback.content,
        category: feedback.category as FeedbackCategory
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        setLocalReactCount(feedback.reactCount || 0);
        if (user?._id && feedback.likedBy) {
            setHasLiked(feedback.likedBy.includes(user._id));
        }
    }, [feedback.reactCount, feedback.likedBy, user?._id]);

    const isOwner = user?._id === feedback.userId?._id;
    const categoryConfig = CATEGORY_CONFIG[feedback.category] || CATEGORY_CONFIG.other;
    const statusConfig = STATUS_CONFIG[feedback.status] || STATUS_CONFIG.pending;

    const handleLike = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để ủng hộ');
            return;
        }
        if (isLiking) return;
        if (hasLiked) {
            toast.info('Bạn đã ủng hộ góp ý này rồi');
            return;
        }

        setIsLiking(true);
        setHasLiked(true);
        setLocalReactCount(prev => prev + 1);

        try {
            const result = await feedbackApi.reactFeedback(token, feedback._id);
            if (result.success && result.data) {
                setLocalReactCount(result.data.reactCount);
                onLikeSuccess?.(feedback._id, result.data.reactCount, result.data.likedBy);
            } else {
                setHasLiked(false);
                setLocalReactCount(prev => prev - 1);
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            setHasLiked(false);
            setLocalReactCount(prev => prev - 1);
            toast.error('Không thể ủng hộ lúc này');
        } finally {
            setIsLiking(false);
        }
    };

    const handleConfirmDelete = () => {
        onDelete?.(feedback._id);
        setShowDeleteModal(false);
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
        setIsSubmitting(true);
        await onEdit?.(feedback._id, editForm.title, editForm.content, editForm.category);
        setIsSubmitting(false);
        setIsEditing(false);
    };

    const getUserInitial = () => {
        const name = feedback.userId?.fullName || 'Người dùng';
        return name !== 'Người dùng' ? name.charAt(0).toUpperCase() : '?';
    };

    const getUserName = () => feedback.userId?.fullName || 'Người dùng';
    const getUserAvatar = () => feedback.userId?.avatar;

    const formatTime = (date: string) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    };

    if (isEditing) {
        return (
            <div className="bg-white rounded-xl border border-blue-200 shadow-md overflow-hidden">
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề</label>
                        <CustomInput
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Tiêu đề góp ý"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
                        <CustomSelect
                            value={editForm.category}
                            onChange={(value) => setEditForm(prev => ({ ...prev, category: value as FeedbackCategory }))}
                            options={EDIT_CATEGORIES}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung</label>
                        <CustomTextarea
                            value={editForm.content}
                            onChange={(value) => setEditForm(prev => ({ ...prev, content: value }))}
                            placeholder="Nội dung chi tiết..."
                            rows={5}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleEdit}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {getUserAvatar() ? (
                                    <Image
                                        src={getUserAvatar()!}
                                        alt={getUserName()}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-sm">
                                        {getUserInitial()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{getUserName()}</p>
                                <p className="text-xs text-gray-400">{formatTime(feedback.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.color}`}>
                                {categoryConfig.label}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{feedback.title}</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{feedback.content}</p>
                    </div>

                    {feedback.adminResponse && (
                        <div className="mb-4 p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                            <p className="text-xs font-medium text-blue-600 uppercase mb-1">Phản hồi từ admin</p>
                            <p className="text-sm text-gray-700">{feedback.adminResponse}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                            onClick={handleLike}
                            disabled={isLiking || hasLiked}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 ${hasLiked
                                ? 'text-red-500 bg-red-50'
                                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                }`}
                        >
                            {isLiking ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <div>
                                    {hasLiked ? (
                                        <Heart size={16} fill="#ef4444" stroke="#ef4444" data-filled="true" />
                                    ) : (
                                        <Heart size={16} fill="none" stroke="currentColor" data-filled="false" />
                                    )}
                                </div>
                            )}
                            <span className="text-sm font-medium">{localReactCount}</span>
                        </button>

                        {showActions && isOwner && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"
                                    title="Chỉnh sửa"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                    title="Xóa"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa góp ý"
                message="Bạn có chắc chắn muốn xóa góp ý này không?"
                warning="Hành động này không thể hoàn tác."
            />
        </>
    );
}