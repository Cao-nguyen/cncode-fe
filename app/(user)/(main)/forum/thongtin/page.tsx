
'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, MessageCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function SystemErrorPage() {
    const zaloLink = "https://zalo.me/0394217863";

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {}
                <div className="relative inline-flex mb-8">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                        <span className="flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                    </div>
                </div>

                {}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Hệ thống đang gặp sự cố
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Rất tiếc, một lỗi không mong muốn đã xảy ra. Chúng tôi đã ghi nhận sự cố này và đang nỗ lực khắc phục sớm nhất có thể.
                </p>

                {}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Báo cáo sự cố</p>
                            <p className="text-sm font-semibold text-gray-700">Liên hệ Admin để được hỗ trợ nhanh nhất</p>
                        </div>
                    </div>

                    <a
                        href={zaloLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Báo lỗi qua Zalo
                    </a>
                </div>

                {}
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
