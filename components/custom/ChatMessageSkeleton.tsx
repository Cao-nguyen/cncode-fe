export function ChatMessageSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {/* Loading indicator at top */}
            <div className="flex justify-center py-2">
                <div className="animate-pulse flex items-center gap-2 text-sm text-[var(--cn-text-sub)]">
                    <div className="w-1.5 h-1.5 bg-[var(--cn-text-sub)] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--cn-text-sub)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-[var(--cn-text-sub)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>

            {/* Message skeletons */}
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                    <div className={`flex gap-2 max-w-[70%] ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                        {i % 2 !== 0 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                        )}
                        <div>
                            {i % 2 !== 0 && (
                                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                            )}
                            <div className={`rounded-2xl px-4 py-2 ${i % 2 === 0 ? 'bg-[var(--cn-primary)]/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                                    {i % 3 === 0 && <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>}
                                </div>
                            </div>
                            <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}