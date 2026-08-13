'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageSquare, Pencil, Star, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomButton } from '@/components/custom/CustomButton';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import {
    shopApi,
    ShopProductReview,
    ShopReviewStats,
} from '@/lib/api/shop.api';
import { getAvatarUrl, avatarImageProps } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EMPTY_STATS: ShopReviewStats = {
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
}

export function StarRating({
    value,
    onChange,
    size = 'md',
    readonly = false,
}: StarRatingProps) {
    const [hover, setHover] = useState(0);
    const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hover || value);
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => onChange?.(star)}
                        onMouseEnter={() => !readonly && setHover(star)}
                        onMouseLeave={() => !readonly && setHover(0)}
                        className={cn(
                            'transition-transform',
                            !readonly && 'hover:scale-110',
                            readonly && 'cursor-default',
                        )}
                        aria-label={`${star} sao`}
                    >
                        <Star
                            className={cn(
                                sizeClass,
                                filled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600',
                            )}
                            data-filled={filled}
                        />
                    </button>
                );
            })}
        </div>
    );
}

interface ShopProductReviewsProps {
    productId: string;
    accent: string;
    accentBg: string;
    onStatsChange?: (stats: ShopReviewStats) => void;
}

export function ShopProductReviews({
    productId,
    accent,
    accentBg,
    onStatsChange,
}: ShopProductReviewsProps) {
    const [reviews, setReviews] = useState<ShopProductReview[]>([]);
    const [stats, setStats] = useState<ShopReviewStats>(EMPTY_STATS);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [myReview, setMyReview] = useState<ShopProductReview | null>(null);
    const [editing, setEditing] = useState(false);
    const [formRating, setFormRating] = useState(5);
    const [formContent, setFormContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const applyStats = useCallback(
        (next: ShopReviewStats) => {
            setStats(next);
            onStatsChange?.(next);
        },
        [onStatsChange],
    );

    const loadReviews = useCallback(
        async (pageNum: number, append = false) => {
            if (append) setLoadingMore(true);
            else setLoading(true);

            try {
                const res = await shopApi.getProductReviews(productId, pageNum, 8);
                if (res.success) {
                    setReviews((prev) => (append ? [...prev, ...res.data] : res.data));
                    applyStats(res.stats || EMPTY_STATS);
                    setTotalPages(res.pagination?.pages || 1);
                    setPage(pageNum);
                }
            } catch {
                if (!append) toast.error('Không thể tải đánh giá');
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [productId, applyStats],
    );

    const loadMyReview = useCallback(async () => {
        try {
            const res = await shopApi.getMyProductReview(productId);
            if (res.success) {
                setCanReview(res.data.canReview);
                const mine = res.data.myReview;
                if (mine) {
                    setMyReview({
                        ...mine,
                        user: null,
                    });
                    setFormRating(mine.rating);
                    setFormContent(mine.content);
                } else {
                    setMyReview(null);
                    setFormRating(5);
                    setFormContent('');
                }
            }
        } catch {
            // optional auth — ignore
        }
    }, [productId]);

    useEffect(() => {
        loadReviews(1);
        loadMyReview();
    }, [loadReviews, loadMyReview]);

    const showForm = canReview && (!myReview || editing);

    const handleSubmit = async () => {
        if (formRating < 1) {
            toast.error('Vui lòng chọn số sao');
            return;
        }
        if (formContent.trim().length < 5) {
            toast.error('Nội dung đánh giá phải có ít nhất 5 ký tự');
            return;
        }

        setSubmitting(true);
        try {
            if (myReview && editing) {
                const res = await shopApi.updateProductReview(productId, myReview._id, {
                    rating: formRating,
                    content: formContent.trim(),
                });
                if (res.success && res.data) {
                    toast.success(res.message || 'Đã cập nhật đánh giá');
                    setMyReview(res.data);
                    setEditing(false);
                    if (res.stats) applyStats(res.stats);
                    loadReviews(1);
                } else {
                    toast.error(res.message || 'Không thể cập nhật');
                }
            } else {
                const res = await shopApi.createProductReview(productId, {
                    rating: formRating,
                    content: formContent.trim(),
                });
                if (res.success && res.data) {
                    toast.success(res.message || 'Cảm ơn bạn đã đánh giá!');
                    setMyReview(res.data);
                    setCanReview(true);
                    setEditing(false);
                    if (res.stats) applyStats(res.stats);
                    loadReviews(1);
                } else {
                    toast.error(res.message || 'Không thể gửi đánh giá');
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!myReview) return;

        setDeleting(true);
        try {
            const res = await shopApi.deleteProductReview(productId, myReview._id);
            if (res.success) {
                toast.success(res.message || 'Đã xóa đánh giá');
                setMyReview(null);
                setEditing(false);
                setFormRating(5);
                setFormContent('');
                setCanReview(true);
                setShowDeleteConfirm(false);
                if (res.stats) applyStats(res.stats);
                loadReviews(1);
            } else {
                toast.error(res.message || 'Không thể xóa đánh giá');
            }
        } finally {
            setDeleting(false);
        }
    };

    const maxDist = Math.max(...Object.values(stats.distribution), 1);

    return (
        <section
            id="danh-gia"
            className="scroll-mt-24 overflow-hidden rounded-2xl"
            style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
        >
            <div
                className="border-b px-6 py-5 md:px-8"
                style={{ borderColor: 'var(--cn-border)', background: `linear-gradient(135deg, ${accentBg}, transparent)` }}
            >
                <h2 className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--cn-text-main)' }}>
                    <MessageSquare className="h-5 w-5" style={{ color: accent }} />
                    Đánh giá sản phẩm
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--cn-text-sub)' }}>
                    Chỉ người đã mua sản phẩm mới được đánh giá
                </p>
            </div>

            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* Stats */}
                <div
                    className="rounded-xl p-5"
                    style={{ backgroundColor: 'var(--cn-bg-section)' }}
                >
                    <div className="text-center">
                        <p className="text-5xl font-bold tabular-nums" style={{ color: 'var(--cn-text-main)' }}>
                            {stats.total > 0 ? stats.average.toFixed(1) : '—'}
                        </p>
                        <div className="mt-2 flex justify-center">
                            <StarRating
                                value={Math.round(stats.average)}
                                readonly
                                size="md"
                            />
                        </div>
                        <p className="mt-2 text-sm" style={{ color: 'var(--cn-text-muted)' }}>
                            {stats.total} đánh giá
                        </p>
                    </div>

                    <div className="mt-6 space-y-2">
                        {([5, 4, 3, 2, 1] as const).map((star) => {
                            const count = stats.distribution[star] || 0;
                            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                    <span className="w-3 font-medium" style={{ color: 'var(--cn-text-sub)' }}>
                                        {star}
                                    </span>
                                    <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" data-filled />
                                    <div
                                        className="h-2 flex-1 overflow-hidden rounded-full"
                                        style={{ backgroundColor: 'var(--cn-bg-card)' }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
                                                backgroundColor: accent,
                                                opacity: count > 0 ? 0.55 + (count / maxDist) * 0.45 : 0.15,
                                            }}
                                        />
                                    </div>
                                    <span className="w-6 text-right tabular-nums" style={{ color: 'var(--cn-text-muted)' }}>
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews list + form */}
                <div className="space-y-5">
                    {showForm && (
                        <div
                            className="rounded-xl p-5"
                            style={{ backgroundColor: 'var(--cn-bg-section)', border: `1px solid ${accent}33` }}
                        >
                            <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--cn-text-main)' }}>
                                {editing ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá của bạn'}
                            </p>
                            <StarRating value={formRating} onChange={setFormRating} size="lg" />
                            <textarea
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                rows={4}
                                maxLength={1000}
                                className="mt-4 w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2"
                                style={{
                                    backgroundColor: 'var(--cn-bg-card)',
                                    color: 'var(--cn-text-main)',
                                    border: '1px solid var(--cn-border)',
                                }}
                            />
                            <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-xs" style={{ color: 'var(--cn-text-muted)' }}>
                                    {formContent.length}/1000
                                </span>
                                <div className="flex gap-2">
                                    {editing && (
                                        <CustomButton
                                            variant="secondary"
                                            size="small"
                                            onClick={() => {
                                                setEditing(false);
                                                if (myReview) {
                                                    setFormRating(myReview.rating);
                                                    setFormContent(myReview.content);
                                                }
                                            }}
                                        >
                                            Hủy
                                        </CustomButton>
                                    )}
                                    <CustomButton size="small" onClick={handleSubmit} loading={submitting}>
                                        {editing ? 'Lưu thay đổi' : 'Gửi đánh giá'}
                                    </CustomButton>
                                </div>
                            </div>
                        </div>
                    )}

                    {myReview && !editing && (
                        <div
                            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm"
                            style={{ backgroundColor: accentBg, color: accent }}
                        >
                            <span className="font-medium">Bạn đã đánh giá sản phẩm này</span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition hover:opacity-80"
                                    style={{ backgroundColor: 'var(--cn-bg-card)' }}
                                >
                                    <Pencil className="h-3 w-3" />
                                    Sửa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:opacity-80"
                                    style={{ backgroundColor: 'var(--cn-bg-card)' }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-7 w-7 animate-spin" style={{ color: accent }} />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div
                            className="rounded-xl py-12 text-center"
                            style={{ backgroundColor: 'var(--cn-bg-section)' }}
                        >
                            <Star className="mx-auto mb-3 h-10 w-10" data-filled={false} style={{ color: 'var(--cn-text-muted)' }} />
                            <p className="font-medium" style={{ color: 'var(--cn-text-main)' }}>
                                Chưa có đánh giá nào
                            </p>
                            <p className="mt-1 text-sm" style={{ color: 'var(--cn-text-muted)' }}>
                                Hãy là người đầu tiên đánh giá sau khi mua sản phẩm
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => {
                                const name = review.user?.fullName || 'Người dùng';
                                const isMine = myReview?._id === review._id;
                                return (
                                    <article
                                        key={review._id}
                                        className={cn(
                                            'rounded-xl p-5 transition',
                                            isMine && 'ring-1',
                                        )}
                                        style={{
                                            backgroundColor: 'var(--cn-bg-section)',
                                            ...(isMine ? { ringColor: `${accent}55` } : {}),
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 shrink-0 border" style={{ borderColor: 'var(--cn-border)' }}>
                                                {review.user?.avatar ? (
                                                    <AvatarImage
                                                        {...avatarImageProps}
                                                        src={getAvatarUrl(review.user.avatar)}
                                                        alt={name}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="text-sm font-semibold">
                                                    {name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold" style={{ color: 'var(--cn-text-main)' }}>
                                                        {name}
                                                        {isMine && (
                                                            <span className="ml-2 text-xs font-normal" style={{ color: accent }}>
                                                                (Bạn)
                                                            </span>
                                                        )}
                                                    </p>
                                                    <StarRating value={review.rating} readonly size="sm" />
                                                </div>
                                                <p className="mt-0.5 text-xs" style={{ color: 'var(--cn-text-muted)' }}>
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--cn-text-sub)' }}>
                                                    {review.content}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                            {page < totalPages && (
                                <div className="flex justify-center pt-2">
                                    <CustomButton
                                        variant="secondary"
                                        size="small"
                                        onClick={() => loadReviews(page + 1, true)}
                                        loading={loadingMore}
                                    >
                                        Xem thêm đánh giá
                                    </CustomButton>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModalDelete
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Xóa đánh giá"
                message="Bạn có chắc muốn xóa đánh giá của mình?"
                warning="Sau khi xóa, bạn có thể viết đánh giá mới."
                isDeleting={deleting}
            />
        </section>
    );
}

export function ShopReviewBadge({
    stats,
    accent,
}: {
    stats: ShopReviewStats;
    accent: string;
}) {
    if (stats.total <= 0) return null;

    return (
        <div className="flex items-center gap-2">
            <StarRating value={Math.round(stats.average)} readonly size="sm" />
            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--cn-text-main)' }}>
                {stats.average.toFixed(1)}
            </span>
            <span className="text-xs" style={{ color: 'var(--cn-text-muted)' }}>
                ({stats.total})
            </span>
        </div>
    );
}
