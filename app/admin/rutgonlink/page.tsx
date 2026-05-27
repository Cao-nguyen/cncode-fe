
'use client';

import { AdminStatsCards } from '@/components/shortlink/AdminStatsCards';
import { AdminLinksTable } from '@/components/shortlink/AdminLinksTable';

export default function AdminShortLinkPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--cn-text-main)]">Quản lý Short Link</h1>
                <p className="text-sm text-[var(--cn-text-muted)] mt-1">Quản lý tất cả link rút gọn trên hệ thống</p>
            </div>

            <AdminStatsCards />
            <AdminLinksTable />
        </div>
    );
}
