'use client';

import { useAuthStore } from '@/store/auth.store';
import StarRating from '@/components/common/StarRating';
import { Star, MessageCircle, CheckCircle, Pencil, Trash } from 'lucide-react';

interface RatingStatsType {
    average: number;
    total: number;
    distribution: Record<number, number>;
}

interface RatingStatsProps {
    stats: RatingStatsType;
    onOpenModal: () => void;
    hasUserRated: boolean;
    onEditRating: () => void;
    onDeleteRating: () => void;
}

export default function RatingStats({
    stats,
    onOpenModal,
    hasUserRated,
    onEditRating,
    onDeleteRating,
}: RatingStatsProps) {
    const { token } = useAuthStore();

    if (!token) {
        return (
            <div className="bg-gradient-to-r from-[var(--cn-primary)]/10 to-[var(--cn-primary)]/5 rounded-[var(--cn-radius-md)] p-6 text-center">
                <Star className="w-12 h-12 text-[var(--cn-text-muted)] mx-auto mb-3" />
                <p className="text-[var(--cn-text-sub)]">Đăng nhập để đánh giá</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-[var(--cn-primary)]/10 to-[var(--cn-primary)]/5 rounded-[var(--cn-radius-md)] p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <div className="text-3xl font-bold text-[var(--cn-primary)]">{stats.average.toFixed(1)}</div>
                    <StarRating rating={Math.round(stats.average)} readonly size={16} />
                    <div className="text-xs text-[var(--cn-text-muted)] mt-1">{stats.total} đánh giá</div>
                </div>

                <div className="flex-1 w-full max-w-[200px]">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = stats.distribution[star] || 0;
                        const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                                <span className="w-8 text-[var(--cn-text-sub)]">{star}★</span>
                                <div className="flex-1 h-1.5 bg-[var(--cn-border)] rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                                </div>
                                <span className="w-8 text-[var(--cn-text-muted)]">{count}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center gap-2">
                    {hasUserRated && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEditRating}
                                className="p-2 text-[var(--cn-primary)] hover:bg-[var(--cn-primary)]/10 rounded-[var(--cn-radius-sm)] transition-colors"
                                title="Chỉnh sửa đánh giá"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={onDeleteRating}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-[var(--cn-radius-sm)] transition-colors"
                                title="Xóa đánh giá"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={onOpenModal}
                        disabled={hasUserRated}
                        className={`flex items-center gap-2 px-4 py-2 rounded-[var(--cn-radius-sm)] transition-colors text-sm font-medium whitespace-nowrap ${hasUserRated
                            ? 'bg-green-100 text-green-600 cursor-default'
                            : 'bg-[var(--cn-primary)] text-white hover:bg-[var(--cn-primary-hover)]'
                            }`}
                    >
                        {hasUserRated ? (
                            <>
                                <CheckCircle size={16} />
                                <span>Đã đánh giá</span>
                            </>
                        ) : (
                            <>
                                <MessageCircle size={16} />
                                <span>Viết đánh giá</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
