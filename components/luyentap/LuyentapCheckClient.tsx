'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Clock,
    Home,
    Loader2,
    MessageSquareText,
    RotateCcw,
    Sparkles,
    XCircle,
} from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { CustomButton } from '@/components/custom/CustomButton';
import {
    formatPercentageValue,
    formatScoreScaleLabel,
    formatScoreValue,
    resolveAttemptScore,
    resolveEssayMaxPoints,
    resolveExercisePassPercentage,
    resolveExerciseTotalPoints,
} from '@/lib/luyentap/exercise-display.utils';
import LuyentapCheckAnswerList, { type CheckAnswerItem } from '@/components/luyentap/LuyentapCheckAnswerList';
import ExerciseCoinWheelModal from '@/components/luyentap/ExerciseCoinWheelModal';
import { formatCoinSpinResult } from '@/lib/luyentap/exercise-coin-wheel.utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface LuyentapCheckClientProps {
    slug: string;
    answerId: string | null;
    scoreParam: number;
    passedParam: boolean;
    coinsParam: number;
    totalParam: number;
}

interface CheckAnswer extends CheckAnswerItem {}

interface ExerciseQuestionMeta {
    _id?: string;
    type?: string;
    question?: string;
    groupTitle?: string;
    options?: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
    trueFalseOptions?: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
    correctAnswer?: string;
    leftItems?: Array<{ text: string }>;
    rightItems?: Array<{ text: string }>;
    matchingPairs?: Array<{ leftIndex: number; rightIndex: number }>;
    explanation?: string;
    sampleAnswer?: string;
}

interface CheckResult {
    percentage: number;
    totalScore?: number;
    totalPoints?: number;
    passThreshold: number;
    passed: boolean;
    coinsAwarded: number;
    coinSpinClaimed?: boolean;
    resolvedAnswerId?: string | null;
    totalQuestions: number;
    correctCount: number;
    timeSpent?: number;
    submittedAt?: string;
    essayGradingPending?: boolean;
    exerciseTitle?: string;
    exerciseQuestions?: ExerciseQuestionMeta[];
    answers: CheckAnswer[];
    canViewScore?: boolean;
    canViewAnswers?: boolean;
    canAttempt?: boolean;
    overallFeedback?: string;
}

const PAGE_PX = 'px-3 md:px-4 lg:px-[60px]';

function formatDurationShort(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
}

function formatExamDate(date?: string) {
    if (!date) return '—';
    return format(new Date(date), 'HH:mm - d/M/yyyy', { locale: vi });
}

function ScoreRing({
    score,
    totalPoints,
    effectivePercentage,
    passed,
    compact = false,
    desktop = false,
}: {
    score: number;
    totalPoints: number;
    effectivePercentage: number;
    passed: boolean;
    compact?: boolean;
    desktop?: boolean;
}) {
    const ratio = Math.min(1, Math.max(0, effectivePercentage / 100));
    const circumference = 2 * Math.PI * 42;
    const offset = circumference * (1 - ratio);
    const size = desktop
        ? 'h-32 w-32'
        : compact
            ? 'h-24 w-24'
            : 'h-36 w-36';

    return (
        <div className={cn('relative', (compact || desktop) ? 'shrink-0' : 'mx-auto', size)}>
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
                <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="9" className="text-[var(--cn-border)]" />
                <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={cn('transition-all duration-700', passed ? 'text-emerald-500' : 'text-amber-500')}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
                <span className={cn(
                    'font-bold leading-none text-[var(--cn-text-main)]',
                    desktop ? 'text-3xl' : compact ? 'text-xl' : 'text-3xl',
                )}>
                    {formatPercentageValue(effectivePercentage)}%
                </span>
                {totalPoints > 0 && (desktop || !compact) && (
                    <span className={cn(
                        'mt-1 text-[var(--cn-text-muted)]',
                        desktop ? 'text-xs' : 'text-[10px]',
                    )}>
                        {formatScoreScaleLabel(score, totalPoints)}
                    </span>
                )}
            </div>
        </div>
    );
}

function MetaItemCompact({
    icon,
    label,
    value,
    desktop = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    desktop?: boolean;
}) {
    return (
        <div className={cn(
            'flex items-center gap-2.5 rounded-lg border border-[var(--cn-border)] bg-[var(--cn-bg-section)]',
            desktop ? 'px-4 py-3' : 'px-3 py-2',
        )}>
            <div className={cn(
                'flex shrink-0 items-center justify-center rounded-md bg-[var(--cn-bg-card)] text-[var(--cn-primary)]',
                desktop ? 'h-9 w-9' : 'h-7 w-7',
            )}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className={cn(
                    'text-[var(--cn-text-muted)]',
                    desktop ? 'text-xs' : 'text-[10px]',
                )}>
                    {label}
                </p>
                <p className={cn(
                    'truncate font-semibold text-[var(--cn-text-main)]',
                    desktop ? 'text-sm' : 'text-xs',
                )}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function buildResultPayload(
    input: {
        percentage: number;
        totalScore?: number;
        totalPoints?: number;
        passThreshold: number;
        coinsAwarded?: number;
        coinSpinClaimed?: boolean;
        resolvedAnswerId?: string | null;
        totalQuestions: number;
        correctCount: number;
        timeSpent?: number;
        submittedAt?: string;
        essayGradingPending?: boolean;
        exerciseTitle?: string;
        exerciseQuestions?: ExerciseQuestionMeta[];
        answers: CheckAnswer[];
        canViewScore?: boolean;
        canViewAnswers?: boolean;
        canAttempt?: boolean;
        overallFeedback?: string;
    },
): CheckResult {
    const totalPoints = input.totalPoints ?? 0;
    const totalScore = input.totalScore;
    const essayMaxPoints = resolveEssayMaxPoints({ questions: input.exerciseQuestions });

    const passPercentage = Math.max(
        resolveExercisePassPercentage(totalScore, totalPoints, {
            percentage: input.percentage,
            essayGradingPending: input.essayGradingPending,
            essayMaxPoints,
        }),
        Number(input.percentage) || 0,
    );

    return {
        ...input,
        totalPoints,
        totalScore,
        passed: passPercentage >= input.passThreshold,
        percentage: passPercentage,
        coinsAwarded: input.coinsAwarded ?? 0,
        coinSpinClaimed: Boolean(input.coinSpinClaimed),
        resolvedAnswerId: input.resolvedAnswerId ?? null,
        canViewScore: input.canViewScore ?? true,
        canViewAnswers: input.canViewAnswers ?? true,
        canAttempt: input.canAttempt ?? true,
    };
}

export default function LuyentapCheckClient({
    slug,
    answerId,
    scoreParam,
    passedParam,
    coinsParam,
    totalParam,
}: LuyentapCheckClientProps) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [wheelOpen, setWheelOpen] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            try {
                if (answerId) {
                    const res = await luyentapApi.getUserAnswer(slug, answerId);
                    const data = res.data || res;
                    const answers: CheckAnswer[] = data.answers || [];
                    const exercise = data.exercise || {};
                    const exerciseQuestions = exercise.questions?.length
                        ? exercise.questions
                        : answers.map((item) => item.question).filter(Boolean);
                    const totalQuestions = exerciseQuestions.length || exercise.questionCount || answers.length;
                    const correctCount = answers.filter((a) => a.isCorrect).length;
                    const totalPoints = resolveExerciseTotalPoints(exercise);
                    const passThreshold = Number(exercise.passThreshold) || 80;
                    const totalScore = data.totalScore != null
                        ? Number(data.totalScore)
                        : resolveAttemptScore({ percentage: data.percentage }, totalPoints) ?? undefined;

                    if (!active) return;

                    let canAttempt = true;
                    const exerciseId = exercise._id ? String(exercise._id) : '';
                    if (token && exerciseId) {
                        try {
                            const attempts = await luyentapApi.checkUserAttempts(exerciseId);
                            canAttempt = Boolean(attempts.canAttempt);
                        } catch {
                            canAttempt = true;
                        }
                    }

                    setResult(buildResultPayload({
                        percentage: Number(data.percentage) || 0,
                        totalScore,
                        totalPoints,
                        passThreshold,
                        coinsAwarded: data.coinsAwarded || 0,
                        coinSpinClaimed: Boolean(data.coinSpinClaimed),
                        resolvedAnswerId: data._id || answerId,
                        totalQuestions,
                        correctCount,
                        timeSpent: data.timeSpent,
                        submittedAt: data.submittedAt,
                        essayGradingPending: Boolean(data.essayGradingPending),
                        exerciseTitle: exercise.title,
                        exerciseQuestions,
                        answers,
                        canViewScore: data.canViewScore !== false,
                        canViewAnswers: data.canViewAnswers === true,
                        canAttempt,
                        overallFeedback: data.overallFeedback || '',
                    }));
                    return;
                }

                const exercise = await luyentapApi.getExerciseBySlug(slug).catch(() => null);
                const totalPoints = resolveExerciseTotalPoints(exercise);
                const passThreshold = Number(exercise?.passThreshold) || 80;
                const totalScore = totalPoints > 0
                    ? (scoreParam / 100) * totalPoints
                    : scoreParam;

                if (!active) return;
                setResult(buildResultPayload({
                    percentage: scoreParam,
                    totalScore,
                    totalPoints,
                    passThreshold,
                    coinsAwarded: coinsParam,
                    totalQuestions: totalParam,
                    correctCount: Math.round((scoreParam / 100) * totalParam),
                    exerciseTitle: exercise?.title,
                    answers: [],
                }));
            } catch {
                if (!active) return;
                setResult(buildResultPayload({
                    percentage: scoreParam,
                    passThreshold: 80,
                    coinsAwarded: coinsParam,
                    totalQuestions: totalParam,
                    correctCount: Math.round((scoreParam / 100) * totalParam),
                    answers: [],
                }));
            } finally {
                if (active) setLoading(false);
            }
        };

        void load();
        return () => { active = false; };
    }, [slug, answerId, scoreParam, passedParam, coinsParam, totalParam]);

    const displayScore = useMemo(() => {
        if (!result) return null;
        return result.totalScore ?? resolveAttemptScore({ percentage: result.percentage }, result.totalPoints ?? 0);
    }, [result]);

    if (loading || !result) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--cn-bg-main)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    const {
        totalPoints = 0,
        passThreshold,
        coinsAwarded,
        coinSpinClaimed,
        resolvedAnswerId,
        totalQuestions,
        correctCount,
        timeSpent,
        submittedAt,
        essayGradingPending,
        exerciseTitle,
        exerciseQuestions,
        answers,
        canViewScore = true,
        canViewAnswers = true,
    } = result;

    const wrongCount = totalQuestions - correctCount;
    const scoreValue = displayScore ?? 0;
    const threshold = passThreshold || 80;
    const essayMaxPoints = resolveEssayMaxPoints({ questions: exerciseQuestions });
    const effectivePercentage = Math.max(
        resolveExercisePassPercentage(
            result.totalScore ?? scoreValue,
            totalPoints,
            {
                percentage: result.percentage,
                essayGradingPending,
                essayMaxPoints,
            },
        ),
        Number(result.percentage) || 0,
    );
    const isPassed = canViewScore && effectivePercentage >= threshold;
    const canSpinCoin = canViewScore && isPassed
        && Boolean(resolvedAnswerId)
        && !coinSpinClaimed
        && coinsAwarded <= 0;
    const spinCompleted = Boolean(coinSpinClaimed) || coinsAwarded > 0;

    const handleCoinSpun = (amount: number) => {
        setResult((prev) => prev ? {
            ...prev,
            coinsAwarded: amount,
            coinSpinClaimed: true,
        } : prev);
    };

    const coinSpinBlock = (desktop = false) => {
        if (!isPassed) return null;

        if (canSpinCoin) {
            return (
                <div className={desktop ? 'mt-2 pl-[52px]' : 'mt-2'}>
                    <CustomButton
                        size={desktop ? 'medium' : 'small'}
                        onClick={() => setWheelOpen(true)}
                        className="gap-2 bg-amber-500 hover:bg-amber-600"
                    >
                        <Sparkles className={desktop ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
                        Quay xu
                    </CustomButton>
                </div>
            );
        }

        if (!spinCompleted) return null;

        return (
            <div className={desktop ? 'mt-2 pl-[52px]' : 'mt-2'}>
                {coinsAwarded > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        <Sparkles className="h-3.5 w-3.5" />
                        {formatCoinSpinResult(coinsAwarded)}
                    </span>
                ) : (
                    <p className="text-xs font-medium text-[var(--cn-text-sub)]">
                        {formatCoinSpinResult(0)}
                    </p>
                )}
            </div>
        );
    };

    const answerList = canViewAnswers ? (
        <LuyentapCheckAnswerList
            answers={answers}
            exerciseQuestions={exerciseQuestions}
            correctCount={correctCount}
            wrongCount={wrongCount}
            totalQuestions={totalQuestions}
            desktopFill
        />
    ) : (
        <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-8 text-center">
            <p className="text-sm font-medium text-[var(--cn-text-main)]">Bài làm đã được nộp</p>
            <p className="mt-2 text-sm text-[var(--cn-text-sub)]">
                Đáp án chi tiết sẽ được công bố khi hết hạn giao đề
            </p>
        </div>
    );

    const overallFeedback = result.overallFeedback?.trim() || '';
    const feedbackPanel = overallFeedback ? (
        <section className="mb-4 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/50 shadow-sm lg:mb-5 lg:shrink-0">
            <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <MessageSquareText className="h-4 w-4" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">Nhận xét của giáo viên</h2>
                    <p className="text-xs text-blue-700">Nhận xét chung cho bài làm của bạn</p>
                </div>
            </div>
            <div className="px-4 py-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {overallFeedback}
                </p>
            </div>
        </section>
    ) : null;

    const resultStatusTitle = !canViewScore
        ? 'Đã nộp bài'
        : (isPassed ? 'Đạt yêu cầu' : 'Chưa đạt');

    const resultStatusHint = !canViewScore
        ? 'Điểm sẽ được công bố theo cấu hình giáo viên'
        : (isPassed ? `≥ ${threshold}%` : `Cần ≥ ${threshold}%`);

    const scoreRingBlock = (compact = false) => (
        canViewScore ? (
            <ScoreRing
                score={scoreValue}
                totalPoints={totalPoints}
                effectivePercentage={effectivePercentage}
                passed={isPassed}
                compact={compact}
            />
        ) : (
            <div className={cn(
                'flex shrink-0 items-center justify-center rounded-full bg-[var(--cn-bg-section)] text-center font-medium text-[var(--cn-text-sub)]',
                compact ? 'h-24 w-24 text-[11px]' : 'h-32 w-32 text-xs',
            )}>
                Chờ<br />công bố
            </div>
        )
    );

    const statsGrid = (desktop = false) => (
        canViewScore ? (
        <div className={cn(
            'grid shrink-0 grid-cols-3 gap-1.5 border-t border-[var(--cn-border)]',
            desktop ? 'gap-2 p-3' : 'p-3',
        )}>
            <div className={cn(
                'rounded-md bg-[var(--cn-bg-section)] text-center',
                desktop ? 'px-2 py-2.5' : 'px-1.5 py-2',
            )}>
                <p className={cn('text-[var(--cn-text-sub)]', desktop ? 'text-[11px]' : 'text-[10px]')}>Tổng</p>
                <p className={cn('font-bold text-[var(--cn-primary)]', desktop ? 'text-lg' : 'text-base')}>{totalQuestions}</p>
            </div>
            <div className={cn(
                'rounded-md bg-emerald-50 text-center',
                desktop ? 'px-2 py-2.5' : 'px-1.5 py-2',
            )}>
                <p className={cn('text-emerald-700', desktop ? 'text-[11px]' : 'text-[10px]')}>Đúng</p>
                <p className={cn('font-bold text-emerald-600', desktop ? 'text-lg' : 'text-base')}>{correctCount}</p>
            </div>
            <div className={cn(
                'rounded-md bg-red-50 text-center',
                desktop ? 'px-2 py-2.5' : 'px-1.5 py-2',
            )}>
                <p className={cn('text-red-700', desktop ? 'text-[11px]' : 'text-[10px]')}>Sai</p>
                <p className={cn('font-bold text-red-600', desktop ? 'text-lg' : 'text-base')}>{wrongCount}</p>
            </div>
        </div>
        ) : null
    );

    const metaBlock = (desktop = false) => (
        (timeSpent != null || submittedAt) ? (
            <div className={cn(
                'shrink-0 space-y-2 border-t border-[var(--cn-border)] p-3',
            )}>
                {timeSpent != null && (
                    <MetaItemCompact
                        desktop={desktop}
                        icon={<Clock className={desktop ? 'h-4 w-4' : 'h-3.5 w-3.5'} />}
                        label="Thời gian làm bài"
                        value={formatDurationShort(timeSpent)}
                    />
                )}
                {submittedAt && (
                    <MetaItemCompact
                        desktop={desktop}
                        icon={<CheckCircle2 className={desktop ? 'h-4 w-4' : 'h-3.5 w-3.5'} />}
                        label="Thời gian nộp"
                        value={formatExamDate(submittedAt)}
                    />
                )}
            </div>
        ) : null
    );

    const actionButtons = (desktop = false) => (
        <div className={cn(
            'flex shrink-0 flex-col border-t border-[var(--cn-border)] bg-[var(--cn-bg-card)]',
            desktop ? 'mt-auto gap-2 p-3' : 'gap-2 p-3',
        )}>
            <CustomButton
                variant="outline"
                size="medium"
                onClick={() => router.push(`/luyentap/${slug}`)}
                className="w-full gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Về chi tiết đề
            </CustomButton>
            {result.canAttempt !== false ? (
                <CustomButton
                    size="medium"
                    onClick={() => router.push(`/luyentap/${slug}/lambai`)}
                    className="w-full gap-2"
                >
                    <RotateCcw className="h-4 w-4" />
                    Làm lại
                </CustomButton>
            ) : (
                <CustomButton size="medium" disabled className="w-full gap-2">
                    Đã hết lượt
                </CustomButton>
            )}
        </div>
    );

    const statsPanel = (
        <>
            {/* Mobile / tablet */}
            <aside className="lg:hidden">
                <section className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
                    <div className={cn(
                        'flex items-center gap-4 px-4 py-4',
                        isPassed ? 'bg-emerald-50/60' : 'bg-amber-50/60',
                    )}>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5">
                                <div className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                    isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600',
                                )}>
                                    {isPassed
                                        ? <CheckCircle2 className="h-4 w-4" />
                                        : <XCircle className="h-4 w-4" />}
                                </div>
                                <h1 className="text-base font-bold text-[var(--cn-text-main)]">
                                    {resultStatusTitle}
                                </h1>
                            </div>
                            <p className="mt-1.5 pl-10.5 text-xs text-[var(--cn-text-sub)]">
                                {canViewScore && totalPoints > 0 && (
                                    <span className="font-medium text-[var(--cn-text-main)]">
                                        {formatScoreValue(scoreValue)}/{totalPoints} điểm
                                        {' · '}
                                    </span>
                                )}
                                {resultStatusHint}
                            </p>
                            {essayGradingPending && (
                                <p className="mt-1 pl-10.5 text-[11px] font-medium text-amber-700">
                                    Chưa gồm điểm tự luận
                                </p>
                            )}
                            {coinSpinBlock(false)}
                        </div>
                        {scoreRingBlock(true)}
                    </div>
                    {statsGrid(false)}
                    {metaBlock(false)}
                    {actionButtons(false)}
                </section>
            </aside>

            {/* Laptop+ */}
            <aside className="hidden lg:flex lg:h-full lg:max-h-full lg:min-h-0">
                <section className="flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
                    <div className={cn(
                        'flex shrink-0 items-center gap-4 px-5 py-4',
                        isPassed ? 'bg-emerald-50/70' : 'bg-amber-50/70',
                    )}>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                    isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600',
                                )}>
                                    {isPassed
                                        ? <CheckCircle2 className="h-5 w-5" />
                                        : <XCircle className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold text-[var(--cn-text-main)]">
                                        {resultStatusTitle}
                                    </h1>
                                    <p className="truncate text-xs text-[var(--cn-text-sub)]">
                                        {exerciseTitle || 'Kết quả bài làm'}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-2 pl-[52px] text-sm text-[var(--cn-text-sub)]">
                                {canViewScore && totalPoints > 0 && (
                                    <span className="font-semibold text-[var(--cn-text-main)]">
                                        {formatScoreValue(scoreValue)}/{totalPoints} điểm
                                        {' · '}
                                    </span>
                                )}
                                {resultStatusHint}
                            </p>
                            {essayGradingPending && (
                                <p className="mt-1 pl-[52px] text-[11px] font-medium text-amber-700">
                                    Chưa gồm điểm tự luận
                                </p>
                            )}
                            {coinSpinBlock(true)}
                        </div>
                        {scoreRingBlock(true)}
                    </div>
                    {statsGrid(true)}
                    {metaBlock(true)}
                    {actionButtons(true)}
                </section>
            </aside>
        </>
    );

    return (
        <div className="min-h-screen bg-[var(--cn-bg-main)] pb-12 pt-4 md:pt-6 lg:flex lg:h-dvh lg:max-h-dvh lg:flex-col lg:overflow-hidden lg:pb-4 lg:pt-4">
            <div className={cn('mx-auto flex h-full min-h-0 w-full flex-1 flex-col', PAGE_PX)}>
                <nav className="mb-5 flex shrink-0 items-center gap-2 text-xs text-[var(--cn-text-sub)] md:text-sm lg:mb-3">
                    <Link href="/" className="flex items-center gap-1 transition hover:text-[var(--cn-text-main)]">
                        <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)]" />
                    <Link href="/luyentap" className="transition hover:text-[var(--cn-text-main)]">
                        Luyện tập
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)]" />
                    <Link href={`/luyentap/${slug}`} className="line-clamp-1 transition hover:text-[var(--cn-text-main)]">
                        {exerciseTitle || 'Chi tiết đề'}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)]" />
                    <span className="font-medium text-[var(--cn-text-main)]">Kết quả</span>
                </nav>

                <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-5 lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="order-2 min-w-0 lg:order-1 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
                        {feedbackPanel}
                        {answerList}
                    </div>
                    <div className="order-1 lg:order-2 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
                        {statsPanel}
                    </div>
                </div>
            </div>

            {resolvedAnswerId && (
                <ExerciseCoinWheelModal
                    open={wheelOpen}
                    onClose={() => setWheelOpen(false)}
                    slug={slug}
                    answerId={resolvedAnswerId}
                    onSpun={handleCoinSpun}
                />
            )}
        </div>
    );
}
