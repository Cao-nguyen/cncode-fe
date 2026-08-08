'use client';

import { useRouter } from 'next/navigation';
import { Shield, Zap, Users, CheckCircle, AlertTriangle, Home } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

export default function LinkExpiredPage() {
    const router = useRouter();

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

                    {/* Error Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-300" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            Link đã hết hạn
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                            Link rút gọn này đã hết hạn hoặc không còn tồn tại. Vui lòng liên hệ người chia sẻ link để lấy link mới.
                        </p>
                        <div className="flex justify-center">
                            <CustomButton onClick={() => router.push('/')} variant="primary">
                                <Home size={18} />
                                Về trang chủ
                            </CustomButton>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Info Cards */}
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
