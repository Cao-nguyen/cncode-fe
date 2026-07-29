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

    // Check if running on production
    const isProduction = process.env.NEXT_PUBLIC_API_URL?.includes('cncode.io.vn') || 
                        (typeof window !== 'undefined' && window.location.hostname.includes('cncode.io.vn'));

    const fetchReviews = useCallback(async (pageNum = 1) => {
        if (isProduction) return;
        
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
    }, [limit, isProduction]);

    const fetchStats = useCallback(async () => {
        if (isProduction) return;
        
        try {
            const statsData = await reviewApi.getStats();
            setStats(statsData);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, [isProduction]);

    const fetchMyReview = useCallback(async () => {
        if (isProduction) return;
        
        try {
            const myReviewData = await reviewApi.getMyReview();
            setMyReview(myReviewData);
        } catch (err) {
            console.error('Error fetching my review:', err);
        }
    }, [isProduction]);

    const createReview = useCallback(async (payload: { rating: number; content: string }) => {
        if (isProduction) throw new Error('Review feature disabled on production');
        
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
    }, [fetchReviews, fetchStats, isProduction]);

    const updateReview = useCallback(async (id: string, payload: { rating?: number; content?: string }) => {
        if (isProduction) throw new Error('Review feature disabled on production');
        
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
    }, [page, fetchReviews, fetchStats, isProduction]);

    const deleteReview = useCallback(async (id: string) => {
        if (isProduction) throw new Error('Review feature disabled on production');
        
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
    }, [page, fetchReviews, fetchStats, isProduction]);

    const loadMore = useCallback(() => {
        if (page < totalPages && !isProduction) {
            fetchReviews(page + 1);
        }
    }, [page, totalPages, fetchReviews, isProduction]);

    useEffect(() => {
        if (!isProduction) {
            fetchReviews(1);
            fetchStats();
            fetchMyReview();
        } else {
            setLoading(false);
        }
    }, [fetchReviews, fetchStats, fetchMyReview, isProduction]);

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
