'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, CheckCircle2, Circle, Clock, Eye, ListChecks, Loader2, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { luyentapApi } from '@/lib/api/luyentap.api';
import type { Exercise, ExerciseAttempt } from '@/lib/api/luyentap.api';
import { mapBackendQuestion, buildSubmitPayload } from '@/lib/utils/luyentap.mapper';
import { isQuestionAnswered } from '@/lib/luyentap/question-answer.utils';
import { formatGroupTitleDisplay } from '@/lib/luyentap/exercise-display.utils';
import {
    clearTakeSession,
    loadTakeSession,
    saveTakeSession,
} from '@/lib/luyentap/take-session';
import {
    applyTakeShuffleState,
    isTakeShuffleStateEffective,
    normalizeTakeShuffleState,
    resolveTakeShuffleState,
    type TakeShuffleState,
} from '@/lib/luyentap/take-shuffle';
import type { PracticeQuestion, PracticeAnswer } from '@/types/luyentap.type';
import QuestionTaker from '@/components/luyentap/QuestionTaker';
import LuyentapPreExamNoticeModal from '@/components/luyentap/LuyentapPreExamNoticeModal';
import { CustomButton } from '@/components/custom/CustomButton';
import { readStoredExamPassword } from '@/lib/luyentap/exercise-availability.utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface LuyentapLamBaiClientProps {
    slug: string;
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const PAGE_PX = 'px-3 md:px-4 lg:px-[60px]';

function resolveApiErrorMessage(err: unknown, fallback: string) {
    if (err && typeof err === 'object' && 'response' in err) {
        const data = (err as { response?: { data?: { message?: string; error?: string } } }).response?.data;
        if (data?.message) return data.message;
        if (typeof data?.error === 'string') return data.error;
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
}

export default function LuyentapLamBaiClient({ slug }: LuyentapLamBaiClientProps) {
    const router = useRouter();
    const { token } = useAuthStore();
    const startTimeRef = useRef(Date.now());
    const questionRefs = useRef<Array<HTMLDivElement | null>>([]);
    const originalQuestionsRef = useRef<PracticeQuestion[]>([]);
    const shuffleStateRef = useRef<TakeShuffleState | null>(null);
    const attemptIdRef = useRef<string | null>(null);
    const expiresAtRef = useRef<number>(0);
    const submitLockRef = useRef(false);
    const expiredHandledRef = useRef(false);
    const tabSwitchCountRef = useRef(0);

    const [exerciseSlug, setExerciseSlug] = useState(slug);
    const [title, setTitle] = useState('');
    const [proctoring, setProctoring] = useState<'off' | 'tab-switch'>('off');
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [mobileListOpen, setMobileListOpen] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [preExamOpen, setPreExamOpen] = useState(false);
    const [preExamContent, setPreExamContent] = useState('');
    const [pendingExerciseData, setPendingExerciseData] = useState<Exercise | null>(null);
    const sessionReadyRef = useRef(false);
    const saveProgressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const saveProgressToServer = useCallback(async (
        nextAnswers = answers,
        nextActiveIndex = activeIndex,
        nextTabSwitchCount = tabSwitchCountRef.current,
    ) => {
        const attemptId = attemptIdRef.current;
        if (!attemptId || !slug) return;

        try {
            await luyentapApi.saveExerciseAttemptProgress(slug, attemptId, {
                draftAnswers: nextAnswers,
                activeIndex: nextActiveIndex,
                timeSpent: Math.floor((Date.now() - startTimeRef.current) / 1000),
                tabSwitchCount: nextTabSwitchCount,
                shuffleState: shuffleStateRef.current
                    ? {
                        questionOrder: shuffleStateRef.current.questionOrder,
                        shuffles: shuffleStateRef.current.shuffles,
                        shuffleQuestions: shuffleStateRef.current.shuffleQuestions,
                        shuffleAnswers: shuffleStateRef.current.shuffleAnswers,
                    }
                    : null,
            });
        } catch {
            // autosave im lặng
        }
    }, [slug, answers, activeIndex]);

    const saveTabSwitchToServer = useCallback(async (count: number) => {
        const attemptId = attemptIdRef.current;
        if (!attemptId || !slug) return;

        try {
            await luyentapApi.saveExerciseAttemptProgress(slug, attemptId, {
                tabSwitchCount: count,
                timeSpent: Math.floor((Date.now() - startTimeRef.current) / 1000),
            });
        } catch {
            // im lặng
        }
    }, [slug]);

    const applyAttemptSession = useCallback(async (data: Exercise, attempt: ExerciseAttempt) => {
        const durationSeconds = (data.duration || 30) * 60;
        const mappedQuestions = (data.questions || []).map(mapBackendQuestion);
        const shuffleQuestions = Boolean(data.shuffleQuestions);
        const shuffleAnswers = Boolean(data.shuffleAnswers);

        originalQuestionsRef.current = mappedQuestions;
        attemptIdRef.current = attempt._id;

        const startedAtMs = new Date(attempt.startedAt).getTime();
        const expiresAtMs = new Date(attempt.expiresAt).getTime();
        startTimeRef.current = startedAtMs;
        expiresAtRef.current = expiresAtMs;
        expiredHandledRef.current = false;
        submitLockRef.current = false;
        const timeRemaining = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));

        const backendShuffleCandidate = attempt.shuffleState?.questionOrder?.length
            ? normalizeTakeShuffleState({
                questionOrder: attempt.shuffleState.questionOrder,
                shuffles: (attempt.shuffleState.shuffles ?? {}) as TakeShuffleState['shuffles'],
                shuffleQuestions: Boolean(attempt.shuffleState.shuffleQuestions),
                shuffleAnswers: Boolean(attempt.shuffleState.shuffleAnswers),
            })
            : undefined;

        const shuffleState = resolveTakeShuffleState(
            mappedQuestions,
            shuffleQuestions,
            shuffleAnswers,
            backendShuffleCandidate,
        );

        shuffleStateRef.current = shuffleState;

        const shouldPersistShuffle = Boolean(
            shuffleState
            && (
                !backendShuffleCandidate
                || !isTakeShuffleStateEffective(
                    backendShuffleCandidate,
                    mappedQuestions,
                    shuffleQuestions,
                    shuffleAnswers,
                )
            ),
        );

        if (shouldPersistShuffle && shuffleState) {
            try {
                await luyentapApi.saveExerciseAttemptProgress(slug, attempt._id, {
                    shuffleState: {
                        questionOrder: shuffleState.questionOrder,
                        shuffles: shuffleState.shuffles,
                        shuffleQuestions: shuffleState.shuffleQuestions,
                        shuffleAnswers: shuffleState.shuffleAnswers,
                    },
                    timeSpent: Math.floor((Date.now() - startedAtMs) / 1000),
                });
            } catch {
                // không chặn vào bài nếu lưu shuffle thất bại
            }
        }

        const displayQuestions = shuffleState
            ? applyTakeShuffleState(mappedQuestions, shuffleState)
            : mappedQuestions;

        const draftAnswers = attempt.draftAnswers && typeof attempt.draftAnswers === 'object'
            ? attempt.draftAnswers as Record<string, unknown>
            : {};
        const restoredTabSwitchCount = Math.max(0, Number(attempt.tabSwitchCount) || 0);

        setTitle(data.title);
        setExerciseSlug(data.slug || slug);
        setProctoring(data.proctoring === 'tab-switch' ? 'tab-switch' : 'off');
        setTabSwitchCount(restoredTabSwitchCount);
        tabSwitchCountRef.current = restoredTabSwitchCount;
        setQuestions(displayQuestions);
        setAnswers(draftAnswers);
        setActiveIndex(attempt.activeIndex ?? 0);
        setTimeLeft(timeRemaining);

        saveTakeSession(slug, {
            attemptId: attempt._id,
            startedAt: startedAtMs,
            durationSeconds,
            answers: draftAnswers,
            activeIndex: attempt.activeIndex ?? 0,
            tabSwitchCount: restoredTabSwitchCount,
            questionOrder: shuffleState?.questionOrder,
            shuffles: shuffleState?.shuffles,
            shuffleQuestions,
            shuffleAnswers,
        });

        sessionReadyRef.current = true;
    }, [slug]);

    const startAttemptSession = useCallback(async (
        data: Exercise,
        options?: { acknowledgePreExam?: boolean },
    ) => {
        const attempt = await luyentapApi.startExerciseAttempt(slug, {
            examPassword: readStoredExamPassword(slug),
            acknowledgePreExam: options?.acknowledgePreExam,
        });
        await applyAttemptSession(data, attempt);
    }, [slug, applyAttemptSession]);

    const fetchExercise = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const data = await luyentapApi.getExerciseForTaking(slug);

            try {
                await startAttemptSession(data);
            } catch (err: unknown) {
                const message = resolveApiErrorMessage(err, '');
                if (message.includes('PRE_EXAM_ACK_REQUIRED') && data.preExamNoticeEnabled) {
                    setPendingExerciseData(data);
                    setPreExamContent(data.preExamNotice || '');
                    setPreExamOpen(true);
                    setLoading(false);
                    return;
                }
                throw err;
            }
        } catch (err: unknown) {
            toast.error(resolveApiErrorMessage(err, 'Không thể tải bài tập'));
            router.push(`/luyentap/${slug}`);
        } finally {
            setLoading(false);
        }
    }, [slug, router, startAttemptSession]);

    const handlePreExamConfirm = useCallback(async () => {
        if (!pendingExerciseData) return;
        setPreExamOpen(false);
        setLoading(true);
        try {
            await startAttemptSession(pendingExerciseData, { acknowledgePreExam: true });
            setPendingExerciseData(null);
        } catch (err: unknown) {
            toast.error(resolveApiErrorMessage(err, 'Không thể bắt đầu làm bài'));
            router.push(`/luyentap/${slug}`);
        } finally {
            setLoading(false);
        }
    }, [pendingExerciseData, slug, router, startAttemptSession]);

    useEffect(() => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để làm bài');
            router.push('/login');
            return;
        }
        fetchExercise();
    }, [token, fetchExercise, router]);

    useEffect(() => {
        if (!slug || loading || !sessionReadyRef.current) return;

        const saved = loadTakeSession(slug);
        if (!saved) return;

        saveTakeSession(slug, {
            ...saved,
            attemptId: attemptIdRef.current ?? saved.attemptId,
            answers,
            activeIndex,
            tabSwitchCount: tabSwitchCountRef.current,
            questionOrder: shuffleStateRef.current?.questionOrder,
            shuffles: shuffleStateRef.current?.shuffles,
            shuffleQuestions: shuffleStateRef.current?.shuffleQuestions,
            shuffleAnswers: shuffleStateRef.current?.shuffleAnswers,
        });

        if (saveProgressTimerRef.current) {
            clearTimeout(saveProgressTimerRef.current);
        }
        saveProgressTimerRef.current = setTimeout(() => {
            void saveProgressToServer(answers, activeIndex);
        }, 800);
    }, [slug, loading, answers, activeIndex, saveProgressToServer]);

    useEffect(() => () => {
        if (saveProgressTimerRef.current) {
            clearTimeout(saveProgressTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (loading || proctoring !== 'tab-switch') return;

        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'hidden') return;
            if (submitLockRef.current || submitting) return;

            const next = tabSwitchCountRef.current + 1;
            tabSwitchCountRef.current = next;
            setTabSwitchCount(next);

            const saved = loadTakeSession(slug);
            if (saved) {
                saveTakeSession(slug, { ...saved, tabSwitchCount: next });
            }

            void saveTabSwitchToServer(next);
            toast.warning(`Cảnh báo: Bạn đã rời khỏi màn hình (${next} lần)`);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [loading, proctoring, submitting, slug, saveTabSwitchToServer]);

    const answeredCount = useMemo(
        () => questions.filter((q) => isQuestionAnswered(q, answers[q._id!])).length,
        [questions, answers],
    );

    const progressPercent = questions.length > 0
        ? Math.round((answeredCount / questions.length) * 100)
        : 0;

    const scrollToQuestion = useCallback((index: number) => {
        setActiveIndex(index);
        setMobileListOpen(false);
        const node = questionRefs.current[index];
        if (!node) return;
        const top = node.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top, behavior: 'smooth' });
    }, []);

    const handleConfirmLeave = useCallback(async () => {
        setShowLeaveModal(false);
        await saveProgressToServer();
        router.push(`/luyentap/${exerciseSlug}`);
    }, [router, exerciseSlug, saveProgressToServer]);

    const handleSubmit = useCallback(async (options?: { auto?: boolean }) => {
        if (!slug || submitting || submitLockRef.current) return;

        const isAuto = options?.auto === true;

        submitLockRef.current = true;
        setSubmitting(true);
        setShowSubmitModal(false);
        try {
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const payload = buildSubmitPayload(questions, answers, {
                originalQuestions: originalQuestionsRef.current,
                shuffles: shuffleStateRef.current?.shuffles,
            });
            const res = await luyentapApi.submitExerciseAnswer(slug, {
                attemptId: attemptIdRef.current ?? undefined,
                answers: payload,
                timeSpent,
            });
            clearTakeSession(slug);
            const result = res.data || res;
            const answerId = result._id;
            const percentage = result.percentage ?? 0;
            const coins = result.coinsAwarded ?? 0;
            const passed = percentage >= 80;

            if (isAuto) {
                toast.info('Hết giờ! Bài làm đã được tự động nộp.');
            }

            router.push(
                `/luyentap/${exerciseSlug}/check?answerId=${answerId}&score=${percentage}&passed=${passed}&coins=${coins}&total=${questions.length}`,
            );
        } catch (err: unknown) {
            submitLockRef.current = false;
            toast.error(err instanceof Error ? err.message : 'Nộp bài thất bại');
        } finally {
            setSubmitting(false);
        }
    }, [slug, exerciseSlug, submitting, answers, questions, router]);

    const handleSubmitClick = useCallback(() => {
        if (submitting || submitLockRef.current) return;
        setShowSubmitModal(true);
    }, [submitting]);

    const unansweredCount = questions.length - answeredCount;

    useEffect(() => {
        if (loading || !sessionReadyRef.current) return;

        const tick = () => {
            const remaining = Math.max(0, Math.floor((expiresAtRef.current - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0 && !expiredHandledRef.current) {
                expiredHandledRef.current = true;
                void handleSubmit({ auto: true });
            }
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [loading, handleSubmit]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--cn-bg-main)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-primary)]" />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--cn-bg-main)]">
                <p className="text-[var(--cn-text-sub)]">Không có câu hỏi trong đề thi</p>
                <button
                    type="button"
                    onClick={() => router.push(`/luyentap/${exerciseSlug}`)}
                    className="text-sm font-medium text-[var(--cn-primary)] hover:underline"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const questionListContent = (
        <>
            <div className="max-h-[min(70vh,560px)] overflow-y-auto p-3">
                <div className="space-y-3">
                    {questions.map((q, index) => {
                        const showSection = Boolean(
                            q.groupTitle && q.groupTitle !== questions[index - 1]?.groupTitle,
                        );
                        const qid = q._id!;
                        const done = isQuestionAnswered(q, answers[qid]);
                        const active = index === activeIndex;

                        return (
                            <React.Fragment key={qid || index}>
                                {showSection && q.groupTitle && (
                                    <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--cn-primary)]">
                                        {formatGroupTitleDisplay(q.groupTitle)}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => scrollToQuestion(index)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition',
                                        active
                                            ? 'border-[var(--cn-primary)] bg-[var(--cn-primary)]/10 ring-1 ring-inset ring-[var(--cn-primary)]/30'
                                            : done
                                                ? 'border-emerald-200 bg-emerald-50/80 hover:border-emerald-300'
                                                : 'border-[var(--cn-border)] bg-[var(--cn-bg-section)] hover:border-[var(--cn-primary)]/30',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                            active
                                                ? 'bg-[var(--cn-primary)] text-white'
                                                : done
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-[var(--cn-bg-card)] text-[var(--cn-text-sub)]',
                                        )}
                                    >
                                        {index + 1}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-xs font-medium',
                                            done ? 'text-emerald-600' : 'text-[var(--cn-text-muted)]',
                                        )}
                                    >
                                        {done ? 'Đã làm' : 'Chưa làm'}
                                    </span>
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-[var(--cn-border)] p-3">
                <div className="flex items-center gap-2 text-xs text-[var(--cn-text-sub)]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Đã làm</span>
                    <Circle className="ml-3 h-3.5 w-3.5 text-[var(--cn-text-muted)]" />
                    <span>Chưa làm</span>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-[var(--cn-bg-main)] pb-[4.5rem] lg:pb-0">
            <header className="sticky top-0 z-20 border-b border-[var(--cn-border)] bg-[var(--cn-bg-card)]/95 backdrop-blur">
                <div className={cn('mx-auto flex max-w-7xl items-center justify-between gap-2 py-3.5 md:gap-3 md:py-4', PAGE_PX)}>
                    <button
                        type="button"
                        onClick={() => setShowLeaveModal(true)}
                        className="inline-flex shrink-0 items-center gap-2 text-sm text-[var(--cn-text-sub)] transition hover:text-[var(--cn-text-main)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Quay lại</span>
                    </button>

                    <div className="min-w-0 flex-1 px-1 text-center md:px-2">
                        <p className="truncate text-sm font-semibold text-[var(--cn-text-main)] md:text-base">{title}</p>
                        <p className="text-xs text-[var(--cn-text-muted)]">
                            {answeredCount}/{questions.length} câu · {progressPercent}%
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 md:gap-3">
                        {proctoring === 'tab-switch' && (
                            <div
                                className={cn(
                                    'hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold md:px-3 md:py-2.5',
                                    tabSwitchCount > 0
                                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                                        : 'border-[var(--cn-border)] bg-[var(--cn-bg-section)] text-[var(--cn-text-sub)]',
                                )}
                                title="Số lần rời khỏi màn hình"
                            >
                                <Eye className="h-4 w-4" />
                                Rời màn hình: {tabSwitchCount}
                            </div>
                        )}
                        <div
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-xs font-bold md:px-3 md:py-2.5 md:text-sm',
                                timeLeft < 60
                                    ? 'border-red-200 bg-red-50 text-red-600'
                                    : 'border-[var(--cn-border)] bg-[var(--cn-bg-section)] text-[var(--cn-text-main)]',
                            )}
                        >
                            <Clock className="h-4 w-4" />
                            {formatTime(timeLeft)}
                        </div>
                        <CustomButton
                            size="medium"
                            onClick={handleSubmitClick}
                            disabled={submitting}
                            className="gap-1.5 !py-2 px-3 text-xs md:!py-2.5 md:px-4 md:text-sm"
                        >
                            <Send className="h-4 w-4" />
                            {submitting ? 'Đang nộp...' : 'Nộp bài'}
                        </CustomButton>
                    </div>
                </div>
                <div className="h-1 bg-[var(--cn-bg-section)]">
                    <div
                        className="h-full bg-[var(--cn-primary)] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </header>

            <div className={cn('mx-auto grid max-w-7xl gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6 lg:py-6', PAGE_PX)}>
                <main className="min-w-0 space-y-4">
                    {questions.map((question, index) => {
                        const qid = question._id!;
                        const showSection = Boolean(
                            question.groupTitle
                            && question.groupTitle !== questions[index - 1]?.groupTitle,
                        );

                        return (
                            <React.Fragment key={qid || index}>
                                {showSection && question.groupTitle && (
                                    <div className="rounded-xl border border-[var(--cn-primary)]/20 bg-[var(--cn-primary)]/5 px-4 py-3">
                                        <h2 className="text-base font-bold text-[var(--cn-primary)] md:text-lg">
                                            {formatGroupTitleDisplay(question.groupTitle)}
                                        </h2>
                                    </div>
                                )}
                                <div
                                    ref={(node) => {
                                        questionRefs.current[index] = node;
                                    }}
                                    id={`question-${index + 1}`}
                                    className={cn(
                                        'scroll-mt-24 rounded-xl transition',
                                        activeIndex === index && 'ring-2 ring-[var(--cn-primary)]/20',
                                    )}
                                >
                                    <QuestionTaker
                                        question={question}
                                        index={index}
                                        answer={answers[qid] as PracticeAnswer['answer']}
                                        onChange={(val) => setAnswers((prev) => ({ ...prev, [qid]: val }))}
                                    />
                                </div>
                            </React.Fragment>
                        );
                    })}
                </main>

                <aside className="hidden lg:sticky lg:top-[88px] lg:block lg:self-start">
                    <section className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
                        <div className="border-b border-[var(--cn-border)] bg-[var(--cn-primary)] px-4 py-3">
                            <h2 className="text-sm font-semibold text-white">Danh sách câu hỏi</h2>
                            <p className="mt-0.5 text-xs text-white/80">
                                {answeredCount} đã làm · {questions.length - answeredCount} chưa làm
                            </p>
                        </div>
                        {questionListContent}
                    </section>
                </aside>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--cn-border)] bg-[var(--cn-bg-card)]/95 backdrop-blur lg:hidden">
                <div className={cn('mx-auto max-w-7xl py-2.5', PAGE_PX)}>                    <button
                        type="button"
                        onClick={() => setMobileListOpen(true)}
                        className="inline-flex w-full items-center gap-3 rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-section)] px-3 py-2.5 text-left transition active:scale-[0.99]"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cn-primary)]/10 text-[var(--cn-primary)]">
                            <ListChecks className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-[var(--cn-text-main)]">Danh sách câu hỏi</span>
                            <span className="block text-xs text-[var(--cn-text-muted)]">
                                {answeredCount}/{questions.length} đã làm · {questions.length - answeredCount} chưa làm
                            </span>
                        </span>
                    </button>
                </div>
            </div>

            {mobileListOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Đóng danh sách câu hỏi"
                        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                        onClick={() => setMobileListOpen(false)}
                    />
                    <section className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-2xl lg:hidden">
                        <div className="flex items-center justify-between border-b border-[var(--cn-border)] bg-[var(--cn-primary)] px-4 py-3">
                            <div>
                                <h2 className="text-sm font-semibold text-white">Danh sách câu hỏi</h2>
                                <p className="mt-0.5 text-xs text-white/80">
                                    {answeredCount} đã làm · {questions.length - answeredCount} chưa làm
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileListOpen(false)}
                                className="rounded-full p-1.5 text-white/90 transition hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {questionListContent}
                        </div>
                    </section>
                </>
            )}

            {showSubmitModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowSubmitModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 border-b border-[var(--cn-border)] p-5">
                            <div className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                unansweredCount > 0 ? 'bg-amber-100' : 'bg-blue-100',
                            )}>
                                {unansweredCount > 0 ? (
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                ) : (
                                    <Send className="h-5 w-5 text-blue-600" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">
                                    Nộp bài?
                                </h2>
                                {unansweredCount > 0 ? (
                                    <p className="mt-2 text-sm leading-relaxed text-[var(--cn-text-sub)]">
                                        Bạn còn <strong>{unansweredCount}</strong> câu chưa trả lời
                                        ({answeredCount}/{questions.length} đã làm).
                                        Bạn có chắc muốn nộp bài ngay bây giờ?
                                    </p>
                                ) : (
                                    <p className="mt-2 text-sm leading-relaxed text-[var(--cn-text-sub)]">
                                        Bạn đã hoàn thành tất cả {questions.length} câu hỏi.
                                        Xác nhận nộp bài để chấm điểm?
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSubmitModal(false)}
                                className="rounded-full p-1.5 text-[var(--cn-text-muted)] transition hover:bg-[var(--cn-hover)]"
                                aria-label="Đóng"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex gap-3 p-5">
                            <button
                                type="button"
                                onClick={() => setShowSubmitModal(false)}
                                disabled={submitting}
                                className="flex-1 rounded-lg border border-[var(--cn-border)] px-4 py-2.5 text-sm font-medium text-[var(--cn-text-sub)] transition hover:bg-[var(--cn-hover)] disabled:opacity-50"
                            >
                                Tiếp tục làm bài
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleSubmit()}
                                disabled={submitting}
                                className="flex-1 rounded-lg bg-[var(--cn-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                                {submitting ? 'Đang nộp...' : 'Nộp bài'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLeaveModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowLeaveModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 border-b border-[var(--cn-border)] p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">
                                    Rời khỏi bài làm?
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-[var(--cn-text-sub)]">
                                    Bạn đang làm bài. Nếu quay lại, tiến trình sẽ được lưu và hiện trong
                                    {' '}<strong>Lịch sử làm bài</strong> để tiếp tục khi còn thời gian.
                                    Khi hết giờ, bài làm sẽ được <strong>tự động nộp</strong>.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowLeaveModal(false)}
                                className="rounded-full p-1.5 text-[var(--cn-text-muted)] transition hover:bg-[var(--cn-hover)]"
                                aria-label="Đóng"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex gap-3 p-5">
                            <button
                                type="button"
                                onClick={() => setShowLeaveModal(false)}
                                className="flex-1 rounded-lg border border-[var(--cn-border)] px-4 py-2.5 text-sm font-medium text-[var(--cn-text-sub)] transition hover:bg-[var(--cn-hover)]"
                            >
                                Ở lại làm bài
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLeave}
                                className="flex-1 rounded-lg bg-[var(--cn-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LuyentapPreExamNoticeModal
                open={preExamOpen}
                content={preExamContent}
                onConfirm={() => void handlePreExamConfirm()}
            />
        </div>
    );
}
