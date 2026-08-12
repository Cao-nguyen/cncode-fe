'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
    luyentapApi,
    type ExerciseHistoryEntry,
    type ExerciseStatistics,
    type LeaderboardEntry,
} from '@/lib/api/luyentap.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import LuyentapExerciseStatsTabSkeleton from '@/components/luyentap/LuyentapExerciseStatsTabSkeleton';
import { formatScoreValue, formatScoreScaleLabel, resolveAttemptScore } from '@/lib/luyentap/exercise-display.utils';

type MainTab = 'stats' | 'leaderboard' | 'history' | 'comments';

interface LuyentapExerciseStatsPanelProps {
    exerciseId: string;
    exerciseSlug?: string;
    passThreshold?: number;
    totalPoints?: number;
    hideLeaderboard?: boolean;
    commentCount?: number;
    mobileComments?: React.ReactNode;
    adminMode?: boolean;
}

const ALL_MAIN_TABS: { id: MainTab; label: string }[] = [
    { id: 'stats', label: 'Thống kê' },
    { id: 'leaderboard', label: 'Bảng xếp hạng' },
    { id: 'history', label: 'Lịch sử làm bài' },
];

function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} Phút ${secs} Giây`;
}

function formatRemainingTime(expiresAt?: string, nowMs: number = Date.now()) {
    if (!expiresAt) return '—';
    const seconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowMs) / 1000));
    if (seconds <= 0) return 'Hết giờ';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `Còn ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getRemainingSeconds(expiresAt?: string, nowMs: number = Date.now()) {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowMs) / 1000));
}

function formatDurationShort(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
}

function formatExamDate(date?: string) {
    if (!date) return '—';
    return format(new Date(date), 'HH:mm - d/M/yyyy', { locale: vi });
}

function getRankStyle(rank: number) {
    if (rank === 1) return { badge: 'bg-red-500', text: 'text-red-500' };
    if (rank <= 3) return { badge: 'bg-blue-500', text: 'text-blue-600' };
    if (rank <= 5) return { badge: 'bg-emerald-500', text: 'text-emerald-600' };
    return { badge: 'bg-gray-400', text: 'text-gray-600' };
}

function RankBadge({ rank }: { rank: number }) {
    const style = getRankStyle(rank);
    return (
        <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white', style.badge)}>
            {rank}
        </span>
    );
}

function getInitial(name?: string) {
    return name?.charAt(0).toUpperCase() || '?';
}

function SideLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-10 shrink-0 items-center justify-center bg-[var(--cn-primary)] text-white">
            <span
                className="text-xs font-semibold tracking-wide"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
                {children}
            </span>
        </div>
    );
}

function ScoreWithScale({
    score,
    totalPoints,
    className,
}: {
    score: number | null | undefined;
    totalPoints: number;
    className?: string;
}) {
    if (score == null || Number.isNaN(score)) {
        return <span className={className}>—</span>;
    }

    return (
        <div className={cn('inline-flex flex-col items-center', className)}>
            <span className="font-bold leading-tight text-[var(--cn-text-main)]">
                {formatScoreValue(score)}
            </span>
            {totalPoints > 0 && (
                <span className="mt-0.5 text-xs text-[var(--cn-text-muted)]">
                    {formatScoreScaleLabel(score, totalPoints)}
                </span>
            )}
        </div>
    );
}

export default function LuyentapExerciseStatsPanel({
    exerciseId,
    exerciseSlug,
    passThreshold = 80,
    totalPoints: totalPointsProp = 0,
    hideLeaderboard = false,
    commentCount = 0,
    mobileComments,
    adminMode = false,
}: LuyentapExerciseStatsPanelProps) {
    const { token } = useAuthStore();
    const mainTabs = useMemo(
        () => {
            const tabs = hideLeaderboard
                ? ALL_MAIN_TABS.filter((tab) => tab.id !== 'leaderboard')
                : ALL_MAIN_TABS;
            if (adminMode) {
                return tabs.filter((tab) => tab.id !== 'history');
            }
            return tabs;
        },
        [hideLeaderboard, adminMode],
    );
    const [mainTab, setMainTab] = useState<MainTab>('stats');
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState<ExerciseStatistics | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);

    const fetchStatsData = useCallback(async () => {
        const statsRes = await luyentapApi.getExerciseStatistics(exerciseId);
        setStats(statsRes);
    }, [exerciseId]);

    const fetchLeaderboard = useCallback(async () => {
        const data = await luyentapApi.getExerciseLeaderboard(exerciseId, 50);
        setLeaderboard(Array.isArray(data) ? data : []);
    }, [exerciseId]);

    const fetchHistory = useCallback(async () => {
        if (!token) {
            setHistory([]);
            return;
        }
        const res = await luyentapApi.getUserExerciseHistory(exerciseId);
        const items = res.data || res || [];
        setHistory(Array.isArray(items) ? items : []);
    }, [exerciseId, token]);

    useEffect(() => {
        if (mainTab === 'comments') {
            setLoading(false);
            return;
        }

        let active = true;
        (async () => {
            setLoading(true);
            try {
                if (mainTab === 'stats') await fetchStatsData();
                else if (mainTab === 'leaderboard') await fetchLeaderboard();
                else await fetchHistory();
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [mainTab, fetchStatsData, fetchLeaderboard, fetchHistory]);

    const chartData = useMemo(() => (
        stats?.histogram.map((bucket) => ({
            name: bucket.label,
            count: bucket.count,
            isUserBucket: stats.userScore != null
                && stats.userScore >= bucket.min
                && (
                    bucket.max === stats.totalPoints
                        ? stats.userScore <= bucket.max
                        : stats.userScore < bucket.max
                ),
        })) || []
    ), [stats]);

    const sortedHistory = useMemo(() => (
        [...history].sort((a, b) => {
            if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
            if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        })
    ), [history]);

    const showTabSwitchColumn = useMemo(
        () => sortedHistory.some((item) => (item.tabSwitchCount ?? 0) > 0),
        [sortedHistory],
    );

    const hasInProgressAttempt = useMemo(
        () => sortedHistory.some((item) => item.status === 'in_progress' && item.expiresAt),
        [sortedHistory],
    );

    const [nowMs, setNowMs] = useState(() => Date.now());
    const expiredRefetchDoneRef = useRef(false);

    useEffect(() => {
        if (mainTab !== 'history' || !hasInProgressAttempt) return;

        const timer = setInterval(() => {
            setNowMs(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, [mainTab, hasInProgressAttempt]);

    useEffect(() => {
        if (!hasInProgressAttempt) {
            expiredRefetchDoneRef.current = false;
        }
    }, [hasInProgressAttempt]);

    useEffect(() => {
        if (mainTab !== 'history' || !hasInProgressAttempt || expiredRefetchDoneRef.current) return;

        const anyExpired = sortedHistory.some(
            (item) => item.status === 'in_progress'
                && item.expiresAt
                && getRemainingSeconds(item.expiresAt, nowMs) <= 0,
        );

        if (anyExpired) {
            expiredRefetchDoneRef.current = true;
            void fetchHistory();
        }
    }, [nowMs, mainTab, hasInProgressAttempt, sortedHistory, fetchHistory]);

    const totalPoints = totalPointsProp || stats?.totalPoints || 0;

    const detailCards = useMemo(() => {
        if (!stats) return [];
        return [
            {
                id: 'total-participants',
                title: 'Tổng thí sinh',
                value: `${stats.totalParticipants}`,
                suffix: '(Thí sinh tham gia)',
            },
            {
                id: 'average-score',
                title: 'Điểm trung bình',
                value: formatScoreValue(stats.averageScore),
                suffix: formatScoreScaleLabel(stats.averageScore, stats.totalPoints),
            },
            {
                id: 'median-score',
                title: 'Điểm trung vị',
                value: formatScoreValue(stats.medianScore),
                suffix: formatScoreScaleLabel(stats.medianScore, stats.totalPoints),
            },
            {
                id: 'average-time',
                title: 'Thời gian làm bài tb',
                value: formatDuration(stats.averageTimeSpent),
                suffix: '',
            },
            ...stats.scoreRanges.map((range, index) => ({
                id: `range-${range.min}-${range.max}-${index}`,
                title: `Thí sinh đạt điểm ${range.label}`,
                value: `${range.count} thí sinh (${range.percent}%)`,
                suffix: '',
            })),
        ];
    }, [stats]);

    return (
        <section className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
            <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-[var(--cn-border)] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {mainTabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMainTab(tab.id)}
                        className={cn(
                            'shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm md:px-4 md:py-2',
                            mainTab === tab.id
                                ? 'bg-[var(--cn-primary)] text-white'
                                : 'text-[var(--cn-text-sub)] hover:bg-[var(--cn-bg-section)] hover:text-[var(--cn-text-main)]',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
                {!adminMode && (
                <button
                    type="button"
                    onClick={() => setMainTab('comments')}
                    className={cn(
                        'shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm md:px-4 md:py-2 lg:hidden',
                        mainTab === 'comments'
                            ? 'bg-[var(--cn-primary)] text-white'
                            : 'text-[var(--cn-text-sub)] hover:bg-[var(--cn-bg-section)] hover:text-[var(--cn-text-main)]',
                    )}
                >
                    Bình luận{commentCount > 0 ? ` (${commentCount})` : ''}
                </button>
                )}
            </div>

            {loading ? (
                <LuyentapExerciseStatsTabSkeleton tab={mainTab} />
            ) : mainTab === 'stats' ? (
                <div className="space-y-0">
                    <div className="flex border-b border-[var(--cn-border)]">
                        <SideLabel>Phổ điểm</SideLabel>
                        <div className="flex-1 p-4">
                            <div className="mb-3 flex flex-wrap gap-4 text-xs text-[var(--cn-text-sub)]">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-orange-400" />
                                    Điểm của tôi
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                    Điểm trung bình
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-fuchsia-500" />
                                    Điểm trung vị
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 8, bottom: 32 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cn-border)" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        interval={0}
                                        angle={chartData.length > 6 ? -35 : 0}
                                        textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                                        height={chartData.length > 6 ? 56 : 36}
                                        label={{
                                            value: 'Điểm',
                                            position: 'bottom',
                                            offset: chartData.length > 6 ? 4 : 0,
                                            fontSize: 12,
                                            fill: 'var(--cn-text-sub)',
                                        }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        allowDecimals={false}
                                        width={36}
                                        label={{
                                            value: 'Học sinh',
                                            angle: -90,
                                            position: 'insideLeft',
                                            fontSize: 12,
                                            fill: 'var(--cn-text-sub)',
                                        }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Học sinh" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.isUserBucket ? '#fb923c' : 'var(--cn-primary)'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex">
                        <SideLabel>Chi tiết</SideLabel>
                        <div className="grid flex-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
                            {detailCards.map((card) => (
                                <div
                                    key={card.id}
                                    className="rounded-lg bg-[var(--cn-bg-section)] px-4 py-5 text-center"
                                >
                                    <p className="text-xs text-[var(--cn-text-sub)]">{card.title}</p>
                                    <p className="mt-2 text-lg font-bold text-[var(--cn-primary)]">{card.value}</p>
                                    {card.suffix && (
                                        <p className="mt-1 text-xs text-[var(--cn-text-muted)]">{card.suffix}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : mainTab === 'leaderboard' ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse text-sm">
                        <thead>
                            <tr className="bg-[var(--cn-primary)] text-white">
                                <th className="px-3 py-2.5 text-center font-semibold">STT</th>
                                <th className="px-3 py-2.5 text-center font-semibold">Ảnh</th>
                                <th className="px-3 py-2.5 text-left font-semibold">Tên thí sinh</th>
                                <th className="px-3 py-2.5 text-center font-semibold">Điểm thi</th>
                                <th className="px-3 py-2.5 text-center font-semibold">Thời gian thi</th>
                                <th className="px-3 py-2.5 text-center font-semibold">Thời gian làm bài</th>
                                <th className="px-3 py-2.5 text-center font-semibold">Tỉnh</th>
                                <th className="px-3 py-2.5 text-left font-semibold">Trường học</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-[var(--cn-text-muted)]">
                                        Chưa có bảng xếp hạng
                                    </td>
                                </tr>
                            ) : leaderboard.map((entry) => {
                                const rankStyle = getRankStyle(entry.rank);
                                const displayScore = entry.score ?? entry.totalScore ?? null;
                                return (
                                    <tr key={`${entry.userId}-${entry.rank}`} className="border-b border-[var(--cn-border)]">
                                        <td className="px-3 py-3 text-center">
                                            <RankBadge rank={entry.rank} />
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <Avatar className="mx-auto h-9 w-9">
                                                {entry.userAvatar ? (
                                                    <AvatarImage src={getImageUrl(entry.userAvatar)} alt={entry.userName} />
                                                ) : null}
                                                <AvatarFallback>{getInitial(entry.userName)}</AvatarFallback>
                                            </Avatar>
                                        </td>
                                        <td className={cn('px-3 py-3 font-semibold', rankStyle.text)}>
                                            {entry.userName}
                                        </td>
                                        <td className="px-3 py-3 text-center font-bold text-[var(--cn-text-main)]">
                                            <ScoreWithScale score={displayScore} totalPoints={totalPoints} />
                                        </td>
                                        <td className="px-3 py-3 text-center text-[var(--cn-text-sub)]">
                                            {formatExamDate(entry.submittedAt)}
                                        </td>
                                        <td className="px-3 py-3 text-center text-[var(--cn-text-sub)]">
                                            {entry.timeSpent != null ? formatDurationShort(entry.timeSpent) : '—'}
                                        </td>
                                        <td className="px-3 py-3 text-center text-[var(--cn-text-sub)]">
                                            {entry.province || '—'}
                                        </td>
                                        <td className="px-3 py-3 text-[var(--cn-text-sub)]">
                                            {entry.school || '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : mainTab === 'history' ? (
                !token ? (
                    <p className="py-12 text-center text-sm text-[var(--cn-text-muted)]">
                        Vui lòng đăng nhập để xem lịch sử làm bài
                    </p>
                ) : history.length === 0 ? (
                    <p className="py-12 text-center text-sm text-[var(--cn-text-muted)]">Bạn chưa làm bài này</p>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-[var(--cn-primary-light)] text-[var(--cn-primary)]">
                                <th className="border border-[var(--cn-border)] px-4 py-2.5 text-center font-semibold">Ngày thi</th>
                                <th className="border border-[var(--cn-border)] px-4 py-2.5 text-center font-semibold">Thời gian làm bài</th>
                                <th className="border border-[var(--cn-border)] px-4 py-2.5 text-center font-semibold">Điểm thi</th>
                                {showTabSwitchColumn && (
                                    <th className="border border-[var(--cn-border)] px-4 py-2.5 text-center font-semibold">Rời màn hình</th>
                                )}
                                <th className="border border-[var(--cn-border)] px-4 py-2.5 text-center font-semibold">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedHistory.map((item) => {
                                const isInProgress = item.status === 'in_progress';
                                const remainingSeconds = isInProgress
                                    ? getRemainingSeconds(item.expiresAt, nowMs)
                                    : 0;
                                const isExpiredInProgress = isInProgress && remainingSeconds <= 0;
                                return (
                                    <tr
                                        key={item._id}
                                        className={isInProgress ? 'bg-amber-50/70' : undefined}
                                    >
                                        <td className="border border-[var(--cn-border)] px-4 py-3 text-center text-[var(--cn-text-main)]">
                                            {formatExamDate(item.startedAt || item.submittedAt)}
                                            {isInProgress && (
                                                <span className={cn(
                                                    'mt-1 block text-xs font-medium',
                                                    isExpiredInProgress ? 'text-orange-700' : 'text-amber-700',
                                                )}>
                                                    {isExpiredInProgress ? 'Hết giờ — đang nộp' : 'Đang làm dở'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="border border-[var(--cn-border)] px-4 py-3 text-center">
                                            {isInProgress ? (
                                                isExpiredInProgress ? (
                                                    <span className="text-sm font-medium text-orange-700">
                                                        Hết giờ
                                                    </span>
                                                ) : (
                                                <span className={cn(
                                                    'font-mono text-sm font-semibold tabular-nums',
                                                    remainingSeconds < 60
                                                        ? 'text-red-600'
                                                        : 'text-amber-700',
                                                )}>
                                                    {formatRemainingTime(item.expiresAt, nowMs)}
                                                </span>
                                                )
                                            ) : (
                                                <span className="text-[var(--cn-text-sub)]">
                                                    {formatDurationShort(item.timeSpent || 0)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="border border-[var(--cn-border)] px-4 py-3 text-center font-bold text-[var(--cn-text-main)]">
                                            {isInProgress ? (
                                                '—'
                                            ) : (
                                                <ScoreWithScale
                                                    score={resolveAttemptScore(item, totalPoints)}
                                                    totalPoints={totalPoints}
                                                />
                                            )}
                                        </td>
                                        {showTabSwitchColumn && (
                                            <td className="border border-[var(--cn-border)] px-4 py-3 text-center text-[var(--cn-text-sub)]">
                                                {item.tabSwitchCount ?? 0}
                                            </td>
                                        )}
                                        <td className="border border-[var(--cn-border)] px-4 py-3 text-center">
                                            {isInProgress ? (
                                                isExpiredInProgress ? (
                                                    <span className="text-xs text-[var(--cn-text-muted)]">
                                                        Đang xử lý…
                                                    </span>
                                                ) : (
                                                <Link
                                                    href={`/luyentap/${exerciseSlug || exerciseId}/lambai`}
                                                    className="inline-flex rounded-md bg-[var(--cn-primary)] px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                                                >
                                                    Tiếp tục
                                                </Link>
                                                )
                                            ) : (
                                                <Link
                                                    href={`/luyentap/${exerciseSlug || exerciseId}/check?answerId=${item._id}`}
                                                    className="inline-flex rounded-md bg-[var(--cn-primary-light)] px-4 py-1.5 text-sm font-medium text-[var(--cn-primary)] transition hover:bg-[var(--cn-hover-blue)]"
                                                >
                                                    Xem chi tiết
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                )
            ) : mainTab === 'comments' ? (
                <div className="p-3 md:p-4 lg:hidden">
                    {mobileComments}
                </div>
            ) : null}
        </section>
    );
}
