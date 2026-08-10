'use client';

import { useState } from 'react';
import { AdminStatsCards } from '@/components/shortlink/AdminStatsCards';
import { AdminLinksTable } from '@/components/shortlink/AdminLinksTable';
import { CreateShortLink } from '@/components/shortlink/CreateShortLink';
import { CustomButton } from '@/components/custom/CustomButton';
import { Plus, X } from 'lucide-react';

export default function AdminShortLinkPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--cn-text-main)]">Quản lý Short Link</h1>
                    <p className="text-sm text-[var(--cn-text-muted)] mt-1">Quản lý tất cả link rút gọn trên hệ thống</p>
                </div>
                <CustomButton onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo link mới
                </CustomButton>
            </div>

            <AdminStatsCards />
            <AdminLinksTable />

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsCreateModalOpen(false)}>
                    <div
                        className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-lg)] w-full max-w-2xl shadow-2xl border border-[var(--cn-border)] max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-[var(--cn-bg-card)] border-b border-[var(--cn-border)] p-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">Tạo link rút gọn mới</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-[var(--cn-bg-section)] transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--cn-text-muted)]" />
                            </button>
                        </div>
                        <div className="p-6">
                            <CreateShortLink />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
