'use client';

import Image from 'next/image';
import { Crown, Medal, Star } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/api/dautruong.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { RANK_TITLES } from '@/lib/dautruong/contest-display.utils';
import { cn } from '@/lib/utils';

const BANG_VANG_HEADER = '/dautruong/bangvang.png';
const COIN_ICON = '/icons/coins.svg';

interface DauTruongLeaderboardPanelProps {
    entries: LeaderboardEntry[];
    loading?: boolean;
}

const PODIUM_THEME: Record<
    1 | 2 | 3,
    {
        nameClass: string;
        ribbonClass: string;
        shieldClass: string;
        minHeight: string;
        scale: string;
    }
> = {
    1: {
        nameClass: 'text-red-600',
        ribbonClass: 'bg-gradient-to-b from-red-500 via-red-600 to-red-700',
        shieldClass: 'border-amber-300 bg-red-500/90 text-amber-200',
        minHeight: 'min-h-[210px]',
        scale: 'sm:-mt-3 sm:scale-[1.06]',
    },
    2: {
        nameClass: 'text-violet-600',
        ribbonClass: 'bg-gradient-to-b from-violet-500 via-violet-600 to-violet-700',
        shieldClass: 'border-violet-200 bg-violet-500/90 text-amber-200',
        minHeight: 'min-h-[178px]',
        scale: '',
    },
    3: {
        nameClass: 'text-blue-600',
        ribbonClass: 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700',
        shieldClass: 'border-blue-200 bg-blue-500/90 text-amber-200',
        minHeight: 'min-h-[168px]',
        scale: '',
    },
};

function getInitials(name?: string) {
    return (name || '?').trim().charAt(0).toUpperCase();
}

function formatScore(entry: LeaderboardEntry) {
    return (entry.totalScore ?? entry.score ?? 0).toLocaleString('vi-VN');
}

function PodiumShield({ rank }: { rank: 1 | 2 | 3 }) {
    const theme = PODIUM_THEME[rank];

    return (
        <div className="relative mx-auto mb-2 flex h-14 w-14 items-center justify-center">
            {rank === 1 && (
                <Crown
                    className="absolute -top-5 left-1/2 h-6 w-6 -translate-x-1/2 text-amber-400 drop-shadow"
                    fill="currentColor"
                />
            )}
            <div
                className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-inner',
                    theme.shieldClass,
                )}
            >
                {rank === 1 ? (
                    <span className="text-lg font-black">M</span>
                ) : (
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: rank === 2 ? 3 : 2 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-300 text-amber-300" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PodiumCard({
    entry,
    rank,
    className,
}: {
    entry: LeaderboardEntry;
    rank: 1 | 2 | 3;
    className?: string;
}) {
    const theme = PODIUM_THEME[rank];

    return (
        <div className={cn('flex min-w-0 flex-col items-center px-0.5', theme.scale, className)}>
            <Avatar className="h-11 w-11 border-2 border-white shadow-md">
                <AvatarImage src={getImageUrl(entry.userAvatar)} />
                <AvatarFallback className="bg-slate-200 text-sm font-bold text-slate-600">
                    {getInitials(entry.userName)}
                </AvatarFallback>
            </Avatar>
            <p className={cn('mt-1.5 line-clamp-2 px-0.5 text-center text-[11px] font-semibold leading-tight', theme.nameClass)}>
                {entry.userName}
            </p>

            <div
                className={cn(
                    'relative mt-2 flex w-full flex-col items-center px-1.5 pb-6 pt-2 text-center text-white shadow-lg',
                    theme.ribbonClass,
                    theme.minHeight,
                )}
                style={{
                    clipPath: 'polygon(8% 0, 92% 0, 100% 88%, 50% 100%, 0 88%)',
                }}
            >
                <PodiumShield rank={rank} />

                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-black/15 px-2 py-0.5">
                    <Image src={COIN_ICON} alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-black tabular-nums">{formatScore(entry)}</span>
                </div>

                <p className="text-[11px] font-bold leading-tight">{RANK_TITLES[rank]}</p>

                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-3xl font-black leading-none text-white/95">
                    {rank}
                </span>
            </div>
        </div>
    );
}

function RankListItem({ entry }: { entry: LeaderboardEntry }) {
    return (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[var(--cn-border)] bg-white px-3 py-2.5 shadow-sm">
            <span className="w-6 shrink-0 text-center text-xl font-bold text-[var(--cn-text-main)]">
                {entry.rank}
            </span>
            <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={getImageUrl(entry.userAvatar)} />
                <AvatarFallback className="bg-slate-200 text-xs font-semibold text-slate-600">
                    {getInitials(entry.userName)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--cn-text-main)]">{entry.userName}</p>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--cn-bg-section)] px-2.5 py-1">
                <Image src={COIN_ICON} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                <span className="text-sm font-bold tabular-nums text-[var(--cn-text-main)]">
                    {formatScore(entry)}
                </span>
            </div>
            <Medal className="h-7 w-7 shrink-0 text-amber-400" fill="currentColor" strokeWidth={1.25} />
        </div>
    );
}

export default function DauTruongLeaderboardPanel({ entries, loading }: DauTruongLeaderboardPanelProps) {
    const topThree = entries.slice(0, 3);
    const rest = entries.slice(3, 10);

    return (
        <aside className="relative mt-[34px] sm:mt-[42px]">
            <div className="relative overflow-visible rounded-2xl border border-[var(--cn-border)] bg-white shadow-sm">
                <div className="pointer-events-none absolute left-1/2 top-0 z-20 w-[calc(108%-13px)] max-w-none -translate-x-1/2 -translate-y-1/2">
                    <Image
                        src={BANG_VANG_HEADER}
                        alt="Bảng vàng"
                        width={640}
                        height={160}
                        priority
                        className="h-auto w-full object-contain"
                    />
                </div>

                <div className="space-y-3 px-2 pb-4 pt-11 sm:px-3 sm:pt-14">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--cn-primary)] border-t-transparent" />
                    </div>
                ) : entries.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[var(--cn-text-sub)]">
                        Chưa có dữ liệu bảng xếp hạng
                    </p>
                ) : (
                    <>
                        {topThree.length > 0 && (
                            <div className="grid grid-cols-3 items-end gap-0.5 sm:gap-1">
                                {topThree[1] ? (
                                    <PodiumCard entry={topThree[1]} rank={2} className="pb-0.5" />
                                ) : (
                                    <div />
                                )}
                                {topThree[0] && (
                                    <PodiumCard entry={topThree[0]} rank={1} />
                                )}
                                {topThree[2] ? (
                                    <PodiumCard entry={topThree[2]} rank={3} className="pb-0.5" />
                                ) : (
                                    <div />
                                )}
                            </div>
                        )}

                        <div className="space-y-2 px-0.5">
                            {rest.map((entry) => (
                                <RankListItem key={entry.userId} entry={entry} />
                            ))}
                        </div>
                    </>
                )}
                </div>
            </div>
        </aside>
    );
}
