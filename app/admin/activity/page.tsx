// app/admin/activity/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { activityApi } from '@/lib/api/activity.api';
import { IActivity, IActivityFilters } from '@/types/activity.type';
import {
    Search,
    Eye,
    ThumbsUp,
    Download,
    FileText,
    Package,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CreditCard,
    Calendar,
    Filter,
    X,
    TrendingUp,
    Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const getActivityIcon = (type: IActivity['type']) => {
    switch (type) {
        case 'post': return <FileText size={18} className="text-blue-500" />;
        case 'product': return <Package size={18} className="text-purple-500" />;
        case 'payment': return <DollarSign size={18} className="text-green-500" />;
        default: return <Eye size={18} className="text-gray-500" />;
    }
};

const getStatusBadge = (status: IActivity['status']) => {
    const statusMap: Record<string, { color: string; text: string }> = {
        published: { color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400', text: 'Đã duyệt' },
        pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400', text: 'Chờ duyệt' },
        draft: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', text: 'Nháp' },
        rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400', text: 'Từ chối' },
        success: { color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400', text: 'Thành công' },
        failed: { color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400', text: 'Thất bại' }
    };
    return statusMap[status || ''] || { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', text: status || 'Unknown' };
};

const getActionText = (activity: IActivity): string => {
    switch (activity.type) {
        case 'post': return 'đã tạo bài viết';
        case 'product': return 'đã đăng sản phẩm';
        case 'payment': return 'đã thanh toán';
        default: return 'đã thực hiện hành động';
    }
};

export default function AdminActivityPage() {
    const { token } = useAuthStore();
    const [activities, setActivities] = useState<IActivity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [filters, setFilters] = useState<IActivityFilters>({
        type: '',
        status: '',
        search: '',
        startDate: '',
        endDate: ''
    });

    const fetchActivities = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const result = await activityApi.getActivities(token, filters, page, 20);
            if (result.success) {
                setActivities(result.data);
                setTotalPages(result.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    }, [token, page, filters]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const handleFilterChange = (key: keyof IActivityFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            status: '',
            search: '',
            startDate: '',
            endDate: ''
        });
        setPage(1);
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    const formatDate = (dateString: string): string => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    };

    const formatNumber = (value: number): string => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    if (loading && activities.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hoạt động hệ thống</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Theo dõi toàn bộ hoạt động trên nền tảng</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <Filter size={18} />
                    <span>Bộ lọc</span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Bộ lọc nâng cao</h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="post">📝 Bài viết</option>
                            <option value="product">📦 Sản phẩm</option>
                            <option value="payment">💰 Giao dịch</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="published">✅ Đã duyệt</option>
                            <option value="pending">⏳ Chờ duyệt</option>
                            <option value="draft">📄 Nháp</option>
                            <option value="rejected">❌ Từ chối</option>
                            <option value="success">✅ Thành công</option>
                            <option value="failed">❌ Thất bại</option>
                        </select>

                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Từ ngày"
                        />

                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Đến ngày"
                        />
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-blue-500 mb-2">
                        <FileText size={18} />
                        <span className="text-sm">Bài viết</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activities.filter(a => a.type === 'post').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-purple-500 mb-2">
                        <Package size={18} />
                        <span className="text-sm">Sản phẩm</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activities.filter(a => a.type === 'product').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                        <DollarSign size={18} />
                        <span className="text-sm">Giao dịch</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activities.filter(a => a.type === 'payment').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                        <TrendingUp size={18} />
                        <span className="text-sm">Doanh thu</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                            activities
                                .filter(a => a.type === 'payment' && a.metadata?.method === 'banking')
                                .reduce((sum, a) => sum + (a.metadata?.amount || 0), 0)
                        )}
                    </p>
                </div>
            </div>

            {/* Activities List */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                {activities.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Eye size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">Không có hoạt động nào</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {activities.map((activity) => {
                                const statusBadge = getStatusBadge(activity.status);
                                return (
                                    <div key={activity.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                {getActivityIcon(activity.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header */}
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {activity.user?.fullName || 'Hệ thống'}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        {getActionText(activity)}
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {activity.title}
                                                    </span>
                                                    {activity.status && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                            {statusBadge.text}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Metadata - Bài viết */}
                                                {activity.type === 'post' && activity.metadata && (
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <Eye size={12} /> {formatNumber(activity.metadata.views || 0)} lượt xem
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ThumbsUp size={12} /> {formatNumber(activity.metadata.likes || 0)} thích
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FileText size={12} /> {formatNumber(activity.metadata.comments || 0)} bình luận
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Metadata - Sản phẩm */}
                                                {activity.type === 'product' && activity.metadata && (
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <Download size={12} /> {formatNumber(activity.metadata.downloads || 0)} lượt tải
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Star size={12} /> {activity.metadata.rating?.toFixed(1) || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign size={12} /> {formatCurrency(activity.metadata.price || 0)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Metadata - Giao dịch (hiển thị rõ Xu hay Ngân hàng) */}
                                                {activity.type === 'payment' && activity.metadata && (
                                                    <div className="flex flex-wrap items-center gap-4 text-xs mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign size={12} />
                                                            {activity.metadata.method === 'xu' ? (
                                                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                                    {formatNumber(activity.metadata.xuAmount || 0)} Xu
                                                                </span>
                                                            ) : (
                                                                <span className="text-green-600 dark:text-green-400 font-medium">
                                                                    {formatCurrency(activity.metadata.amount || 0)}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <CreditCard size={12} />
                                                            <span className={activity.metadata.method === 'xu'
                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                : 'text-green-600 dark:text-green-400'
                                                            }>
                                                                {activity.metadata.method === 'xu' ? 'Thanh toán bằng Xu' : 'Thanh toán qua ngân hàng (PayOS)'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Time */}
                                                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(activity.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Action Link */}
                                            {activity.link && (
                                                <a
                                                    href={activity.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex-shrink-0 hover:underline"
                                                >
                                                    Xem chi tiết →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center p-5 border-t border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    <ChevronLeft size={18} />
                                    Trước
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Trang {page} / {totalPages}
                                    </span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum = page;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (page <= 3) {
                                                pageNum = i + 1;
                                            } else if (page >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }

                                            if (pageNum < 1 || pageNum > totalPages) return null;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`w-8 h-8 rounded-lg text-sm transition ${page === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    Sau
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}