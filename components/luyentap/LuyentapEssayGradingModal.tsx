'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, PenLine, X } from 'lucide-react';
import { toast } from 'sonner';
import StaticContent from '@/components/common/StaticContent';
import { CustomButton } from '@/components/custom/CustomButton';
import { luyentapApi } from '@/lib/api/luyentap.api';
import type { AdminEssayGradingItem, AdminSubmissionItem } from '@/lib/api/luyentap.api';
import { cn } from '@/lib/utils';
interface EssayGradeDraft {
    questionId: string;
    points: string;
    feedback: string;
}

interface LuyentapEssayGradingModalProps {
    open: boolean;
    exerciseId: string;
    submission: AdminSubmissionItem | null;
    onClose: () => void;
    onGraded: () => void;
}

export default function LuyentapEssayGradingModal({
    open,
    exerciseId,
    submission,
    onClose,
    onGraded,
}: LuyentapEssayGradingModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [essayItems, setEssayItems] = useState<AdminEssayGradingItem[]>([]);
    const [grades, setGrades] = useState<Record<string, EssayGradeDraft>>({});
    const [overallFeedback, setOverallFeedback] = useState('');

    useEffect(() => {
        if (!open || !submission?._id) return;

        let cancelled = false;
        setLoading(true);
        luyentapApi.getAdminSubmissionDetail(exerciseId, submission._id)
            .then((detail) => {
                if (cancelled) return;
                setEssayItems(detail.essayItems || []);
                setOverallFeedback(detail.submission?.overallFeedback || submission.overallFeedback || '');
                const nextGrades: Record<string, EssayGradeDraft> = {};
                (detail.essayItems || []).forEach((item) => {
                    nextGrades[item.questionId] = {
                        questionId: item.questionId,
                        points: String(item.awardedPoints ?? ''),
                        feedback: item.feedback || '',
                    };
                });
                setGrades(nextGrades);
            })
            .catch((err: unknown) => {
                toast.error(err instanceof Error ? err.message : 'Không thể tải bài làm');
                onClose();
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [open, exerciseId, submission?._id, onClose]);

    const handleSave = async () => {
        if (!submission?._id) return;

        const payload = essayItems.map((item) => {
            const draft = grades[item.questionId];
            const points = Math.min(
                item.points,
                Math.max(0, Number(draft?.points) || 0),
            );
            return {
                questionId: item.questionId,
                points,
                feedback: draft?.feedback?.trim() || '',
            };
        });

        if (payload.some((entry) => Number.isNaN(Number(entry.points)))) {
            toast.error('Vui lòng nhập điểm hợp lệ');
            return;
        }

        setSaving(true);
        try {
            await luyentapApi.gradeAdminEssayAnswers(exerciseId, submission._id, {
                grades: payload,
                overallFeedback: overallFeedback.trim(),
            });
            toast.success('Đã lưu nhận xét');
            onGraded();
            onClose();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Không thể lưu nhận xét');
        } finally {
            setSaving(false);
        }
    };

    if (!open || !submission) return null;

    return (
        <div className="fixed inset-0 z-[10002] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
            <div className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Nhận xét toàn bài</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {submission.userName} · Lần thi {submission.attemptNumber}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                                <label className="mb-2 block text-sm font-semibold text-gray-900">
                                    Nhận xét chung
                                </label>
                                <textarea
                                    value={overallFeedback}
                                    onChange={(e) => setOverallFeedback(e.target.value)}
                                    rows={4}
                                    placeholder="Nhận xét tổng thể cho bài làm của học sinh..."
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </section>

                            {essayItems.length === 0 ? (
                                <p className="text-center text-sm text-gray-500">Bài làm không có câu tự luận cần chấm riêng.</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                                                <PenLine className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900">Chấm tự luận</h3>
                                                <p className="text-xs text-gray-500">{essayItems.length} câu cần chấm</p>
                                            </div>
                                        </div>
                                    </div>

                                    {essayItems.map((item, index) => {
                                        const draft = grades[item.questionId] || {
                                            questionId: item.questionId,
                                            points: '',
                                            feedback: '',
                                        };
                                        const isPending = item.needsManualGrading;

                                        return (
                                            <article
                                                key={item.questionId}
                                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900">Câu tự luận</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                            Tối đa {item.points} điểm
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'rounded-full px-2.5 py-1 text-xs font-semibold',
                                                                isPending
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-emerald-100 text-emerald-700',
                                                            )}
                                                        >
                                                            {isPending ? 'Chờ chấm' : 'Đã chấm'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 p-4">
                                                    <div>
                                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                            Đề bài
                                                        </p>
                                                        <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                                                            <StaticContent
                                                                content={item.question}
                                                                className="prose prose-sm max-w-none text-gray-800"
                                                            />
                                                        </div>
                                                    </div>

                                                    {item.sampleAnswer && (
                                                        <div>
                                                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                                                                Đáp án mẫu
                                                            </p>
                                                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                                                                <StaticContent
                                                                    content={item.sampleAnswer}
                                                                    className="prose prose-sm max-w-none text-emerald-900"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                                                            Bài làm của học sinh
                                                        </p>
                                                        <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3">
                                                            {item.essayAnswer ? (
                                                                <StaticContent
                                                                    content={item.essayAnswer}
                                                                    className="prose prose-sm max-w-none text-gray-800"
                                                                />
                                                            ) : (
                                                                <p className="text-sm italic text-gray-400">Học sinh chưa trả lời câu này</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                                                        <p className="mb-3 text-sm font-semibold text-violet-900">Chấm điểm câu này</p>
                                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                                            <div className="shrink-0 lg:w-36">
                                                                <label className="mb-2 block text-xs font-medium text-gray-600">
                                                                    Điểm đạt được
                                                                </label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={item.points}
                                                                        step={0.5}
                                                                        value={draft.points}
                                                                        onChange={(e) => setGrades((prev) => ({
                                                                            ...prev,
                                                                            [item.questionId]: {
                                                                                ...draft,
                                                                                points: e.target.value,
                                                                            },
                                                                        }))}
                                                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-center text-lg font-bold text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                        placeholder="0"
                                                                    />
                                                                    <span className="shrink-0 text-sm font-medium text-gray-400">
                                                                        / {item.points}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <label className="mb-2 block text-xs font-medium text-gray-600">
                                                                    Nhận xét riêng câu này
                                                                </label>
                                                                <textarea
                                                                    value={draft.feedback}
                                                                    onChange={(e) => setGrades((prev) => ({
                                                                        ...prev,
                                                                        [item.questionId]: {
                                                                            ...draft,
                                                                            feedback: e.target.value,
                                                                        },
                                                                    }))}
                                                                    rows={3}
                                                                    placeholder="Góp ý chi tiết cho câu trả lời này..."
                                                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
                    <CustomButton variant="secondary" onClick={onClose} disabled={saving} className="w-full sm:w-auto">
                        Hủy
                    </CustomButton>
                    <CustomButton onClick={handleSave} loading={saving} disabled={loading} className="w-full sm:w-auto">
                        Lưu nhận xét
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}
