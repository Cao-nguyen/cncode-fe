// app/admin/gopy/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, IFeedback } from '@/lib/api/feedback.api';
import StatusBadge from '@/components/common/StatusBadge';
import { Loader2, ChevronLeft, ChevronRight, Search, Settings, Check, X, Trash2, Eye, Calendar, User, Tag, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả', color: 'text-gray-500', bg: 'bg-gray-100' },
    { value: 'pending', label: 'Chờ xử lý', color: 'text-gray-500', bg: 'bg-gray-100' },
    { value: 'viewed', label: 'Đã xem', color: 'text-blue-500', bg: 'bg-blue-100' },
    { value: 'approved', label: 'Đã duyệt', color: 'text-green-500', bg: 'bg-green-100' },
    { value: 'in_progress', label: 'Đang cải tiến', color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { value: 'completed', label: 'Hoàn thành', color: 'text-purple-500', bg: 'bg-purple-100' },
    { value: 'rejected', label: 'Từ chối', color: 'text-red-500', bg: 'bg-red-100' }
];

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'bug', label: '🐛 Lỗi/Bug' },
    { value: 'feature', label: '✨ Tính năng mới' },
    { value: 'improvement', label: '⚡ Cải tiến' },
    { value: 'other', label: '💡 Khác' }
];

const STATUS_SELECT_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'viewed', label: 'Đã xem' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'in_progress', label: 'Đang cải tiến' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'rejected', label: 'Từ chối' }
];

const getStatusStyle = (status: string) => {
    const found = STATUS_OPTIONS.find(s => s.value === status);
    return found || STATUS_OPTIONS[0];
};

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
    const [showDetailModal, setShowDetailModal] = useState(false);
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

    const openDetailModal = (feedback: IFeedback) => {
        setSelectedFeedback(feedback);
        setShowDetailModal(true);
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

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
    };

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--cn-text-main)]">Quản lý góp ý</h1>
                    <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-1">
                        Quản lý và theo dõi các góp ý từ người dùng
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {STATUS_OPTIONS.filter(s => s.value !== 'all').map(stat => (
                    <div
                        key={stat.value}
                        className={`rounded-[var(--cn-radius-md)] p-3 text-center cursor-pointer transition-all ${selectedStatus === stat.value
                            ? 'ring-2 ring-[var(--cn-primary)] shadow-[var(--cn-shadow-md)]'
                            : 'hover:shadow-[var(--cn-shadow-sm)]'
                            } bg-[var(--cn-bg-card)] border border-[var(--cn-border)]`}
                        onClick={() => setSelectedStatus(stat.value)}
                    >
                        <div className={`text-2xl font-bold ${stat.color}`}>
                            {stats.byStatus[stat.value] || 0}
                        </div>
                        <div className="text-xs text-[var(--cn-text-muted)] mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-start">
                <div className="flex-1 min-w-[200px]">
                    <CustomInputSearch
                        placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                        value={searchInput}
                        onChange={setSearchInput}
                        onSearch={(value) => {
                            setSearchInput(value);
                            setPage(1);
                            fetchFeedbacks();
                        }}
                        size="medium"
                        variant="default"
                    />
                </div>
                <div className="w-48">
                    <div>
                        <CustomSelect
                            value={selectedCategory}
                            onChange={(value) => setSelectedCategory(value)}
                            options={CATEGORY_OPTIONS}
                            placeholder="Chọn danh mục"
                        />
                    </div>
                </div>
                <button
                    onClick={() => {
                        setPage(1);
                        fetchFeedbacks();
                    }}
                    className="px-4 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-primary-hover)] transition text-sm h-[45px] flex items-center justify-center"
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Feedbacks Table */}
            <div className="rounded-[var(--cn-radius-md)] shadow-[var(--cn-shadow-sm)] border border-[var(--cn-border)] overflow-hidden bg-[var(--cn-bg-card)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-[var(--cn-primary)]/5 border-b border-[var(--cn-border)]">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--cn-text-main)]">Người dùng</th>
                                <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--cn-text-main)]">Tiêu đề</th>
                                <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--cn-text-main)]">Danh mục</th>
                                <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--cn-text-main)]">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--cn-text-main)]">Ngày tạo</th>
                                <th className="text-center px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--cn-text-main)]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--cn-border)]">
                            {loading && feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[var(--cn-primary)] mx-auto" />
                                    </td>
                                </tr>
                            ) : feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-[var(--cn-text-muted)]">
                                        Không có góp ý nào
                                    </td>
                                </tr>
                            ) : (
                                feedbacks.map((feedback) => {
                                    const statusStyle = getStatusStyle(feedback.status);
                                    return (
                                        <tr key={feedback._id} className="hover:bg-[var(--cn-hover)] transition cursor-pointer" onClick={() => openDetailModal(feedback)}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden flex-shrink-0">
                                                        {getUserAvatar(feedback) ? (
                                                            <Image
                                                                src={getUserAvatar(feedback)!}
                                                                alt={getUserName(feedback)}
                                                                width={32}
                                                                height={32}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[var(--cn-primary)] text-xs font-semibold">
                                                                {getUserInitial(feedback)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs sm:text-sm truncate max-w-[120px] text-[var(--cn-text-main)]">
                                                        {getUserName(feedback)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs sm:text-sm font-medium max-w-xs truncate text-[var(--cn-text-main)]">
                                                    {feedback.title}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs sm:text-sm text-[var(--cn-text-sub)]">{getCategoryLabel(feedback.category)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}>
                                                    {statusStyle.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-[var(--cn-text-muted)] whitespace-nowrap">
                                                    {formatDate(feedback.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => openDetailModal(feedback)}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-[var(--cn-radius-sm)] transition"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openStatusModal(feedback)}
                                                        className="p-1.5 text-[var(--cn-primary)] hover:bg-[var(--cn-primary)]/10 rounded-[var(--cn-radius-sm)] transition"
                                                        title="Cập nhật trạng thái"
                                                    >
                                                        <Settings size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFeedback(feedback._id)}
                                                        disabled={deletingId === feedback._id}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-[var(--cn-radius-sm)] transition disabled:opacity-50"
                                                        title="Xóa góp ý"
                                                    >
                                                        {deletingId === feedback._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-[var(--cn-border)] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-xs sm:text-sm text-[var(--cn-text-muted)]">
                                {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} / {total}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] disabled:opacity-50 hover:bg-[var(--cn-hover)] transition"
                                >
                                    <ChevronLeft size={16} className="text-[var(--cn-text-sub)]" />
                                </button>
                                <span className="px-3 py-1 text-xs sm:text-sm text-[var(--cn-text-main)]">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 border border-[var(--cn-border)] rounded-[var(--cn-radius-sm)] disabled:opacity-50 hover:bg-[var(--cn-hover)] transition"
                                >
                                    <ChevronRight size={16} className="text-[var(--cn-text-sub)]" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[var(--cn-shadow-lg)]" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-[var(--cn-bg-card)] p-4 sm:p-5 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-lg sm:text-xl font-semibold text-[var(--cn-text-main)]">Chi tiết góp ý</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] hover:bg-[var(--cn-hover)] transition text-[var(--cn-text-muted)]"
                            >
                                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-5 space-y-5">
                            {/* User Info */}
                            <div className="flex items-center gap-3 p-4 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-md)]">
                                <div className="w-12 h-12 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden">
                                    {getUserAvatar(selectedFeedback) ? (
                                        <Image
                                            src={getUserAvatar(selectedFeedback)!}
                                            alt={getUserName(selectedFeedback)}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[var(--cn-primary)] text-lg font-semibold">
                                            {getUserInitial(selectedFeedback)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--cn-text-main)]">{getUserName(selectedFeedback)}</p>
                                    <p className="text-xs text-[var(--cn-text-muted)]">ID: {selectedFeedback.userId?._id || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--cn-text-sub)]">
                                    <Tag size={14} className="text-[var(--cn-primary)]" />
                                    <span>Danh mục: {getCategoryLabel(selectedFeedback.category)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--cn-text-sub)]">
                                    <Calendar size={14} className="text-[var(--cn-primary)]" />
                                    <span>Ngày tạo: {formatDate(selectedFeedback.createdAt)}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[var(--cn-text-muted)] mb-2">TIÊU ĐỀ</label>
                                <p className="text-base sm:text-lg font-semibold text-[var(--cn-text-main)]">{selectedFeedback.title}</p>
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[var(--cn-text-muted)] mb-2">NỘI DUNG GÓP Ý</label>
                                <div className="p-4 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-md)]">
                                    <p className="text-sm text-[var(--cn-text-sub)] whitespace-pre-wrap leading-relaxed">
                                        {selectedFeedback.content}
                                    </p>
                                </div>
                            </div>

                            {/* Admin Note */}
                            {selectedFeedback.adminNote && (
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-[var(--cn-text-muted)] mb-2">PHẢN HỒI TỪ ADMIN</label>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-[var(--cn-radius-md)] border-l-4 border-[var(--cn-primary)]">
                                        <p className="text-sm text-[var(--cn-text-sub)]">{selectedFeedback.adminNote}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center justify-between pt-3 border-t border-[var(--cn-border)]">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[var(--cn-text-muted)]">Trạng thái:</span>
                                    <StatusBadge status={selectedFeedback.status} size="sm" />
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        openStatusModal(selectedFeedback);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-primary-hover)] transition text-sm"
                                >
                                    <Settings size={14} />
                                    Cập nhật trạng thái
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showStatusModal && selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowStatusModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-md shadow-[var(--cn-shadow-lg)]" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-[var(--cn-text-main)]">Cập nhật trạng thái</h3>
                            <button onClick={() => setShowStatusModal(false)} className="p-1 hover:bg-[var(--cn-hover)] rounded-[var(--cn-radius-sm)] transition text-[var(--cn-text-muted)]">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Tiêu đề góp ý</label>
                                <p className="text-sm text-[var(--cn-text-main)] bg-[var(--cn-bg-section)] p-3 rounded-[var(--cn-radius-md)]">
                                    {selectedFeedback.title}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Trạng thái mới</label>
                                <CustomSelect
                                    value={newStatus}
                                    onChange={(value) => setNewStatus(value)}
                                    options={STATUS_SELECT_OPTIONS}
                                    placeholder="Chọn trạng thái"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Phản hồi (tùy chọn)</label>
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
                                    className="flex-1 px-4 py-2 border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-hover)] transition text-[var(--cn-text-sub)] text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={updating}
                                    className="flex-1 px-4 py-2 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
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