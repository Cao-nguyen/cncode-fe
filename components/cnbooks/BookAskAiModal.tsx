'use client';

import React from 'react';
import { Bot, Loader2, X } from 'lucide-react';

interface BookAskAiModalProps {
    open: boolean;
    selectedText: string;
    answer: string;
    loading: boolean;
    error: string | null;
    onClose: () => void;
}

export function BookAskAiModal({
    open,
    selectedText,
    answer,
    loading,
    error,
    onClose,
}: BookAskAiModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/30"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Hỏi AI</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5">
                            Đoạn đã chọn
                        </p>
                        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 line-clamp-4 italic">
                            &ldquo;{selectedText}&rdquo;
                        </p>
                    </div>

                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5">
                            Giải thích
                        </p>
                        {loading && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                AI đang trả lời...
                            </div>
                        )}
                        {error && !loading && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                                {error}
                            </p>
                        )}
                        {answer && !loading && (
                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {answer}
                            </p>
                        )}
                    </div>
                </div>

                <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
