// app/events/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Bell, ArrowLeft, Sparkles, Clock } from 'lucide-react';

export default function EventsEmptyPage() {
    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 bg-white">
            <div className="max-w-md w-full text-center">

                {/* Hình ảnh minh họa / Icon Group */}
                <div className="relative inline-flex mb-10">
                    {/* Vòng tròn trang trí phía sau */}
                    <div className="absolute inset-0 bg-blue-50 rounded-full scale-150 blur-2xl opacity-60 animate-pulse" />

                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] shadow-2xl shadow-blue-200 flex items-center justify-center rotate-3 group hover:rotate-0 transition-transform duration-500">
                        <Calendar className="w-10 h-10 text-white" />

                        {/* Badge nhỏ xinh */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                    </div>
                </div>

                {/* Nội dung thông báo */}
                <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                    Chưa có sự kiện nào diễn ra
                </h1>

                <p className="text-gray-500 text-sm leading-relaxed mb-10 px-4">
                    Hiện tại hệ thống chưa tổ chức sự kiện nào mới. Chúng tôi đang chuẩn bị những nội dung hấp dẫn nhất dành cho bạn.
                </p>

                {/* Box thời gian quay lại */}
                <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 mb-10 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        Lịch hẹn
                    </div>
                    <div className="text-gray-800 font-bold">
                        Vui lòng quay lại vào <span className="text-blue-600 text-xl font-black ml-1">15 tháng 06</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Chúng tôi sẽ mở cửa đăng ký vào ngày này.</p>
                </div>

                {/* Nút hành động */}
                <div className="flex flex-col gap-4">

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}