'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/providers/socket.provider';
import { feedbackApi, getErrorMessage } from '@/lib/api/feedback.api';
import {
    Feedback,
    FeedbackAdminStats,
    FeedbackStatus,
    STATUS_OPTIONS,
    CATEGORY_OPTIONS,
    PRIORITY_OPTIONS,
    STATUS_LABELS,
    STATUS_COLORS,
    CATEGORY_LABELS,
    CATEGORY_COLORS,
    PRIORITY_LABELS,
} from '@/types/feedback.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableScroll } from '@/components/admin/AdminTableScroll';
import {
    Eye, Settings, Trash2, X,
    MessageSquare, Clock, Pin, Lock, AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { avatarImageProps, getAvatarUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import AdminFeedbackVersions from '@/components/feedback/AdminFeedbackVersions';

const PAGE_SIZE = 10;
const STATUS_SELECT = STATUS_OPTIONS.filter((o) => o.value !== 'all');

type AdminTab = 'feedbacks' | 'versions';

function UserCell({ feedback }: { feedback: Feedback }) {
    const name = feedback.userId?.fullName || 'Người dùng';
    return (
        <div className="flex min-w-[160px] items-center gap-2">
            <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src={getAvatarUrl(feedback.userId?.avatar)} alt={name} {...avatarImageProps} />
                <AvatarFallback className="text-xs">{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{name}</p>
                <p className="truncate text-xs text-gray-400">{feedback.userId?.email}</p>
            </div>
        </div>
    );
}

export default function AdminFeedbackPage() {
    const { socket, isConnected } = useSocket();
    const [adminTab, setAdminTab] = useState<AdminTab>('feedbacks');
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [adminStats, setAdminStats] = useState<FeedbackAdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [detailTarget, setDetailTarget] = useState<Feedback | null>(null);
    const [statusTarget, setStatusTarget] = useState<Feedback | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);
    const [newStatus, setNewStatus] = useState<FeedbackStatus>('pending');
    const [adminResponse, setAdminResponse] = useState('');
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchInput]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await feedbackApi.adminGetStats();
            if (res.success) setAdminStats(res.data);
        } catch {
            // optional
        }
    }, []);

    const fetchFeedbacks = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const result = await feedbackApi.adminGetAll({
                page,
                limit: PAGE_SIZE,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                search: search || undefined,
            });
            if (result.success) {
                setFeedbacks(result.data || []);
                setTotalPages(result.pagination?.totalPages || 1);
                setTotal(result.pagination?.total || 0);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [page, selectedStatus, selectedCategory, selectedPriority, search]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        if (adminTab !== 'feedbacks') return;
        fetchFeedbacks();
    }, [adminTab, fetchFeedbacks]);

    useEffect(() => {
        if (!socket || !isConnected || adminTab !== 'feedbacks') return;
        const refresh = () => fetchFeedbacks(true);
        socket.on('feedback_created', refresh);
        socket.on('feedback_updated', refresh);
        socket.on('feedback_deleted', refresh);
        return () => {
            socket.off('feedback_created', refresh);
            socket.off('feedback_updated', refresh);
            socket.off('feedback_deleted', refresh);
        };
    }, [socket, isConnected, adminTab, fetchFeedbacks]);

    const patchFeedbackInList = (updated: Feedback) => {
        setFeedbacks((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
        setDetailTarget((prev) => (prev?._id === updated._id ? updated : prev));
    };

    const patchStatsAfterDelete = (feedback: Feedback) => {
        setAdminStats((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                total: Math.max(0, prev.total - 1),
                statusStats: {
                    ...prev.statusStats,
                    [feedback.status]: Math.max(0, (prev.statusStats[feedback.status] || 0) - 1),
                },
                priorityStats: {
                    ...prev.priorityStats,
                    [feedback.priority]: Math.max(0, (prev.priorityStats[feedback.priority] || 0) - 1),
                },
            };
        });
    };

    const patchStatsAfterStatusChange = (oldStatus: FeedbackStatus, newStatusValue: FeedbackStatus) => {
        if (oldStatus === newStatusValue) return;
        setAdminStats((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                statusStats: {
                    ...prev.statusStats,
                    [oldStatus]: Math.max(0, (prev.statusStats[oldStatus] || 0) - 1),
                    [newStatusValue]: (prev.statusStats[newStatusValue] || 0) + 1,
                },
            };
        });
    };

    const handleUpdateStatus = async () => {
        if (!statusTarget) return;
        const previousStatus = statusTarget.status;
        setUpdating(true);
        try {
            const res = await feedbackApi.adminUpdateStatus(statusTarget._id, newStatus, adminResponse);
            if (res.success && res.data) {
                patchFeedbackInList(res.data);
                patchStatsAfterStatusChange(previousStatus, newStatus);
            }
            toast.success('Đã cập nhật trạng thái');
            setStatusTarget(null);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const removed = deleteTarget;
        setDeleting(true);
        try {
            await feedbackApi.adminDelete(deleteTarget._id);
            setFeedbacks((prev) => prev.filter((item) => item._id !== removed._id));
            setTotal((prev) => Math.max(0, prev - 1));
            patchStatsAfterDelete(removed);
            toast.success('Đã xóa góp ý');
            setDeleteTarget(null);
            setDetailTarget(null);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    };

    const handleTogglePin = async (feedback: Feedback) => {
        try {
            const res = await feedbackApi.adminTogglePin(feedback._id);
            if (res.success && res.data) patchFeedbackInList(res.data);
            toast.success(feedback.isPinned ? 'Đã bỏ ghim' : 'Đã ghim');
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleToggleLock = async (feedback: Feedback) => {
        try {
            const res = await feedbackApi.adminToggleLock(feedback._id);
            if (res.success && res.data) patchFeedbackInList(res.data);
            toast.success(feedback.isLocked ? 'Đã mở khóa' : 'Đã khóa');
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const openStatusModal = (feedback: Feedback) => {
        setStatusTarget(feedback);
        setNewStatus(feedback.status);
        setAdminResponse(feedback.adminResponse || '');
    };

    const fmtDate = (date: string) => format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });

    return (
        <AdminPageShell
            title="Quản lý góp ý"
            description="Theo dõi, phản hồi và xử lý góp ý từ người dùng"
        >
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                {[
                    { value: 'feedbacks', label: 'Góp ý' },
                    { value: 'versions', label: 'Phiên bản' },
                ].map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setAdminTab(tab.value as AdminTab)}
                        className={cn(
                            'rounded-md px-4 py-1.5 text-sm font-medium transition',
                            adminTab === tab.value ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {adminTab === 'versions' ? (
                <AdminFeedbackVersions />
            ) : (
                <>
            {adminStats && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <DashboardCard title="Tổng góp ý" value={adminStats.total} icon={<MessageSquare size={18} />} iconBgColor="#EFF6FF" iconColor="#3B82F6" />
                    <DashboardCard title="Chờ xử lý" value={adminStats.statusStats.pending || 0} icon={<Clock size={18} />} iconBgColor="#FFF7ED" iconColor="#F97316" />
                    <DashboardCard title="Đang cải tiến" value={adminStats.statusStats.improving || 0} icon={<Settings size={18} />} iconBgColor="#F5F3FF" iconColor="#8B5CF6" />
                    <DashboardCard title="Ưu tiên cao" value={adminStats.priorityStats.high || 0} icon={<AlertTriangle size={18} />} iconBgColor="#FEF2F2" iconColor="#EF4444" />
                </div>
            )}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                    <CustomInputSearch placeholder="Tìm theo tiêu đề, nội dung, tên..." value={searchInput} onChange={setSearchInput} size="medium" />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-[540px]">
                    <CustomSelect options={CATEGORY_OPTIONS} value={selectedCategory} onChange={(v) => { setSelectedCategory(v); setPage(1); }} placeholder="Danh mục" />
                    <CustomSelect options={STATUS_OPTIONS} value={selectedStatus} onChange={(v) => { setSelectedStatus(v); setPage(1); }} placeholder="Trạng thái" />
                    <CustomSelect options={PRIORITY_OPTIONS} value={selectedPriority} onChange={(v) => { setSelectedPriority(v); setPage(1); }} placeholder="Ưu tiên" />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <AdminTableScroll minWidth={980}>
                    <table className="w-full">
                        <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-5 py-3">Người dùng</th>
                                <th className="px-5 py-3">Tiêu đề</th>
                                <th className="px-5 py-3">Danh mục</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3">Ưu tiên</th>
                                <th className="px-5 py-3">Ngày tạo</th>
                                <th className="px-5 py-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className={cn('divide-y', loading && 'opacity-60')}>
                            {!loading && feedbacks.length === 0 ? (
                                <tr><td colSpan={7} className="py-16 text-center text-gray-400">Không có góp ý nào</td></tr>
                            ) : feedbacks.map((feedback) => (
                                <tr key={feedback._id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4"><UserCell feedback={feedback} /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            {feedback.isPinned && <Pin className="h-3.5 w-3.5 text-orange-500" />}
                                            {feedback.isLocked && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                                            <p className="line-clamp-1 text-sm font-medium text-gray-800">{feedback.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">{CATEGORY_LABELS[feedback.category]}</td>
                                    <td className="px-5 py-4">
                                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', STATUS_COLORS[feedback.status])}>
                                            {STATUS_LABELS[feedback.status]}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">{PRIORITY_LABELS[feedback.priority]}</td>
                                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{fmtDate(feedback.createdAt)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button type="button" onClick={() => setDetailTarget(feedback)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Chi tiết"><Eye className="h-4 w-4" /></button>
                                            <button type="button" onClick={() => openStatusModal(feedback)} className="rounded-lg p-2 text-purple-600 hover:bg-purple-50" title="Cập nhật"><Settings className="h-4 w-4" /></button>
                                            <button type="button" onClick={() => handleTogglePin(feedback)} className="rounded-lg p-2 text-orange-600 hover:bg-orange-50" title="Ghim"><Pin className="h-4 w-4" /></button>
                                            <button type="button" onClick={() => handleToggleLock(feedback)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" title="Khóa"><Lock className="h-4 w-4" /></button>
                                            <button type="button" onClick={() => setDeleteTarget(feedback)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Xóa"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminTableScroll>
                <AdminPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={total}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                />
            </div>

            {detailTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailTarget(null)}>
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
                            <h3 className="text-lg font-semibold">Chi tiết góp ý</h3>
                            <button type="button" onClick={() => setDetailTarget(null)} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="space-y-4 p-5">
                            <UserCell feedback={detailTarget} />
                            <div className="flex flex-wrap gap-2">
                                <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[detailTarget.category])}>{CATEGORY_LABELS[detailTarget.category]}</span>
                                <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', STATUS_COLORS[detailTarget.status])}>{STATUS_LABELS[detailTarget.status]}</span>
                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{PRIORITY_LABELS[detailTarget.priority]}</span>
                            </div>
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Tiêu đề</p>
                                <p className="font-semibold text-gray-900">{detailTarget.title}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Nội dung</p>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{detailTarget.content}</p>
                            </div>
                            {detailTarget.adminResponse && (
                                <div className="rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4">
                                    <p className="mb-1 text-xs font-semibold uppercase text-blue-600">Phản hồi admin</p>
                                    <p className="text-sm text-gray-700">{detailTarget.adminResponse}</p>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <CustomButton variant="secondary" onClick={() => { setDetailTarget(null); openStatusModal(detailTarget); }}>Cập nhật trạng thái</CustomButton>
                                <CustomButton variant="danger" onClick={() => setDeleteTarget(detailTarget)}>Xóa</CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {statusTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setStatusTarget(null)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Cập nhật trạng thái</h3>
                            <button type="button" onClick={() => setStatusTarget(null)} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                        </div>
                        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{statusTarget.title}</p>
                        <div className="space-y-4">
                            <CustomSelect value={newStatus} onChange={(v) => setNewStatus(v as FeedbackStatus)} options={STATUS_SELECT} placeholder="Trạng thái" />
                            <CustomTextarea value={adminResponse} onChange={setAdminResponse} placeholder="Phản hồi cho người dùng..." rows={4} maxLength={500} />
                            <div className="flex gap-2">
                                <CustomButton variant="secondary" fullWidth onClick={() => setStatusTarget(null)}>Hủy</CustomButton>
                                <CustomButton fullWidth loading={updating} onClick={handleUpdateStatus}>Cập nhật</CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa góp ý"
                message={deleteTarget ? `Xóa góp ý "${deleteTarget.title}"?` : ''}
                warning="Góp ý sẽ bị xóa vĩnh viễn khỏi hệ thống."
                isDeleting={deleting}
            />
                </>
            )}
        </AdminPageShell>
    );
}
