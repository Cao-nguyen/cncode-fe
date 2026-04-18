export function ExerciseCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-4 animate-pulse">
            <div className="flex justify-between mb-3">
                <div className="h-6 w-16 bg-muted rounded-full" />
                <div className="h-4 w-20 bg-muted rounded" />
            </div>
            <div className="h-5 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-full mb-1" />
            <div className="h-4 bg-muted rounded w-2/3 mb-3" />
            <div className="flex justify-between">
                <div className="flex gap-3">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
            </div>
        </div>
    );
}