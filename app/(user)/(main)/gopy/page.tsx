// app/(user)/(public)/gopy/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, IFeedback } from '@/lib/api/feedback.api';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import { Loader2, Filter, X, Send, Plus, Bug, Sparkles, Zap, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomTextarea } from '@/components/custom/CustomTextarea';

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
    { value: 'bug', label: '🐛 Lỗi/Bug' },
    { value: 'feature', label: '✨ Tính năng mới' },
    { value: 'improvement', label: '⚡ Cải tiến' },
    { value: 'other', label: '💡 Khác' }
];

const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        pending: 'Chờ xử lý',
        viewed: 'Đã xem',
        approved: 'Đã duyệt',
        in_progress: 'Đang cải tiến',
        completed: 'Hoàn thành',
        rejected: 'Từ chối'
    };
    return labels[status] || status;
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

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">
                    Góp ý & Phản hồi
                </h1>
                <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-2">
                    Đóng góp ý kiến của bạn để CNcode ngày càng hoàn thiện hơn
                </p>
            </div>

            {/* Stats Cards */}
            {Object.keys(stats.byStatus || {}).length > 0 && (
                <div className={`grid gap-3 mb-6 ${Object.keys(stats.byStatus).length === 6
                    ? 'grid-cols-3 sm:grid-cols-6'
                    : 'grid-cols-2 sm:grid-cols-5'
                    }`}>
                    {Object.entries(stats.byStatus).map(([status, count]) => (
                        <div key={status} className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] p-2 sm:p-3 text-center border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)]">
                            <div className="text-lg sm:text-xl font-bold text-[var(--cn-primary)]">{count as number}</div>
                            <div className="text-[9px] sm:text-xs text-[var(--cn-text-muted)]">
                                {getStatusLabel(status)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap gap-2">
                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-1 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-md)] p-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm rounded-[var(--cn-radius-sm)] transition ${selectedCategory === cat.value
                                    ? 'bg-[var(--cn-primary)] text-white'
                                    : 'text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)]'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    {/* Status Filters */}
                    <div className="flex flex-wrap gap-1 bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-md)] p-1">
                        {STATUS_FILTERS.map(status => (
                            <button
                                key={status.value}
                                onClick={() => setSelectedStatus(status.value)}
                                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm rounded-[var(--cn-radius-sm)] transition ${selectedStatus === status.value
                                    ? 'bg-[var(--cn-primary)] text-white'
                                    : 'text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)]'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-primary-hover)] transition text-sm"
                >
                    <Plus size={16} />
                    <span>Gửi góp ý</span>
                </button>
            </div>

            {/* Feedbacks List */}
            {loading && page === 1 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[var(--cn-primary)]" />
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-12 bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)]">
                    <p className="text-sm text-[var(--cn-text-sub)]">Chưa có góp ý nào</p>
                    <p className="text-xs text-[var(--cn-text-muted)] mt-1">Hãy là người đầu tiên đóng góp ý kiến!</p>
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

            {/* Load More */}
            {page < totalPages && (
                <div className="text-center mt-6">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-5 sm:px-6 py-2 border border-[var(--cn-primary)] text-[var(--cn-primary)] rounded-[var(--cn-radius-md)] hover:bg-[var(--cn-primary)]/5 transition disabled:opacity-50 text-sm"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        {loading ? 'Đang tải...' : 'Xem thêm'}
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[var(--cn-shadow-lg)]" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-[var(--cn-bg-card)] p-4 sm:p-5 border-b border-[var(--cn-border)] flex justify-between items-center">
                            <h3 className="text-lg sm:text-xl font-semibold text-[var(--cn-text-main)]">Gửi góp ý</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] hover:bg-[var(--cn-hover)] transition text-[var(--cn-text-muted)]"
                            >
                                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateFeedback} className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-[var(--cn-text-sub)]">Danh mục</label>
                                <CustomSelect
                                    value={formData.category}
                                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                    options={CREATE_CATEGORIES}
                                    placeholder="Chọn danh mục"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-[var(--cn-text-sub)]">Tiêu đề</label>
                                <CustomInput
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Tóm tắt ngắn gọn về ý kiến của bạn"
                                    maxLength={200}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-[var(--cn-text-sub)]">Nội dung</label>
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
                                    className="flex-1 px-4 py-2.5 sm:py-3 border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] text-[var(--cn-text-sub)] font-medium hover:bg-[var(--cn-hover)] transition text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 sm:py-3 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-md)] font-medium hover:bg-[var(--cn-primary-hover)] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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