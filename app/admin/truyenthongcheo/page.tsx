'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    Eye,
    Edit2,
    Trash2,
    X,
    FileText,
    Clock,
    CheckCircle2,
    BadgeCheck,
    BarChart3,
    LineChart,
    Building2,
    Mail,
    Phone,
    Globe,
    ChevronLeft,
    ChevronRight,
    Share2,
} from 'lucide-react';
import {
    LineChart as RechartsLineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { crossPromotionApi } from '@/lib/api/crosspromotion.api';
import type { CrossPromotionRequest, CrossPromotionStats, CrossPromotionStatus } from '@/types/crosspromotion.type';
import { useSocket } from '@/providers/socket.provider';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import StaticContent from '@/components/common/StaticContent';
import { TableSkeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 20;

const FILTER_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Đã từ chối' },
    { value: 'completed', label: 'Đã hoàn thành' },
];

const STATUS_UPDATE_OPTIONS = [
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Đã từ chối' },
    { value: 'completed', label: 'Đã hoàn thành' },
];

const COOPERATION_TYPE_MAP: Record<string, string> = {
    'blog-post': 'Bài đăng Blog',
    'fanpage-post': 'Bài đăng Fanpage',
};

const STATUS_CONFIG: Record<CrossPromotionStatus, { label: string; className: string }> = {
    pending: {
        label: 'Chờ duyệt',
        className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    },
    approved: {
        label: 'Đã duyệt',
        className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    },
    rejected: {
        label: 'Đã từ chối',
        className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    },
    completed: {
        label: 'Đã hoàn thành',
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    },
};

const STATUS_CHART_COLORS = ['#EAB308', '#22C55E', '#EF4444', '#3B82F6'];

const normalizeText = (text: string) => {
    if (!text) return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
};

function AdminCrossPromotionPageContent() {
    const { socket, isConnected } = useSocket();
    const [requests, setRequests] = useState<CrossPromotionRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<CrossPromotionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [stats, setStats] = useState<CrossPromotionStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
    });

    const [viewRequest, setViewRequest] = useState<CrossPromotionRequest | null>(null);
    const [statusModal, setStatusModal] = useState<CrossPromotionRequest | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<CrossPromotionRequest | null>(null);
    const [newStatus, setNewStatus] = useState<CrossPromotionStatus>('pending');
    const [adminResponseMessage, setAdminResponseMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const statusChartData = [
        { name: 'Chờ duyệt', value: stats.pending },
        { name: 'Đã duyệt', value: stats.approved },
        { name: 'Từ chối', value: stats.rejected },
        { name: 'Hoàn thành', value: stats.completed },
    ];

    const growthChartData = filteredRequests.reduce<Array<{ date: string; count: number }>>((acc, request) => {
        const date = format(new Date(request.createdAt), 'yyyy-MM-dd');
        const existing = acc.find((item) => item.date === date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ date, count: 1 });
        }
        return acc;
    }, []).sort((a, b) => a.date.localeCompare(b.date)).slice(-10);

    const fetchStats = async () => {
        try {
            const res = await crossPromotionApi.getStats();
            if (res.success && res.data) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await crossPromotionApi.getAllRequestsAdmin({
                page,
                limit: PAGE_SIZE,
                status: filterStatus,
            });
            if (res.success && res.data) {
                setRequests(res.data);
                setTotalPages(res.pagination?.pages || 1);
                setTotal(res.pagination?.total || res.data.length);
            } else {
                toast.error(res.message || 'Không thể tải danh sách yêu cầu');
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 403) {
                toast.error('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin.');
            } else if (err.response?.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else {
                toast.error('Không thể tải danh sách yêu cầu');
            }
        } finally {
            setLoading(false);
        }
    }, [page, filterStatus]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const refreshData = () => {
            fetchRequests();
            fetchStats();
        };

        socket.on('cross_promotion_created', refreshData);
        socket.on('cross_promotion_updated', refreshData);

        return () => {
            socket.off('cross_promotion_created', refreshData);
            socket.off('cross_promotion_updated', refreshData);
        };
    }, [socket, isConnected, fetchRequests]);

    useEffect(() => {
        let filtered = [...requests];

        if (searchInput.trim()) {
            const search = normalizeText(searchInput);
            filtered = filtered.filter((request) =>
                normalizeText(request.title).includes(search) ||
                normalizeText(request.requesterInfo.organizationName || '').includes(search) ||
                normalizeText(request.requester.fullName).includes(search)
            );
        }

        setFilteredRequests(filtered);
    }, [requests, searchInput]);

    const updateRequestInList = (updatedRequest: CrossPromotionRequest) => {
        setRequests((prev) => prev.map((item) => (item._id === updatedRequest._id ? updatedRequest : item)));
    };

    const removeRequestFromList = (requestId: string) => {
        setRequests((prev) => prev.filter((item) => item._id !== requestId));
    };

    const handleSearch = (value: string) => {
        setSearchInput(value);
        setPage(1);
    };

    const handleOpenStatusModal = (request: CrossPromotionRequest) => {
        setStatusModal(request);
        setNewStatus(request.status === 'pending' ? 'approved' : request.status);
        setAdminResponseMessage(request.adminResponse?.message || '');
    };

    const handleUpdateStatus = async () => {
        if (!statusModal) return;

        setSubmitting(true);
        try {
            const res = await crossPromotionApi.updateRequestStatus(
                statusModal._id,
                newStatus,
                adminResponseMessage.trim()
            );
            if (res.success && res.data) {
                toast.success('Cập nhật trạng thái thành công');
                updateRequestInList(res.data);
                setStatusModal(null);
                fetchStats();
            } else {
                toast.error(res.message || 'Cập nhật trạng thái thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            const res = await crossPromotionApi.deleteRequest(deleteConfirm._id);
            if (res.success) {
                toast.success('Xóa yêu cầu thành công');
                removeRequestFromList(deleteConfirm._id);
                setDeleteConfirm(null);
                fetchStats();
            } else {
                toast.error(res.message || 'Xóa yêu cầu thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });

    const cardConfigs = [
        {
            key: 'total',
            title: 'Tổng yêu cầu',
            value: stats.total,
            icon: <FileText className="w-4 h-4" />,
            iconBgColor: '#EFF6FF',
            iconColor: '#3B82F6',
        },
        {
            key: 'pending',
            title: 'Chờ duyệt',
            value: stats.pending,
            icon: <Clock className="w-4 h-4" />,
            iconBgColor: '#FEF3C7',
            iconColor: '#D97706',
        },
        {
            key: 'approved',
            title: 'Đã duyệt',
            value: stats.approved,
            icon: <CheckCircle2 className="w-4 h-4" />,
            iconBgColor: '#DCFCE7',
            iconColor: '#16A34A',
        },
        {
            key: 'completed',
            title: 'Hoàn thành',
            value: stats.completed,
            icon: <BadgeCheck className="w-4 h-4" />,
            iconBgColor: '#DBEAFE',
            iconColor: '#2563EB',
        },
    ];

    return (
        <div className="space-y-6 pb-8 px-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Quản lý Truyền thông chéo
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý yêu cầu hợp tác truyền thông
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cardConfigs.map((card) => (
                    <DashboardCard
                        key={card.key}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        iconBgColor={card.iconBgColor}
                        iconColor={card.iconColor}
                    />
                ))}
            </div>

            <div className="space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Yêu cầu gần đây (10 ngày gần nhất)
                        </h3>
                    </div>
                    {growthChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsLineChart data={growthChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                    tickFormatter={(value) =>
                                        new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                                    }
                                />
                                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#F9FAFB',
                                    }}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                                    formatter={(value) => [value, 'Số yêu cầu']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Chưa có dữ liệu</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Phân bố trạng thái
                        </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={statusChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#F9FAFB',
                                }}
                                formatter={(value) => [value, 'Số lượng']}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {statusChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_CHART_COLORS[index]} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 min-w-[280px]">
                        <CustomInputSearch
                            placeholder="Tìm kiếm theo tiêu đề hoặc tổ chức..."
                            value={searchInput}
                            onChange={handleSearch}
                            size="medium"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <CustomSelect
                            value={filterStatus}
                            onChange={(value) => {
                                setFilterStatus(value);
                                setPage(1);
                            }}
                            options={FILTER_OPTIONS}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <TableSkeleton rows={10} cols={6} />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Tiêu đề
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Người yêu cầu
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Loại hợp tác
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Ngày gửi
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <Share2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                            Không tìm thấy yêu cầu nào
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm line-clamp-1">
                                                    {request.title}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-800 dark:text-gray-200">
                                                    {request.requesterInfo.organizationName || request.requester.fullName}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {request.requester.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {COOPERATION_TYPE_MAP[request.cooperationType]}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleOpenStatusModal(request)}
                                                        className="inline-flex items-center"
                                                    >
                                                        <span
                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_CONFIG[request.status].className}`}
                                                        >
                                                            {STATUS_CONFIG[request.status].label}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setViewRequest(request)}
                                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenStatusModal(request)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                        title="Cập nhật trạng thái"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(request)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} trên {total}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewRequest(null)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Chi tiết yêu cầu</h2>
                            <button onClick={() => setViewRequest(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{viewRequest.title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[viewRequest.status].className}`}>
                                        {STATUS_CONFIG[viewRequest.status].label}
                                    </span>
                                    <span>{COOPERATION_TYPE_MAP[viewRequest.cooperationType]}</span>
                                    <span>•</span>
                                    <span>{formatDate(viewRequest.createdAt)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Người yêu cầu</h4>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                        <p>{viewRequest.requester.fullName}</p>
                                        <p className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {viewRequest.requester.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Thông tin liên hệ</h4>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                        {viewRequest.requesterInfo.organizationName && (
                                            <p className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                {viewRequest.requesterInfo.organizationName}
                                            </p>
                                        )}
                                        {viewRequest.requesterInfo.contactEmail && (
                                            <p className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                {viewRequest.requesterInfo.contactEmail}
                                            </p>
                                        )}
                                        {viewRequest.requesterInfo.contactPhone && (
                                            <p className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {viewRequest.requesterInfo.contactPhone}
                                            </p>
                                        )}
                                        {viewRequest.requesterInfo.website && (
                                            <p className="flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                <Link
                                                    href={viewRequest.requesterInfo.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {viewRequest.requesterInfo.website}
                                                </Link>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Nội dung</h4>
                                <div className="prose dark:prose-invert max-w-none">
                                    <StaticContent content={viewRequest.content} />
                                </div>
                            </div>

                            {viewRequest.adminResponse?.message && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Phản hồi từ CNcode</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">{viewRequest.adminResponse.message}</p>
                                    {viewRequest.adminResponse.respondedAt && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                            {viewRequest.adminResponse.respondedBy?.fullName || 'Admin'} • {formatDate(viewRequest.adminResponse.respondedAt)}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <CustomButton
                                    onClick={() => {
                                        handleOpenStatusModal(viewRequest);
                                        setViewRequest(null);
                                    }}
                                    className="flex-1"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Cập nhật trạng thái
                                </CustomButton>
                                <CustomButton variant="secondary" onClick={() => setViewRequest(null)}>
                                    Đóng
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {statusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setStatusModal(null)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Cập nhật trạng thái</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Yêu cầu: <span className="font-medium text-gray-800 dark:text-gray-200">{statusModal.title}</span>
                            </p>
                            <CustomSelect
                                label="Trạng thái mới"
                                value={newStatus}
                                onChange={(value) => setNewStatus(value as CrossPromotionStatus)}
                                options={STATUS_UPDATE_OPTIONS}
                            />
                            <CustomTextarea
                                label="Phản hồi của Admin (tùy chọn)"
                                value={adminResponseMessage}
                                onChange={setAdminResponseMessage}
                                placeholder="Nhập phản hồi cho người yêu cầu..."
                                rows={4}
                                maxLength={500}
                            />
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton onClick={handleUpdateStatus} loading={submitting} className="flex-1">
                                Xác nhận
                            </CustomButton>
                            <CustomButton variant="secondary" onClick={() => setStatusModal(null)}>
                                Hủy
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <ConfirmModalDelete
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={handleDelete}
                    title="Xác nhận xóa"
                    message={`Bạn có chắc chắn muốn xóa yêu cầu "${deleteConfirm.title}"?`}
                />
            )}
        </div>
    );
}

export default function AdminCrossPromotionPage() {
    return <AdminCrossPromotionPageContent />;
}
