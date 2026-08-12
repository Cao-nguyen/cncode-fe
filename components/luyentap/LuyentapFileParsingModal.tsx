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
        <div className="fixed inset-0 z-[10002] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl px-8 py-7 flex flex-col items-center gap-3 shadow-xl min-w-[260px]">
                <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{message}</p>
                <p className="text-xs text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
        </div>
    );
}
