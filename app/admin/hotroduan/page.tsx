'use client';

import React, { useEffect, useState } from 'react';
import { helpProjectApi, HelpProjectAdminStats } from '@/lib/api/helpproject.api';
import { HelpProject } from '@/types/helpproject.type';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableScroll } from '@/components/admin/AdminTableScroll';
import StaticContent from '@/components/common/StaticContent';
import CommentSection from '@/components/comment/CommentSection';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import {
    Eye,
    MessageCircle,
    CheckCircle2,
    Clock,
    Search,
    Trash2,
    X,
    FolderKanban,
    Users,
    Globe,
    Lock,
} from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ trả lời' },
    { value: 'answered', label: 'Đã trả lời' },
];

const STATUS: Record<string, { label: string; className: string }> = {
    pending: { label: 'Chờ trả lời', className: 'bg-amber-50 text-amber-700' },
    answered: { label: 'Đã trả lời', className: 'bg-emerald-50 text-emerald-700' },
};

function fmtDate(s: string) {
    return new Date(s).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, '').trim();
}

function getInitial(name?: string) {
    return name?.charAt(0).toUpperCase() || '?';
}

function ModalShell({
    open,
    onClose,
    title,
    children,
    footer,
    wide,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    wide?: boolean;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className={cn(
                    'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl',
                    wide ? 'max-w-3xl' : 'max-w-2xl'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
                {footer && <div className="border-t border-gray-200 px-5 py-4">{footer}</div>}
            </div>
        </div>
    );
}

function ViewProjectModal({
    project,
    onClose,
    onCommentCountChange,
}: {
    project: HelpProject | null;
    onClose: () => void;
    onCommentCountChange?: (projectId: string, count: number) => void;
}) {
    if (!project) return null;
    const st = STATUS[project.status] || STATUS.pending;
    const name = project.userId?.fullName || 'Người dùng';

    return (
        <ModalShell open={!!project} onClose={onClose} title="Chi tiết dự án" wide>
            {project.thumbnail && (
                <div className="mb-4 h-56 overflow-hidden rounded-xl bg-gray-100">
                    <img src={getImageUrl(project.thumbnail)} alt={project.title} className="h-full w-full object-cover" />
                </div>
            )}
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-semibold', st.className)}>{st.label}</span>
                <span className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold',
                    project.isPublic ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                )}>
                    {project.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {project.isPublic ? 'Công khai' : 'Riêng tư'}
                </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{project.title}</h2>
            <div className="mt-4 flex items-center gap-3 border-b border-gray-200 pb-4">
                <Avatar className="h-9 w-9 border-2 border-gray-200">
                    {project.userId?.avatar ? <AvatarImage src={getImageUrl(project.userId.avatar)} alt={name} /> : null}
                    <AvatarFallback className="bg-blue-500 text-white">{getInitial(name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">{fmtDate(project.createdAt)}</p>
                </div>
            </div>
            <div className="mt-4">
                <StaticContent content={project.content} />
            </div>
            <div className="mt-6 border-t border-gray-200 pt-5">
                <CommentSection
                    targetType="help_project"
                    targetId={project._id}
                    title="Phản hồi"
                    onCommentCountChange={(count) => onCommentCountChange?.(project._id, count)}
                />
            </div>
        </ModalShell>
    );
}

export default function AdminHelpProjectPage() {
    const [projects, setProjects] = useState<HelpProject[]>([]);
    const [statistics, setStatistics] = useState<HelpProjectAdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [viewProject, setViewProject] = useState<HelpProject | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<HelpProject | null>(null);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        fetchStatistics();
        fetchProjects();
    }, [page, statusFilter, debouncedSearch]);

    const fetchStatistics = async () => {
        try {
            const res = await helpProjectApi.getStatistics();
            if (res.success) setStatistics(res.data);
        } catch {
            /* ignore */
        }
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await helpProjectApi.getAllProjects({
                page,
                limit: 10,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: debouncedSearch || undefined,
            });
            if (res.success) {
                setProjects(res.data);
                setTotalPages(res.pagination.totalPages);
                setTotal(res.pagination.total);
            }
        } catch {
            toast.error('Không thể tải dự án');
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => {
        fetchProjects();
        fetchStatistics();
    };

    const handleCommentCountChange = (projectId: string, count: number) => {
        setProjects((prev) => prev.map((p) => (
            p._id === projectId ? { ...p, commentCount: count } : p
        )));
        setViewProject((prev) => (
            prev && prev._id === projectId ? { ...prev, commentCount: count } : prev
        ));
    };

    const handleCloseViewModal = () => {
        setViewProject(null);
        refresh();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await helpProjectApi.adminDeleteProject(deleteTarget._id);
            toast.success('Xóa thành công');
            setDeleteTarget(null);
            refresh();
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    return (
        <AdminPageShell
            title="Quản lý hỗ trợ dự án"
            description="Xem và phản hồi yêu cầu hỗ trợ dự án từ người dùng"
        >
            {statistics && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <DashboardCard title="Tổng dự án" value={statistics.total} icon={<FolderKanban size={18} />} iconBgColor="#EFF6FF" iconColor="#3B82F6" />
                    <DashboardCard title="Chờ trả lời" value={statistics.pending} icon={<Clock size={18} />} iconBgColor="#FFF7ED" iconColor="#F97316" />
                    <DashboardCard title="Đã trả lời" value={statistics.answered} icon={<CheckCircle2 size={18} />} iconBgColor="#F0FDF4" iconColor="#22C55E" />
                    <DashboardCard title="Lượt xem" value={statistics.totalViews} icon={<Eye size={18} />} iconBgColor="#F5F3FF" iconColor="#8B5CF6" />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm dự án, nội dung..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div className="w-48">
                    <CustomSelect
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={(v) => { setStatusFilter(v); setPage(1); }}
                        placeholder="Trạng thái"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <AdminTableScroll minWidth={880}>
                    <table className="w-full min-w-[880px] border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50/80">
                                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Dự án</th>
                                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Người gửi</th>
                                <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                                <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Phản hồi</th>
                                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Ngày gửi</th>
                                <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-3 py-4">
                                            <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                                        </td>
                                    </tr>
                                ))
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-3 py-16 text-center text-gray-400">
                                        <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                                        Không có dự án nào
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project, i) => {
                                    const st = STATUS[project.status] || STATUS.pending;
                                    const name = project.userId?.fullName || 'Ẩn danh';
                                    return (
                                        <tr key={project._id} className={cn('hover:bg-gray-50/80', i % 2 === 1 && 'bg-gray-50/30')}>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                                        {project.thumbnail ? (
                                                            <img src={getImageUrl(project.thumbnail)} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <FolderKanban className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="line-clamp-1 font-medium text-gray-800">{project.title}</p>
                                                        <p className="line-clamp-1 text-xs text-gray-400">{stripHtml(project.content).slice(0, 60)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 border border-gray-200">
                                                        {project.userId?.avatar ? <AvatarImage src={getImageUrl(project.userId.avatar)} alt={name} /> : null}
                                                        <AvatarFallback className="bg-blue-500 text-[10px] text-white">{getInitial(name)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-700">{name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-semibold', st.className)}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                    {project.commentCount ?? 0}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                                                {fmtDate(project.createdAt)}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button type="button" onClick={() => setViewProject(project)} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50" title="Xem & phản hồi">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={() => setDeleteTarget(project)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Xóa">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </AdminTableScroll>

                <AdminPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={total}
                    pageSize={10}
                    onPageChange={setPage}
                />
            </div>

            <ViewProjectModal
                project={viewProject}
                onClose={handleCloseViewModal}
                onCommentCountChange={handleCommentCountChange}
            />

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa dự án"
                message={`Bạn có chắc chắn muốn xóa dự án "${deleteTarget?.title}"?`}
                warning="Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
            />
        </AdminPageShell>
    );
}
