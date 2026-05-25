'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, Edit2, Loader2, Tag, Calendar } from 'lucide-react';
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
import { DeleteConfirmModal } from '@/components/custom/DeleteConfirmModal';

type FeedbackCategory = 'bug' | 'ui_ux' | 'feature_request' | 'performance' | 'security' | 'other';

interface IReactResponse {
    success: boolean;
    data?: {
        reactCount: number;
        likedBy: string[];
    };
    message?: string;
}

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

    // States
    const [isEditing, setIsEditing] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [hasLiked, setHasLiked] = useState(feedback.likedBy?.includes(user?._id || '') || false);
    const [localReactCount, setLocalReactCount] = useState(feedback.reactCount || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editForm, setEditForm] = useState<{
        title: string;
        content: string;
        category: FeedbackCategory;
    }>({
        title: feedback.title,
        content: feedback.content,
        category: feedback.category as FeedbackCategory
    });

    // ✅ Đồng bộ state khi ID feedback hoặc ID user thay đổi (Tránh bị ghi đè khi Parent re-render)
    useEffect(() => {
        setLocalReactCount(feedback.reactCount || 0);
        setHasLiked(feedback.likedBy?.includes(user?._id || '') || false);
    }, [feedback._id, user?._id]);

    const isOwner = user?._id === feedback.userId?._id;
    const categoryConfig = CATEGORY_CONFIG[feedback.category] || CATEGORY_CONFIG.other;
    const statusConfig = STATUS_CONFIG[feedback.status] || STATUS_CONFIG.pending;

    const handleLike = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để ủng hộ');
            return;
        }
        if (isLiking || hasLiked) return;

        // ⚡️ Optimistic Update: Chạy ngay lập tức
        setIsLiking(true);
        setHasLiked(true);
        setLocalReactCount(prev => prev + 1);

        try {
            const result = (await feedbackApi.reactFeedback(token, feedback._id)) as IReactResponse;

            if (result.success && result.data) {
                setLocalReactCount(result.data.reactCount);
                onLikeSuccess?.(feedback._id, result.data.reactCount, result.data.likedBy);
            } else {
                throw new Error(result.message || 'Thao tác thất bại');
            }
        } catch (error: unknown) {
            // Rollback UI
            setHasLiked(false);
            setLocalReactCount(prev => prev - 1);

            let errorMessage = 'Không thể ủng hộ lúc này';
            if (error instanceof Error) errorMessage = error.message;
            toast.error(errorMessage);
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
        try {
            await onEdit?.(feedback._id, editForm.title, editForm.content, editForm.category);
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
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
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${hasLiked ? 'border-red-200 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}>
                <div className="p-5">
                    {/* Header: User Info & Badges */}
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
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Calendar size={12} />
                                    <span>{formatTime(feedback.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${categoryConfig.bg} ${categoryConfig.color}`}>
                                {categoryConfig.label}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Content: Title & Text */}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{feedback.title}</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">{feedback.content}</p>
                    </div>

                    {/* Admin Response Section */}
                    {feedback.adminResponse && (
                        <div className="mb-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100 border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Tag size={12} className="text-blue-500" />
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Phản hồi từ admin</p>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{feedback.adminResponse}</p>
                        </div>
                    )}

                    {/* Footer: Like & Owner Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLike();
                            }}
                            disabled={isLiking}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 ${hasLiked
                                ? 'text-red-500 bg-red-50 font-bold'
                                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                }`}
                        >
                            {isLiking ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Heart
                                    size={16}
                                    data-filled={hasLiked ? "true" : "false"}
                                    fill={hasLiked ? "currentColor" : "none"}
                                    className="transition-all duration-300"
                                />
                            )}
                            <span className="text-sm font-bold">{localReactCount}</span>
                        </button>

                        {showActions && isOwner && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"
                                    title="Chỉnh sửa"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                    title="Xóa"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Xác nhận xóa */}
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