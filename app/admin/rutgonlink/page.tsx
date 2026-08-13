'use client';

import { useState } from 'react';
import { AdminStatsCards } from '@/components/shortlink/AdminStatsCards';
import { AdminLinksTable } from '@/components/shortlink/AdminLinksTable';
import { CreateShortLink } from '@/components/shortlink/CreateShortLink';
import { CustomButton } from '@/components/custom/CustomButton';
import { Plus, X } from 'lucide-react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';

export default function AdminShortLinkPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <AdminPageShell
            title="Quản lý Short Link"
            description="Quản lý tất cả link rút gọn trên hệ thống"
            action={
                <CustomButton onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo link mới
                </CustomButton>
            }
        >
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
        </AdminPageShell>
    );
}
