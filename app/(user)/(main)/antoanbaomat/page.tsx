// app/(user)/(none)/chinhsachbaohanh/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { systemSettingsApi } from '@/lib/api/system-settings.api';
import { Loader2 } from 'lucide-react';

export default function ChinhSachBaoHanhPage() {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const result = await systemSettingsApi.getPublicContent('antoanbaomat');
            if (result.success) {
                setTitle(result.data.title);
                setContent(result.data.content);
            }
        } catch (error) {
            console.error('Failed to fetch content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
            <div className="container mx-auto px-5 lg:px-5 max-w-7xl">
                <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    </div>
                    <div className="p-6 prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                </div>
            </div>
        </div>
    );
}