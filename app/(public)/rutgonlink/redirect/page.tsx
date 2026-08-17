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
        <div className="min-h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col lg:flex items-center justify-center p-0 lg:px-10 relative">
            {/* Banner - Full Screen */}
            <img 
                src="/b.jpg" 
                alt="Banner CNcode" 
                className="w-full h-full object-contain cursor-pointer lg:w-[calc(100vw-20px)] lg:object-cover lg:h-auto"
                onClick={handleContinue}
            />

            {/* Progress Bar and Button - Mobile/MD Only */}
            <div className="lg:hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-3 z-10 w-full">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tự động chuyển hướng sau
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {countdown}s
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Button */}
                <CustomButton
                    onClick={handleContinue}
                    variant="primary"
                    className="w-full"
                    size="medium"
                >
                    Chuyển hướng đến link gốc
                </CustomButton>
            </div>

            {/* Fixed Progress Bar and Button - Laptop Only */}
            <div className="hidden lg:flex flex-col gap-3 fixed top-[30px] left-[30px] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-3 z-10 w-[280px]">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tự động chuyển hướng sau
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {countdown}s
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Button */}
                <CustomButton
                    onClick={handleContinue}
                    variant="primary"
                    className="w-full"
                    size="medium"
                >
                    Chuyển hướng đến link gốc
                </CustomButton>
            </div>
        </div>
    );
}
