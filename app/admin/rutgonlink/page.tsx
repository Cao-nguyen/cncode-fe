import type { Metadata } from 'next';
import { AdminLinksTable } from '@/components/shortlink/AdminLinksTable';

export const metadata: Metadata = {
    title: 'Quản lý link rút gọn | Admin',
    description: 'Quản lý tất cả link rút gọn trên hệ thống',
};

export default function AdminRutgonLinkPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Quản lý link rút gọn
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Xem và xóa tất cả link rút gọn của người dùng trên hệ thống
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                <AdminLinksTable />
            </div>
        </div>
    );
}