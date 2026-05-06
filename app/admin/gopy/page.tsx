// app/admin/gopy/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, IFeedback } from '@/lib/api/feedback.api';
import StatusBadge from '@/components/common/StatusBadge';
import { Loader2, ChevronLeft, ChevronRight, Search, Settings, Check, X, Trash2, Eye, Calendar, Tag, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { DashboardCard } from '@/components/custom/DashboardCard';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả', color: 'text-gray-500', bg: 'bg-gray-100' },
    { value: 'pending', label: 'Chờ xử lý', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { value: 'viewed', label: 'Đã xem', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'approved', label: 'Đã duyệt', color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'in_progress', label: 'Đang cải tiến', color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: 'completed', label: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: 'rejected', label: 'Từ chối', color: 'text-red-600', bg: 'bg-red-50' }
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
                if (result.stats) setStats(result.stats);
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
            if (page === 1) setFeedbacks(prev => [newFeedback, ...prev]);
            fetchFeedbacks();
        };
        const handleFeedbackUpdated = (updatedFeedback: IFeedback) => {
            setFeedbacks(prev => prev.map(f => f._id === updatedFeedback._id ? updatedFeedback : f));
            fetchFeedbacks();
        };
        const handleFeedbackDeleted = (feedbackId: string) => {
            setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
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
                fetchFeedbacks();
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeletingId(null);
        }
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

    const getUserName = (feedback: IFeedback) => feedback.userId?.fullName || 'Người dùng';
    const getUserAvatar = (feedback: IFeedback) => feedback.userId?.avatar;
    const getUserInitial = (feedback: IFeedback) => {
        const name = getUserName(feedback);
        return name !== 'Người dùng' ? name.charAt(0).toUpperCase() : '?';
    };
    const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });

    const cardConfigs = [
        { key: 'pending', title: 'Chờ xử lý', iconBgColor: '#FEF3C7', iconColor: '#D97706' },
        { key: 'viewed', title: 'Đã xem', iconBgColor: '#DBEAFE', iconColor: '#2563EB' },
        { key: 'approved', title: 'Đã duyệt', iconBgColor: '#D1FAE5', iconColor: '#059669' },
        { key: 'in_progress', title: 'Đang cải tiến', iconBgColor: '#F3E8FF', iconColor: '#9333EA' },
        { key: 'completed', title: 'Hoàn thành', iconBgColor: '#D1FAE5', iconColor: '#10B981' },
        { key: 'rejected', title: 'Từ chối', iconBgColor: '#FEE2E2', iconColor: '#DC2626' },
    ];

    if (loading && feedbacks.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">Quản lý góp ý</h1>
                    <p className="text-sm text-[var(--cn-text-muted)] mt-1">Quản lý và theo dõi các góp ý từ người dùng</p>
                </div>
                <div className="bg-[var(--cn-primary)]/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-[var(--cn-primary)]">Tổng: {total} góp ý</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {cardConfigs.map((config) => (
                    <DashboardCard
                        key={config.key}
                        title={config.title}
                        value={stats.byStatus[config.key] || 0}
                        iconBgColor={config.iconBgColor}
                        iconColor={config.iconColor}
                        change={0}
                        trend="neutral"
                    />
                ))}
            </div>

            {/* Filters */}
            <div className="bg-[var(--cn-bg-card)] rounded-xl p-4 shadow-sm border border-[var(--cn-border)]">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <CustomInputSearch
                            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                            value={searchInput}
                            onChange={setSearchInput}
                            onSearch={(value) => { setSearchInput(value); setPage(1); fetchFeedbacks(); }}
                            size="medium"
                            variant="default"
                        />
                    </div>
                    <div className="w-48">
                        <CustomSelect
                            value={selectedCategory}
                            onChange={(value) => { setSelectedCategory(value); setPage(1); fetchFeedbacks(); }}
                            options={CATEGORY_OPTIONS}
                            placeholder="Chọn danh mục"
                        />
                    </div>
                    <button onClick={() => fetchFeedbacks()} className="px-5 py-2.5 bg-[var(--cn-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--cn-primary-hover)] transition flex items-center gap-2">
                        <Search size={16} /> Tìm kiếm
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--cn-bg-card)] rounded-xl shadow-sm border border-[var(--cn-border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-[var(--cn-primary)]/5 border-b border-[var(--cn-border)]">
                            <tr>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Người dùng</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Tiêu đề</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Danh mục</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Trạng thái</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Ngày tạo</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--cn-text-muted)] uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--cn-border)]">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[var(--cn-primary)] mx-auto" /><p className="text-sm text-[var(--cn-text-muted)] mt-3">Đang tải dữ liệu...</p></td></tr>
                            ) : feedbacks.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-16"><MessageCircle size={48} className="text-[var(--cn-text-muted)] mx-auto" /><p className="text-gray-400 mt-2">Không có góp ý nào</p></td></tr>
                            ) : (
                                feedbacks.map((feedback) => {
                                    const statusStyle = getStatusStyle(feedback.status);
                                    return (
                                        <tr key={feedback._id} className="hover:bg-[var(--cn-hover)] transition cursor-pointer group" onClick={() => openDetailModal(feedback)}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[var(--cn-primary)]/10 flex items-center justify-center">
                                                        {getUserAvatar(feedback) ? (
                                                            <Image src={getUserAvatar(feedback)!} alt={getUserName(feedback)} width={36} height={36} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-[var(--cn-primary)]">{getUserInitial(feedback)}</span>
                                                        )}
                                                    </div>
                                                    <div><p className="text-sm font-medium text-[var(--cn-text-main)]">{getUserName(feedback)}</p><p className="text-xs text-[var(--cn-text-muted)]">{feedback.userId?.email}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4"><p className="text-sm font-medium text-[var(--cn-text-main)] line-clamp-1">{feedback.title}</p></td>
                                            <td className="px-5 py-4"><span className="text-sm text-[var(--cn-text-sub)]">{getCategoryLabel(feedback.category)}</span></td>
                                            <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}>{statusStyle.label}</span></td>
                                            <td className="px-5 py-4"><span className="text-sm text-[var(--cn-text-muted)] whitespace-nowrap">{formatDate(feedback.createdAt)}</span></td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => openDetailModal(feedback)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Xem chi tiết"><Eye size={16} /></button>
                                                    <button onClick={() => openStatusModal(feedback)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition" title="Cập nhật trạng thái"><Settings size={16} /></button>
                                                    <button onClick={() => handleDeleteFeedback(feedback._id)} disabled={deletingId === feedback._id} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50" title="Xóa góp ý">{deletingId === feedback._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="border-t border-[var(--cn-border)] px-5 py-4 flex items-center justify-between">
                        <div className="text-sm text-[var(--cn-text-muted)]">Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} trên {total}</div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronLeft size={16} /></button>
                            <span className="px-3 text-sm font-medium text-[var(--cn-text-main)]">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-[var(--cn-bg-card)] px-6 py-4 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[var(--cn-text-main)]">Chi tiết góp ý</h3>
                            <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] hover:bg-[var(--cn-hover)] transition"><X size={18} className="text-[var(--cn-text-muted)]" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4 p-4 bg-[var(--cn-bg-section)] rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-[var(--cn-primary)]/20 flex items-center justify-center text-[var(--cn-primary)] text-xl font-bold">{getUserInitial(selectedFeedback)}</div>
                                <div><p className="font-semibold text-[var(--cn-text-main)] text-lg">{getUserName(selectedFeedback)}</p><p className="text-sm text-[var(--cn-text-muted)]">{selectedFeedback.userId?.email}</p></div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--cn-bg-section)] rounded-full"><Tag size={14} className="text-[var(--cn-primary)]" /><span className="text-sm text-[var(--cn-text-sub)]">{getCategoryLabel(selectedFeedback.category)}</span></div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--cn-bg-section)] rounded-full"><Calendar size={14} className="text-[var(--cn-primary)]" /><span className="text-sm text-[var(--cn-text-sub)]">{formatDate(selectedFeedback.createdAt)}</span></div>
                            </div>
                            <div><label className="block text-xs font-semibold uppercase text-[var(--cn-text-muted)] mb-2">TIÊU ĐỀ</label><div className="p-4 bg-[var(--cn-bg-section)] rounded-xl"><p className="text-lg font-semibold text-[var(--cn-text-main)]">{selectedFeedback.title}</p></div></div>
                            <div><label className="block text-xs font-semibold uppercase text-[var(--cn-text-muted)] mb-2">NỘI DUNG</label><div className="p-4 bg-[var(--cn-bg-section)] rounded-xl"><p className="text-[var(--cn-text-sub)] whitespace-pre-wrap leading-relaxed">{selectedFeedback.content}</p></div></div>
                            {selectedFeedback.adminNote && (<div><label className="block text-xs font-semibold uppercase text-[var(--cn-text-muted)] mb-2">PHẢN HỒI</label><div className="p-4 bg-blue-50 rounded-xl border-l-4 border-[var(--cn-primary)]"><p className="text-[var(--cn-text-sub)]">{selectedFeedback.adminNote}</p></div></div>)}
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--cn-border)]">
                                <div className="flex items-center gap-2"><span className="text-sm text-[var(--cn-text-muted)]">Trạng thái:</span><StatusBadge status={selectedFeedback.status} size="sm" /></div>
                                <button onClick={() => { setShowDetailModal(false); openStatusModal(selectedFeedback); }} className="px-5 py-2 bg-[var(--cn-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--cn-primary-hover)] transition flex items-center gap-2"><Settings size={14} /> Cập nhật</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {showStatusModal && selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowStatusModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[var(--cn-text-main)]">Cập nhật trạng thái</h3>
                            <button onClick={() => setShowStatusModal(false)} className="p-1 hover:bg-[var(--cn-hover)] rounded-lg transition"><X size={20} className="text-[var(--cn-text-muted)]" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div><label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Tiêu đề</label><div className="p-3 bg-[var(--cn-bg-section)] rounded-xl"><p className="text-[var(--cn-text-main)]">{selectedFeedback.title}</p></div></div>
                            <div><label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Trạng thái mới</label><CustomSelect value={newStatus} onChange={setNewStatus} options={STATUS_SELECT_OPTIONS} placeholder="Chọn trạng thái" /></div>
                            <div><label className="block text-sm font-medium mb-2 text-[var(--cn-text-sub)]">Phản hồi</label><CustomTextarea value={adminNote} onChange={setAdminNote} placeholder="Nhập phản hồi..." rows={3} maxLength={500} /></div>
                            <div className="flex gap-3"><button onClick={() => setShowStatusModal(false)} className="flex-1 px-4 py-2.5 border border-[var(--cn-border)] rounded-xl text-[var(--cn-text-sub)] font-medium hover:bg-[var(--cn-hover)] transition">Hủy</button><button onClick={handleUpdateStatus} disabled={updating} className="flex-1 px-4 py-2.5 bg-[var(--cn-primary)] text-white rounded-xl font-medium hover:bg-[var(--cn-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-2">{updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}{updating ? 'Đang cập nhật...' : 'Cập nhật'}</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}