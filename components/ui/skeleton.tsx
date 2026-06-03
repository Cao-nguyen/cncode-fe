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

export { Skeleton, TableSkeleton, CardSkeleton, ListSkeleton };