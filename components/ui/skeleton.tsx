import { cn } from '@/lib/utils';

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-slate-200', className)}
            {...props}
        />
    );
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    {Array.from({ length: cols }).map((_, j) => (
                        <Skeleton key={j} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

function CardSkeleton({ count = 1 }: { count?: number }) {
    return (
        <div className="grid gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            ))}
        </div>
    );
}

function ListSkeleton({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-3 w-3/5" />
                    </div>
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
            ))}
        </div>
    );
}

function IndustryCardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <div className="flex items-center justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function GiftShopSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-4 space-y-4"
                >
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
            ))}
        </div>
    );
}

function MyCoursesPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-6 md:p-8">
                <div className="space-y-3 max-w-lg">
                    <Skeleton className="h-6 w-40 rounded-full" />
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--cn-border)]">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-7 w-12" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))}
                </div>
            </div>
            <Skeleton className="h-11 w-full rounded-xl sm:max-w-2xl" />
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                        <Skeleton className="aspect-[16/10] w-full rounded-none" />
                        <div className="space-y-2 p-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                            <Skeleton className="h-1.5 w-full rounded-full" />
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GiftShopPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-56" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-12 w-40 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--cn-border)]">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))}
                </div>
            </div>
            <Skeleton className="h-11 w-full max-w-md rounded-xl" />
            <GiftShopSkeleton count={6} />
        </div>
    );
}

function FeedbackCardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                    <div className="flex gap-2 px-4 pt-4 md:px-5">
                        <Skeleton className="h-5 w-16 rounded-md" />
                        <Skeleton className="h-5 w-20 rounded-md" />
                    </div>
                    <div className="space-y-2 px-4 py-3 md:px-5">
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="border-t border-[var(--cn-border)] px-4 py-3 md:px-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-7 w-7 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="mt-2.5 h-4 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function AdminKhoahocStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-700 dark:bg-gray-800"
                >
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AdminKhoahocChartsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-md" />
                        <Skeleton className="h-5 w-44" />
                    </div>
                    <Skeleton className="h-[220px] w-full rounded-lg" />
                </div>
            ))}
        </div>
    );
}

function AdminKhoahocMobileListSkeleton({ items = 6 }: { items?: number }) {
    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 sm:hidden">
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-12 w-20 shrink-0 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function AdminKhoahocTableSectionSkeleton() {
    return (
        <>
            <div className="hidden p-4 sm:block sm:p-6">
                <TableSkeleton rows={10} cols={8} />
            </div>
            <AdminKhoahocMobileListSkeleton items={6} />
        </>
    );
}

function AdminKhoahocPageSkeleton({
    showStats = true,
    showCharts = true,
    showTable = true,
}: {
    showStats?: boolean;
    showCharts?: boolean;
    showTable?: boolean;
}) {
    return (
        <div className="space-y-4">
            {showStats && <AdminKhoahocStatsSkeleton />}
            {showCharts && <AdminKhoahocChartsSkeleton />}
            {showTable && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <AdminKhoahocTableSectionSkeleton />
                </div>
            )}
        </div>
    );
}

export {
    Skeleton,
    TableSkeleton,
    CardSkeleton,
    ListSkeleton,
    IndustryCardSkeleton,
    GiftShopSkeleton,
    GiftShopPageSkeleton,
    MyCoursesPageSkeleton,
    FeedbackCardSkeleton,
    AdminKhoahocStatsSkeleton,
    AdminKhoahocChartsSkeleton,
    AdminKhoahocTableSectionSkeleton,
    AdminKhoahocPageSkeleton,
};