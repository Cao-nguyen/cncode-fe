'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LuyentapCheckAnswerList, { type CheckAnswerItem } from '@/components/luyentap/LuyentapCheckAnswerList';
import { luyentapApi } from '@/lib/api/luyentap.api';
import type { AdminSubmissionDetail, AdminSubmissionItem } from '@/lib/api/luyentap.api';
import {
    formatScoreValue,
    resolveAttemptScore,
    resolveExerciseTotalPoints,
} from '@/lib/luyentap/exercise-display.utils';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface LuyentapAdminSubmissionDetailModalProps {
    open: boolean;
    exerciseId: string;
    submission: AdminSubmissionItem | null;
    onClose: () => void;
}

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

export default function LuyentapAdminSubmissionDetailModal({
    open,
    exerciseId,
    submission,
    onClose,
}: LuyentapAdminSubmissionDetailModalProps) {
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<AdminSubmissionDetail | null>(null);

    useEffect(() => {
        if (!open || !submission?._id) {
            setDetail(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        luyentapApi.getAdminSubmissionDetail(exerciseId, submission._id)
            .then((data) => {
                if (cancelled) return;
                setDetail({
                    ...data,
                    submission: {
                        ...data.submission,
                        attemptNumber: submission.attemptNumber,
                    },
                });
            })
            .catch((err: unknown) => {
                toast.error(err instanceof Error ? err.message : 'Không thể tải bài làm');
                onClose();
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [open, exerciseId, submission?._id, submission?.attemptNumber, onClose]);

    const answers = (detail?.answers || []) as CheckAnswerItem[];
    const exerciseQuestions = detail?.exercise?.questions || [];
    const totalPoints = detail?.totalPoints || resolveExerciseTotalPoints({ questions: exerciseQuestions });
    const displayScore = useMemo(
        () => resolveAttemptScore(detail?.submission || {}, totalPoints),
        [detail?.submission, totalPoints],
    );
    const correctCount = answers.filter((item) => item.isCorrect).length;
    const totalQuestions = exerciseQuestions.length || answers.length;
    const wrongCount = Math.max(0, totalQuestions - correctCount);

    if (!open || !submission) return null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11">
                            <AvatarImage src={getImageUrl(submission.userAvatar)} />
                            <AvatarFallback>
                                {(submission.userName || '?').slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-semibold text-gray-900">
                                Bài làm của {submission.userName}
                            </h2>
                            <p className="truncate text-sm text-gray-500">{submission.userEmail || '—'}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        <div className="shrink-0 border-b border-gray-100 bg-slate-50 px-5 py-4">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Điểm</p>
                                    <p className="mt-1 text-2xl font-bold text-blue-600">
                                        {displayScore != null ? formatScoreValue(displayScore) : '—'}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Lần thi số</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{submission.attemptNumber}</p>
                                </div>
                                <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Thời gian làm bài</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {fmtDuration(detail?.submission.timeSpent || 0)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Thời gian nộp</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {fmtDate(detail?.submission.submittedAt)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Thoát màn hình</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {detail?.submission.tabSwitchCount ?? 0} lần
                                    </p>
                                </div>
                            </div>
                            {detail?.submission.overallFeedback && (
                                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                        Nhận xét chung
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                                        {detail.submission.overallFeedback}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                            <LuyentapCheckAnswerList
                                answers={answers}
                                exerciseQuestions={exerciseQuestions}
                                correctCount={correctCount}
                                wrongCount={wrongCount}
                                totalQuestions={totalQuestions}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
