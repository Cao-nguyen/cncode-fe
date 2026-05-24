// app/admin/gopy/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, IFeedback } from '@/lib/api/feedback.api';
import { Loader2, ChevronLeft, ChevronRight, Search, Settings, Check, X, Trash2, Eye, Calendar, Tag, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { DeleteConfirmModal } from '@/components/custom/DeleteConfirmModal';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả', color: 'text-gray-500', bg: 'bg-gray-100' },
    { value: 'pending', label: 'Chờ xử lý', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { value: 'viewed', label: 'Đã xem', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'approved', label: 'Đã duyệt', color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'improving', label: 'Đang cải tiến', color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: 'completed', label: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: 'rejected', label: 'Từ chối', color: 'text-red-600', bg: 'bg-red-50' }
];

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'bug', label: 'Lỗi/Bug' },
    { value: 'ui_ux', label: 'UI/UX' },
    { value: 'feature_request', label: 'Tính năng mới' },
    { value: 'performance', label: 'Hiệu năng' },
    { value: 'security', label: 'Bảo mật' },
    { value: 'other', label: 'Khác' }
];

const STATUS_SELECT_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'viewed', label: 'Đã xem' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'improving', label: 'Đang cải tiến' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'rejected', label: 'Từ chối' }
];

const getStatusStyle = (status: string) => {
    const found = STATUS_OPTIONS.find(s => s.value === status);
    return found || STATUS_OPTIONS[0];
};

const getCategoryLabel = (category: string) => {
    const found = CATEGORY_OPTIONS.find(c => c.value === category);
    return found?.label || category;
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [adminResponse, setAdminResponse] = useState('');
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
            const result = await feedbackApi.updateFeedbackStatus(token, selectedFeedback._id, newStatus, adminResponse);
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

    const handleDeleteFeedback = async () => {
        if (!token || !selectedFeedback) return;
        try {
            setDeletingId(selectedFeedback._id);
            const result = await feedbackApi.deleteFeedback(token, selectedFeedback._id);
            if (result.success) {
                toast.success('Xóa góp ý thành công');
                setShowDeleteModal(false);
                setSelectedFeedback(null);
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

    const openDeleteModal = (feedback: IFeedback) => {
        setSelectedFeedback(feedback);
        setShowDeleteModal(true);
    };

    const openStatusModal = (feedback: IFeedback) => {
        setSelectedFeedback(feedback);
        setNewStatus(feedback.status);
        setAdminResponse(feedback.adminResponse || '');
        setShowStatusModal(true);
    };

    const openDetailModal = (feedback: IFeedback) => {
        setSelectedFeedback(feedback);
        setShowDetailModal(true);
    };

    const getUserName = (feedback: IFeedback) => feedback.userId?.fullName || 'Người dùng';
    const getUserAvatar = (feedback: IFeedback) => feedback.userId?.avatar;
    const getUserInitial = (feedback: IFeedback) => {
        const name = getUserName(feedback);
        return name !== 'Người dùng' ? name.charAt(0).toUpperCase() : '?';
    };
    const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });

    const statusOrder = ['pending', 'viewed', 'approved', 'improving', 'completed', 'rejected'];
    const statusLabels: Record<string, string> = {
        pending: 'Chờ xử lý', viewed: 'Đã xem', approved: 'Đã duyệt',
        improving: 'Đang cải tiến', completed: 'Hoàn thành', rejected: 'Từ chối'
    };
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-50 text-yellow-600', viewed: 'bg-blue-50 text-blue-600',
        approved: 'bg-green-50 text-green-600', improving: 'bg-purple-50 text-purple-600',
        completed: 'bg-emerald-50 text-emerald-600', rejected: 'bg-red-50 text-red-600'
    };

    if (loading && feedbacks.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý góp ý</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý và theo dõi các góp ý từ người dùng</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-blue-600">Tổng: {total} góp ý</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {statusOrder.map((status) => (
                    <div key={status} className={`rounded-xl p-3 text-center border ${statusColors[status].replace('text', 'border').replace('bg', '')} ${statusColors[status].split(' ')[0]}`}>
                        <div className="text-xl font-bold text-gray-800">{stats.byStatus[status] || 0}</div>
                        <div className="text-xs text-gray-500">{statusLabels[status]}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
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
                    <button onClick={() => fetchFeedbacks()} className="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center gap-2">
                        <Search size={16} /> Tìm kiếm
                    </button>
                </div>
            </div>

            {/* Table - bỏ cột Độ ưu tiên */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase w-[18%]">Người dùng</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase w-[27%]">Tiêu đề</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase w-[12%]">Danh mục</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase w-[12%]">Trạng thái</th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase w-[15%]">Ngày tạo</th>
                                <th className="text-center px-5 py-4 text-xs font-semibold text-gray-500 uppercase w-[16%]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" /><p className="text-sm text-gray-500 mt-3">Đang tải dữ liệu...</p></td></tr>
                            ) : feedbacks.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-16"><MessageCircle size={48} className="text-gray-300 mx-auto" /><p className="text-gray-400 mt-2">Không có góp ý nào</p></td></tr>
                            ) : (
                                feedbacks.map((feedback) => {
                                    const statusStyle = getStatusStyle(feedback.status);
                                    return (
                                        <tr key={feedback._id} className="hover:bg-gray-50 transition cursor-pointer group" onClick={() => openDetailModal(feedback)}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        {getUserAvatar(feedback) ? (
                                                            <Image src={getUserAvatar(feedback)!} alt={getUserName(feedback)} width={36} height={36} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-blue-600">{getUserInitial(feedback)}</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{getUserName(feedback)}</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{feedback.userId?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-2">{feedback.title}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-600">{getCategoryLabel(feedback.category)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}>
                                                    {statusStyle.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-500 whitespace-nowrap">{formatDate(feedback.createdAt)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => openDetailModal(feedback)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Xem chi tiết">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button onClick={() => openStatusModal(feedback)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition" title="Cập nhật trạng thái">
                                                        <Settings size={16} />
                                                    </button>
                                                    <button onClick={() => openDeleteModal(feedback)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Xóa góp ý">
                                                        <Trash2 size={16} />
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

                {totalPages > 1 && (
                    <div className="border-t border-gray-200 px-5 py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} trên {total}</div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 text-sm font-medium text-gray-700">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Chi tiết góp ý</h3>
                            <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                                    {getUserInitial(selectedFeedback)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-lg">{getUserName(selectedFeedback)}</p>
                                    <p className="text-sm text-gray-500">{selectedFeedback.userId?.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                                    <Tag size={14} className="text-blue-500" />
                                    <span className="text-sm text-gray-600">{getCategoryLabel(selectedFeedback.category)}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                                    <Calendar size={14} className="text-blue-500" />
                                    <span className="text-sm text-gray-600">{formatDate(selectedFeedback.createdAt)}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">TIÊU ĐỀ</label>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-lg font-semibold text-gray-800">{selectedFeedback.title}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">NỘI DUNG</label>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{selectedFeedback.content}</p>
                                </div>
                            </div>
                            {selectedFeedback.adminResponse && (
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">PHẢN HỒI</label>
                                    <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                                        <p className="text-gray-700">{selectedFeedback.adminResponse}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Trạng thái:</span>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedFeedback.status).bg} ${getStatusStyle(selectedFeedback.status).color}`}>
                                        {getStatusStyle(selectedFeedback.status).label}
                                    </span>
                                </div>
                                <button onClick={() => { setShowDetailModal(false); openStatusModal(selectedFeedback); }} className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center gap-2">
                                    <Settings size={14} /> Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {showStatusModal && selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowStatusModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Cập nhật trạng thái</h3>
                            <button onClick={() => setShowStatusModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Tiêu đề</label>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-gray-800">{selectedFeedback.title}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Trạng thái mới</label>
                                <CustomSelect
                                    value={newStatus}
                                    onChange={setNewStatus}
                                    options={STATUS_SELECT_OPTIONS}
                                    placeholder="Chọn trạng thái"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Phản hồi</label>
                                <CustomTextarea
                                    value={adminResponse}
                                    onChange={setAdminResponse}
                                    placeholder="Nhập phản hồi của bạn..."
                                    rows={4}
                                    maxLength={1000}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowStatusModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition">
                                    Hủy
                                </button>
                                <button onClick={handleUpdateStatus} disabled={updating} className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                                    {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteFeedback}
                title="Xóa góp ý"
                message="Bạn có chắc chắn muốn xóa góp ý này không?"
                warning="Hành động này không thể hoàn tác."
            />
        </div>
    );
}