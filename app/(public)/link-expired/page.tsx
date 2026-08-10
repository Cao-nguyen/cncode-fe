
'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, AlertTriangle, Book, Star, Sparkles, Home } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

export default function LinkExpiredPage() {
    const router = useRouter();

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

                {/* Error Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-24">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-300" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Link không khả dụng
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Link rút gọn này không khả dụng vì một trong các lý do sau:
                            </p>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                                <li>• Đã hết hạn thời gian sử dụng</li>
                                <li>• Đã vượt quá giới hạn lượt truy cập</li>
                                <li>• Link đã bị xóa hoặc không tồn tại</li>
                            </ul>
                            <CustomButton
                                onClick={() => router.push('/')}
                                variant="primary"
                                className="w-full"
                                size="large"
                            >
                                <Home size={18} />
                                Về trang chủ
                            </CustomButton>
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
