'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { ratingApi, IRating, IRatingStats } from '@/lib/api/rating.api';
import StarRating from '@/components/common/StarRating';
import { Loader2, ChevronLeft, ChevronRight, Trash2, Star, Search, User, X } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

interface AdminStatsType {
    average: number;
    distribution: Record<number, number>;
}

export default function AdminRatingsPage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [ratings, setRatings] = useState<IRating[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedRating, setSelectedRating] = useState<IRating | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [stats, setStats] = useState<AdminStatsType>({
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
    const initialFetchDone = useRef(false);

    const fetchRatings = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const result = await ratingApi.getAllRatingsForAdmin(token, page, PAGE_SIZE, searchInput);

            if (result.success && result.data) {
                setRatings(result.data as IRating[]);
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages);
                    setTotal(result.pagination.total);
                }
                if (result.stats) {
                    setStats({
                        average: result.stats.average,
                        distribution: result.stats.distribution
                    });
                }
            } else {
                const errorMsg = result.message || 'Không thể lấy danh sách đánh giá';
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Fetch ratings error:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, [token, page, searchInput]);

    const fetchStats = useCallback(async () => {
        if (!token) return;
        try {
            const result = await ratingApi.getAllRatingsForAdmin(token, 1, 1);
            if (result.stats) {
                setStats({
                    average: result.stats.average,
                    distribution: result.stats.distribution
                });
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    }, [token]);

    // Socket realtime listeners
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRatingCreated = (newRating: IRating) => {
            console.log('Admin real-time: new rating', newRating);
            if (page === 1) {
                setRatings(prev => [newRating, ...prev]);
                setTotal(prev => prev + 1);
            }
            fetchStats();
            fetchRatings();
        };

        const handleRatingUpdated = (updatedRating: IRating) => {
            console.log('Admin real-time: rating updated', updatedRating);
            setRatings(prev => prev.map(r => r._id === updatedRating._id ? updatedRating : r));
            fetchStats();
            fetchRatings();
        };

        const handleRatingDeleted = (ratingId: string) => {
            console.log('Admin real-time: rating deleted', ratingId);
            setRatings(prev => prev.filter(r => r._id !== ratingId));
            setTotal(prev => prev - 1);
            fetchStats();
            fetchRatings();
        };

        const handleStatsUpdated = (newStats: IRatingStats) => {
            console.log('Admin real-time: stats updated', newStats);
            setStats({
                average: newStats.average,
                distribution: newStats.distribution
            });
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
    }, [socket, isConnected, page, fetchStats, fetchRatings]);

    useEffect(() => {
        if (token && !initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchRatings();
        }
    }, [token, fetchRatings]);

    const handleDeleteRating = async (ratingId: string) => {
        if (!token) return;
        const confirmMsg = 'Bạn có chắc chắn muốn xóa đánh giá này?';
        if (!confirm(confirmMsg)) return;

        try {
            setDeletingId(ratingId);
            const result = await ratingApi.deleteRating(token, ratingId);
            if (result.success) {
                toast.success('Xóa đánh giá thành công');
                setRatings(prev => prev.filter(r => r._id !== ratingId));
                setTotal(prev => prev - 1);
                if (ratings.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchRatings();
                }
            } else {
                const errorMsg = result.message || 'Xóa đánh giá thất bại';
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Delete rating error:', error);
            toast.error('Có lỗi xảy ra khi xóa đánh giá');
        } finally {
            setDeletingId(null);
            setShowDetailModal(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchRatings();
    };

    const openDetailModal = (rating: IRating) => {
        setSelectedRating(rating);
        setShowDetailModal(true);
    };

    const percentage = (count: number) => {
        return total > 0 ? (count / total) * 100 : 0;
    };

    return (
        <>
            <div className="space-y-4 sm:space-y-6 pb-8 px-3 sm:px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Quản lý đánh giá</h1>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Quản lý tất cả đánh giá của người dùng
                        </p>
                    </div>
                </div>

                {/* Thống kê */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-4 sm:p-5 shadow-sm border border-main/20 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" data-filled={true} />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Đánh giá trung bình</span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-main">{stats.average.toFixed(1)}/5</div>
                        <div className="mt-2">
                            <StarRating rating={Math.round(stats.average)} readonly size={16} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Từ {total} đánh giá</p>
                    </div>

                    <div className="rounded-xl p-4 sm:p-5 shadow-sm border border-main/20 bg-white dark:bg-gray-900">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Phân bố đánh giá</h3>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = stats.distribution[star] || 0;
                                const percent = percentage(count);
                                return (
                                    <div key={star} className="flex items-center gap-2">
                                        <div className="w-10 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{star}★</div>
                                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full transition-all"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <div className="w-10 text-xs sm:text-sm text-gray-500">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="rounded-xl p-4 sm:p-5 shadow-sm border border-main/20 bg-white dark:bg-gray-900">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} data-filled={true} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tìm kiếm theo nội dung..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-main/30 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-main"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-main text-white rounded-lg hover:bg-main/80 transition-colors text-sm whitespace-nowrap"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>

                {/* Danh sách đánh giá */}
                {loading && ratings.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-main" data-filled={true} />
                    </div>
                ) : ratings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border border-main/20 rounded-xl bg-white dark:bg-gray-900">
                        Không có đánh giá nào
                    </div>
                ) : (
                    <>
                        {/* Mobile card view */}
                        <div className="block md:hidden space-y-3">
                            {ratings.map((rating) => (
                                <div
                                    key={rating._id}
                                    className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-main/10 overflow-hidden flex-shrink-0">
                                                {rating.userId?.avatar ? (
                                                    <Image
                                                        src={rating.userId.avatar}
                                                        alt={rating.userId.fullName || 'User'}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-main text-xs font-semibold">
                                                        {rating.userId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {rating.userId?.fullName || 'Người dùng'}
                                                </p>
                                                <span className="text-xs text-gray-400">
                                                    {format(new Date(rating.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openDetailModal(rating)}
                                            className="text-xs text-main hover:underline flex-shrink-0"
                                        >
                                            Chi tiết
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <StarRating rating={rating.rating} readonly size={14} />
                                        <button
                                            onClick={() => handleDeleteRating(rating._id)}
                                            disabled={deletingId === rating._id}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === rating._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" data-filled={true} />
                                            ) : (
                                                <Trash2 size={14} data-filled={true} />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                        {rating.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Tablet/Laptop table view */}
                        <div className="hidden md:block rounded-xl shadow-sm border border-main/20 overflow-hidden bg-white dark:bg-gray-900">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-main/5 border-b border-main/20">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-main">Người dùng</th>
                                            <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-main">Đánh giá</th>
                                            <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-main">Nội dung</th>
                                            <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-main">Ngày tạo</th>
                                            <th className="text-center px-4 py-3 text-xs sm:text-sm font-semibold text-main">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-main/10">
                                        {ratings.map((rating) => (
                                            <tr key={rating._id} className="hover:bg-main/5 transition">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-main/10 overflow-hidden flex-shrink-0">
                                                            {rating.userId?.avatar ? (
                                                                <Image
                                                                    src={rating.userId.avatar}
                                                                    alt={rating.userId.fullName}
                                                                    width={32}
                                                                    height={32}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-main text-xs font-semibold">
                                                                    {rating.userId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                                            {rating.userId?.fullName || 'Người dùng'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StarRating rating={rating.rating} readonly size={16} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p
                                                        className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md cursor-pointer hover:text-main"
                                                        onClick={() => openDetailModal(rating)}
                                                    >
                                                        {rating.content}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                                        {format(new Date(rating.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() => handleDeleteRating(rating._id)}
                                                            disabled={deletingId === rating._id}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Xóa đánh giá"
                                                        >
                                                            {deletingId === rating._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" data-filled={true} />
                                                            ) : (
                                                                <Trash2 size={16} data-filled={true} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                                <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                    {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} / {total}
                                </div>
                                <div className="flex items-center gap-1 order-1 sm:order-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-1.5 sm:p-2 border border-main/20 rounded-lg disabled:opacity-50 hover:bg-main/5"
                                    >
                                        <ChevronLeft size={16} data-filled={true} />
                                    </button>
                                    <span className="px-2 sm:px-3 py-1 text-sm font-medium">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-1.5 sm:p-2 border border-main/20 rounded-lg disabled:opacity-50 hover:bg-main/5"
                                    >
                                        <ChevronRight size={16} data-filled={true} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal chi tiết đánh giá */}
            {showDetailModal && selectedRating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chi tiết đánh giá</h3>
                            <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                <X size={20} data-filled={true} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-main/10 overflow-hidden">
                                    {selectedRating.userId?.avatar ? (
                                        <Image
                                            src={selectedRating.userId.avatar}
                                            alt={selectedRating.userId.fullName || 'User'}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-main font-semibold">
                                            {selectedRating.userId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedRating.userId?.fullName || 'Người dùng'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {format(new Date(selectedRating.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <StarRating rating={selectedRating.rating} readonly size={20} />
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {selectedRating.content}
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => handleDeleteRating(selectedRating._id)}
                                    disabled={deletingId === selectedRating._id}
                                    className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {deletingId === selectedRating._id ? 'Đang xóa...' : 'Xóa đánh giá'}
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}