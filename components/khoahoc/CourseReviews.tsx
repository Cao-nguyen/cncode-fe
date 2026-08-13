'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageSquare, Pencil, Star, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomButton } from '@/components/custom/CustomButton';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { StarRating } from '@/components/cuahangso/ShopProductReviews';
import {
    khoahocApi,
} from '@/lib/api/khoahoc.api';
import { CourseReview, CourseReviewStats } from '@/types/khoahoc.type';
import { getAvatarUrl, avatarImageProps } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ACCENT = '#2563eb';
const ACCENT_BG = 'rgba(37, 99, 235, 0.08)';

const EMPTY_STATS: CourseReviewStats = {
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

interface CourseReviewsProps {
    courseId: string;
}

export function CourseReviews({ courseId }: CourseReviewsProps) {
    const [reviews, setReviews] = useState<CourseReview[]>([]);
    const [stats, setStats] = useState<CourseReviewStats>(EMPTY_STATS);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [myReview, setMyReview] = useState<CourseReview | null>(null);
    const [editing, setEditing] = useState(false);
    const [formRating, setFormRating] = useState(5);
    const [formContent, setFormContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const loadReviews = useCallback(
        async (pageNum: number, append = false) => {
            if (append) setLoadingMore(true);
            else setLoading(true);

            try {
                const res = await khoahocApi.getCourseReviews(courseId, pageNum, 8);
                if (res.success) {
                    setReviews((prev) => (append ? [...prev, ...res.data] : res.data));
                    setStats(res.stats || EMPTY_STATS);
                    setTotalPages(res.pagination?.pages || 1);
                    setPage(pageNum);
                }
            } catch {
                if (!append) toast.error('Không thể tải đánh giá khóa học');
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [courseId],
    );

    const loadMyReview = useCallback(async () => {
        try {
            const res = await khoahocApi.getMyCourseReview(courseId);
            if (res.success) {
                setCanReview(res.data.canReview);
                const mine = res.data.myReview;
                if (mine) {
                    setMyReview({ ...mine, user: null });
                    setFormRating(mine.rating);
                    setFormContent(mine.content);
                } else {
                    setMyReview(null);
                    setFormRating(5);
                    setFormContent('');
                }
            }
        } catch {
            // optional auth
        }
    }, [courseId]);

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
                const res = await khoahocApi.updateCourseReview(courseId, myReview._id, {
                    rating: formRating,
                    content: formContent.trim(),
                });
                if (res.success && res.data) {
                    toast.success('Đã cập nhật đánh giá');
                    setMyReview(res.data);
                    setEditing(false);
                    if (res.stats) setStats(res.stats);
                    loadReviews(1);
                } else {
                    toast.error(res.message || 'Không thể cập nhật');
                }
            } else {
                const res = await khoahocApi.createCourseReview(courseId, {
                    rating: formRating,
                    content: formContent.trim(),
                });
                if (res.success && res.data) {
                    toast.success('Cảm ơn bạn đã đánh giá khóa học!');
                    setMyReview(res.data);
                    setCanReview(false);
                    setEditing(false);
                    if (res.stats) setStats(res.stats);
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
            const res = await khoahocApi.deleteCourseReview(courseId, myReview._id);
            if (res.success) {
                toast.success('Đã xóa đánh giá');
                setMyReview(null);
                setEditing(false);
                setFormRating(5);
                setFormContent('');
                setCanReview(true);
                setShowDeleteConfirm(false);
                if (res.stats) setStats(res.stats);
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
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div
                className="border-b border-gray-200 px-4 py-5 sm:px-6 md:px-8 dark:border-gray-800"
                style={{ background: `linear-gradient(135deg, ${ACCENT_BG}, transparent)` }}
            >
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 sm:text-xl dark:text-gray-100">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Đánh giá khóa học
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Chỉ học viên đã tham gia khóa học mới được đánh giá
                </p>
            </div>

            <div className="grid gap-6 p-4 sm:p-6 md:p-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800/50">
                    <div className="text-center">
                        <p className="text-4xl font-bold tabular-nums text-gray-900 sm:text-5xl dark:text-gray-100">
                            {stats.total > 0 ? stats.average.toFixed(1) : '—'}
                        </p>
                        <div className="mt-2 flex justify-center">
                            <StarRating value={Math.round(stats.average)} readonly size="md" />
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {stats.total} đánh giá
                        </p>
                    </div>

                    <div className="mt-6 space-y-2">
                        {([5, 4, 3, 2, 1] as const).map((star) => {
                            const count = stats.distribution[star] || 0;
                            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                    <span className="w-3 font-medium text-gray-600 dark:text-gray-400">{star}</span>
                                    <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" data-filled={true} />
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white dark:bg-gray-900">
                                        <div
                                            className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                            style={{
                                                width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
                                                opacity: count > 0 ? 0.55 + (count / maxDist) * 0.45 : 0.15,
                                            }}
                                        />
                                    </div>
                                    <span className="w-6 text-right tabular-nums text-gray-500">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-5">
                    {showForm && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
                            <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {editing ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá khóa học'}
                            </p>
                            <StarRating value={formRating} onChange={setFormRating} size="lg" />
                            <textarea
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                                rows={4}
                                maxLength={1000}
                                className="mt-4 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            />
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                <span className="text-xs text-gray-500">{formContent.length}/1000</span>
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
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                            <span className="font-medium">Bạn đã đánh giá khóa học này</span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold transition hover:opacity-80 dark:bg-gray-900"
                                >
                                    <Pencil className="h-3 w-3" />
                                    Sửa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-red-600 transition hover:opacity-80 dark:bg-gray-900"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="rounded-xl bg-gray-50 py-12 text-center dark:bg-gray-800/50">
                            <Star className="mx-auto mb-3 h-10 w-10 text-gray-300" data-filled={false} />
                            <p className="font-medium text-gray-900 dark:text-gray-100">Chưa có đánh giá nào</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Hãy là người đầu tiên đánh giá sau khi hoàn thành khóa học
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => {
                                const name = review.user?.fullName || 'Học viên';
                                const isMine = myReview?._id === review._id;
                                return (
                                    <article
                                        key={review._id}
                                        className={cn(
                                            'rounded-xl bg-gray-50 p-4 sm:p-5 dark:bg-gray-800/50',
                                            isMine && 'ring-1 ring-blue-200 dark:ring-blue-800',
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 shrink-0 border border-gray-200 dark:border-gray-700">
                                                <AvatarImage
                                                    {...avatarImageProps}
                                                    src={getAvatarUrl(review.user?.avatar)}
                                                    alt={name}
                                                />
                                                <AvatarFallback className="text-sm font-semibold">
                                                    {name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {name}
                                                        {isMine && (
                                                            <span className="ml-2 text-xs font-normal text-blue-600">(Bạn)</span>
                                                        )}
                                                    </p>
                                                    <StarRating value={review.rating} readonly size="sm" />
                                                </div>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
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
