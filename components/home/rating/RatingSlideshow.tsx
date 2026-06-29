'use client';

import { useState, useCallback, useEffect } from 'react';
import { IRating } from '@/lib/api/rating.api';
import StarRating from '@/components/common/StarRating';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { ChevronLeft, ChevronRight, Star, Pencil, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { useCarousel } from '@/hooks/useCarousel';

interface RatingSlideshowProps {
    ratings: IRating[];
    loading: boolean;
    onEdit: (rating: IRating) => void;
    onDelete: (ratingId: string) => Promise<void>;
    currentUserId?: string;
    onRefresh: () => void;
}

export default function RatingSlideshow({
    ratings,
    loading,
    onEdit,
    onDelete,
    currentUserId,
    onRefresh,
}: RatingSlideshowProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const carousel = useCarousel(ratings, {
        autoSlide: false,
        minSwipeDistance: 50,
    });

    const handleDeleteClick = (ratingId: string) => {
        setPendingDeleteId(ratingId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteId) return;

        try {
            setDeletingId(pendingDeleteId);
            await onDelete(pendingDeleteId);
            onRefresh();
            toast.success('Xóa đánh giá thành công');
            setDeleteModalOpen(false);
            setPendingDeleteId(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Xóa đánh giá thất bại';
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setPendingDeleteId(null);
    };

    if (loading && ratings.length === 0) {
        return null;
    }

    if (ratings.length === 0) {
        return null;
    }

    const currentRating = ratings[carousel.current];
    if (!currentRating) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    const isOwnRating = currentRating.userId?._id === currentUserId;

    return (
        <>
            <div className="relative bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)] overflow-hidden">
                {ratings.length > 1 && (
                    <>
                        <button
                            onClick={carousel.prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-[var(--cn-shadow-sm)] hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        >
                            <ChevronLeft size={20} className="text-[var(--cn-text-sub)]" />
                        </button>
                        <button
                            onClick={carousel.next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-[var(--cn-shadow-sm)] hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        >
                            <ChevronRight size={20} className="text-[var(--cn-text-sub)]" />
                        </button>
                    </>
                )}

                <div className={`p-6 transition-opacity duration-300 ${carousel.isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden mb-4">
                            {currentRating.userId?.avatar ? (
                                <img
                                    src={currentRating.userId.avatar}
                                    alt={currentRating.userId.fullName || 'User'}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--cn-primary)] text-xl font-semibold">
                                    {(currentRating.userId?.fullName?.charAt(0) || 'U').toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            <p className="font-semibold text-[var(--cn-text-main)] text-base">
                                {currentRating.userId?.fullName || 'Người dùng'}
                            </p>
                            {isOwnRating && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onEdit(currentRating)}
                                        className="p-1 text-[var(--cn-primary)] hover:bg-[var(--cn-primary)]/10 rounded-[var(--cn-radius-sm)] transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(currentRating._id)}
                                        disabled={deletingId === currentRating._id}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded-[var(--cn-radius-sm)] transition-colors disabled:opacity-50"
                                        title="Xóa"
                                    >
                                        {deletingId === currentRating._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-[var(--cn-text-muted)] mt-1">
                            {format(new Date(currentRating.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </p>

                        <div className="mt-3">
                            <StarRating rating={currentRating.rating} readonly size={20} />
                        </div>

                        <div className="mt-4 max-w-md">
                            <p className="text-[var(--cn-text-sub)] text-sm leading-relaxed italic">
                                {`"${currentRating.content}"`}
                            </p>
                        </div>
                    </div>
                </div>

                {ratings.length > 1 && (
                    <div className="absolute bottom-3 right-3 text-xs text-[var(--cn-text-muted)] bg-[var(--cn-bg-section)] px-2 py-0.5 rounded-full">
                        {carousel.current + 1} / {ratings.length}
                    </div>
                )}
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isDeleting={deletingId !== null}
            />
        </>
    );
}
