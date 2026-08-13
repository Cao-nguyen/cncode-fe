'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    BookOpen, Clock, Play, ShoppingBag, RotateCcw, Calendar,
    Search, Dumbbell, CheckCircle2, Circle, Crown, ChevronRight,
} from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { mapBackendExercise } from '@/lib/utils/luyentap.mapper';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { FeedbackCardSkeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatXu, getPayableAmount } from '@/lib/utils/currency.utils';
import { DIFFICULTY_LABELS, DIFFICULTY_OPTIONS } from '@/lib/luyentap/exercise-config.constants';
import LuyentapPurchaseModal from '@/components/luyentap/LuyentapPurchaseModal';

type ExerciseItem = ReturnType<typeof mapBackendExercise>;
type ExerciseWithStatus = ExerciseItem & { completionStatus: 'completed' | 'not_started' };

function exerciseDetailPath(exercise: ExerciseItem) {
    return `/luyentap/${exercise.slug || exercise._id}`;
}

const DIFFICULTY_BADGE: Record<string, string> = {
    easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    hard: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    very_hard: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
};

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

function ExerciseCard({
    exercise,
    purchased,
    onBuy,
}: {
    exercise: ExerciseWithStatus;
    purchased: boolean;
    onBuy: () => void;
}) {
    const difficulty = exercise.difficulty || 'medium';
    const questionCount = exercise.questionCount || exercise.questions?.length || 0;
    const duration = exercise.duration || exercise.timeLimit || 0;
    const isVip = exercise.type === 'vip' || exercise.tier === 'pro';
    const isCompleted = exercise.completionStatus === 'completed';
    const needsPurchase = isVip && !purchased;
    const payableAmount = getPayableAmount(exercise);

    const renderAction = () => {
        if (needsPurchase && !isCompleted) {
            return (
                <CustomButton variant="outline" size="small" className="whitespace-nowrap border-purple-200 text-purple-600 hover:bg-purple-50" onClick={onBuy}>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Mua ngay
                </CustomButton>
            );
        }
        if (isCompleted) {
            return (
                <Link href={exerciseDetailPath(exercise)}>
                    <CustomButton variant="outline" size="small" className="whitespace-nowrap border-blue-200 text-blue-600 hover:bg-blue-50">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Làm lại
                    </CustomButton>
                </Link>
            );
        }
        return (
            <Link href={exerciseDetailPath(exercise)}>
                <CustomButton size="small" className="whitespace-nowrap">
                    <Play className="h-3.5 w-3.5" />
                    Làm bài
                </CustomButton>
            </Link>
        );
    };

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm transition hover:border-[var(--cn-primary)]/25 hover:shadow-md">
            <div className="flex flex-wrap items-center gap-1.5 px-4 pt-4 md:px-5">
                <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', DIFFICULTY_BADGE[difficulty] || DIFFICULTY_BADGE.medium)}>
                    {DIFFICULTY_LABELS[difficulty] || 'Trung bình'}
                </span>
                <span className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium',
                    isVip
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
                )}>
                    {isVip ? 'VIP' : 'Free'}
                </span>
                <span className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium',
                    isCompleted
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-[var(--cn-bg-section)] text-[var(--cn-text-sub)]',
                )}>
                    {isCompleted ? 'Đã làm' : 'Chưa làm'}
                </span>
            </div>

            <Link href={exerciseDetailPath(exercise)} className="block flex-1 px-4 py-3 md:px-5">
                <h2 className="line-clamp-2 text-base font-semibold leading-snug text-[var(--cn-text-main)] transition group-hover:text-[var(--cn-primary)] md:text-lg">
                    {exercise.title}
                </h2>
                {exercise.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-[var(--cn-text-sub)]">
                        {exercise.description}
                    </p>
                )}
            </Link>

            <div className="mt-auto border-t border-[var(--cn-border)] px-4 py-3 md:px-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--cn-text-sub)]">
                    <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 shrink-0" />
                        {questionCount} câu
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 shrink-0" />
                        {duration} phút
                    </span>
                    {exercise.createdAt && (
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 shrink-0" />
                            {format(new Date(exercise.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={exerciseDetailPath(exercise)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cn-primary)] transition hover:underline"
                        >
                            Xem chi tiết
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        {isVip && needsPurchase && payableAmount > 0 && (
                            <p className="mt-1 text-sm font-semibold text-purple-700 dark:text-purple-300">
                                {formatXu(payableAmount)}
                            </p>
                        )}
                    </div>
                    {renderAction()}
                </div>
            </div>
        </article>
    );
}

export default function LuyentapPage() {
    const { token } = useAuthStore();
    const [exercises, setExercises] = useState<ExerciseItem[]>([]);
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [difficulty, setDifficulty] = useState('all');
    const [tierFilter, setTierFilter] = useState('all');
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [purchaseTarget, setPurchaseTarget] = useState<ExerciseItem | null>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => setSearchTerm(searchInput), 400);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchInput]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await luyentapApi.getPublicExercises({ limit: 100 });
            const list = (res.exercises || []).map(mapBackendExercise);
            setExercises(list);

            if (token) {
                const [userRes, purchaseRes] = await Promise.all([
                    luyentapApi.getUserExercises(),
                    luyentapApi.getUserPurchases().catch(() => ({ exerciseIds: [] })),
                ]);
                const done = new Set<string>();
                const items = userRes.data || userRes || [];
                (Array.isArray(items) ? items : []).forEach((item: { exerciseId?: { _id?: string } | string }) => {
                    const id = typeof item.exerciseId === 'object' ? item.exerciseId?._id : item.exerciseId;
                    if (id) done.add(id);
                });
                setCompletedIds(done);

                const ids = purchaseRes.exerciseIds || [];
                setPurchasedIds(new Set(Array.isArray(ids) ? ids : []));
            } else {
                setCompletedIds(new Set());
                setPurchasedIds(new Set());
            }
        } catch {
            toast.error('Không tải được danh sách bài tập');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const exercisesWithStatus = useMemo<ExerciseWithStatus[]>(() => (
        exercises.map((ex) => ({
            ...ex,
            completionStatus: completedIds.has(ex._id) ? 'completed' : 'not_started',
        }))
    ), [exercises, completedIds]);

    const summaryStats = useMemo(() => {
        const total = exercises.length;
        const completed = exercises.filter((ex) => completedIds.has(ex._id)).length;
        const freeCount = exercises.filter((ex) => ex.type !== 'vip' && ex.tier !== 'pro').length;
        const vipCount = total - freeCount;
        return { total, completed, notStarted: total - completed, freeCount, vipCount };
    }, [exercises, completedIds]);

    const filteredExercises = useMemo(() => (
        exercisesWithStatus.filter((exercise) => {
            const q = searchTerm.trim().toLowerCase();
            const matchesSearch = !q
                || exercise.title.toLowerCase().includes(q)
                || (exercise.description || '').toLowerCase().includes(q);
            const matchesDifficulty = difficulty === 'all' || exercise.difficulty === difficulty;
            const isVip = exercise.type === 'vip' || exercise.tier === 'pro';
            const matchesTier = tierFilter === 'all'
                || (tierFilter === 'free' && !isVip)
                || (tierFilter === 'vip' && isVip);
            return matchesSearch && matchesDifficulty && matchesTier;
        })
    ), [exercisesWithStatus, searchTerm, difficulty, tierFilter]);

    return (
        <div className="min-h-screen pb-6 pt-[20px] md:pb-8 lg:pt-[30px]" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-7xl px-3 sm:px-4">
                <div className="mb-5 md:mb-8">
                    <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--cn-text-main)] sm:text-2xl md:text-3xl">
                        <Dumbbell className="h-7 w-7 text-[var(--cn-primary)] md:h-8 md:w-8" />
                        Luyện tập
                    </h1>
                    <p className="mt-1 text-xs text-[var(--cn-text-sub)] sm:text-sm">
                        Rèn luyện kỹ năng qua các bài tập thực hành đa dạng
                    </p>
                </div>

                {!loading && summaryStats.total > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-2 md:mb-6 md:grid-cols-4 md:gap-3">
                        <StatCard icon={<BookOpen className="h-5 w-5 text-blue-600" />} label="Tổng bài tập" value={summaryStats.total} color="bg-blue-100" />
                        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} label="Đã hoàn thành" value={summaryStats.completed} color="bg-emerald-100" />
                        <StatCard icon={<Circle className="h-5 w-5 text-amber-600" />} label="Chưa làm" value={summaryStats.notStarted} color="bg-amber-100" />
                        <StatCard icon={<Crown className="h-5 w-5 text-purple-600" />} label="Bài VIP" value={summaryStats.vipCount} color="bg-purple-100" />
                    </div>
                )}

                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:gap-3">
                    <div className="min-w-0 flex-1">
                        <CustomInput
                            placeholder="Tìm kiếm bài tập..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            icon={<Search className="h-4 w-4" />}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                        <div className="w-full sm:w-40">
                            <CustomSelect
                                value={difficulty}
                                onChange={setDifficulty}
                                options={[
                                    { value: 'all', label: 'Tất cả độ khó' },
                                    ...DIFFICULTY_OPTIONS,
                                ]}
                            />
                        </div>
                        <div className="w-full sm:w-36">
                            <CustomSelect
                                value={tierFilter}
                                onChange={setTierFilter}
                                options={[
                                    { value: 'all', label: 'Tất cả loại' },
                                    { value: 'free', label: 'Free' },
                                    { value: 'vip', label: 'VIP' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <FeedbackCardSkeleton count={6} />
                ) : filteredExercises.length === 0 ? (
                    <div className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] py-16 text-center">
                        <BookOpen className="mx-auto mb-4 h-16 w-16 text-[var(--cn-text-muted)]/40" />
                        <p className="text-[var(--cn-text-sub)]">
                            {searchTerm || difficulty !== 'all' || tierFilter !== 'all'
                                ? 'Không tìm thấy bài tập phù hợp'
                                : 'Chưa có bài tập nào'}
                        </p>
                        {(searchTerm || difficulty !== 'all' || tierFilter !== 'all') && (
                            <CustomButton
                                variant="secondary"
                                className="mt-4"
                                onClick={() => {
                                    setSearchInput('');
                                    setSearchTerm('');
                                    setDifficulty('all');
                                    setTierFilter('all');
                                }}
                            >
                                Xóa bộ lọc
                            </CustomButton>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {filteredExercises.map((exercise) => (
                            <ExerciseCard
                                key={exercise._id}
                                exercise={exercise}
                                purchased={purchasedIds.has(exercise._id)}
                                onBuy={() => setPurchaseTarget(exercise)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <LuyentapPurchaseModal
                exercise={purchaseTarget}
                open={!!purchaseTarget}
                onClose={() => setPurchaseTarget(null)}
                onSuccess={(exerciseId) => {
                    setPurchasedIds((prev) => new Set([...prev, exerciseId]));
                }}
            />
        </div>
    );
}
