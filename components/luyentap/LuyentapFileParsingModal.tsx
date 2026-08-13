'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LuyentapFileParsingModalProps {
    message?: string;
}

export default function LuyentapFileParsingModal({
    message = 'Đang phân tích file...',
}: LuyentapFileParsingModalProps) {
    return (
        <div className="fixed inset-0 z-[10002] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
            <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-t-2xl bg-white px-6 py-7 shadow-xl dark:bg-gray-900 sm:min-w-[260px] sm:rounded-xl sm:px-8">
                <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{message}</p>
                <p className="text-xs text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
        </div>
    );
}
