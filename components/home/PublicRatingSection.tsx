'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { ratingApi, IRating, IRatingStats } from '@/lib/api/rating.api';
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

export default function PublicRatingSection() {
    const { token, user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [ratings, setRatings] = useState<IRating[]>([]);
    const [stats, setStats] = useState<RatingStatsType>({
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [refetchKey, setRefetchKey] = useState(0);
    const [hasUserRated, setHasUserRated] = useState(false);
    const [userRating, setUserRating] = useState<IRating | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editRatingData, setEditRatingData] = useState<EditRatingData | null>(null);

    const fetchRatings = useCallback(async () => {
        try {
            setLoading(true);
            const result = await ratingApi.getRatings(1, 20);

            if (result.success && result.data) {
                const ratingsData = result.data as IRating[];
                setRatings(ratingsData);

                if (user?._id) {
                    const userRatingData = ratingsData.find(r => r.userId?._id === user._id);
                    setHasUserRated(!!userRatingData);
                    setUserRating(userRatingData || null);
                }

                if (result.stats) {
                    setStats(result.stats);
                }
            }
        } catch (error) {
            console.error('Fetch ratings error:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRatingCreated = (newRating: IRating) => {
            console.log('Real-time: new rating', newRating);
            setRatings(prev => [newRating, ...prev]);
            fetchRatings();
        };

        const handleRatingUpdated = (updatedRating: IRating) => {
            console.log('Real-time: rating updated', updatedRating);
            setRatings(prev => prev.map(r => r._id === updatedRating._id ? updatedRating : r));
            if (user?._id && updatedRating.userId?._id === user._id) {
                setUserRating(updatedRating);
            }
            fetchRatings();
        };

        const handleRatingDeleted = (ratingId: string) => {
            console.log('Real-time: rating deleted', ratingId);
            setRatings(prev => prev.filter(r => r._id !== ratingId));
            if (userRating?._id === ratingId) {
                setHasUserRated(false);
                setUserRating(null);
            }
            fetchRatings();
        };

        const handleStatsUpdated = (newStats: IRatingStats) => {
            console.log('Real-time: stats updated', newStats);
            setStats(newStats);
        };

        socket.on('rating_created', handleRatingCreated);
        socket.on('rating_updated', handleRatingUpdated);
        socket.on('rating_deleted', handleRatingDeleted);
        socket.on('rating_stats_updated', handleStatsUpdated);

        return () => {
            socket.off('rating_created', handleRatingCreated);
            socket.off('rating_updated', handleRatingUpdated);
            socket.off('rating_deleted', handleRatingDeleted);
            socket.off('rating_stats_updated', handleStatsUpdated);
        };
    }, [socket, isConnected, user, userRating, fetchRatings]);

    useEffect(() => {
        fetchRatings();
    }, [refetchKey, user]);

    const handleSubmitRating = async (rating: number, content: string) => {
        if (!token) throw new Error('Vui lòng đăng nhập');

        if (isEditMode && editRatingData) {
            const result = await ratingApi.updateRating(token, editRatingData.id, rating, content);
            if (result.success) {
                setRefetchKey(prev => prev + 1);
            } else {
                throw new Error(result.message);
            }
        } else {
            if (hasUserRated) throw new Error('Bạn đã đánh giá rồi!');
            const result = await ratingApi.createRating(token, rating, content);
            if (result.success) {
                setRefetchKey(prev => prev + 1);
                setHasUserRated(true);
            } else {
                throw new Error(result.message);
            }
        }
    };

    const handleEditRating = (rating: IRating) => {
        setEditRatingData({
            rating: rating.rating,
            content: rating.content,
            id: rating._id
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDeleteRating = async (ratingId: string) => {
        if (!token) return;
        const result = await ratingApi.deleteRating(token, ratingId);
        if (result.success) {
            setRefetchKey(prev => prev + 1);
        } else {
            throw new Error(result.message);
        }
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
                        stats={stats}
                        onOpenModal={handleOpenCreateModal}
                        hasUserRated={hasUserRated}
                        onEditRating={() => userRating && handleEditRating(userRating)}
                        onDeleteRating={() => userRating && handleDeleteRating(userRating._id)}
                    />

                    <RatingSlideshow
                        ratings={ratings}
                        loading={loading}
                        onEdit={handleEditRating}
                        onDelete={handleDeleteRating}
                        currentUserId={user?._id}
                        onRefresh={() => setRefetchKey(prev => prev + 1)}
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
