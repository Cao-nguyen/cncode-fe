'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ExternalLink, Shield, Zap, Users, CheckCircle, AlertTriangle, Book, Star, Sparkles, ArrowUpRight } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

export default function RedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(3);
    const [isValid, setIsValid] = useState(true);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(100);

    const shortCode = searchParams.get('code');
    const originalUrl = searchParams.get('url');

    useEffect(() => {
        if (!shortCode || !originalUrl) {
            setIsValid(false);
            setLoading(false);
            return;
        }

        setLoading(false);

        // Countdown auto-redirect
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = originalUrl;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Circular progress animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(progressInterval);
                    return 0;
                }
                return prev - (100 / 30); // 30 steps for smooth animation over 3 seconds
            });
        }, 100);

        return () => {
            clearInterval(timer);
            clearInterval(progressInterval);
        };
    }, [shortCode, originalUrl]);

    const handleContinue = () => {
        if (originalUrl) {
            window.location.href = originalUrl;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Link không hợp lệ</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Link rút gọn này không tồn tại hoặc đã bị xóa.
                    </p>
                    <CustomButton onClick={() => router.push('/')} variant="primary">
                        Về trang chủ
                    </CustomButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
            <div className="max-w-4xl w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-2">
                            <img 
                                src="/images/logo.png" 
                                alt="CNcode Logo" 
                                className="h-16 w-auto"
                            />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Nền tảng học công nghệ và đổi mới sáng tạo
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-shrink-0 relative mx-auto sm:mx-0">
                                {/* Decorative stars */}
                                <div className="absolute -top-1 -left-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-pulse" />
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                                </div>
                                <div className="absolute -bottom-1 -left-2">
                                    <Star className="w-2 h-2 text-yellow-400 fill-yellow-400 animate-pulse" style={{ animationDelay: '1s' }} />
                                </div>
                                
                                {/* Book icon */}
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center shadow-lg relative z-10">
                                    <Book className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    CNcode - Kết nối tri thức
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    CNcode là nền tảng học công nghệ và đổi mới sáng tạo dành cho học sinh và nhiều người học khác với nhiều tính năng và cách giảng dạy hiện đại.
                                </p>
                            </div>
                            <div className="flex-shrink-0 flex justify-center sm:justify-end">
                                <CustomButton
                                    onClick={() => router.push('/')}
                                    variant="primary"
                                    className="px-3 py-2 text-sm"
                                >
                                    Khám phá CNcode
                                    <ArrowRight size={16} />
                                </CustomButton>
                            </div>
                        </div>
                    </div>

                    {/* Redirect Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0 w-32">
                                <img 
                                    src="/images/redirect.png" 
                                    alt="Redirect" 
                                    className="w-28 h-28 object-contain"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                                        Bạn đang được chuyển đến link đích
                                    </h2>
                                    <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 ml-4">
                                        <svg className="absolute inset-0 transform -rotate-90" width="48" height="48">
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                                className="text-gray-200 dark:text-gray-700"
                                            />
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                stroke="url(#gradient)"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 20}`}
                                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                                                className="transition-all duration-100 ease-linear"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#3B82F6" />
                                                    <stop offset="100%" stopColor="#93C5FD" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span className="relative z-10 text-sm font-bold text-blue-600 dark:text-blue-300">
                                            {countdown}s
                                        </span>
                                    </div>
                                </div>

                                <CustomButton
                                    onClick={handleContinue}
                                    variant="primary"
                                    className="w-full"
                                    size="large"
                                >
                                    <ExternalLink size={18} />
                                    Tiếp tục đến link đích
                                    <ArrowRight size={18} />
                                </CustomButton>

                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                                    Nếu không tự động chuyển, hãy bấm nút ở trên
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
                        <p>© 2026 CNcode. Tất cả quyền được bảo lưu.</p>
                    </div>
            </div>
        </div>
    );
}
