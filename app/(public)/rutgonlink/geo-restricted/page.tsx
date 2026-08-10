'use client';

import { useRouter } from 'next/navigation';
import { Globe, AlertTriangle, Home } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

export default function GeoRestrictedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                <Globe className="w-10 h-10 text-orange-600 dark:text-orange-300" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            Giới hạn địa lý
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                            Link này chỉ có thể truy cập từ Việt Nam. Nếu bạn đang ở Việt Nam, vui lòng thử lại sau hoặc liên hệ người chia sẻ link.
                        </p>

                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-orange-800 dark:text-orange-200">
                                    <p className="font-medium mb-1">Thông tin:</p>
                                    <p className="text-orange-700 dark:text-orange-300">
                                        Link này được cấu hình để chỉ cho phép truy cập từ địa điểm Việt Nam để bảo vệ nội dung.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <CustomButton onClick={() => router.push('/')} variant="primary">
                                <Home size={18} />
                                Về trang chủ
                            </CustomButton>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
                        <p>© 2024 CNcode. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
