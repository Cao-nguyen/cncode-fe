'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    BookOpen, ChevronRight, Clock, Dumbbell, FileText, Home,
    PlayCircle, ShoppingBag, CalendarClock,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { mapBackendExercise } from '@/lib/utils/luyentap.mapper';
import { CustomButton } from '@/components/custom/CustomButton';
import CommentSection from '@/components/comment/CommentSection';
import LuyentapPurchaseModal from '@/components/luyentap/LuyentapPurchaseModal';
import LuyentapExamPasswordModal from '@/components/luyentap/LuyentapExamPasswordModal';
import LuyentapExerciseStatsPanel from '@/components/luyentap/LuyentapExerciseStatsPanel';
import LuyentapSlugDetailSkeleton from '@/components/luyentap/LuyentapSlugDetailSkeleton';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { formatXu, getPayableAmount } from '@/lib/utils/currency.utils';
import {
    resolveExerciseAvailability,
    resolveEnterExamButtonLabel,
    type ExerciseAccessStatus,
} from '@/lib/luyentap/exercise-availability.utils';
import {
    DIFFICULTY_LABELS,
    EXAM_PURPOSE_LABELS,
    GRADE_LABELS,
} from '@/lib/luyentap/exercise-config.constants';

const REACTION_DISPLAY = [
    { type: 'love', icon: '/icons/love.svg', label: 'Yêu thích' },
    { type: 'like', icon: '/icons/like.svg', label: 'Thích' },
    { type: 'haha', icon: '/icons/haha.svg', label: 'Haha' },
    { type: 'wow', icon: '/icons/wow.svg', label: 'Wow' },
    { type: 'angry', icon: '/icons/angry.svg', label: 'Phẫn nộ' },
];

interface LuyentapSlugDetailClientProps {
    id: string;
}

function fmtDelivery(date?: string | null) {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return format(d, 'HH:mm - dd/MM/yyyy', { locale: vi });
}

export default function LuyentapSlugDetailClient({ id }: LuyentapSlugDetailClientProps) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [isDesktop, setIsDesktop] = useState(false);
    const [exercise, setExercise] = useState<ReturnType<typeof mapBackendExercise> | null>(null);
    const [owned, setOwned] = useState(false);
    const [loading, setLoading] = useState(true);
    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const [reactionTotals, setReactionTotals] = useState<Record<string, number>>({});
    const [userReaction, setUserReaction] = useState<string | null>(null);
    const [reactingType, setReactingType] = useState<string | null>(null);
    const [accessStatus, setAccessStatus] = useState<ExerciseAccessStatus | null>(null);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [pendingEnter, setPendingEnter] = useState(false);

    const fetchExerciseReactions = useCallback(async (exerciseId: string) => {
        try {
            const data = await luyentapApi.getExerciseReactions(exerciseId);
            setReactionTotals(data.reactionCounts || {});
            setUserReaction(data.userReaction || null);
        } catch {
            setReactionTotals({});
            setUserReaction(null);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await luyentapApi.getExerciseBySlug(id);
            if (!data?._id) {
                setExercise(null);
                return;
            }
            const mapped = mapBackendExercise(data);
            setExercise(mapped);

            if (token) {
                try {
                    const [status, access] = await Promise.all([
                        luyentapApi.getPurchaseStatus(mapped._id).catch(() => null),
                        luyentapApi.getExerciseAccess(mapped._id).catch(() => null),
                    ]);
                    setOwned(!!status?.owned);
                    setAccessStatus(access);
                } catch {
                    setOwned(false);
                    setAccessStatus(null);
                }
            } else {
                setOwned(false);
                setAccessStatus(null);
            }

            await fetchExerciseReactions(mapped._id);
        } catch {
            toast.error('Không tải được đề thi');
            setExercise(null);
        } finally {
            setLoading(false);
        }
    }, [id, token, fetchExerciseReactions]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const update = () => setIsDesktop(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const isVip = exercise?.tier === 'pro' || exercise?.type === 'vip';
    const needsPurchase = isVip && !owned;
    const payableAmount = getPayableAmount(exercise);
    const questionCount = exercise?.questionCount || exercise?.questions?.length || 0;
    const duration = exercise?.duration || exercise?.timeLimit || 0;

    const deliveryLabel = useMemo(() => {
        const from = fmtDelivery(exercise?.deliveryFrom as string | undefined);
        const to = fmtDelivery(exercise?.deliveryTo as string | undefined);
        if (from && to) return `${from} → ${to}`;
        if (from) return `Từ ${from}`;
        if (to) return `Đến ${to}`;
        if (exercise?.createdAt) {
            return format(new Date(exercise.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi });
        }
        return null;
    }, [exercise?.deliveryFrom, exercise?.deliveryTo, exercise?.createdAt]);

    const availability = useMemo(
        () => resolveExerciseAvailability(exercise),
        [exercise],
    );

    const canAttempt = accessStatus?.canAttempt ?? true;
    const enterButton = useMemo(
        () => resolveEnterExamButtonLabel({ needsPurchase, availability, canAttempt }),
        [needsPurchase, availability, canAttempt],
    );

    const navigateToExam = useCallback(() => {
        if (!exercise) return;
        router.push(`/luyentap/${exercise.slug || exercise._id}/lambai`);
    }, [exercise, router]);

    const handleEnterExam = () => {
        if (!exercise) return;
        if (!token) {
            toast.error('Vui lòng đăng nhập để vào phòng thi');
            router.push('/login');
            return;
        }
        if (needsPurchase) {
            setPurchaseOpen(true);
            return;
        }
        if (enterButton.disabled) return;

        const needsPassword = accessStatus?.hasExamPassword || exercise.hasExamPassword;
        if (needsPassword) {
            setPendingEnter(true);
            setPasswordOpen(true);
            return;
        }
        navigateToExam();
    };

    const handlePasswordVerified = () => {
        setPasswordOpen(false);
        if (pendingEnter) {
            setPendingEnter(false);
            navigateToExam();
        }
    };

    const tags = useMemo(() => {
        const items: string[] = [];
        if (exercise?.examPurpose && EXAM_PURPOSE_LABELS[exercise.examPurpose]) {
            items.push(EXAM_PURPOSE_LABELS[exercise.examPurpose]);
        }
        if (exercise?.grade && GRADE_LABELS[exercise.grade]) {
            items.push(GRADE_LABELS[exercise.grade]);
        }
        if (exercise?.difficulty && DIFFICULTY_LABELS[exercise.difficulty]) {
            items.push(DIFFICULTY_LABELS[exercise.difficulty]);
        }
        return items;
    }, [exercise?.examPurpose, exercise?.grade, exercise?.difficulty]);

    const totalReactions = useMemo(
        () => Object.values(reactionTotals).reduce((sum, n) => sum + n, 0),
        [reactionTotals],
    );

    const handlePurchaseSuccess = async (exerciseId: string) => {
        setOwned(true);
        setPurchaseOpen(false);
        if (exerciseId === exercise?._id) {
            handleEnterExam();
        }
    };

    const handleReaction = async (type: string) => {
        if (!exercise) return;
        if (!token) {
            toast.error('Vui lòng đăng nhập để thả cảm xúc');
            router.push('/login');
            return;
        }
        if (reactingType) return;

        const prevTotals = reactionTotals;
        const prevUserReaction = userReaction;

        setReactingType(type);

        if (prevUserReaction === type) {
            setUserReaction(null);
            setReactionTotals((current) => ({
                ...current,
                [type]: Math.max(0, (current[type] || 0) - 1),
            }));
        } else {
            setReactionTotals((current) => {
                const next = { ...current };
                if (prevUserReaction) {
                    next[prevUserReaction] = Math.max(0, (next[prevUserReaction] || 0) - 1);
                }
                next[type] = (next[type] || 0) + 1;
                return next;
            });
            setUserReaction(type);
        }

        try {
            const data = await luyentapApi.reactToExercise(exercise._id, type);
            setReactionTotals(data.reactionCounts || {});
            setUserReaction(data.reacted ? data.reactionType : null);
        } catch (err: unknown) {
            setReactionTotals(prevTotals);
            setUserReaction(prevUserReaction);
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || 'Không thể thả cảm xúc');
        } finally {
            setReactingType(null);
        }
    };

    if (loading) {
        return <LuyentapSlugDetailSkeleton />;
    }

    if (!exercise) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <Dumbbell className="h-12 w-12 text-[var(--cn-text-muted)] opacity-40" />
                <p className="text-[var(--cn-text-sub)]">Không tìm thấy đề thi</p>
                <Link href="/luyentap" className="text-sm font-medium text-[var(--cn-primary)] hover:underline">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const reactionsContent = (
        <>
            <h2 className="mb-3 text-sm font-semibold text-[var(--cn-text-main)]">
                Đánh giá ({totalReactions})
            </h2>
            <div className="flex flex-wrap gap-2">
                {REACTION_DISPLAY.map((rt) => {
                    const count = reactionTotals[rt.type] || 0;
                    const isActive = userReaction === rt.type;
                    const isBusy = reactingType === rt.type;
                    return (
                        <button
                            key={rt.type}
                            type="button"
                            onClick={() => handleReaction(rt.type)}
                            className={cn(
                                'inline-flex min-w-[3.25rem] items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition',
                                isActive
                                    ? 'border-[var(--cn-primary)] bg-[var(--cn-primary)]/10 text-[var(--cn-primary)] ring-1 ring-inset ring-[var(--cn-primary)]/30'
                                    : count > 0
                                        ? 'border-[var(--cn-primary)]/20 bg-[var(--cn-primary)]/5 text-[var(--cn-text-main)] hover:border-[var(--cn-primary)]/40'
                                        : 'border-[var(--cn-border)] text-[var(--cn-text-muted)] hover:border-[var(--cn-primary)]/30 hover:bg-[var(--cn-bg-section)]',
                                isBusy && 'pointer-events-none opacity-70',
                            )}
                            title={rt.label}
                        >
                            <img src={rt.icon} alt={rt.label} className="h-5 w-5 shrink-0" />
                            <span className="min-w-[0.75rem] tabular-nums">{count}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );

    const reactionsSection = (
        <section className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-3 py-4 shadow-sm">
            {reactionsContent}
        </section>
    );

    const commentsSection = (
        <CommentSection
            targetType="luyentap"
            targetId={exercise._id}
            title={`Bình luận${commentCount > 0 ? ` (${commentCount})` : ''}`}
            onCommentCountChange={setCommentCount}
        />
    );

    const mobileCommentsTab = (
        <div className="space-y-6">
            {reactionsContent}
            {commentsSection}
        </div>
    );

    return (
        <>
            <div className="min-h-screen pb-10 pt-4 md:pt-6" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
                <div className="mx-auto w-full px-3 md:px-4 lg:px-[60px]">
                    <nav className="mb-5 flex items-center gap-2 text-xs text-[var(--cn-text-sub)] md:text-sm">
                        <Link href="/" className="flex items-center gap-1 transition hover:text-[var(--cn-text-main)]">
                            <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)]" />
                        <Link href="/luyentap" className="transition hover:text-[var(--cn-text-main)]">
                            Luyện tập
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)]" />
                        <span className="transition hover:text-[var(--cn-text-main)]">Đề thi</span>
                        <ChevronRight className="h-3.5 w-3.5 text-[var(--cn-text-muted)]" />
                        <span className="line-clamp-1 font-medium text-[var(--cn-text-main)]">{exercise.title}</span>
                    </nav>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start">
                        <div className="min-w-0 space-y-6">
                            <article className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-4 py-5 shadow-sm md:px-5 md:py-6">
                            <h1 className="text-xl font-bold leading-snug text-[var(--cn-text-main)] md:text-2xl">
                                {exercise.title}
                            </h1>

                            {tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-[var(--cn-border)] bg-[var(--cn-bg-section)] px-3 py-1 text-xs font-medium text-[var(--cn-text-sub)]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <ul className="mt-6 space-y-3 text-sm text-[var(--cn-text-sub)] md:text-base">
                                <li className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 shrink-0 text-[var(--cn-primary)]" />
                                    <span>Tổng số câu: <strong className="text-[var(--cn-text-main)]">{questionCount}</strong></span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 shrink-0 text-[var(--cn-primary)]" />
                                    <span>Thời gian làm bài: <strong className="text-[var(--cn-text-main)]">{duration} phút</strong></span>
                                </li>
                                {deliveryLabel && (
                                    <li className="flex items-center gap-3">
                                        <CalendarClock className="h-5 w-5 shrink-0 text-[var(--cn-primary)]" />
                                        <span>Đề thi bắt đầu vào lúc: <strong className="text-[var(--cn-text-main)]">{deliveryLabel}</strong></span>
                                    </li>
                                )}
                                {exercise.description && (
                                    <li className="flex items-start gap-3">
                                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[var(--cn-primary)]" />
                                        <span>
                                            Mô tả:{' '}
                                            <strong className="font-medium text-[var(--cn-text-main)]">
                                                {exercise.description}
                                            </strong>
                                        </span>
                                    </li>
                                )}
                            </ul>

                            <div className="mt-8 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
                                {needsPurchase && payableAmount > 0 && (
                                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 sm:mr-auto">
                                        Giá: {formatXu(payableAmount)} <span className="font-normal text-[var(--cn-text-sub)]">(1 xu = 1 VNĐ)</span>
                                    </p>
                                )}
                                <CustomButton
                                    size="large"
                                    className="gap-2 px-6"
                                    onClick={needsPurchase ? () => setPurchaseOpen(true) : handleEnterExam}
                                    disabled={!needsPurchase && enterButton.disabled}
                                >
                                    {needsPurchase ? (
                                        <ShoppingBag className="h-5 w-5" />
                                    ) : (
                                        <PlayCircle className="h-5 w-5" />
                                    )}
                                    {needsPurchase ? 'Mua ngay' : enterButton.label}
                                </CustomButton>
                            </div>
                        </article>

                        <LuyentapExerciseStatsPanel
                            exerciseId={exercise._id}
                            exerciseSlug={exercise.slug}
                            passThreshold={exercise.passThreshold}
                            totalPoints={exercise.totalPoints}
                            hideLeaderboard={Boolean(exercise.hideLeaderboard || accessStatus?.hideLeaderboard)}
                            commentCount={commentCount}
                            mobileComments={!isDesktop ? mobileCommentsTab : undefined}
                        />
                    </div>

                        <aside className="hidden space-y-4 lg:sticky lg:top-20 lg:block lg:self-start">
                            {reactionsSection}
                            <section className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-3 py-4 shadow-sm">
                                {commentsSection}
                            </section>
                        </aside>
                    </div>
                </div>
            </div>

            <LuyentapPurchaseModal
                exercise={exercise}
                open={purchaseOpen}
                onClose={() => setPurchaseOpen(false)}
                onSuccess={handlePurchaseSuccess}
            />
            <LuyentapExamPasswordModal
                open={passwordOpen}
                onClose={() => {
                    setPasswordOpen(false);
                    setPendingEnter(false);
                }}
                slug={exercise.slug || exercise._id}
                onVerified={handlePasswordVerified}
            />
        </>
    );
}
