import { Skeleton, ListSkeleton } from '@/components/ui/skeleton';

export default function LuyentapSlugDetailSkeleton() {
    return (
        <div className="min-h-screen pb-10 pt-4 md:pt-6" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="mx-auto w-full px-3 md:px-4 lg:px-[60px]">
                <nav className="mb-5 flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3.5 w-3.5 rounded" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3.5 w-3.5 rounded" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-3.5 w-3.5 rounded" />
                    <Skeleton className="h-4 w-32" />
                </nav>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start">
                    <div className="min-w-0 space-y-6">
                        <article className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-4 py-5 shadow-sm md:px-5 md:py-6">
                            <Skeleton className="h-8 w-4/5 max-w-xl md:h-9" />
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Skeleton className="h-7 w-24 rounded-full" />
                                <Skeleton className="h-7 w-20 rounded-full" />
                                <Skeleton className="h-7 w-28 rounded-full" />
                            </div>
                            <div className="mt-6 space-y-3">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-5 w-56" />
                                <Skeleton className="h-5 w-64" />
                                <Skeleton className="h-5 w-full max-w-md" />
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Skeleton className="h-11 w-40 rounded-lg" />
                            </div>
                        </article>

                        <section className="overflow-hidden rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm">
                            <div className="flex gap-2 border-b border-[var(--cn-border)] p-3">
                                <Skeleton className="h-9 w-24 rounded-lg" />
                                <Skeleton className="h-9 w-32 rounded-lg" />
                                <Skeleton className="h-9 w-28 rounded-lg" />
                            </div>
                            <div className="space-y-4 p-4">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="rounded-lg border border-[var(--cn-border)] p-3">
                                            <Skeleton className="mb-2 h-7 w-12" />
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    ))}
                                </div>
                                <Skeleton className="h-52 w-full rounded-lg" />
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Skeleton className="h-16 rounded-lg" />
                                    <Skeleton className="h-16 rounded-lg" />
                                    <Skeleton className="h-16 rounded-lg" />
                                    <Skeleton className="h-16 rounded-lg" />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="hidden space-y-4 lg:block lg:sticky lg:top-20 lg:self-start">
                        <section className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-3 py-4 shadow-sm">
                            <Skeleton className="mb-3 h-5 w-32" />
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Skeleton key={index} className="h-8 w-14 rounded-full" />
                                ))}
                            </div>
                        </section>
                        <section className="rounded-xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] px-3 py-4 shadow-sm">
                            <Skeleton className="mb-4 h-5 w-28" />
                            <ListSkeleton items={3} />
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
