'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ExternalLink, Shield, Zap, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

export default function RedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(10);
    const [isValid, setIsValid] = useState(true);
    const [loading, setLoading] = useState(true);

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

        return () => clearInterval(timer);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            CNcode
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Nền tảng học tập & chia sẻ kiến thức
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    An toàn & Bảo mật
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Tất cả link rút gọn đều được kiểm tra và bảo mật. Bạn có thể tin tưởng sử dụng dịch vụ của chúng tôi.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="w-6 h-6 text-yellow-600" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Nhanh chóng
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Link rút gọn giúp chia sẻ URL dài một cách nhanh chóng và dễ nhớ hơn.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-6 h-6 text-green-600" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Cộng đồng lớn
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Tham gia cộng đồng học tập với hàng ngàn người dùng trên toàn quốc.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-6 h-6 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Miễn phí
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Dịch vụ rút gọn link hoàn toàn miễn phí cho tất cả người dùng.
                            </p>
                        </div>
                    </div>

                    {/* Redirect Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Bạn đang được chuyển đến link đích
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Tự động chuyển sau</span>
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full font-bold">
                                    {countdown}s
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Link đích:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                                {originalUrl}
                            </p>
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

                    {/* Footer */}
                    <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
                        <p>© 2024 CNcode. Tất cả quyền được bảo lưu.</p>
                        <CustomButton
                            onClick={() => router.push('/')}
                            variant="outline"
                            className="mt-2"
                        >
                            Về trang chủ
                        </CustomButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
