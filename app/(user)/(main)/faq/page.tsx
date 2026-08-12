'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Eye, MessageCircle, Heart, Clock, Search, PlusCircle,
    FileQuestion, CheckCircle, ChevronRight, ChevronLeft, Pin, Lock, Edit2, Trash2, X,
} from 'lucide-react';
import { faqApi, getErrorMessage } from '@/lib/api/faq.api';
import { Question, FaqStatistics, GRADE_LABELS } from '@/types/faq.type';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

const GRADE_OPTIONS = [
    { value: 'all', label: 'Tất cả lớp' },
    { value: 'grade10', label: 'Tin học 10' },
    { value: 'grade11', label: 'Tin học 11' },
    { value: 'grade12', label: 'Tin học 12' },
    { value: 'other', label: 'Khác' },
];

function fmtQuestionDate(date: string) {
    const created = new Date(date);
    const diffMins = Math.floor((Date.now() - created.getTime()) / 60000);
    if (diffMins < 60) return `${Math.max(diffMins, 0)} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return created.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

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

function QuestionCard({
    question,
    liked,
    isOwner,
    onLike,
    onEdit,
    onDelete,
}: {
    question: Question;
    liked: boolean;
    isOwner: boolean;
    onLike: (id: string) => void;
    onEdit: (question: Question) => void;
    onDelete: (question: Question) => void;
}) {
    const displayName = question.isAnonymous ? 'Ẩn danh' : question.userId?.fullName || 'Người dùng';

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm transition hover:border-[var(--cn-primary)]/25 hover:shadow-md">
            <div className="flex items-start justify-between gap-3 px-4 pt-4 md:px-5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-[var(--cn-bg-section)] px-2 py-0.5 text-xs font-medium text-[var(--cn-text-sub)]">
                        {GRADE_LABELS[question.grade]}
                    </span>
                    <span className={cn(
                        'rounded-md px-2 py-0.5 text-xs font-medium',
                        question.isSolved
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
                    )}>
                        {question.isSolved ? 'Đã giải' : 'Chờ trả lời'}
                    </span>
                    {question.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                            <Pin className="h-3 w-3" /> Ghim
                        </span>
                    )}
                    {question.isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--cn-bg-section)] px-2 py-0.5 text-xs text-[var(--cn-text-muted)]">
                            <Lock className="h-3 w-3" /> Đã khóa
                        </span>
                    )}
                </div>
                {isOwner && (
                    <div className="flex shrink-0 items-center gap-0.5">
                        <button
                            type="button"
                            onClick={() => onEdit(question)}
                            className="rounded-lg p-1.5 text-[var(--cn-text-muted)] transition hover:bg-[var(--cn-hover)] hover:text-blue-600"
                            title="Sửa"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(question)}
                            className="rounded-lg p-1.5 text-[var(--cn-text-muted)] transition hover:bg-red-50 hover:text-red-600"
                            title="Xóa"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            <Link href={`/faq/${question.slug}`} className="block px-4 py-3 md:px-5">
                <h2 className="line-clamp-2 text-base font-semibold leading-snug text-[var(--cn-text-main)] transition group-hover:text-[var(--cn-primary)] md:text-lg">
                    {question.title}
                </h2>
            </Link>

            <div className="mt-auto border-t border-[var(--cn-border)] px-4 py-3 md:px-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0 border border-[var(--cn-border)]">
                            {!question.isAnonymous && question.userId?.avatar ? (
                                <AvatarImage src={getImageUrl(question.userId.avatar)} alt={displayName} />
                            ) : null}
                            <AvatarFallback className="text-[10px]">
                                {question.isAnonymous ? '?' : displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm font-medium text-[var(--cn-text-main)]">{displayName}</span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-[var(--cn-text-muted)]">
                        <Clock className="h-3.5 w-3.5" />
                        {fmtQuestionDate(question.createdAt)}
                    </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--cn-text-sub)]">
                    <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {question.viewCount}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" />
                        {question.answerCount}
                    </span>
                    <button
                        type="button"
                        onClick={() => onLike(question._id)}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition',
                            liked
                                ? 'text-red-500'
                                : 'text-[var(--cn-text-sub)] hover:text-red-500',
                        )}
                    >
                        <Heart
                            className="h-4 w-4"
                            data-filled={liked ? 'true' : 'false'}
                            fill={liked ? 'currentColor' : 'none'}
                        />
                        {question.likeCount > 0 ? question.likeCount : 'Hữu ích'}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function FAQPage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const editEditorRef = useRef<CustomEditorRef>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [stats, setStats] = useState<FaqStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [grade, setGrade] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());
    const [editTarget, setEditTarget] = useState<Question | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        faqApi.getStatistics().then((res) => {
            if (res.success) setStats(res.data);
        }).catch(() => {});
    }, []);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await faqApi.getQuestions({
                page,
                limit: 10,
                grade: grade !== 'all' ? grade : undefined,
                search: debouncedSearch || undefined,
            });
            setQuestions(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
            setLikedQuestions(new Set(res.data.filter((q) => q.userLiked).map((q) => q._id)));
        } catch {
            toast.error('Không thể tải danh sách câu hỏi');
        } finally {
            setLoading(false);
        }
    }, [page, grade, debouncedSearch]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const handleLike = async (id: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }
        try {
            const res = await faqApi.toggleLikeQuestion(id);
            if (res.success) {
                setLikedQuestions((prev) => {
                    const next = new Set(prev);
                    if (res.data.action === 'added') next.add(id);
                    else next.delete(id);
                    return next;
                });
                setQuestions((prev) => prev.map((q) => (
                    q._id === id ? { ...q, likeCount: res.data.likeCount } : q
                )));
            }
        } catch {
            toast.error('Không thể cập nhật lượt thích');
        }
    };

    const handleOpenEdit = (question: Question) => {
        setEditTitle(question.title);
        setEditTarget(question);
    };

    const handleSaveEdit = async () => {
        if (!editTarget) return;
        const content = editEditorRef.current?.getContent() || editTarget.content;
        if (!editTitle.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung');
            return;
        }
        setEditSaving(true);
        try {
            await faqApi.updateQuestion(editTarget._id, { title: editTitle.trim(), content });
            toast.success('Cập nhật câu hỏi thành công');
            setEditTarget(null);
            fetchQuestions();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await faqApi.deleteQuestion(deleteTarget._id);
            toast.success('Đã xóa câu hỏi');
            setDeleteTarget(null);
            fetchQuestions();
            faqApi.getStatistics().then((res) => { if (res.success) setStats(res.data); });
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen pb-6 pt-[20px] md:pb-8 lg:pt-[30px]" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-7xl px-3 sm:px-4">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--cn-text-main)] sm:text-2xl md:text-3xl">
                            Góc Hỏi Đáp
                        </h1>
                        <p className="mt-1 text-xs text-[var(--cn-text-sub)] sm:text-sm">
                            Gặp khó khăn với bài tập? Đặt câu hỏi và nhận sự trợ giúp từ cộng đồng
                        </p>
                    </div>
                    <CustomButton className="w-full shrink-0 sm:w-auto" onClick={() => router.push('/faq/ask')}>
                        <PlusCircle className="h-4 w-4" />
                        Đặt câu hỏi
                    </CustomButton>
                </div>

                {stats && (
                    <div className="mb-4 grid grid-cols-2 gap-2 md:mb-6 md:grid-cols-4 md:gap-3">
                        <StatCard icon={<FileQuestion className="h-5 w-5 text-blue-600" />} label="Tổng câu hỏi" value={stats.totalQuestions} color="bg-blue-100" />
                        <StatCard icon={<CheckCircle className="h-5 w-5 text-emerald-600" />} label="Đã có trả lời" value={stats.answeredQuestions} color="bg-emerald-100" />
                        <StatCard icon={<Clock className="h-5 w-5 text-amber-600" />} label="Chờ trả lời" value={stats.pendingQuestions} color="bg-amber-100" />
                        <StatCard icon={<Heart className="h-5 w-5 text-red-500" />} label="Lượt thích" value={stats.totalLikes} color="bg-red-100" />
                    </div>
                )}

                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:gap-3">
                    <div className="min-w-0 flex-1">
                        <CustomInput
                            placeholder="Tìm kiếm câu hỏi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="h-4 w-4" />}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <CustomSelect options={GRADE_OPTIONS} value={grade} onChange={(v) => { setGrade(v); setPage(1); }} placeholder="Chọn lớp" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    </div>
                ) : questions.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-950">
                        <FileQuestion className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                        <p className="mb-4 text-gray-500">Chưa có câu hỏi nào</p>
                        <CustomButton onClick={() => router.push('/faq/ask')}>Đặt câu hỏi đầu tiên</CustomButton>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {questions.map((q) => (
                                <QuestionCard
                                    key={q._id}
                                    question={q}
                                    liked={likedQuestions.has(q._id)}
                                    isOwner={!!user?._id && user._id === q.userId?._id}
                                    onLike={handleLike}
                                    onEdit={handleOpenEdit}
                                    onDelete={setDeleteTarget}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-3">
                                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border p-2 disabled:opacity-40">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
                                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border p-2 disabled:opacity-40">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditTarget(null)}>
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 dark:bg-gray-950" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Chỉnh sửa câu hỏi</h3>
                            <button type="button" onClick={() => setEditTarget(null)} className="rounded-lg p-1 hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <CustomInput label="Tiêu đề" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mb-4" />
                        <CustomEditor key={editTarget._id} ref={editEditorRef} initialValue={editTarget.content} />
                        <div className="mt-4 flex justify-end gap-2">
                            <CustomButton variant="secondary" onClick={() => setEditTarget(null)}>Hủy</CustomButton>
                            <CustomButton onClick={handleSaveEdit} loading={editSaving}>Lưu</CustomButton>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModalDelete
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa câu hỏi"
                message={deleteTarget ? `Bạn có chắc muốn xóa "${deleteTarget.title}"?` : ''}
                warning="Tất cả câu trả lời sẽ bị xóa vĩnh viễn."
                isDeleting={deleting}
            />
        </div>
    );
}
