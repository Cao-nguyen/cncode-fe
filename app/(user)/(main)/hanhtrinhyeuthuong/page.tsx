// app/(user)/(none)/hanhtrinhiyeuthuong/page.tsx
'use client';

import { Heart } from 'lucide-react';

export default function HanhTrinhYeuThuongPage() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex flex-col items-center justify-center text-white">
            {/* Nội dung chính giữa màn hình */}
            <div className="text-center px-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                    <Heart size={40} className="fill-white" />
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                    Hành trình yêu thương
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                    Dự án cộng đồng hỗ trợ những hoàn cảnh khó khăn<br />
                    được tiếp bước đến trường
                </p>

                <div className="bg-white/10 rounded-lg p-3 inline-block">
                    <p className="text-sm text-white/80">
                        📌 Dự án sẽ hoạt động khi nền tảng có doanh thu ổn định
                    </p>
                </div>
            </div>
        </div>
    );
}