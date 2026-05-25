// app/admin/feedback/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, IFeedback } from '@/lib/api/feedback.api';
import {
    Loader2, ChevronLeft, ChevronRight, Search, Settings,
    Check, X, Trash2, Eye, Calendar, Tag, MessageCircle, Clock, TrendingUp, AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { DeleteConfirmModal } from '@/components/custom/DeleteConfirmModal';
import { DashboardCard } from '@/components/custom/DashboardCard';

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

const STATUS_CONFIG = {
    pending: { label: 'Chờ xử lý', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <Clock size={16} /> },
    viewed: { label: 'Đã xem', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Eye size={16} /> },
    approved: { label: 'Đã duyệt', color: 'text-green-600', bg: 'bg-green-50', icon: <Check size={16} /> },
    improving: { label: 'Đang cải tiến', color: 'text-purple-600', bg: 'bg-purple-50', icon: <TrendingUp size={16} /> },
    completed: { label: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Check size={16} /> },
    rejected: { label: 'Từ chối', color: 'text-red-600', bg: 'bg-red-50', icon: <X size={16} /> }
};

export default function AdminFeedbackPage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();

    // Data states
    const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState<{ byStatus: Record<string, number>; byCategory: Record<string, number> }>({
        byStatus: {}, byCategory: {}
    });

    // Search & Filter states
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Modal states
    const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [adminResponse, setAdminResponse] = useState('');
    const [updating, setUpdating] = useState(false);

    // Fetching Logic
    const fetchFeedbacks = useCallback(async (p: number, status: string, cat: string, search: string) => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await feedbackApi.getAllFeedbacksForAdmin(token, p, PAGE_SIZE, status, cat, search);
            if (result.success) {
                setFeedbacks(result.data as IFeedback[]);
                setTotalPages(result.pagination?.totalPages || 1);
                setTotal(result.pagination?.total || 0);
                if (result.stats) setStats(result.stats);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Debounce search effect
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearchTerm(searchInput);
            setPage(1);
        }, 500);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchInput]);

    // Data synchronization effect
    useEffect(() => {
        fetchFeedbacks(page, selectedStatus, selectedCategory, searchTerm);
    }, [page, selectedStatus, selectedCategory, searchTerm, fetchFeedbacks]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !isConnected) return;
        const refresh = () => fetchFeedbacks(page, selectedStatus, selectedCategory, searchTerm);
        socket.on('feedback_created', refresh);
        socket.on('feedback_updated', refresh);
        return () => {
            socket.off('feedback_created', refresh);
            socket.off('feedback_updated', refresh);
        };
    }, [socket, isConnected, page, selectedStatus, selectedCategory, searchTerm, fetchFeedbacks]);

    // Action Handlers
    const handleUpdateStatus = async () => {
        if (!token || !selectedFeedback) return;
        setUpdating(true);
        try {
            const result = await feedbackApi.updateFeedbackStatus(token, selectedFeedback._id, newStatus, adminResponse);
            if (result.success) {
                toast.success('Cập nhật thành công');
                setShowStatusModal(false);
                fetchFeedbacks(page, selectedStatus, selectedCategory, searchTerm);
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
            const result = await feedbackApi.deleteFeedback(token, selectedFeedback._id);
            if (result.success) {
                toast.success('Xóa góp ý thành công');
                setShowDeleteModal(false);
                fetchFeedbacks(page, selectedStatus, selectedCategory, searchTerm);
            }
        } catch (error) {
            toast.error('Xóa thất bại');
        }
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

    const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });

    // Card configs for DashboardCard
    const cardConfigs = [
        { key: 'pending', title: 'Chờ xử lý', value: stats.byStatus.pending || 0, icon: <Clock size={18} />, iconBgColor: '#FEF3C7', iconColor: '#D97706' },
        { key: 'viewed', title: 'Đã xem', value: stats.byStatus.viewed || 0, icon: <Eye size={18} />, iconBgColor: '#DBEAFE', iconColor: '#2563EB' },
        { key: 'approved', title: 'Đã duyệt', value: stats.byStatus.approved || 0, icon: <Check size={18} />, iconBgColor: '#D1FAE5', iconColor: '#059669' },
        { key: 'improving', title: 'Đang cải tiến', value: stats.byStatus.improving || 0, icon: <TrendingUp size={18} />, iconBgColor: '#F3E8FF', iconColor: '#9333EA' },
        { key: 'completed', title: 'Hoàn thành', value: stats.byStatus.completed || 0, icon: <Check size={18} />, iconBgColor: '#D1FAE5', iconColor: '#10B981' },
        { key: 'rejected', title: 'Từ chối', value: stats.byStatus.rejected || 0, icon: <X size={18} />, iconBgColor: '#FEE2E2', iconColor: '#DC2626' }
    ];

    return (
        <div className="space-y-6 pb-8 px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Quản lý góp ý</h1>
                    <p className="text-sm text-gray-500">Xem và xử lý phản hồi từ học viên</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-bold text-blue-700">Tổng: {total}</span>
                </div>
            </div>

            {/* Stats Cards - Dùng DashboardCard */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {cardConfigs.map((card) => (
                    <DashboardCard
                        key={card.key}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        iconBgColor={card.iconBgColor}
                        iconColor={card.iconColor}
                        change={0}
                        trend="neutral"
                    />
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[280px]">
                    <CustomInputSearch
                        placeholder="Tìm kiếm tiêu đề hoặc nội dung..."
                        value={searchInput}
                        onChange={setSearchInput}
                        size="medium"
                    />
                </div>
                <div className="w-44">
                    <CustomSelect value={selectedStatus} onChange={(v) => { setSelectedStatus(v); setPage(1); }} options={STATUS_OPTIONS} />
                </div>
                <div className="w-44">
                    <CustomSelect value={selectedCategory} onChange={(v) => { setSelectedCategory(v); setPage(1); }} options={CATEGORY_OPTIONS} />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                {loading && (
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-50 overflow-hidden z-20">
                        <div className="h-full bg-blue-500 animate-[loading_1.5s_infinite_linear]" style={{ width: '40%' }} />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className={`w-full transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Người gửi</th>
                                <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nội dung</th>
                                <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[130px]">Danh mục</th>
                                <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[130px]">Trạng thái</th>
                                <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[150px]">Ngày gửi</th>
                                <th className="text-center px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[100px]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {feedbacks.length > 0 ? (
                                feedbacks.map((feedback) => {
                                    const statusConfig = STATUS_CONFIG[feedback.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                                    return (
                                        <tr key={feedback._id} className="hover:bg-gray-50/50 transition cursor-pointer group" onClick={() => openDetailModal(feedback)}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200 overflow-hidden">
                                                        {feedback.userId?.avatar ? (
                                                            <Image src={feedback.userId.avatar} alt="ava" width={32} height={32} className="object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-500">{feedback.userId?.fullName?.charAt(0) || '?'}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">{feedback.userId?.fullName || 'Ẩn danh'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-medium text-gray-800 line-clamp-1">{feedback.title}</div>
                                                <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{feedback.content.substring(0, 100)}...</div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-500">
                                                {CATEGORY_OPTIONS.find(c => c.value === feedback.category)?.label}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase ${statusConfig.bg} ${statusConfig.color}`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400">{formatDate(feedback.createdAt)}</td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => openStatusModal(feedback)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                                        <Settings size={16} />
                                                    </button>
                                                    <button onClick={() => { setSelectedFeedback(feedback); setShowDeleteModal(true); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : !loading && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-400">
                                        <MessageCircle size={40} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm font-medium">Không tìm thấy góp ý nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">Trang {page} / {totalPages}</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border rounded-lg bg-white disabled:opacity-30 hover:bg-gray-100 transition">
                                <ChevronLeft size={14} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border rounded-lg bg-white disabled:opacity-30 hover:bg-gray-100 transition">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Update Modal */}
            {showStatusModal && selectedFeedback && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowStatusModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Xử lý góp ý</h3>
                            <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Trạng thái mới</label>
                                <CustomSelect value={newStatus} onChange={setNewStatus} options={STATUS_SELECT_OPTIONS} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phản hồi admin</label>
                                <CustomTextarea value={adminResponse} onChange={setAdminResponse} placeholder="Gửi lời phản hồi đến người dùng..." rows={4} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowStatusModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition">
                                    Hủy
                                </button>
                                <button onClick={handleUpdateStatus} disabled={updating} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2">
                                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedFeedback && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-5 border-b border-gray-100 flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                                    <Tag size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Chi tiết phản hồi</h3>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">
                                    {selectedFeedback.userId?.fullName?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800">{selectedFeedback.userId?.fullName || 'Người dùng ẩn danh'}</h4>
                                    <p className="text-gray-400 text-sm">{selectedFeedback.userId?.email || 'Chưa cập nhật email'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Danh mục</p>
                                    <p className="text-sm font-semibold text-gray-700">{CATEGORY_OPTIONS.find(c => c.value === selectedFeedback.category)?.label}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ngày gửi</p>
                                    <p className="text-sm font-semibold text-gray-700">{formatDate(selectedFeedback.createdAt)}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Nội dung góp ý</p>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <h5 className="font-bold text-gray-800 mb-2 text-lg">{selectedFeedback.title}</h5>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedFeedback.content}</p>
                                </div>
                            </div>
                            {selectedFeedback.adminResponse && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase">Phản hồi từ Admin</p>
                                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-blue-700">
                                        <p className="leading-relaxed">{selectedFeedback.adminResponse}</p>
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 flex justify-end">
                                <button onClick={() => { setShowDetailModal(false); openStatusModal(selectedFeedback); }} className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-lg shadow-black/10 flex items-center gap-2">
                                    <Settings size={18} /> Cập nhật trạng thái
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
                message="Bạn có chắc chắn muốn xóa vĩnh viễn góp ý này không?"
                warning="Hành động này không thể hoàn tác."
            />

            <style jsx global>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(250%); }
                }
            `}</style>
        </div>
    );
}