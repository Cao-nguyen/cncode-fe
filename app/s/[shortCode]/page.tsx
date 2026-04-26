'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ShortLinkRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const shortCode = params?.shortCode as string;

        if (!shortCode) {
            setError('Link không hợp lệ');
            return;
        }

        console.log('🔄 Redirecting shortCode:', shortCode);

        // Gọi API để lấy original URL
        fetch(`http://localhost:5000/api/s/${shortCode}`)
            .then(async (res) => {
                const data = await res.json();

                if (res.ok && data.success && data.originalUrl) {
                    console.log('✅ Redirecting to:', data.originalUrl);
                    // Chuyển hướng đến URL gốc
                    window.location.href = data.originalUrl;
                } else {
                    setError(data.error || 'Link không tồn tại hoặc đã hết hạn');
                }
            })
            .catch((err) => {
                console.error('❌ Fetch error:', err);
                setError('Không thể kết nối đến máy chủ');
            });
    }, [params]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔗</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Link không hợp lệ
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 px-4 py-2 bg-main text-white rounded-lg hover:opacity-90 transition"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-main mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Đang chuyển hướng...</p>
            </div>
        </div>
    );
}