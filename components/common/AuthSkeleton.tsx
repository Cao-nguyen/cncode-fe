'use client';

export default function AuthSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        
                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                        
                        {/* Nav Items */}
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex gap-6">
                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Banner */}
                <div className="h-48 bg-gray-200 rounded-2xl animate-pulse mb-8" />
                
                {/* Categories */}
                <div className="flex gap-4 mb-8 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 w-32 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                    ))}
                </div>
                
                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200">
                            <div className="h-32 bg-gray-200 rounded-xl animate-pulse mb-4" />
                            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation (Mobile) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
                <div className="flex justify-around py-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
