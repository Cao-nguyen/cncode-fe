'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VideoPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id as string;

    useEffect(() => {
        // Redirect to main khampha page with the video ID as context
        // The main page will handle displaying the correct video
        router.replace(`/forum/khampha?v=${videoId}`);
    }, [videoId, router]);

    // Show loading while redirecting
    return (
        <div className="h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-800 text-lg">Đang tải...</div>
        </div>
    );
}