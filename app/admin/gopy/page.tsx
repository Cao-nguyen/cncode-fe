// app/admin/gopy/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, IFeedback } from '@/lib/api/feedback.api';
import StatusBadge from '@/components/common/StatusBadge';
import { Loader2, ChevronLeft, ChevronRight, Search, Settings, Check, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomInput from '@/components/ui/CustomInput';
import CustomTextarea from '@/components/ui/CustomTextarea';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả', color: 'bg-gray-500' },
    { value: 'pending', label: 'Chờ xử lý', color: 'bg-gray-500' },
    { value: 'viewed', label: 'Đã xem', color: 'bg-blue-500' },
    { value: 'approved', label: 'Đã duyệt', color: 'bg-green-500' },
    { value: 'in_progress', label: 'Đang cải tiến', color: 'bg-yellow-500' },
    { value: 'completed', label: 'Hoàn thành', color: 'bg-purple-500' },
    { value: 'rejected', label: 'Từ chối', color: 'bg-red-500' }
];

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'bug', label: 'Lỗi/Bug' },
    { value: 'feature', label: 'Tính năng mới' },
    { value: 'improvement', label: 'Cải tiến' },
    { value: 'other', label: 'Khác' }
];

const STATUS_SELECT_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'viewed', label: 'Đã xem' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'in_progress', label: 'Đang cải tiến' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'rejected', label: 'Từ chối' }
];

export default function AdminFeedbackPage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stats, setStats] = useState<{ byStatus: Record<string, number>; byCategory: Record<string, number> }>({
        byStatus: {},
        byCategory: {}
    });
    const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [updating, setUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const initialFetchDone = useRef(false);

    const fetchFeedbacks = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const result = await feedbackApi.getAllFeedbacksForAdmin(
                token, page, PAGE_SIZE, selectedStatus, selectedCategory, searchInput
            );

            if (result.success && result.data) {
                setFeedbacks(result.data as IFeedback[]);
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages);
                    setTotal(result.pagination.total);
                }
                if (result.stats) {
                    setStats(result.stats);
                }
            }
        } catch (error) {
            console.error('Fetch feedbacks error:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách');
        } finally {
            setLoading(false);
        }
    }, [token, page, selectedStatus, selectedCategory, searchInput]);

    // Socket realtime
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleFeedbackCreated = (newFeedback: IFeedback) => {
            if (page === 1) {
                setFeedbacks(prev => [newFeedback, ...prev]);
                setTotal(prev => prev + 1);
            }
            fetchFeedbacks();
        };

        const handleFeedbackUpdated = (updatedFeedback: IFeedback) => {
            setFeedbacks(prev => prev.map(f => f._id === updatedFeedback._id ? updatedFeedback : f));
            fetchFeedbacks();
        };

        const handleFeedbackDeleted = (feedbackId: string) => {
            setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
            setTotal(prev => prev - 1);
            fetchFeedbacks();
        };

        socket.on('feedback_created', handleFeedbackCreated);
        socket.on('feedback_updated', handleFeedbackUpdated);
        socket.on('feedback_deleted', handleFeedbackDeleted);

        return () => {
            socket.off('feedback_created', handleFeedbackCreated);
            socket.off('feedback_updated', handleFeedbackUpdated);
            socket.off('feedback_deleted', handleFeedbackDeleted);
        };
    }, [socket, isConnected, page, fetchFeedbacks]);

    useEffect(() => {
        if (token && !initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchFeedbacks();
        }
    }, [token, fetchFeedbacks]);

    const handleUpdateStatus = async () => {
        if (!token || !selectedFeedback) return;

        try {
            setUpdating(true);
            const result = await feedbackApi.updateFeedbackStatus(token, selectedFeedback._id, newStatus, adminNote);
            if (result.success) {
                toast.success('Cập nhật trạng thái thành công');
                setShowStatusModal(false);
                setSelectedFeedback(null);
                setNewStatus('');
                setAdminNote('');
                fetchFeedbacks();
            } else {
                toast.error(result.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa góp ý này?')) return;

        try {
            setDeletingId(feedbackId);
            const result = await feedbackApi.deleteFeedback(token!, feedbackId);
            if (result.success) {
                toast.success('Xóa góp ý thành công');
                setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
                setTotal(prev => prev - 1);
                if (feedbacks.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchFeedbacks();
                }
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchFeedbacks();
    };

    const openStatusModal = (feedback: IFeedback) => {
        setSelectedFeedback(feedback);
        setNewStatus(feedback.status);
        setAdminNote(feedback.adminNote || '');
        setShowStatusModal(true);
    };

    const getCategoryLabel = (category: string) => {
        const found = CATEGORY_OPTIONS.find(c => c.value === category);
        return found?.label || category;
    };

    const getUserName = (feedback: IFeedback) => {
        return feedback.userId?.fullName || 'Người dùng';
    };

    const getUserAvatar = (feedback: IFeedback) => {
        return feedback.userId?.avatar;
    };

    const getUserInitial = (feedback: IFeedback) => {
        const name = getUserName(feedback);
        return name !== 'Người dùng' ? name.charAt(0).toUpperCase() : '?';
    };

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Quản lý góp ý</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Quản lý và theo dõi các góp ý từ người dùng
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {STATUS_OPTIONS.filter(s => s.value !== 'all').map(stat => (
                    <div
                        key={stat.value}
                        className={`rounded-xl p-3 text-center cursor-pointer transition-all ${selectedStatus === stat.value
                            ? 'ring-2 ring-main shadow-md'
                            : 'hover:shadow-md'
                            } bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700`}
                        onClick={() => setSelectedStatus(stat.value)}
                    >
                        <div className={`text-2xl font-bold ${stat.color.replace('bg-', 'text-')}`}>
                            {stats.byStatus[stat.value] || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} data-filled={true} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main"
                        />
                    </div>
                </div>
                <div className="w-48">
                    <CustomSelect
                        value={selectedCategory}
                        onChange={(value) => setSelectedCategory(value)}
                        options={CATEGORY_OPTIONS}
                        placeholder="Chọn danh mục"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-main text-white rounded-xl hover:bg-main/80 transition text-sm"
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Feedbacks Table */}
            <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Người dùng</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Tiêu đề</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Danh mục</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Ngày tạo</th>
                                <th className="text-center px-4 py-3 text-sm font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading && feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-main mx-auto" data-filled={true} />
                                    </td>
                                </tr>
                            ) : feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        Không có góp ý nào
                                    </td>
                                </tr>
                            ) : (
                                feedbacks.map((feedback) => (
                                    <tr key={feedback._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-main/10 overflow-hidden flex-shrink-0">
                                                    {getUserAvatar(feedback) ? (
                                                        <Image
                                                            src={getUserAvatar(feedback)!}
                                                            alt={getUserName(feedback)}
                                                            width={32}
                                                            height={32}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-main text-xs font-semibold">
                                                            {getUserInitial(feedback)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm truncate max-w-[120px]">
                                                    {getUserName(feedback)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium max-w-xs truncate">
                                                {feedback.title}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm">{getCategoryLabel(feedback.category)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={feedback.status} size="sm" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                                {format(new Date(feedback.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openStatusModal(feedback)}
                                                    className="p-1.5 text-main hover:bg-main/10 rounded-xl transition"
                                                    title="Cập nhật trạng thái"
                                                >
                                                    <Settings size={16} data-filled={true} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFeedback(feedback._id)}
                                                    disabled={deletingId === feedback._id}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition disabled:opacity-50"
                                                    title="Xóa góp ý"
                                                >
                                                    {deletingId === feedback._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" data-filled={true} />
                                                    ) : (
                                                        <Trash2 size={16} data-filled={true} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-gray-500">
                                {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} / {total}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-100"
                                >
                                    <ChevronLeft size={16} data-filled={true} />
                                </button>
                                <span className="px-3 py-1 text-sm">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 border border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-100"
                                >
                                    <ChevronRight size={16} data-filled={true} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Update Status Modal */}
            {showStatusModal && selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowStatusModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Cập nhật trạng thái</h3>
                            <button onClick={() => setShowStatusModal(false)} className="p-1 hover:bg-gray-100 rounded-xl">
                                <X size={20} data-filled={true} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tiêu đề góp ý</label>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-xl">
                                    {selectedFeedback.title}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Trạng thái mới</label>
                                <CustomSelect
                                    value={newStatus}
                                    onChange={(value) => setNewStatus(value)}
                                    options={STATUS_SELECT_OPTIONS}
                                    placeholder="Chọn trạng thái"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phản hồi (tùy chọn)</label>
                                <CustomTextarea
                                    value={adminNote}
                                    onChange={(value) => setAdminNote(value)}
                                    placeholder="Nhập phản hồi cho người dùng..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={updating}
                                    className="flex-1 px-4 py-2 bg-main text-white rounded-xl hover:bg-main/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" data-filled={true} /> : <Check size={16} data-filled={true} />}
                                    {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}