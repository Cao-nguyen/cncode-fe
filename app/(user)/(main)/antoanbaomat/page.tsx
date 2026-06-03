
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';

export default function SecurityPolicyPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/settings/security_policy`)
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
                        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-6" />
                        <div className="space-y-4">
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
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
