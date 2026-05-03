'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { ratingApi, IRating, IRatingStats } from '@/lib/api/rating.api';
import StarRating from '@/components/common/StarRating';
import { Send, Loader2, Star, MessageCircle, X, ChevronLeft, ChevronRight, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

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

// Modal đánh giá
function RatingModal({ isOpen, onClose, onSubmit, initialRating = 0, initialContent = '', isEdit = false }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, content: string) => Promise<void>;
    initialRating?: number;
    initialContent?: string;
    isEdit?: boolean;
}) {
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
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEdit ? 'Chỉnh sửa đánh giá' : 'Đánh giá của bạn'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                        <X size={20} data-filled={true} />
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
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/50 text-gray-900 dark:text-white resize-none text-sm"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0 || !content.trim()}
                        className="w-full py-3 bg-main text-white rounded-lg hover:bg-main/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" data-filled={true} /> : <Send className="w-4 h-4" data-filled={true} />}
                        <span>{isEdit ? 'Cập nhật' : 'Gửi đánh giá'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Component hiển thị thống kê
function RatingStats({ stats, onOpenModal, hasUserRated, onEditRating, onDeleteRating, userRating }: {
    stats: RatingStatsType;
    onOpenModal: () => void;
    hasUserRated: boolean;
    onEditRating: () => void;
    onDeleteRating: () => void;
    userRating: IRating | null;
}) {
    const { token } = useAuthStore();

    if (!token) {
        return (
            <div className="bg-gradient-to-r from-main/10 to-main/5 rounded-xl p-6 text-center">
                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" data-filled={true} />
                <p className="text-gray-500 dark:text-gray-400">Đăng nhập để đánh giá</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-main/10 to-main/5 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <div className="text-3xl font-bold text-main">{stats.average.toFixed(1)}</div>
                    <StarRating rating={Math.round(stats.average)} readonly size={16} />
                    <div className="text-xs text-gray-500 mt-1">{stats.total} đánh giá</div>
                </div>

                <div className="flex-1 w-full max-w-[200px]">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = stats.distribution[star] || 0;
                        const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                                <span className="w-8">{star}★</span>
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                                </div>
                                <span className="w-8 text-gray-500">{count}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center gap-2">
                    {hasUserRated && userRating && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEditRating}
                                className="p-2 text-main hover:bg-main/10 rounded-lg transition-colors"
                                title="Chỉnh sửa đánh giá"
                            >
                                <Pencil size={16} data-filled={true} />
                            </button>
                            <button
                                onClick={onDeleteRating}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa đánh giá"
                            >
                                <Trash2 size={16} data-filled={true} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={onOpenModal}
                        disabled={hasUserRated}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${hasUserRated
                            ? 'bg-green-100 text-green-600 cursor-default'
                            : 'bg-main text-white hover:bg-main/80'
                            }`}
                    >
                        {hasUserRated ? (
                            <>
                                <CheckCircle size={16} data-filled={true} />
                                <span>Đã đánh giá</span>
                            </>
                        ) : (
                            <>
                                <MessageCircle size={16} data-filled={true} />
                                <span>Viết đánh giá</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Slideshow đánh giá
function RatingSlideshow({ ratings, loading, onEdit, onDelete, currentUserId, onRefresh }: {
    ratings: IRating[];
    loading: boolean;
    onEdit: (rating: IRating) => void;
    onDelete: (ratingId: string) => Promise<void>;
    currentUserId?: string;
    onRefresh: () => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        setCurrentIndex(0);
    }, [ratings.length]);

    const nextSlide = useCallback(() => {
        if (isAnimating || ratings.length === 0) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % ratings.length);
        setTimeout(() => setIsAnimating(false), 300);
    }, [ratings.length, isAnimating]);

    const prevSlide = useCallback(() => {
        if (isAnimating || ratings.length === 0) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + ratings.length) % ratings.length);
        setTimeout(() => setIsAnimating(false), 300);
    }, [ratings.length, isAnimating]);

    const handleDelete = async (ratingId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

        try {
            setDeletingId(ratingId);
            await onDelete(ratingId);
            onRefresh();
            toast.success('Xóa đánh giá thành công');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Xóa đánh giá thất bại';
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading && ratings.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-main" data-filled={true} />
            </div>
        );
    }

    if (ratings.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" data-filled={true} />
                <p className="text-gray-500 dark:text-gray-400">Chưa có đánh giá nào</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Hãy là người đầu tiên đánh giá!</p>
            </div>
        );
    }

    const currentRating = ratings[currentIndex];
    if (!currentRating) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-main" data-filled={true} />
            </div>
        );
    }

    const isOwnRating = currentRating.userId?._id === currentUserId;

    return (
        <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {ratings.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" data-filled={true} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" data-filled={true} />
                    </button>
                </>
            )}

            <div className={`p-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-main/10 overflow-hidden mb-4">
                        {currentRating.userId?.avatar ? (
                            <Image
                                src={currentRating.userId.avatar}
                                alt={currentRating.userId.fullName || 'User'}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-main text-xl font-semibold">
                                {(currentRating.userId?.fullName?.charAt(0) || 'U').toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <p className="font-semibold text-gray-900 dark:text-white text-base">
                            {currentRating.userId?.fullName || 'Người dùng'}
                        </p>
                        {isOwnRating && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onEdit(currentRating)}
                                    className="p-1 text-main hover:bg-main/10 rounded-lg transition-colors"
                                    title="Chỉnh sửa"
                                >
                                    <Pencil size={14} data-filled={true} />
                                </button>
                                <button
                                    onClick={() => handleDelete(currentRating._id)}
                                    disabled={deletingId === currentRating._id}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Xóa"
                                >
                                    {deletingId === currentRating._id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" data-filled={true} />
                                    ) : (
                                        <Trash2 size={14} data-filled={true} />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(currentRating.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </p>

                    <div className="mt-3">
                        <StarRating rating={currentRating.rating} readonly size={20} />
                    </div>

                    <div className="mt-4 max-w-md">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                            {`"${currentRating.content}"`}
                        </p>
                    </div>
                </div>
            </div>

            {ratings.length > 1 && (
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {currentIndex + 1} / {ratings.length}
                </div>
            )}
        </div>
    );
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

    // Socket realtime listeners
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
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Học viên nói gì về CNcode?
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">Tham khảo đánh giá từ cộng đồng</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RatingStats
                        stats={stats}
                        onOpenModal={handleOpenCreateModal}
                        hasUserRated={hasUserRated}
                        onEditRating={() => userRating && handleEditRating(userRating)}
                        onDeleteRating={() => userRating && handleDeleteRating(userRating._id)}
                        userRating={userRating}
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