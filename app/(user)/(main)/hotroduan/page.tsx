'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { helpProjectApi } from '@/lib/api/helpproject.api';
import { HelpProject, HelpProjectStats } from '@/types/helpproject.type';
import { useAuthStore } from '@/store/auth.store';
import { CustomButton } from '@/components/custom/CustomButton';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    FolderKanban,
    MessageCircle,
    Eye,
    Edit2,
    Trash2,
    Clock,
    Globe,
    Lock,
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

const STATUS: Record<string, { label: string; className: string }> = {
    pending: { label: 'Chờ trả lời', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
    answered: { label: 'Đã trả lời', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
};

function fmtDate(s: string) {
    return new Date(s).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, '').trim();
}

export default function HelpProjectPage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const [projects, setProjects] = useState<HelpProject[]>([]);
    const [stats, setStats] = useState<HelpProjectStats>({ total: 0, pending: 0, answered: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        fetchProjects();
    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await helpProjectApi.getMyStats();
            if (res.success) setStats(res.data);
        } catch {
            // stats optional on failure
        }
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await helpProjectApi.getUserProjects({
                page,
                limit: 10,
                search: debouncedSearch || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            if (res.success) {
                setProjects(res.data);
                setTotalPages(res.pagination.totalPages);
            }
        } catch {
            toast.error('Không thể tải danh sách dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await helpProjectApi.deleteProject(deleteTarget);
            toast.success('Xóa dự án thành công');
            setDeleteTarget(null);
            fetchProjects();
            fetchStats();
        } catch {
            toast.error('Có lỗi xảy ra khi xóa');
        }
    };

    return (
        <div className="min-h-screen pt-16 md:pt-14 lg:pt-8 pb-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--cn-text-main)] md:text-3xl">
                        Hỗ trợ dự án
                    </h1>
                    <p className="mt-1 text-sm text-[var(--cn-text-sub)]">
                        Gửi ý tưởng dự án và nhận phản hồi từ đội ngũ CNcode
                    </p>
                </div>
                <CustomButton onClick={() => router.push('/hotroduan/create')}>
                    <Plus className="h-4 w-4" />
                    Gửi dự án mới
                </CustomButton>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-4">
                    <p className="text-xs text-[var(--cn-text-muted)]">Dự án của bạn</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--cn-text-main)]">{stats.total}</p>
                </div>
                <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-4">
                    <p className="text-xs text-[var(--cn-text-muted)]">Chờ trả lời</p>
                    <p className="mt-1 text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-4">
                    <p className="text-xs text-[var(--cn-text-muted)]">Đã trả lời</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.answered}</p>
                </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-section)] p-0.5">
                    {[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'pending', label: 'Chờ trả lời' },
                        { value: 'answered', label: 'Đã trả lời' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                statusFilter === opt.value
                                    ? 'bg-[var(--cn-bg-card)] text-[var(--cn-text-main)] shadow-sm'
                                    : 'text-[var(--cn-text-sub)]'
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cn-text-muted)]" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm dự án..."
                        className="w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)]"
                        >
                            <div className="aspect-[16/10] animate-pulse bg-[var(--cn-bg-section)]" />
                            <div className="space-y-3 p-5">
                                <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--cn-bg-section)]" />
                                <div className="h-5 w-full animate-pulse rounded bg-[var(--cn-bg-section)]" />
                                <div className="h-3 w-full animate-pulse rounded bg-[var(--cn-bg-section)]" />
                                <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--cn-bg-section)]" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-16 text-center">
                    <FolderKanban className="mx-auto mb-3 h-10 w-10 text-[var(--cn-text-muted)] opacity-50" />
                    <p className="text-sm text-[var(--cn-text-sub)]">Chưa có dự án nào</p>
                    <div className="mt-3 flex justify-center">
                        <CustomButton size="small" onClick={() => router.push('/hotroduan/create')}>
                            <Plus className="h-4 w-4" />
                            Gửi dự án đầu tiên
                        </CustomButton>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => {
                            const st = STATUS[project.status] || STATUS.pending;
                            const excerpt = stripHtml(project.content);
                            const isOwner = user?._id === project.userId?._id;

                            return (
                                <article
                                    key={project._id}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm transition hover:shadow-md"
                                >
                                    <Link href={`/hotroduan/${project._id}`} className="relative block">
                                        <div className="aspect-[16/10] overflow-hidden bg-[var(--cn-bg-section)]">
                                            {project.thumbnail ? (
                                                <img
                                                    src={getImageUrl(project.thumbnail)}
                                                    alt={project.title}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <FolderKanban className="h-12 w-12 text-[var(--cn-text-muted)] opacity-40" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                            <span className={cn('inline-flex rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm', st.className)}>
                                                {st.label}
                                            </span>
                                            <span className={cn(
                                                'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm',
                                                project.isPublic
                                                    ? 'bg-blue-600/90 text-white'
                                                    : 'bg-gray-900/70 text-white'
                                            )}>
                                                {project.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                                {project.isPublic ? 'Công khai' : 'Riêng tư'}
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="mb-3 flex items-center justify-between text-xs text-[var(--cn-text-sub)]">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {fmtDate(project.createdAt)}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    {project.viewCount || 0}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                    {project.replies?.length || 0}
                                                </span>
                                            </div>
                                        </div>

                                        <Link href={`/hotroduan/${project._id}`} className="mb-1 block">
                                            <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-[var(--cn-text-main)] transition group-hover:text-[var(--cn-primary)]">
                                                {project.title}
                                            </h3>
                                        </Link>

                                        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-[var(--cn-text-sub)]">
                                            {excerpt || 'Chưa có mô tả'}
                                        </p>

                                        <div className="flex items-center justify-between border-t border-[var(--cn-border)] pt-3">
                                            <Link
                                                href={`/hotroduan/${project._id}`}
                                                className="text-sm font-medium text-[var(--cn-primary)] hover:underline"
                                            >
                                                Xem chi tiết
                                            </Link>
                                            {isOwner && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push(`/hotroduan/edit/${project._id}`)}
                                                        className="rounded-lg p-2 text-[var(--cn-text-muted)] hover:bg-[var(--cn-hover)] hover:text-blue-600"
                                                        title="Sửa"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(project._id)}
                                                        className="rounded-lg p-2 text-[var(--cn-text-muted)] hover:bg-red-50 hover:text-red-600"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <CustomButton
                                variant="secondary"
                                size="small"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                Trước
                            </CustomButton>
                            <span className="px-3 text-sm text-[var(--cn-text-sub)]">
                                Trang {page} / {totalPages}
                            </span>
                            <CustomButton
                                variant="secondary"
                                size="small"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                Sau
                            </CustomButton>
                        </div>
                    )}
                </>
            )}

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa dự án"
                message="Bạn có chắc chắn muốn xóa dự án này?"
                warning="Hành động này không thể hoàn tác."
            />
            </div>
        </div>
    );
}
