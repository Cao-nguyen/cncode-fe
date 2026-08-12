'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, getErrorMessage } from '@/lib/api/feedback.api';
import {
    Feedback,
    FeedbackCategory,
    FeedbackPriority,
    FeedbackStats,
    ReleaseVersion,
    PUBLIC_STATUS_FILTERS,
    CATEGORY_OPTIONS,
    CREATE_CATEGORY_OPTIONS,
    CREATE_PRIORITY_OPTIONS,
} from '@/types/feedback.type';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import FeedbackVersionList from '@/components/feedback/FeedbackVersionList';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomSelect } from '@/components/custom/CustomSelect';
import {
    Plus, X, MessageSquare, ChevronLeft, ChevronRight,
    Search, Clock, CheckCircle2, Sparkles, Lightbulb, GitBranch,
} from 'lucide-react';
import { FeedbackCardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

type ViewMode = 'all' | 'mine' | 'versions';

const VIEW_TABS: { value: ViewMode; label: string }[] = [
    { value: 'all', label: 'Cộng đồng' },
    { value: 'mine', label: 'Của tôi' },
    { value: 'versions', label: 'Phiên bản' },
];

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl md:h-10 md:w-10', color)}>{icon}</div>
                <div className="min-w-0">
                    <p className="text-xl font-bold text-[var(--cn-text-main)] md:text-2xl">{value.toLocaleString('vi-VN')}</p>
                    <p className="truncate text-[11px] text-[var(--cn-text-muted)] md:text-xs">{label}</p>
                </div>
            </div>
        </div>
    );
}

export default function FeedbackPage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [versions, setVersions] = useState<ReleaseVersion[]>([]);
    const [stats, setStats] = useState<FeedbackStats>({ byStatus: {}, byCategory: {} });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        content: string;
        category: FeedbackCategory;
        priority: FeedbackPriority;
    }>({ title: '', content: '', category: 'other', priority: 'medium' });
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const summaryStats = useMemo(() => {
        const byStatus = stats.byStatus || {};
        const total = Object.values(byStatus).reduce((sum, n) => sum + (n || 0), 0);
        return {
            total,
            pending: byStatus.pending || 0,
            improving: byStatus.improving || 0,
            completed: byStatus.completed || 0,
        };
    }, [stats.byStatus]);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearchTerm(searchInput);
            setPage(1);
        }, 400);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchInput]);

    const filteredVersions = useMemo(() => {
        if (!searchTerm.trim()) return versions;
        const q = searchTerm.trim().toLowerCase();
        return versions.filter((item) =>
            item.version.toLowerCase().includes(q)
            || item.changes.some((change) => change.toLowerCase().includes(q)),
        );
    }, [versions, searchTerm]);

    const fetchFeedbacks = useCallback(async () => {
        if (viewMode === 'versions') return;

        setLoading(true);
        try {
            const listParams = {
                page,
                limit: PAGE_SIZE,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                search: searchTerm || undefined,
            };

            const result = viewMode === 'mine' && token
                ? await feedbackApi.getMyFeedbacks(listParams)
                : await feedbackApi.getFeedbacks(listParams);

            if (result.success) {
                setFeedbacks(result.data || []);
                setTotalPages(result.pagination?.totalPages || 1);
                if (result.stats) setStats(result.stats);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [page, selectedStatus, selectedCategory, searchTerm, viewMode, token]);

    const fetchVersions = useCallback(async () => {
        if (viewMode !== 'versions') return;

        setLoading(true);
        try {
            const result = await feedbackApi.getVersions();
            if (result.success) setVersions(result.data || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [viewMode]);

    useEffect(() => {
        if (viewMode === 'versions') {
            fetchVersions();
        } else {
            fetchFeedbacks();
        }
    }, [viewMode, fetchFeedbacks, fetchVersions]);

    useEffect(() => {
        if (!socket || !isConnected || viewMode === 'versions') return;

        const refresh = () => fetchFeedbacks();
        const handleCreated = (item: Feedback) => {
            if (page === 1 && viewMode === 'all') {
                setFeedbacks((prev) => [item, ...prev].slice(0, PAGE_SIZE));
            }
            refresh();
        };
        const handleUpdated = (item: Feedback) => {
            setFeedbacks((prev) => prev.map((f) => (f._id === item._id ? item : f)));
        };
        const handleDeleted = (id: string) => {
            setFeedbacks((prev) => prev.filter((f) => f._id !== id));
            refresh();
        };
        const handleStatusChanged = (data: { feedbackId: string; newStatus: string; adminResponse?: string }) => {
            setFeedbacks((prev) => prev.map((f) => (
                f._id === data.feedbackId
                    ? { ...f, status: data.newStatus as Feedback['status'], adminResponse: data.adminResponse || f.adminResponse }
                    : f
            )));
        };

        socket.on('feedback_created', handleCreated);
        socket.on('feedback_updated', handleUpdated);
        socket.on('feedback_deleted', handleDeleted);
        socket.on('feedback_status_changed', handleStatusChanged);

        return () => {
            socket.off('feedback_created', handleCreated);
            socket.off('feedback_updated', handleUpdated);
            socket.off('feedback_deleted', handleDeleted);
            socket.off('feedback_status_changed', handleStatusChanged);
        };
    }, [socket, isConnected, page, viewMode, fetchFeedbacks]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error('Vui lòng đăng nhập để gửi góp ý');
            return;
        }
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
            return;
        }

        setSubmitting(true);
        try {
            const result = await feedbackApi.createFeedback(formData);
            toast.success(result.message || 'Gửi góp ý thành công');
            setShowCreateModal(false);
            setFormData({ title: '', content: '', category: 'other', priority: 'medium' });
            setViewMode('all');
            setPage(1);
            fetchFeedbacks();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pb-6 pt-[20px] md:pb-8 lg:pt-[30px]" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-7xl px-4">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--cn-text-main)] sm:text-2xl md:text-3xl">
                            <Lightbulb className="h-7 w-7 text-[var(--cn-primary)] md:h-8 md:w-8" />
                            Góp ý & Phản hồi
                        </h1>
                        <p className="mt-1 text-xs text-[var(--cn-text-sub)] sm:text-sm">
                            Đóng góp ý kiến để CNcode ngày càng hoàn thiện hơn
                        </p>
                    </div>
                    <CustomButton className="w-full shrink-0 sm:w-auto" onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4" />
                        Gửi góp ý
                    </CustomButton>
                </div>

                {summaryStats.total > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-2 md:mb-6 md:grid-cols-4 md:gap-3">
                        <StatCard icon={<MessageSquare className="h-5 w-5 text-blue-600" />} label="Tổng góp ý" value={summaryStats.total} color="bg-blue-100" />
                        <StatCard icon={<Clock className="h-5 w-5 text-amber-600" />} label="Chờ xử lý" value={summaryStats.pending} color="bg-amber-100" />
                        <StatCard icon={<Sparkles className="h-5 w-5 text-purple-600" />} label="Đang cải tiến" value={summaryStats.improving} color="bg-purple-100" />
                        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} label="Hoàn thành" value={summaryStats.completed} color="bg-emerald-100" />
                    </div>
                )}

                <div className="mb-4 space-y-3 sm:mb-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="min-w-0 flex-1">
                            <CustomInput
                                placeholder={viewMode === 'versions' ? 'Tìm phiên bản...' : 'Tìm góp ý...'}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                icon={<Search className="h-4 w-4" />}
                            />
                        </div>
                        {viewMode !== 'versions' && (
                            <>
                                <div className="w-full sm:w-44">
                                    <CustomSelect options={CATEGORY_OPTIONS} value={selectedCategory} onChange={(v) => { setSelectedCategory(v); setPage(1); }} placeholder="Danh mục" />
                                </div>
                                <div className="w-full sm:w-44">
                                    <CustomSelect options={PUBLIC_STATUS_FILTERS} value={selectedStatus} onChange={(v) => { setSelectedStatus(v); setPage(1); }} placeholder="Trạng thái" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="inline-flex flex-wrap rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-0.5 shadow-sm">
                        {VIEW_TABS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { setViewMode(opt.value); setPage(1); }}
                                className={cn(
                                    'rounded-md px-4 py-1.5 text-sm font-medium transition',
                                    viewMode === opt.value
                                        ? 'bg-[var(--cn-primary)] text-white shadow-sm'
                                        : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]',
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    viewMode === 'versions' ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-36 animate-pulse rounded-xl bg-[var(--cn-bg-card)]" />
                            ))}
                        </div>
                    ) : (
                        <FeedbackCardSkeleton count={PAGE_SIZE} />
                    )
                ) : viewMode === 'versions' ? (
                    filteredVersions.length === 0 ? (
                        <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-16 text-center">
                            <GitBranch className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                            <p className="mb-1 font-medium text-[var(--cn-text-main)]">Chưa có cập nhật phiên bản</p>
                            <p className="text-sm text-[var(--cn-text-sub)]">Các thay đổi mới sẽ được hiển thị tại đây</p>
                        </div>
                    ) : (
                        <FeedbackVersionList versions={filteredVersions} />
                    )
                ) : feedbacks.length === 0 ? (
                    <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-16 text-center">
                        <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                        <p className="mb-1 font-medium text-[var(--cn-text-main)]">
                            {viewMode === 'mine' && 'Bạn chưa gửi góp ý nào'}
                            {viewMode === 'all' && 'Chưa có góp ý nào'}
                        </p>
                        <p className="mb-5 text-sm text-[var(--cn-text-sub)]">
                            {viewMode === 'mine' && 'Hãy chia sẻ ý kiến để giúp CNcode tốt hơn'}
                            {viewMode === 'all' && 'Hãy là người đầu tiên góp ý'}
                        </p>
                        <CustomButton onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-4 w-4" />
                            Gửi góp ý
                        </CustomButton>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {feedbacks.map((feedback) => (
                                <FeedbackCard
                                    key={feedback._id}
                                    feedback={feedback}
                                    onUpdated={fetchFeedbacks}
                                    onDeleted={fetchFeedbacks}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-3">
                                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-[var(--cn-border)] p-2 transition hover:bg-[var(--cn-hover)] disabled:opacity-40">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm text-[var(--cn-text-sub)]">Trang {page} / {totalPages}</span>
                                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-[var(--cn-border)] p-2 transition hover:bg-[var(--cn-hover)] disabled:opacity-40">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Gửi góp ý</h3>
                                <p className="text-xs text-gray-500">Ý kiến của bạn giúp chúng tôi cải thiện sản phẩm</p>
                            </div>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4 p-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <CustomSelect
                                    label="Danh mục"
                                    value={formData.category}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, category: v as FeedbackCategory }))}
                                    options={CREATE_CATEGORY_OPTIONS}
                                />
                                <CustomSelect
                                    label="Mức độ ưu tiên"
                                    value={formData.priority}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, priority: v as FeedbackPriority }))}
                                    options={CREATE_PRIORITY_OPTIONS}
                                />
                            </div>
                            <CustomInput
                                label="Tiêu đề"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Tóm tắt ngắn gọn"
                                maxLength={200}
                            />
                            <CustomTextarea
                                label="Nội dung"
                                value={formData.content}
                                onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                                placeholder="Mô tả chi tiết vấn đề hoặc đề xuất của bạn..."
                                rows={5}
                                maxLength={2000}
                            />
                            <div className="flex gap-2 pt-1">
                                <CustomButton type="button" variant="secondary" fullWidth onClick={() => setShowCreateModal(false)}>Hủy</CustomButton>
                                <CustomButton type="submit" fullWidth loading={submitting}>Gửi góp ý</CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
