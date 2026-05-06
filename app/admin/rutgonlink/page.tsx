// app/admin/rutgon-link/page.tsx
'use client';

import { AdminLinksTable } from '@/components/shortlink/AdminLinksTable';
import { Link2, Trash2, Copy, ExternalLink } from 'lucide-react';

export default function AdminRutgonLinkPage() {
    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--cn-text-main)]">
                        Quản lý link rút gọn
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-1">
                        Xem và xóa tất cả link rút gọn của người dùng trên hệ thống
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-[var(--cn-primary)]/10 px-3 py-1.5 rounded-full">
                        <span className="text-xs font-medium text-[var(--cn-primary)]">Quản trị</span>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] shadow-[var(--cn-shadow-sm)] border border-[var(--cn-border)] overflow-hidden">
                <div className="p-4 sm:p-6">
                    <AdminLinksTable />
                </div>
            </div>

            {/* Hướng dẫn nhỏ */}
            <div className="bg-[var(--cn-bg-section)] rounded-[var(--cn-radius-md)] p-4 border border-[var(--cn-border)]">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--cn-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Link2 size={16} className="text-[var(--cn-primary)]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--cn-text-main)]">Về link rút gọn</h3>
                        <p className="text-xs text-[var(--cn-text-muted)] mt-1">
                            Quản trị viên có thể xem và xóa tất cả link rút gọn trên hệ thống.
                            Người dùng có thể tạo link rút gọn tùy chỉnh và theo dõi số lượt click.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}