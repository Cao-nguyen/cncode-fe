// app/thanh-toan/bao-tri/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
    CreditCard,
    Settings,
    AlertCircle,
    ArrowLeft,
    Clock,
    ShieldAlert,
    MessageCircle
} from 'lucide-react';

export default function PaymentMaintenancePage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">

                {/* Biểu tượng bảo trì */}
                <div className="relative inline-flex mb-8">
                    {/* Hiệu ứng vòng tròn xoay nhẹ phía sau */}
                    <div className="absolute inset-0 bg-orange-50 rounded-full scale-150 blur-3xl opacity-60" />

                    <div className="relative w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-[32px] shadow-2xl shadow-orange-100 flex items-center justify-center">
                        <CreditCard className="w-10 h-10 text-white" />

                        {/* Icon bánh răng đang xoay biểu thị đang sửa chữa */}
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                            <Settings className="w-6 h-6 text-orange-500 animate-spin-slow" />
                        </div>
                    </div>
                </div>

                {/* Nội dung thông báo */}
                <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight uppercase">
                    Hệ thống thanh toán bảo trì
                </h1>

                <p className="text-gray-500 text-sm leading-relaxed mb-10 px-2">
                    Chúng tôi đang tiến hành nâng cấp cổng thanh toán để mang lại trải nghiệm tốt hơn.
                    Tính năng này <span className="font-bold text-orange-600">tạm thời bị khóa</span> và sẽ sớm hoạt động trở lại.
                </p>

                {/* Thông tin chi tiết */}
                <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-left">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Thời gian dự kiến</p>
                            <p className="text-sm font-bold text-gray-700">Hoàn thành trong vài ngày tới</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <ShieldAlert className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">An toàn dữ liệu</p>
                            <p className="text-sm font-bold text-gray-700">Mọi giao dịch cũ vẫn an toàn</p>
                        </div>
                    </div>
                </div>

                {/* Nút hành động */}
                <div className="flex flex-col gap-4">
                    <Link href="https://zalo.me/0394217863" target="_blank">
                        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-orange-500 transition-all flex items-center justify-center gap-2 group">
                            <MessageCircle className="w-4 h-4" />
                            Liên hệ Admin qua Zalo
                        </button>
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0 dream); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 4s linear infinite;
                }
            `}</style>
        </div>
    );
}