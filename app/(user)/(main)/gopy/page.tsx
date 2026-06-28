
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, IFeedback } from '@/lib/api/feedback.api';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import { Loader2, Plus, X, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomTextarea } from '@/components/custom/CustomTextarea';

type FeedbackCategory = 'bug' | 'ui_ux' | 'feature_request' | 'performance' | 'security' | 'other';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'bug', label: 'Lỗi/Bug' },
    { value: 'ui_ux', label: 'UI/UX' },
    { value: 'feature_request', label: 'Tính năng mới' },
    { value: 'performance', label: 'Hiệu năng' },
    { value: 'security', label: 'Bảo mật' },
    { value: 'other', label: 'Khác' }
];

const STATUS_FILTERS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'improving', label: 'Đang cải tiến' },
    { value: 'completed', label: 'Hoàn thành' }
];

const CREATE_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
    { value: 'bug', label: 'Lỗi/Bug' },
    { value: 'ui_ux', label: 'UI/UX' },
    { value: 'feature_request', label: 'Tính năng mới' },
    { value: 'performance', label: 'Hiệu năng' },
    { value: 'security', label: 'Bảo mật' },
    { value: 'other', label: 'Khác' }
];

const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý', viewed: 'Đã xem', approved: 'Đã duyệt',
    improving: 'Đang cải tiến', completed: 'Hoàn thành', rejected: 'Từ chối'
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-600', viewed: 'bg-blue-50 text-blue-600',
    approved: 'bg-green-50 text-green-600', improving: 'bg-purple-50 text-purple-600',
    completed: 'bg-emerald-50 text-emerald-600', rejected: 'bg-red-50 text-red-600'
};

export default function FeedbackPage() {
    const { token, user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
    const [stats, setStats] = useState<{ byStatus: Record<string, number>; byCategory: Record<string, number> }>({
        byStatus: {},
        byCategory: {}
    });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        content: string;
        category: FeedbackCategory;
    }>({
        title: '',
        content: '',
        category: 'other'
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchFeedbacks = useCallback(async () => {
        try {
            setLoading(true);
            const result = await feedbackApi.getFeedbacks(page, 10, selectedStatus, selectedCategory);

            if (result.success && result.data) {
                setFeedbacks(result.data as IFeedback[]);
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages);
                }
                if (result.stats) {
                    setStats(result.stats);
                }
            }
        } catch (error) {
            console.error('Fetch feedbacks error:', error);
        } finally {
            setLoading(false);
        }
    }, [page, selectedStatus, selectedCategory]);

    const handleLikeSuccess = useCallback((feedbackId: string, newReactCount: number) => {
        setFeedbacks(prev => prev.map(f =>
            f._id === feedbackId
                ? { ...f, reactCount: newReactCount }
                : f
        ));
    }, []);

    const handleEditFeedback = async (feedbackId: string, title: string, content: string, category: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        const result = await feedbackApi.updateFeedback(token, feedbackId, { title, content, category });
        if (result.success) {
            toast.success('Cập nhật góp ý thành công');
            fetchFeedbacks();
        } else {
            toast.error(result.message || 'Cập nhật thất bại');
        }
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        if (!token) return;

        const result = await feedbackApi.deleteFeedback(token, feedbackId);
        if (result.success) {
            toast.success('Xóa góp ý thành công');
            fetchFeedbacks();
        } else {
            toast.error(result.message || 'Xóa thất bại');
        }
    };

    useEffect(() => {
        if (!socket) {
            console.log('⚠️ [Socket] Socket is null, waiting...');
            return;
        }
        if (!isConnected) {
            console.log('⚠️ [Socket] Socket not connected yet, waiting...');
            return;
        }

        console.log('🔌 [Socket] Setting up feedback listeners', {
            socketId: socket.id,
            isConnected,
            userId: user?._id
        });

        const handleFeedbackCreated = (newFeedback: IFeedback) => {
            console.log('📝 [Socket] Received feedback_created:', newFeedback._id);
            if (page === 1) {
                setFeedbacks(prev => [newFeedback, ...prev]);
            }
            toast.info('Có góp ý mới!', { duration: 3000 });
        };

        const handleFeedbackUpdated = (updatedFeedback: IFeedback) => {
            console.log('📝 [Socket] Received feedback_updated:', updatedFeedback._id);
            setFeedbacks(prev => prev.map(f => f._id === updatedFeedback._id ? updatedFeedback : f));
        };

        const handleFeedbackDeleted = (feedbackId: string) => {
            console.log('📝 [Socket] Received feedback_deleted:', feedbackId);
            setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
        };

        const handleFeedbackReacted = (data: { feedbackId: string; reactCount: number; userId: string }) => {
            console.log('💗 [Socket] Received feedback_reacted:', data);
            if (data.userId !== user?._id) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === data.feedbackId
                        ? { ...f, reactCount: data.reactCount }
                        : f
                ));
            }
        };

        const handleFeedbackStatusChanged = (data: { feedbackId: string; oldStatus: string; newStatus: string; adminResponse: string }) => {
            console.log('🔔 [Frontend] Received feedback_status_changed:', data);
            setFeedbacks(prev => prev.map(f =>
                f._id === data.feedbackId
                    ? { ...f, status: data.newStatus as IFeedback['status'], adminResponse: data.adminResponse }
                    : f
            ));
            toast.success('Góp ý của bạn đã được cập nhật!', { duration: 3000 });
        };

        socket.on('feedback_created', handleFeedbackCreated);
        socket.on('feedback_updated', handleFeedbackUpdated);
        socket.on('feedback_deleted', handleFeedbackDeleted);
        socket.on('feedback_reacted', handleFeedbackReacted);
        socket.on('feedback_status_changed', handleFeedbackStatusChanged);

        console.log('✅ [Socket] All 5 feedback listeners registered successfully');

        return () => {
            console.log('🧹 [Socket] Cleaning up feedback listeners');
            socket.off('feedback_created', handleFeedbackCreated);
            socket.off('feedback_updated', handleFeedbackUpdated);
            socket.off('feedback_deleted', handleFeedbackDeleted);
            socket.off('feedback_reacted', handleFeedbackReacted);
            socket.off('feedback_status_changed', handleFeedbackStatusChanged);
        };
    }, [socket, isConnected, page, user?._id]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleCreateFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error('Vui lòng đăng nhập để gửi góp ý');
            return;
        }

        if (!formData.title.trim()) {
            toast.warning('Vui lòng nhập tiêu đề');
            return;
        }
        if (!formData.content.trim()) {
            toast.warning('Vui lòng nhập nội dung');
            return;
        }

        try {
            setSubmitting(true);
            const result = await feedbackApi.createFeedback(token, formData);
            if (result.success) {
                toast.success(result.message);
                setShowCreateModal(false);
                setFormData({ title: '', content: '', category: 'other' });
                fetchFeedbacks();
            } else {
                toast.error(result.message || 'Gửi góp ý thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const loadMore = () => {
        if (page < totalPages && !loading) {
            setPage(prev => prev + 1);
        }
    };

    const statusOrder = ['pending', 'viewed', 'approved', 'improving', 'completed', 'rejected'];

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            { }
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Góp ý & Phản hồi</h1>
                <p className="text-sm text-gray-500 mt-2">
                    Đóng góp ý kiến của bạn để CNcode ngày càng hoàn thiện hơn
                </p>
            </div>

            { }
            {Object.keys(stats.byStatus || {}).length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                    {statusOrder.map((status) => (
                        <div
                            key={status}
                            className={`rounded-xl p-3 text-center border ${STATUS_COLORS[status] || 'bg-gray-50 text-gray-600'}`}
                        >
                            <div className="text-xl font-bold text-gray-800">{stats.byStatus[status] || 0}</div>
                            <div className="text-xs text-gray-500">{STATUS_LABELS[status]}</div>
                        </div>
                    ))}
                </div>
            )}

            { }
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap gap-2">
                    <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${selectedCategory === cat.value
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
                        {STATUS_FILTERS.map(status => (
                            <button
                                key={status.value}
                                onClick={() => setSelectedStatus(status.value)}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${selectedStatus === status.value
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                >
                    <Plus size={16} />
                    Gửi góp ý
                </button>
            </div>

            { }
            {loading && page === 1 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <MessageSquare size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có góp ý nào</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên đóng góp ý kiến!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map(feedback => (
                        <FeedbackCard
                            key={feedback._id}
                            feedback={feedback}
                            onLikeSuccess={handleLikeSuccess}
                            onDelete={handleDeleteFeedback}
                            onEdit={handleEditFeedback}
                        />
                    ))}
                </div>
            )}

            { }
            {page < totalPages && (
                <div className="text-center mt-6">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 text-sm font-medium"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        {loading ? 'Đang tải...' : 'Xem thêm'}
                    </button>
                </div>
            )}

            { }
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Gửi góp ý</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                            >
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateFeedback} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
                                <CustomSelect
                                    value={formData.category}
                                    onChange={(value) => setFormData(prev => ({ ...prev, category: value as FeedbackCategory }))}
                                    options={CREATE_CATEGORIES}
                                    placeholder="Chọn danh mục"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề</label>
                                <CustomInput
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Tóm tắt ngắn gọn về ý kiến của bạn"
                                    maxLength={200}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung</label>
                                <CustomTextarea
                                    value={formData.content}
                                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                                    placeholder="Mô tả chi tiết ý kiến đóng góp của bạn..."
                                    rows={5}
                                    maxLength={2000}
                                />
                            </div>
                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                                    {submitting ? 'Đang gửi...' : 'Gửi góp ý'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
