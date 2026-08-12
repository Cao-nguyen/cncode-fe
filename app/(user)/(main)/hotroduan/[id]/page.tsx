'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { helpProjectApi } from '@/lib/api/helpproject.api';
import { HelpProject } from '@/types/helpproject.type';
import { CustomButton } from '@/components/custom/CustomButton';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import CommentSection from '@/components/comment/CommentSection';
import StaticContent from '@/components/common/StaticContent';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import {
    Home,
    ChevronRight,
    FolderKanban,
    Calendar,
    Edit2,
    Trash2,
    Eye,
    Globe,
    Lock,
    Loader2,
    Clock,
    CheckCircle2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

const STATUS: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    pending: { label: 'Chờ trả lời', className: 'bg-amber-50 text-amber-700', icon: Clock },
    answered: { label: 'Đã trả lời', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
};

function fmtDate(s: string) {
    return new Date(s).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function getInitial(name?: string) {
    return name?.charAt(0).toUpperCase() || '?';
}

export default function HelpProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const [project, setProject] = useState<HelpProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentCount, setCommentCount] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    useEffect(() => {
        if (!project?._id) return;

        helpProjectApi.incrementView(project._id)
            .then((res) => {
                if (res.success && res.data?.views != null) {
                    setProject((prev) => (prev ? { ...prev, viewCount: res.data.views } : prev));
                }
            })
            .catch(() => {});
    }, [project?._id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await helpProjectApi.getProjectById(params.id as string);
            if (res.success) setProject(res.data);
            else toast.error('Không tìm thấy dự án');
        } catch {
            toast.error('Không thể tải dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await helpProjectApi.deleteProject(project!._id);
            toast.success('Xóa dự án thành công');
            router.push('/hotroduan');
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center pt-16" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
                <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-16" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
                <FolderKanban className="h-12 w-12 text-[var(--cn-text-muted)] opacity-40" />
                <p className="text-[var(--cn-text-sub)]">Không tìm thấy dự án</p>
                <CustomButton variant="secondary" onClick={() => router.push('/hotroduan')}>
                    Quay lại danh sách
                </CustomButton>
            </div>
        );
    }

    const isOwner = user?._id === project.userId?._id;
    const authorName = project.userId?.fullName || 'Người dùng';
    const st = STATUS[project.status] || STATUS.pending;
    const StatusIcon = st.icon;

    return (
        <div className="min-h-screen pb-8 pt-16 md:pt-14 lg:pt-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-5xl px-4">
                <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--cn-text-sub)] md:text-sm">
                    <Link href="/" className="flex items-center gap-1 transition hover:text-[var(--cn-text-main)]">
                        <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Trang chủ</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)] md:h-4 md:w-4" />
                    <Link href="/hotroduan" className="transition hover:text-[var(--cn-text-main)]">
                        Hỗ trợ dự án
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)] md:h-4 md:w-4" />
                    <span className="line-clamp-1 font-medium text-[var(--cn-text-main)]">{project.title}</span>
                </nav>

                <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
                    <div className="space-y-6">
                        <article className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
                            {project.thumbnail && (
                                <div className="aspect-[21/9] w-full overflow-hidden bg-[var(--cn-bg-section)]">
                                    <img
                                        src={getImageUrl(project.thumbnail)}
                                        alt={project.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-5 md:p-6">
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className={cn('inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold', st.className)}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {st.label}
                                    </span>
                                    <span className={cn(
                                        'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold',
                                        project.isPublic
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-gray-100 text-gray-600'
                                    )}>
                                        {project.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                        {project.isPublic ? 'Công khai' : 'Riêng tư'}
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold leading-snug text-[var(--cn-text-main)] md:text-3xl">
                                    {project.title}
                                </h1>

                                <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-[var(--cn-border)] pb-4 text-sm text-[var(--cn-text-sub)]">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8 border border-[var(--cn-border)]">
                                            {project.userId?.avatar ? (
                                                <AvatarImage src={getImageUrl(project.userId.avatar)} alt={authorName} />
                                            ) : null}
                                            <AvatarFallback className="bg-[var(--cn-primary)] text-xs text-white">
                                                {getInitial(authorName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-[var(--cn-text-main)]">{authorName}</span>
                                    </div>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {fmtDate(project.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="h-3.5 w-3.5" />
                                        {project.viewCount} lượt xem
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <StaticContent content={project.content} />
                                </div>
                            </div>
                        </article>

                        <section className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-5 shadow-sm md:p-6">
                            <CommentSection
                                targetType="help_project"
                                targetId={project._id}
                                title="Phản hồi"
                                onCommentCountChange={setCommentCount}
                            />
                        </section>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-5 shadow-sm lg:sticky lg:top-24">
                            <p className="mb-3 text-sm font-semibold text-[var(--cn-text-main)]">Thông tin dự án</p>
                            <dl className="space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-[var(--cn-text-muted)]">Trạng thái</dt>
                                    <dd className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold', st.className)}>
                                        {st.label}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-[var(--cn-text-muted)]">Quyền riêng tư</dt>
                                    <dd className="font-medium text-[var(--cn-text-main)]">
                                        {project.isPublic ? 'Công khai' : 'Riêng tư'}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-[var(--cn-text-muted)]">Phản hồi</dt>
                                    <dd className="font-medium text-[var(--cn-text-main)]">{commentCount}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-[var(--cn-text-muted)]">Lượt xem</dt>
                                    <dd className="font-medium text-[var(--cn-text-main)]">{project.viewCount}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-[var(--cn-text-muted)]">Cập nhật</dt>
                                    <dd className="text-right text-xs text-[var(--cn-text-sub)]">{fmtDate(project.updatedAt)}</dd>
                                </div>
                            </dl>

                            {isOwner && (
                                <div className="mt-5 space-y-2 border-t border-[var(--cn-border)] pt-4">
                                    <CustomButton
                                        variant="secondary"
                                        size="small"
                                        fullWidth
                                        onClick={() => router.push(`/hotroduan/edit/${project._id}`)}
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Chỉnh sửa
                                    </CustomButton>
                                    <CustomButton
                                        variant="danger"
                                        size="small"
                                        fullWidth
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Xóa dự án
                                    </CustomButton>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            <ConfirmModalDelete
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Xóa dự án"
                message={`Bạn có chắc chắn muốn xóa dự án "${project.title}"?`}
                warning="Hành động này không thể hoàn tác."
                isDeleting={deleting}
            />
        </div>
    );
}
