
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
