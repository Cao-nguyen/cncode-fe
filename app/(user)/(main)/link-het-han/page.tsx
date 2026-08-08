'use client';

import Link from 'next/link';
import { XCircle, Home, ArrowLeft } from 'lucide-react';

export default function LinkExpiredPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Link đã hết hạn
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        Link rút gọn này đã hết hạn hoặc không còn tồn tại. Vui lòng liên hệ người gửi để lấy link mới.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                        >
                            <Home size={18} />
                            Về trang chủ
                        </Link>
                        
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                        >
                            <ArrowLeft size={18} />
                            Quay lại
                        </button>
                    </div>
                </div>
                
                <p className="text-center text-sm text-gray-500 mt-6">
                    CNcode - Rút gọn link miễn phí
                </p>
            </div>
        </div>
    );
}
