
'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import StaticContent from '@/components/common/StaticContent';

export default function AboutPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/settings/about_us`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setContent(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-3 lg:px-6">
                    <div className="bg-white rounded-2xl shadow-sm p-3 lg:p-6">
                        <Skeleton className="h-10 w-64 mb-6" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-3 lg:px-6">
                <div className="bg-white rounded-2xl shadow-sm p-3 lg:p-6">
                    <StaticContent content={content} />
                </div>
            </div>
        </div>
    );
}
