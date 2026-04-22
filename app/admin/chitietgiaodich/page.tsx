// app/admin/chitietgiaodich/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { transactionApi, ITransaction, ITransactionStats } from '@/lib/api/transaction.api';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    DollarSign,
    Coins,
    Package,
    User,
    Calendar,
    CreditCard,
    Eye,
    XCircle,
    CheckCircle,
    Clock,
    Filter,
    TrendingUp,
    ShoppingBag,
    X,
    Copy,
    Check
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const PAYMENT_METHODS = [
    { value: '', label: 'Tất cả phương thức' },
    { value: 'banking', label: 'Ngân hàng (PayOS)', color: 'text-green-600' },
    { value: 'xu', label: 'Xu', color: 'text-blue-600' }
];

const STATUSES = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'success', label: 'Thành công', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
    { value: 'pending', label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' },
    { value: 'failed', label: 'Thất bại', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
    { value: 'cancelled', label: 'Đã hủy', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' }
];

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

const formatDate = (dateString: string): string => {
    if (!dateString) return 'Không xác định';
    try {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Không xác định';
    }
};

const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'Không xác định';
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
        return 'Không xác định';
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'success':
            return { label: 'Thành công', color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400', icon: CheckCircle };
        case 'pending':
            return { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400', icon: Clock };
        case 'failed':
            return { label: 'Thất bại', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400', icon: XCircle };
        case 'cancelled':
            return { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: XCircle };
        default:
            return { label: status, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Clock };
    }
};

export default function TransactionPage() {
    const { token } = useAuthStore();
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [stats, setStats] = useState<ITransactionStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const result = await transactionApi.getAllTransactions(token, {
                page,
                limit: 20,
                search: searchTerm || undefined,
                paymentMethod: paymentMethod || undefined,
                status: statusFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });

            if (result.success) {
                setTransactions(result.data);
                setTotalPages(result.pagination.totalPages);
                setStats(result.stats);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [token, page, searchTerm, paymentMethod, statusFilter, startDate, endDate]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setPaymentMethod('');
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const handleCopyId = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('Đã sao chép');
    };

    const hasActiveFilters = searchTerm || paymentMethod || statusFilter || startDate || endDate;

    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Chi tiết giao dịch</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Quản lý tất cả giao dịch trên hệ thống</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Bộ lọc</span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-green-500 mb-1 sm:mb-2">
                        <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm">Doanh thu</span>
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-500 mb-1 sm:mb-2">
                        <Coins size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm">Xu tiêu thụ</span>
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">{formatNumber(stats?.totalXuSpent || 0)} Xu</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-purple-500 mb-1 sm:mb-2">
                        <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm">Tổng đơn</span>
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">{formatNumber(stats?.totalOrders || 0)}</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-500 mb-1 sm:mb-2">
                        <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm">Chờ xử lý</span>
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">{formatNumber(stats?.pendingOrders || 0)}</p>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-orange-500 mb-1 sm:mb-2">
                        <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm">Doanh thu hôm nay</span>
                    </div>
                    <p className="text-xs sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.todayRevenue || 0)}</p>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Bộ lọc nâng cao</h3>
                        <button
                            onClick={handleResetFilters}
                            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-gray-700"
                            />
                        </div>

                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="px-3 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-gray-700"
                        >
                            {PAYMENT_METHODS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-gray-700"
                        >
                            {STATUSES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-gray-700"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1.5 sm:py-2 text-sm border rounded-lg bg-white dark:bg-black dark:border-gray-700"
                        />
                    </div>
                </div>
            )}

            {/* Transactions Table - Bỏ cột sản phẩm */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] lg:min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b">
                            <tr>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Mã GD</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Người dùng</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Số tiền</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Phương thức</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Trạng thái</th>
                                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Thời gian</th>
                                <th className="text-center px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transactions.map((transaction) => {
                                const StatusBadge = getStatusBadge(transaction.status);
                                const StatusIcon = StatusBadge.icon;
                                const displayId = transaction.transactionId?.slice(-8) || transaction.payosOrderId || 'N/A';
                                return (
                                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs sm:text-sm font-mono">
                                                    {displayId}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyId(displayId, transaction._id)}
                                                    className="p-0.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {copiedId === transaction._id ? <Check size={12} /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                                    {transaction.user?.avatar ? (
                                                        <Image src={transaction.user.avatar} alt="" width={32} height={32} className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                                                            {transaction.user?.fullName?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                                                        {transaction.user?.fullName}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[150px]">
                                                        {transaction.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            {transaction.paymentMethod === 'banking' ? (
                                                <span className="font-semibold text-green-600 text-xs sm:text-sm">{formatCurrency(transaction.amount)}</span>
                                            ) : (
                                                <span className="font-semibold text-blue-600 text-xs sm:text-sm">{formatNumber(transaction.xuAmount)} Xu</span>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            {transaction.paymentMethod === 'banking' ? (
                                                <span className="flex items-center gap-0.5 sm:gap-1 text-green-600 text-xs sm:text-sm">
                                                    <CreditCard size={12} className="sm:w-[14px] sm:h-[14px]" />
                                                    Ngân hàng
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-0.5 sm:gap-1 text-blue-600 text-xs sm:text-sm">
                                                    <Coins size={12} className="sm:w-[14px] sm:h-[14px]" />
                                                    Xu
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium ${StatusBadge.color}`}>
                                                <StatusIcon size={10} className="sm:w-[12px] sm:h-[12px]" />
                                                {StatusBadge.label}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className="text-[10px] sm:text-sm text-gray-500" title={formatDate(transaction.createdAt)}>
                                                {formatRelativeTime(transaction.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTransaction(transaction);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1 sm:gap-2 p-3 sm:p-5 border-t border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1 sm:p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-1 sm:p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                )}
            </div>

            {/* Transaction Detail Modal - Hiển thị đầy đủ thông tin kèm sản phẩm */}
            {showDetailModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl w-full max-w-[95%] sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[#1c1c1c] p-3 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">Chi tiết giao dịch</h2>
                            <button onClick={() => setShowDetailModal(false)} className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                                <X size={18} className="sm:w-[20px] sm:h-[20px]" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Thông tin giao dịch */}
                            <div>
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">Thông tin giao dịch</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Mã giao dịch</p>
                                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                                            <p className="font-mono text-xs sm:text-sm break-all">{selectedTransaction.transactionId || selectedTransaction.payosOrderId || 'N/A'}</p>
                                            <button
                                                onClick={() => handleCopyId(selectedTransaction.transactionId || selectedTransaction.payosOrderId || '', 'modal')}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Trạng thái</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg text-xs font-medium mt-0.5 sm:mt-1 ${getStatusBadge(selectedTransaction.status).color}`}>
                                            {getStatusBadge(selectedTransaction.status).label}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Phương thức</p>
                                        <p className="text-sm sm:text-base mt-0.5 sm:mt-1">
                                            {selectedTransaction.paymentMethod === 'banking' ? 'Thanh toán ngân hàng (PayOS)' : 'Thanh toán bằng Xu'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Số tiền</p>
                                        <p className="text-base sm:text-lg font-semibold mt-0.5 sm:mt-1">
                                            {selectedTransaction.paymentMethod === 'banking'
                                                ? formatCurrency(selectedTransaction.amount)
                                                : `${formatNumber(selectedTransaction.xuAmount)} Xu`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Thời gian</p>
                                        <p className="text-sm sm:text-base mt-0.5 sm:mt-1">{formatDate(selectedTransaction.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin người dùng */}
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 sm:pt-6">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">Thông tin người dùng</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        {selectedTransaction.user?.avatar ? (
                                            <Image src={selectedTransaction.user.avatar} alt="" width={48} height={48} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-base sm:text-lg font-semibold">
                                                {selectedTransaction.user?.fullName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm sm:text-base">{selectedTransaction.user?.fullName}</p>
                                        <p className="text-xs sm:text-sm text-gray-500">{selectedTransaction.user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin sản phẩm - CHỈ HIỂN THỊ TRONG MODAL */}
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 sm:pt-6">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">Thông tin sản phẩm</h3>
                                <div className="flex gap-3">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                        {selectedTransaction.product?.thumbnail ? (
                                            <Image src={selectedTransaction.product.thumbnail} alt="" width={64} height={64} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm sm:text-base">{selectedTransaction.product?.name || 'Không xác định'}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Giá: {formatCurrency(selectedTransaction.product?.price || 0)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Mã SP: {selectedTransaction.product?._id || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}