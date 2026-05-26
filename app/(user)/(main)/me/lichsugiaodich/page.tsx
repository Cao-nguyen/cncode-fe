import React from 'react';
import Link from 'next/link';
import { ReceiptText, PlusCircle } from 'lucide-react';

export default function EmptyTransaction() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            {/* Icon Container */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-full shadow-sm border border-gray-100">
                    <ReceiptText size={48} className="text-gray-400" strokeWidth={1.5} />
                </div>
            </div>

            {/* Content */}
            <div className="text-center max-w-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Chưa có giao dịch nào
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Có vẻ như bạn chưa thực hiện giao dịch nào trong khoảng thời gian này.
                    Các giao dịch mới sẽ được hiển thị tại đây.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};