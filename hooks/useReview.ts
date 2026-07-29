import { useState, useEffect, useCallback } from 'react';
import { reviewApi } from '@/lib/api/review.api';
import { Review, ReviewsResponse, ReviewStats } from '@/types/review.type';

export function useReview() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [myReview, setMyReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

    const limit = 10;

    const fetchReviews = useCallback(async (pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response: ReviewsResponse = await reviewApi.getAllReviews(pageNum, limit);
            setReviews(response.reviews);
            setStats(response.stats);
            setTotalPages(response.totalPages);
            setTotal(response.total);
            setPage(response.page);
        } catch (err) {
            setError('Failed to fetch reviews');
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    const fetchStats = useCallback(async () => {
        try {
            const statsData = await reviewApi.getStats();
            setStats(statsData);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    const fetchMyReview = useCallback(async () => {
        try {
            const myReviewData = await reviewApi.getMyReview();
            setMyReview(myReviewData);
        } catch (err) {
            console.error('Error fetching my review:', err);
        }
    }, []);

    const createReview = useCallback(async (payload: { rating: number; content: string }) => {
        try {
            const newReview = await reviewApi.create(payload);
            setMyReview(newReview);
            await fetchReviews(1);
            await fetchStats();
            return newReview;
        } catch (err) {
            setError('Failed to create review');
            console.error('Error creating review:', err);
            throw err;
        }
    }, [fetchReviews, fetchStats]);

    const updateReview = useCallback(async (id: string, payload: { rating?: number; content?: string }) => {
        try {
            const updatedReview = await reviewApi.update(id, payload);
            setMyReview(updatedReview);
            await fetchReviews(page);
            await fetchStats();
            return updatedReview;
        } catch (err) {
            setError('Failed to update review');
            console.error('Error updating review:', err);
            throw err;
        }
    }, [page, fetchReviews, fetchStats]);

    const deleteReview = useCallback(async (id: string) => {
        try {
            await reviewApi.delete(id);
            setMyReview(null);
            await fetchReviews(page);
            await fetchStats();
        } catch (err) {
            setError('Failed to delete review');
            console.error('Error deleting review:', err);
            throw err;
        }
    }, [page, fetchReviews, fetchStats]);

    const loadMore = useCallback(() => {
        if (page < totalPages) {
            fetchReviews(page + 1);
        }
    }, [page, totalPages, fetchReviews]);

    useEffect(() => {
        fetchReviews(1);
        fetchStats();
        fetchMyReview();
    }, [fetchReviews, fetchStats, fetchMyReview]);

    return {
        reviews,
        stats,
        myReview,
        loading,
        error,
        page,
        totalPages,
        total,
        fetchReviews,
        fetchStats,
        fetchMyReview,
        createReview,
        updateReview,
        deleteReview,
        loadMore,
    };
}
