import type { Metadata } from 'next';
import { CreateShortLink } from '@/components/shortlink/CreateShortLink';
import { MyLinksList } from '@/components/shortlink/MyLinksList';

export const metadata: Metadata = {
    title: 'Rút gọn link',
    description: 'Tạo link rút gọn miễn phí, tùy chỉnh theo ý bạn. Theo dõi lượt click và quản lý link dễ dàng.',
};

export default function RutgonLinkPage() {
    return (
        <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-main">Rút gọn link</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Tạo link ngắn gọn, dễ nhớ. Tùy chỉnh theo ý muốn và theo dõi hiệu quả.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
                <CreateShortLink />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Link của bạn
                </h2>
                <MyLinksList />
            </div>
        </div>
    );
}