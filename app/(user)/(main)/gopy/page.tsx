// app/(user)/(public)/gopy/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, IFeedback } from '@/lib/api/feedback.api';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import { Loader2, Filter, X, Send, Plus, Bug, Sparkles, Zap, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomInput from '@/components/ui/CustomInput';
import CustomTextarea from '@/components/ui/CustomTextarea';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'bug', label: 'Lỗi/Bug' },
    { value: 'feature', label: 'Tính năng mới' },
    { value: 'improvement', label: 'Cải tiến' },
    { value: 'other', label: 'Khác' }
];

const STATUS_FILTERS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'in_progress', label: 'Đang cải tiến' },
    { value: 'completed', label: 'Hoàn thành' }
];

const CREATE_CATEGORIES = [
    { value: 'bug', label: 'Lỗi/Bug' },
    { value: 'feature', label: 'Tính năng mới' },
    { value: 'improvement', label: 'Cải tiến' },
    { value: 'other', label: 'Khác' }
];

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
    const [formData, setFormData] = useState({
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

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleFeedbackCreated = (newFeedback: IFeedback) => {
            setFeedbacks(prev => [newFeedback, ...prev]);
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
    }, [socket, isConnected, fetchFeedbacks]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleLike = async (feedbackId: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để ủng hộ');
            return;
        }

        await feedbackApi.likeFeedback(token, feedbackId);
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        const result = await feedbackApi.deleteFeedback(token, feedbackId);
        if (result.success) {
            toast.success('Xóa góp ý thành công');
            fetchFeedbacks();
        } else {
            toast.error(result.message || 'Xóa thất bại');
        }
    };

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

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'bug': return <Bug size={14} className="inline mr-1" data-filled={true} />;
            case 'feature': return <Sparkles size={14} className="inline mr-1" data-filled={true} />;
            case 'improvement': return <Zap size={14} className="inline mr-1" data-filled={true} />;
            default: return <Lightbulb size={14} className="inline mr-1" data-filled={true} />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Góp ý & Phản hồi
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Đóng góp ý kiến của bạn để CNcode ngày càng hoàn thiện hơn
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                {Object.entries(stats.byStatus || {}).slice(0, 5).map(([status, count]) => (
                    <div key={status} className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700">
                        <div className="text-xl font-bold text-main">{count as number}</div>
                        <div className="text-xs text-gray-500">
                            {status === 'pending' && 'Chờ xử lý'}
                            {status === 'viewed' && 'Đã xem'}
                            {status === 'approved' && 'Đã duyệt'}
                            {status === 'in_progress' && 'Đang cải tiến'}
                            {status === 'completed' && 'Hoàn thành'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        <Filter size={14} className="mx-2 text-gray-500" data-filled={true} />
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${selectedCategory === cat.value
                                    ? 'bg-main text-white'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        {STATUS_FILTERS.map(status => (
                            <button
                                key={status.value}
                                onClick={() => setSelectedStatus(status.value)}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${selectedStatus === status.value
                                    ? 'bg-main text-white'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-main text-white rounded-xl hover:bg-main/80 transition"
                >
                    <Plus size={16} data-filled={true} />
                    <span>Gửi góp ý</span>
                </button>
            </div>

            {loading && page === 1 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-main" data-filled={true} />
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500">Chưa có góp ý nào</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên đóng góp ý kiến!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map(feedback => (
                        <FeedbackCard
                            key={feedback._id}
                            feedback={feedback}
                            onLike={handleLike}
                            onDelete={handleDeleteFeedback}
                            onEdit={handleEditFeedback}
                        />
                    ))}
                </div>
            )}

            {page < totalPages && (
                <div className="text-center mt-6">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 border border-main text-main rounded-xl hover:bg-main/5 transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" data-filled={true} /> : null}
                        {loading ? 'Đang tải...' : 'Xem thêm'}
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-gray-900 p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gửi góp ý</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                <X size={18} data-filled={true} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateFeedback} className="p-5 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Danh mục</label>
                                <CustomSelect
                                    value={formData.category}
                                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                    options={CREATE_CATEGORIES}
                                    placeholder="Chọn danh mục"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tiêu đề</label>
                                <CustomInput
                                    value={formData.title}
                                    onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                                    placeholder="Tóm tắt ngắn gọn về ý kiến của bạn"
                                    maxLength={200}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nội dung</label>
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
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-main text-white rounded-xl font-medium hover:bg-main/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" data-filled={true} /> : <Send size={16} data-filled={true} />}
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