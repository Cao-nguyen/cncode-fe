
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { useReview } from '@/hooks/useReview';
import type { Review } from '@/lib/api/review.api';
import RatingModal from './rating/RatingModal';
import RatingStats from './rating/RatingStats';
import RatingSlideshow from './rating/RatingSlideshow';

interface RatingStatsType {
    average: number;
    total: number;
    distribution: Record<number, number>;
}

interface EditRatingData {
    rating: number;
    content: string;
    id: string;
}

export default function Review() {
    const { token, user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const {
        reviews,
        stats,
        myReview,
        loading,
        error,
        fetchReviews,
        fetchStats,
        fetchMyReview,
        createReview,
        updateReview,
        deleteReview,
    } = useReview();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editRatingData, setEditRatingData] = useState<EditRatingData | null>(null);

    const hasUserRated = !!myReview;

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleReviewCreated = (newReview: Review) => {
            console.log('Real-time: new review', newReview);
            fetchReviews(1);
            fetchStats();
            fetchMyReview();
        };

        const handleReviewUpdated = (updatedReview: Review) => {
            console.log('Real-time: review updated', updatedReview);
            fetchReviews(1);
            fetchStats();
            fetchMyReview();
        };

        const handleReviewDeleted = (reviewId: string) => {
            console.log('Real-time: review deleted', reviewId);
            fetchReviews(1);
            fetchStats();
            fetchMyReview();
        };

        const handleStatsUpdated = (newStats: RatingStatsType) => {
            console.log('Real-time: stats updated', newStats);
            fetchStats();
        };

        socket.on('review_created', handleReviewCreated);
        socket.on('review_updated', handleReviewUpdated);
        socket.on('review_deleted', handleReviewDeleted);
        socket.on('review_stats_updated', handleStatsUpdated);

        return () => {
            socket.off('review_created', handleReviewCreated);
            socket.off('review_updated', handleReviewUpdated);
            socket.off('review_deleted', handleReviewDeleted);
            socket.off('review_stats_updated', handleStatsUpdated);
        };
    }, [socket, isConnected, fetchReviews, fetchStats, fetchMyReview]);

    const handleSubmitRating = async (rating: number, content: string) => {
        if (!token) throw new Error('Vui lòng đăng nhập');

        if (isEditMode && editRatingData) {
            await updateReview(editRatingData.id, { rating, content });
        } else {
            if (hasUserRated) throw new Error('Bạn đã đánh giá rồi!');
            await createReview({ rating, content });
        }
        setIsModalOpen(false);
    };

    const handleEditRating = (review: any) => {
        setEditRatingData({
            rating: review.rating,
            content: review.content,
            id: review._id
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDeleteRating = async (ratingId: string) => {
        if (!token) return;
        await deleteReview(ratingId);
    };

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setEditRatingData(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditRatingData(null);
    };

    // Convert Review to IRating format for compatibility with existing components
    const ratingsAsIRating = reviews.map(r => ({
        _id: r._id,
        userId: {
            _id: r.userId._id,
            fullName: r.userId.fullName,
            email: '', // Add required field
            avatar: r.userId.avatar
        },
        rating: r.rating,
        content: r.content,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
    }));

    const userRatingAsIRating = myReview ? {
        _id: myReview._id,
        userId: {
            _id: myReview.userId._id,
            fullName: myReview.userId.fullName,
            email: '', // Add required field
            avatar: myReview.userId.avatar
        },
        rating: myReview.rating,
        content: myReview.content,
        status: myReview.status,
        createdAt: myReview.createdAt,
        updatedAt: myReview.updatedAt
    } : null;

    return (
        <>
            <div>
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">
                        Học viên nói gì về CNcode?
                    </h2>
                    <p className="text-sm text-[var(--cn-text-muted)] mt-2">Tham khảo đánh giá từ cộng đồng</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RatingStats
                        stats={stats || { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }}
                        onOpenModal={handleOpenCreateModal}
                        hasUserRated={hasUserRated}
                        onEditRating={() => userRatingAsIRating && handleEditRating(userRatingAsIRating)}
                        onDeleteRating={() => userRatingAsIRating && handleDeleteRating(userRatingAsIRating._id)}
                    />

                    <RatingSlideshow
                        ratings={ratingsAsIRating}
                        loading={loading}
                        onEdit={handleEditRating}
                        onDelete={handleDeleteRating}
                        currentUserId={user?._id}
                        onRefresh={() => {
                            fetchReviews(1);
                            fetchStats();
                            fetchMyReview();
                        }}
                    />
                </div>
            </div>

            <RatingModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitRating}
                initialRating={editRatingData?.rating || 0}
                initialContent={editRatingData?.content || ''}
                isEdit={isEditMode}
            />
        </>
    );
}
