'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ratingApi, IRating, IRatingStats } from '@/lib/api/rating.api';
import { Star, Loader2, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { useAuthStore } from '@/store/auth.store';

interface Props {
    targetType: 'course' | 'product';
    targetId: string;
    canReview?: boolean;
}

interface RatingStatsType {
    average: number;
    total: number;
    distribution: Record<number, number>;
}

export default function ReviewSection({ targetType, targetId, canReview = true }: Props) {
    const { user, token } = useAuthStore();
    const [reviews, setReviews] = useState<IRating[]>([]);
    const [stats, setStats] = useState<RatingStatsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(true);
    const [formRating, setFormRating] = useState(5);
    const [formComment, setFormComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editReviewId, setEditReviewId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [hasUserRated, setHasUserRated] = useState(false);
    const [userRating, setUserRating] = useState<IRating | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await ratingApi.getRatings(1, 20);
            if (result.success && result.data) {
                const ratingsData = result.data as IRating[];
                setReviews(ratingsData);

                if (user?._id) {
                    const userRatingData = ratingsData.find(r => r.userId?._id === user._id);
                    setHasUserRated(!!userRatingData);
                    setUserRating(userRatingData || null);
                }

                if (result.stats) {
                    setStats(result.stats);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormRating(5);
        setFormComment('');
        setEditing(false);
        setEditReviewId(null);
    };

    useEffect(() => { fetchData(); }, [targetType, targetId, user]);

    const handleSubmit = async () => {
        if (!formComment.trim()) { toast.error('Vui lòng nhập nội dung đánh giá'); return; }
        if (!token) { toast.error('Vui lòng đăng nhập'); return; }
        
        setSubmitting(true);
        try {
            if (editing && editReviewId) {
                const result = await ratingApi.updateRating(token, editReviewId, formRating, formComment.trim());
                if (result.success) {
                    toast.success('Đã cập nhật đánh giá');
                    resetForm();
                    fetchData();
                } else {
                    toast.error(result.message || 'Có lỗi xảy ra');
                }
            } else {
                if (hasUserRated) { toast.error('Bạn đã đánh giá rồi!'); setSubmitting(false); return; }
                const result = await ratingApi.createRating(token, formRating, formComment.trim());
                if (result.success) {
                    toast.success('Đã gửi đánh giá');
                    resetForm();
                    fetchData();
                } else {
                    toast.error(result.message || 'Có lỗi xảy ra');
                }
            }
        } catch (e) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!reviewToDelete || !token) return;
        setDeleting(true);
        try {
            const result = await ratingApi.deleteRating(token, reviewToDelete);
            if (result.success) {
                toast.success('Đã xoá đánh giá');
                setDeleteModalOpen(false);
                setReviewToDelete(null);
                resetForm();
                setShowForm(true);
                fetchData();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (e) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeleting(false);
        }
    };

    const handleEditClick = (review: IRating) => {
        setFormRating(review.rating);
        setFormComment(review.content);
        setEditing(true);
        setEditReviewId(review._id);
        setShowForm(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    };

    const handleDeleteClick = (reviewId: string) => {
        setReviewToDelete(reviewId);
        setDeleteModalOpen(true);
    };

    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const isOwner = (review: IRating) => user?._id && review.userId?._id === user._id;

    const StarRating = ({ rating, interactive = false, size = 20 }: { rating: number; interactive?: boolean; size?: number }) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && setFormRating(star)}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                >
                    <Star
                        size={size}
                        data-filled={true}
                        className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${interactive && star <= formRating ? 'fill-yellow-400 text-yellow-400' : ''}`}
                    />
                </button>
            ))}
        </div>
    );

    if (loading && !stats) {
        return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
    }

    return (
        <div>
            {/* Stats summary */}
            {stats && stats.total > 0 && (
                <div className="flex items-center gap-6 mb-8 p-6 bg-white rounded-2xl border border-gray-200">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">{stats.average.toFixed(1)}</div>
                        <StarRating rating={Math.round(stats.average)} size={16} />
                        <div className="text-sm text-gray-500 mt-1">{stats.total} đánh giá</div>
                    </div>
                    <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.distribution[star] || 0;
                            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <span className="w-3 text-gray-600">{star}</span>
                                    <Star size={14} data-filled={true} className="fill-yellow-400 text-yellow-400" />
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-8 text-right text-gray-500">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Review form */}
            <div ref={formRef}>
                {!canReview ? (
                    <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm text-amber-700">
                        Bạn cần sở hữu khoá học để viết đánh giá.
                    </div>
                ) : showForm && (
                    <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">{editing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}</h4>
                        <div className="mb-3">
                            <StarRating rating={formRating} interactive size={28} />
                        </div>
                        <CustomTextarea
                            value={formComment}
                            onChange={(value: string) => setFormComment(value)}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            rows={3}
                        />
                        <div className="flex items-center gap-2 mt-3 justify-end">
                            <CustomButton variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                                Huỷ
                            </CustomButton>
                            <CustomButton onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Đang gửi...' : editing ? 'Cập nhật' : 'Gửi đánh giá'}
                            </CustomButton>
                        </div>
                    </div>
                )}
            </div>

            {/* Review list */}
            {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào.</div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="p-4 bg-white rounded-2xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0">
                                    {review.userId?.avatar ? (
                                        <img src={review.userId.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        review.userId?.fullName?.charAt(0) || '?'
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-900">{review.userId?.fullName || 'User'}</div>
                                    <div className="text-xs text-gray-500">{formatDate(review.createdAt)}</div>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    {isOwner(review) && (
                                        <>
                                            <button
                                                onClick={() => handleEditClick(review)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(review._id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xoá"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                    <StarRating rating={review.rating} size={14} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-700">{review.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirm modal */}
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setReviewToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                isDeleting={deleting}
                message="Bạn có chắc chắn muốn xoá đánh giá này?"
            />
        </div>
    );
}