import { Skeleton } from '@/components/ui/skeleton';

type StatsTab = 'stats' | 'leaderboard' | 'history' | 'comments';

function SideLabelSkeleton() {
    return <Skeleton className="h-full min-h-[280px] w-10 shrink-0 rounded-none" />;
}

function StatsTabSkeleton() {
    return (
        <div className="space-y-0">
            <div className="flex border-b border-[var(--cn-border)]">
                <SideLabelSkeleton />
                <div className="flex-1 p-4">
                    <div className="mb-3 flex flex-wrap gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-[280px] w-full rounded-lg" />
                </div>
            </div>
            <div className="flex">
                <SideLabelSkeleton />
                <div className="grid flex-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-lg bg-[var(--cn-bg-section)] px-4 py-5 text-center"
                        >
                            <Skeleton className="mx-auto h-3 w-24" />
                            <Skeleton className="mx-auto mt-3 h-7 w-16" />
                            <Skeleton className="mx-auto mt-2 h-3 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function LeaderboardTabSkeleton() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                    <tr className="bg-[var(--cn-primary)]/20">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <th key={index} className="px-3 py-2.5">
                                <Skeleton className="mx-auto h-4 w-14" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-[var(--cn-border)]">
                            <td className="px-3 py-3 text-center">
                                <Skeleton className="mx-auto h-7 w-7 rounded-full" />
                            </td>
                            <td className="px-3 py-3 text-center">
                                <Skeleton className="mx-auto h-9 w-9 rounded-full" />
                            </td>
                            <td className="px-3 py-3">
                                <Skeleton className="h-4 w-32" />
                            </td>
                            <td className="px-3 py-3 text-center">
                                <Skeleton className="mx-auto h-4 w-10" />
                            </td>
                            <td className="px-3 py-3 text-center">
                                <Skeleton className="mx-auto h-4 w-24" />
                            </td>
                            <td className="px-3 py-3 text-center">
                                <Skeleton className="mx-auto h-4 w-20" />
                            </td>
                            <td className="px-3 py-3 text-center">
                                <Skeleton className="mx-auto h-4 w-16" />
                            </td>
                            <td className="px-3 py-3">
                                <Skeleton className="h-4 w-28" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function HistoryTabSkeleton() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-[var(--cn-primary-light)]">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <th key={index} className="border border-[var(--cn-border)] px-4 py-2.5">
                                <Skeleton className="mx-auto h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: 4 }).map((__, colIndex) => (
                                <td key={colIndex} className="border border-[var(--cn-border)] px-4 py-3 text-center">
                                    <Skeleton className="mx-auto h-4 w-24" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function LuyentapExerciseStatsTabSkeleton({ tab }: { tab: StatsTab }) {
    if (tab === 'leaderboard') return <LeaderboardTabSkeleton />;
    if (tab === 'history') return <HistoryTabSkeleton />;
    return <StatsTabSkeleton />;
}
