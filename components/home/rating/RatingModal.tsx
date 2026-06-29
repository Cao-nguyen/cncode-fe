'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import StarRating from '@/components/common/StarRating';
import { Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, content: string) => Promise<void>;
    initialRating?: number;
    initialContent?: string;
    isEdit?: boolean;
}

export default function RatingModal({
    isOpen,
    onClose,
    onSubmit,
    initialRating = 0,
    initialContent = '',
    isEdit = false,
}: RatingModalProps) {
    const { token } = useAuthStore();
    const [rating, setRating] = useState(initialRating);
    const [content, setContent] = useState(initialContent);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRating(initialRating);
            setContent(initialContent);
        }
    }, [isOpen, initialRating, initialContent]);

    const handleSubmit = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }

        if (rating === 0) {
            toast.warning('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (!content.trim()) {
            toast.warning('Vui lòng nhập nội dung đánh giá');
            return;
        }

        try {
            setSubmitting(true);
            await onSubmit(rating, content);
            setRating(0);
            setContent('');
            onClose();
            toast.success(isEdit ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá thành công!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : (isEdit ? 'Cập nhật thất bại' : 'Gửi đánh giá thất bại');
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[var(--cn-shadow-lg)]" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-[var(--cn-bg-card)] p-4 border-b border-[var(--cn-border)] flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[var(--cn-text-main)]">
                        {isEdit ? 'Chỉnh sửa đánh giá' : 'Đánh giá của bạn'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-[var(--cn-hover)] rounded-[var(--cn-radius-sm)] transition text-[var(--cn-text-muted)]">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="text-center">
                        <StarRating rating={rating} onRatingChange={setRating} size={40} showText={true} />
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về CNcode..."
                        rows={4}
                        className="w-full px-4 py-3 bg-[var(--cn-bg-section)] border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--cn-primary)]/50 text-[var(--cn-text-main)] resize-none text-sm"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0 || !content.trim()}
                        className="w-full py-3 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] hover:bg-[var(--cn-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{isEdit ? 'Cập nhật' : 'Gửi đánh giá'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
