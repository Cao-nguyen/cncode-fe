'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Award, BarChart3, Calendar, ClipboardList, Clock, FileText, GraduationCap,
    Link2, Loader2, PenLine, Target, Trash2, UserCircle, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import LuyentapEssayGradingModal from '@/components/luyentap/LuyentapEssayGradingModal';
import LuyentapAdminSubmissionDetailModal from '@/components/luyentap/LuyentapAdminSubmissionDetailModal';
import LuyentapAdminBasicStats from '@/components/luyentap/LuyentapAdminBasicStats';
import LuyentapAdminDetailedStats from '@/components/luyentap/LuyentapAdminDetailedStats';
import { luyentapApi } from '@/lib/api/luyentap.api';
import type { AdminExerciseOverview, AdminSubmissionItem } from '@/lib/api/luyentap.api';
import { EXAM_PURPOSE_LABELS, GRADE_LABELS } from '@/lib/luyentap/exercise-config.constants';
import { formatScoreValue, resolveAttemptScore, resolveExerciseTotalPoints } from '@/lib/luyentap/exercise-display.utils';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

interface LuyentapAdminOverviewClientProps {
    exerciseId: string;
    onClose?: () => void;
}

type SidebarTab = 'submissions' | 'stats';

function fmtDate(value?: string | Date | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function fmtDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
}

function statusLabel(status?: string) {
    if (status === 'published') return 'Đã xuất bản';
    if (status === 'pending') return 'Chờ duyệt';
    if (status === 'rejected') return 'Đã từ chối';
    return 'Bản nháp';
}

function statusBadgeClass(status?: string) {
    if (status === 'published') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (status === 'pending') return 'bg-amber-50 text-amber-700 ring-amber-200';
    if (status === 'rejected') return 'bg-red-50 text-red-700 ring-red-200';
    return 'bg-gray-100 text-gray-600 ring-gray-200';
}

function fmtDeliveryRange(from?: string | null, to?: string | null) {
    if (!from && !to) return 'Không';
    const parts: string[] = [];
    if (from) parts.push(fmtDate(from));
    if (to) parts.push(fmtDate(to));
    return parts.join(' → ');
}

function SidebarDivider() {
    return <div className="my-1 border-t border-gray-200" />;
}

function SidebarInfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 px-3.5 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                <p className="mt-0.5 text-sm leading-snug text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function SidebarNavItem({
    active,
    icon: Icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
        </button>
    );
}

function OverviewHeader({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <header className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:gap-4 sm:px-6">
            <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                title="Quay lại"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>

            <Image
                src="/images/logo.png"
                alt="CNcode"
                width={90}
                height={36}
                className="hidden h-8 w-auto shrink-0 sm:block"
            />
            <Image
                src="/images/logo.png"
                alt="CNcode"
                width={60}
                height={24}
                className="h-6 w-auto shrink-0 sm:hidden"
            />

            <span className="shrink-0 text-gray-300" aria-hidden="true">
                |
            </span>

            <h1 className="min-w-0 truncate text-sm font-semibold text-gray-900 sm:text-base">{title}</h1>
        </header>
    );
}

function SubmissionMetaRow({ label, value, valueClassName }: {
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3 text-sm">
            <span className="shrink-0 text-gray-500">{label}</span>
            <span className={cn('text-right font-medium text-gray-900', valueClassName)}>{value}</span>
        </div>
    );
}

export default function LuyentapAdminOverviewClient({ exerciseId, onClose }: LuyentapAdminOverviewClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<AdminExerciseOverview | null>(null);
    const [submissions, setSubmissions] = useState<AdminSubmissionItem[]>([]);
    const [submissionTotal, setSubmissionTotal] = useState(0);
    const [submissionTotalPoints, setSubmissionTotalPoints] = useState(0);
    const [activeTab, setActiveTab] = useState<SidebarTab>('submissions');
    const [gradingTarget, setGradingTarget] = useState<AdminSubmissionItem | null>(null);
    const [detailTarget, setDetailTarget] = useState<AdminSubmissionItem | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [statsRefreshKey, setStatsRefreshKey] = useState(0);

    const exercise = overview?.exercise;
    const hasEssay = overview?.hasEssay ?? false;

    const loadOverview = useCallback(async () => {
        const data = await luyentapApi.getAdminExerciseOverview(exerciseId);
        setOverview(data);
        return data;
    }, [exerciseId]);

    const loadSubmissions = useCallback(async () => {
        const data = await luyentapApi.getAdminSubmissions(exerciseId, {
            page: 1,
            limit: 50,
        });
        setSubmissions(data.submissions || []);
        setSubmissionTotal(data.total || 0);
        setSubmissionTotalPoints(data.totalPoints || 0);
    }, [exerciseId]);

    const refresh = useCallback(async () => {
        await Promise.all([loadOverview(), loadSubmissions()]);
        setStatsRefreshKey((value) => value + 1);
    }, [loadOverview, loadSubmissions]);

    useEffect(() => {
        setLoading(true);
        Promise.all([loadOverview(), loadSubmissions()])
            .catch((err: unknown) => {
                toast.error(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
                router.replace('/admin/luyentap');
            })
            .finally(() => setLoading(false));
    }, [loadOverview, loadSubmissions, router]);

    const handleCopyLink = async () => {
        if (!exercise?.slug) return;
        const url = `${window.location.origin}/luyentap/${exercise.slug}`;
        await navigator.clipboard.writeText(url);
        toast.success('Đã copy link bài tập');
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await luyentapApi.adminDelete(exerciseId);
            toast.success('Đã xóa bài tập');
            handleClose();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Không thể xóa bài tập');
        } finally {
            setDeleting(false);
            setDeleteOpen(false);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }
        router.replace('/admin/luyentap');
    };

    const creatorName = useMemo(() => {
        const creator = exercise?.createdBy;
        if (!creator || typeof creator !== 'object') return '—';
        return creator.fullName || creator.name || creator.email || '—';
    }, [exercise?.createdBy]);

    const gradeLabel = exercise?.grade ? (GRADE_LABELS[exercise.grade] || exercise.grade) : '—';
    const purposeLabel = exercise?.examPurpose
        ? (EXAM_PURPOSE_LABELS[exercise.examPurpose] || exercise.examPurpose)
        : '—';
    const totalPoints = useMemo(
        () => submissionTotalPoints || resolveExerciseTotalPoints(exercise),
        [submissionTotalPoints, exercise],
    );

    if (loading) {
        return (
            <div className="fixed inset-0 z-[9998] flex h-dvh w-full flex-col overflow-hidden bg-white">
                <OverviewHeader title="Đang tải..." onClose={handleClose} />
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="fixed inset-0 z-[9998] flex h-dvh w-full flex-col overflow-hidden bg-white">
                <OverviewHeader title="Không tìm thấy bài tập" onClose={handleClose} />
                <div className="flex flex-1 flex-col items-center justify-center gap-3">
                    <p className="text-gray-500">Không tìm thấy bài tập</p>
                    <button type="button" onClick={handleClose} className="text-sm text-blue-600 hover:underline">
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9998] flex h-dvh w-full flex-col overflow-hidden bg-white">
            <OverviewHeader title={exercise.title} onClose={handleClose} />
            <div className="flex min-h-0 flex-1 w-full">
                <aside className="hidden w-[300px] shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-[#f8fafc] lg:flex">
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                        <section>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                Trạng thái
                            </p>
                            <span
                                className={cn(
                                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                                    statusBadgeClass(exercise.status),
                                )}
                            >
                                {statusLabel(exercise.status)}
                            </span>
                        </section>

                        <button
                            type="button"
                            onClick={handleCopyLink}
                            disabled={!exercise.slug}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Link2 className="h-4 w-4" />
                            Link đề thi
                        </button>

                        {hasEssay && (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                                <div className="flex items-start gap-2.5">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                        <PenLine className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-amber-900">Chờ chấm tự luận</p>
                                        <p className="mt-0.5 text-xs text-amber-800">
                                            {overview?.pendingEssayCount ?? 0} bài chưa chấm
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <SidebarInfoRow
                                icon={Award}
                                label="Thang điểm"
                                value={totalPoints > 0 ? `${totalPoints} điểm` : '—'}
                            />
                            <div className="border-t border-gray-100">
                                <SidebarInfoRow
                                    icon={Calendar}
                                    label="Ngày tạo đề"
                                    value={fmtDate(exercise.createdAt)}
                                />
                            </div>
                            <div className="border-t border-gray-100">
                                <SidebarInfoRow
                                    icon={Clock}
                                    label="Thời gian giao đề"
                                    value={fmtDeliveryRange(exercise.deliveryFrom, exercise.deliveryTo)}
                                />
                            </div>
                            <div className="border-t border-gray-100">
                                <SidebarInfoRow
                                    icon={UserCircle}
                                    label="Người tạo"
                                    value={creatorName}
                                />
                            </div>
                            <div className="border-t border-gray-100">
                                <SidebarInfoRow
                                    icon={FileText}
                                    label="Số lượt làm đề"
                                    value={overview?.submissionCount ?? 0}
                                />
                            </div>
                            <div className="border-t border-gray-100">
                                <SidebarInfoRow
                                    icon={GraduationCap}
                                    label="Khối"
                                    value={gradeLabel}
                                />
                            </div>
                            <div className="border-t border-gray-100">
                                <SidebarInfoRow
                                    icon={Target}
                                    label="Mục đích"
                                    value={purposeLabel}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                        <nav className="space-y-1">
                            <SidebarNavItem
                                active={activeTab === 'submissions'}
                                icon={ClipboardList}
                                label="Bài đã nộp"
                                onClick={() => setActiveTab('submissions')}
                            />
                            <SidebarNavItem
                                active={activeTab === 'stats'}
                                icon={BarChart3}
                                label="Thống kê"
                                onClick={() => setActiveTab('stats')}
                            />
                        </nav>

                        <SidebarDivider />

                        <button
                            type="button"
                            onClick={() => setDeleteOpen(true)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            Xóa bài tập
                        </button>
                    </div>
                </aside>

                <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
                    <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 lg:hidden">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('submissions')}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium',
                                    activeTab === 'submissions'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600',
                                )}
                            >
                                <ClipboardList className="h-4 w-4" />
                                Bài đã nộp
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('stats')}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium',
                                    activeTab === 'stats'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600',
                                )}
                            >
                                <BarChart3 className="h-4 w-4" />
                                Thống kê
                            </button>
                        </div>
                    </div>

                    {activeTab === 'stats' ? (
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
                            {overview?.basicStats && (
                                <LuyentapAdminBasicStats stats={overview.basicStats} />
                            )}
                            <LuyentapAdminDetailedStats
                                key={statsRefreshKey}
                                exerciseId={exerciseId}
                            />
                        </div>
                    ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-800">
                                Danh sách đã thi ({submissions.length}/{submissionTotal})
                            </h2>
                            {hasEssay && (overview?.pendingEssayCount ?? 0) > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    {overview?.pendingEssayCount} bài chờ chấm tự luận
                                </span>
                            )}
                        </div>

                        {submissions.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                                <p className="text-sm text-gray-500">Chưa có học sinh nộp bài</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {submissions.map((item) => {
                                    const displayScore = resolveAttemptScore(item, totalPoints);
                                    const scoreText = displayScore != null ? formatScoreValue(displayScore) : '—';

                                    return (
                                    <article
                                        key={item._id}
                                        className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                    <AvatarImage src={getImageUrl(item.userAvatar)} />
                                                    <AvatarFallback className="bg-blue-100 text-sm font-semibold text-blue-700">
                                                        {(item.userName || '?').slice(0, 1).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-base font-semibold text-gray-900">
                                                        {item.userName}
                                                    </p>
                                                    <p className="truncate text-sm text-gray-500">
                                                        {item.userEmail || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-4 py-4">
                                            <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
                                                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                                                    Điểm
                                                </p>
                                                <p className="mt-1 text-4xl font-bold leading-none text-blue-600">
                                                    {scoreText}
                                                </p>
                                                {hasEssay && item.essayGradingPending && (
                                                    <p className="mt-2 text-xs font-medium text-amber-700">
                                                        Chưa bao gồm điểm tự luận
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-4 space-y-2.5 rounded-xl border border-gray-100 bg-gray-50/80 px-3.5 py-3">
                                                <SubmissionMetaRow
                                                    label="Lần thi số:"
                                                    value={item.attemptNumber}
                                                />
                                                <SubmissionMetaRow
                                                    label="Thời gian làm bài:"
                                                    value={fmtDuration(item.timeSpent || 0)}
                                                />
                                                <SubmissionMetaRow
                                                    label="Thời gian nộp:"
                                                    value={fmtDate(item.submittedAt)}
                                                />
                                                <SubmissionMetaRow
                                                    label="Số lần thoát màn hình:"
                                                    value={`${item.tabSwitchCount ?? 0} lần`}
                                                    valueClassName={(item.tabSwitchCount ?? 0) > 0 ? 'text-amber-700' : undefined}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-auto flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => setGradingTarget(item)}
                                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 sm:flex-none"
                                            >
                                                <PenLine className="h-3.5 w-3.5" />
                                                Nhận xét toàn bài
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDetailTarget(item)}
                                                className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:flex-none"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    )}
                </main>
            </div>

            <LuyentapAdminSubmissionDetailModal
                open={!!detailTarget}
                exerciseId={exerciseId}
                submission={detailTarget}
                onClose={() => setDetailTarget(null)}
            />

            <LuyentapEssayGradingModal
                open={!!gradingTarget}
                exerciseId={exerciseId}
                submission={gradingTarget}
                onClose={() => setGradingTarget(null)}
                onGraded={refresh}
            />

            <ConfirmModalDelete
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Xóa bài tập"
                message={`Xóa "${exercise.title}"? Hành động này không thể hoàn tác.`}
                isDeleting={deleting}
            />
        </div>
    );
}
