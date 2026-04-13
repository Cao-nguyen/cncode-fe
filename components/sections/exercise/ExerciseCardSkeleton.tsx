export function ExerciseCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
            <div className="h-40 bg-secondary" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-secondary rounded w-1/3" />
                <div className="h-4 bg-secondary rounded w-full" />
                <div className="h-4 bg-secondary rounded w-2/3" />
                <div className="h-3 bg-secondary rounded w-full" />
                <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
        </div>
    );
}