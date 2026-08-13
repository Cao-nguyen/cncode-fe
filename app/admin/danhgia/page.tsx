'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { reviewApi, getErrorMessage } from '@/lib/api/review.api';
import type { Review, ReviewStats } from '@/lib/api/review.api';
import StarRating from '@/components/common/StarRating';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableScroll } from '@/components/admin/AdminTableScroll';
import {
    Star, Trash2, X, Eye, MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { avatarImageProps, getAvatarUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const RATING_OPTIONS = [
    { value: 'all', label: 'Tất cả sao' },
    { value: '5', label: '5 sao' },
    { value: '4', label: '4 sao' },
    { value: '3', label: '3 sao' },
    { value: '2', label: '2 sao' },
    { value: '1', label: '1 sao' },
];

function ReviewAvatar({ avatar, name, className }: { avatar?: string; name?: string; className?: string }) {
    const displayName = name || 'Người dùng';
    return (
        <Avatar className={cn('h-8 w-8 shrink-0 border border-gray-200', className)}>
            <AvatarImage
                src={getAvatarUrl(avatar)}
                alt={displayName}
                {...avatarImageProps}
            />
            <AvatarFallback className="text-xs font-semibold">
                {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
}

function DetailModal({
    review,
    onClose,
    onDelete,
    deleting,
}: {
    review: Review | null;
    onClose: () => void;
    onDelete: () => void;
    deleting: boolean;
}) {
    if (!review) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
                    <h3 className="text-lg font-semibold text-gray-800">Chi tiết đánh giá</h3>
                    <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                        <ReviewAvatar avatar={review.userId?.avatar} name={review.userId?.fullName} className="h-10 w-10" />
                        <div>
                            <p className="font-medium text-gray-900">{review.userId?.fullName || 'Người dùng'}</p>
                            <p className="text-xs text-gray-400">
                                {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </p>
                        </div>
                    </div>
                    <StarRating rating={review.rating} readonly size={20} />
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{review.content}</p>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <CustomButton variant="danger" fullWidth onClick={onDelete} loading={deleting}>
                            Xóa đánh giá
                        </CustomButton>
                        <CustomButton variant="secondary" fullWidth onClick={onClose}>
                            Đóng
                        </CustomButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminRatingsPage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [ratings, setRatings] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>({
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
    const [detailTarget, setDetailTarget] = useState<Review | null>(null);
    const [deleting, setDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearchTerm(searchInput);
            setPage(1);
        }, 400);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchInput]);

    const fetchRatings = useCallback(async (silent = false) => {
        if (!token) return;
        if (!silent) setLoading(true);
        try {
            const result = await reviewApi.adminGetAllReviews(page, PAGE_SIZE, {
                search: searchTerm || undefined,
                rating: ratingFilter !== 'all' ? ratingFilter : undefined,
                status: 'active',
            });
            setRatings(result.reviews);
            setTotalPages(result.totalPages);
            setTotal(result.total);
            if (result.stats) setStats(result.stats);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [token, page, searchTerm, ratingFilter]);

    useEffect(() => {
        fetchRatings();
    }, [fetchRatings]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const refresh = () => fetchRatings(true);

        const handleReviewCreated = (newReview: Review) => {
            if (page === 1 && !searchTerm && ratingFilter === 'all') {
                setRatings((prev) => {
                    if (prev.some((r) => r._id === newReview._id)) return prev;
                    return [newReview, ...prev].slice(0, PAGE_SIZE);
                });
                setTotal((prev) => prev + 1);
            }
            refresh();
        };

        const handleReviewDeleted = (reviewId: string) => {
            setRatings((prev) => prev.filter((r) => r._id !== reviewId));
            setTotal((prev) => Math.max(0, prev - 1));
            refresh();
        };

        const handleStatsUpdated = (newStats: ReviewStats) => {
            setStats(newStats);
        };

        socket.on('review_created', handleReviewCreated);
        socket.on('review_updated', refresh);
        socket.on('review_deleted', handleReviewDeleted);
        socket.on('review_stats_updated', handleStatsUpdated);

        return () => {
            socket.off('review_created', handleReviewCreated);
            socket.off('review_updated', refresh);
            socket.off('review_deleted', handleReviewDeleted);
            socket.off('review_stats_updated', handleStatsUpdated);
        };
    }, [socket, isConnected, page, searchTerm, ratingFilter, fetchRatings]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await reviewApi.adminDeleteReview(deleteTarget._id);
            toast.success('Đã xóa đánh giá');
            setDeleteTarget(null);
            setDetailTarget(null);
            if (ratings.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                fetchRatings(true);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    };

    const distributionPercent = (count: number) => (stats.total > 0 ? (count / stats.total) * 100 : 0);

    return (
        <AdminPageShell
            title="Quản lý đánh giá"
            description="Theo dõi và quản lý đánh giá từ học viên"
        >
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <DashboardCard
                    title="Điểm trung bình"
                    value={stats.average.toFixed(1)}
                    suffix="/5"
                    icon={<Star size={18} />}
                    iconBgColor="#FEF9C3"
                    iconColor="#EAB308"
                />
                <DashboardCard
                    title="Tổng đánh giá"
                    value={stats.total}
                    icon={<MessageSquare size={18} />}
                    iconBgColor="#EFF6FF"
                    iconColor="#3B82F6"
                />
                <DashboardCard
                    title="5 sao"
                    value={stats.distribution[5] || 0}
                    icon={<Star size={18} />}
                    iconBgColor="#F0FDF4"
                    iconColor="#22C55E"
                />
                <DashboardCard
                    title="1-2 sao"
                    value={(stats.distribution[1] || 0) + (stats.distribution[2] || 0)}
                    icon={<Star size={18} />}
                    iconBgColor="#FEF2F2"
                    iconColor="#EF4444"
                />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Phân bố đánh giá</h3>
                <div className="space-y-2">
                    {([5, 4, 3, 2, 1] as const).map((star) => {
                        const count = stats.distribution[star] || 0;
                        const percent = distributionPercent(count);
                        return (
                            <div key={star} className="flex items-center gap-3">
                                <span className="w-8 text-xs text-gray-500">{star}★</span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-yellow-400 transition-all"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-xs text-gray-500">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                    <CustomInputSearch
                        placeholder="Tìm theo tên hoặc nội dung..."
                        value={searchInput}
                        onChange={setSearchInput}
                        size="medium"
                    />
                </div>
                <div className="w-full sm:w-44">
                    <CustomSelect
                        options={RATING_OPTIONS}
                        value={ratingFilter}
                        onChange={(v) => { setRatingFilter(v); setPage(1); }}
                        placeholder="Lọc sao"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <AdminTableScroll minWidth={860}>
                    <table className="w-full">
                        <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-5 py-3">Người dùng</th>
                                <th className="px-5 py-3">Sao</th>
                                <th className="px-5 py-3">Nội dung</th>
                                <th className="px-5 py-3">Ngày tạo</th>
                                <th className="px-5 py-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className={cn('divide-y', loading && 'opacity-60')}>
                            {!loading && ratings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-400">
                                        Không có đánh giá nào
                                    </td>
                                </tr>
                            ) : (
                                ratings.map((rating) => (
                                    <tr key={rating._id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4">
                                            <div className="flex min-w-[160px] items-center gap-2">
                                                <ReviewAvatar
                                                    avatar={rating.userId?.avatar}
                                                    name={rating.userId?.fullName}
                                                />
                                                <span className="truncate text-sm text-gray-800">
                                                    {rating.userId?.fullName || 'Người dùng'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StarRating rating={rating.rating} readonly size={14} />
                                        </td>
                                        <td className="max-w-md px-5 py-4">
                                            <p className="line-clamp-2 text-sm text-gray-600">{rating.content}</p>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                                            {format(new Date(rating.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailTarget(rating)}
                                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(rating)}
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </AdminTableScroll>
            </div>

            <AdminPagination
                page={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />

            <DetailModal
                review={detailTarget}
                onClose={() => setDetailTarget(null)}
                onDelete={() => detailTarget && setDeleteTarget(detailTarget)}
                deleting={deleting}
            />

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa đánh giá"
                message={deleteTarget ? `Xóa đánh giá của "${deleteTarget.userId?.fullName || 'người dùng'}"?` : ''}
                warning="Đánh giá sẽ bị xóa vĩnh viễn khỏi hệ thống."
                isDeleting={deleting}
            />
        </AdminPageShell>
    );
}
