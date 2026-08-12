'use client';

import React from 'react';
import { Megaphone, X } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

interface LuyentapPreExamNoticeModalProps {
    open: boolean;
    content: string;
    onConfirm: () => void;
}

export default function LuyentapPreExamNoticeModal({
    open,
    content,
    onConfirm,
}: LuyentapPreExamNoticeModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
            <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-2xl">
                <div className="border-b border-[var(--cn-border)] px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--cn-text-main)]">Thông báo trước khi thi</h2>
                            <p className="text-sm text-[var(--cn-text-sub)]">Vui lòng đọc kỹ trước khi bắt đầu làm bài</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-y-auto px-5 py-4">
                    <div
                        className="prose prose-sm max-w-none text-[var(--cn-text-main)]"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
                <div className="border-t border-[var(--cn-border)] p-4">
                    <CustomButton className="w-full" onClick={onConfirm}>
                        Đã xem — Bắt đầu làm bài
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}
