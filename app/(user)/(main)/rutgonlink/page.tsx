import type { Metadata } from 'next';
import { CreateShortLink } from '@/components/shortlink/CreateShortLink';
import { MyLinksList } from '@/components/shortlink/MyLinksList';
import { UserStatsOverview } from '@/components/shortlink/UserStatsOverview';
import { ApiKeySection } from '@/components/shortlink/ApiKeySection';

export const metadata: Metadata = {
    title: 'Rút gọn link',
    description: 'Tạo link rút gọn miễn phí, tùy chỉnh theo ý bạn. Theo dõi lượt click và quản lý link dễ dàng.',
};

export default function RutgonLinkPage() {
    return (
        <div className="min-h-screen pt-16 pb-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-main">Rút gọn link</h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Tạo link ngắn gọn, dễ nhớ. Tùy chỉnh theo ý muốn và theo dõi hiệu quả.
                    </p>
                </div>

                {/* Main Content - 2 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form and Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                            <CreateShortLink />
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                            <UserStatsOverview />
                        </div>
                    </div>

                    {/* Right Column - Links List and API Key */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                                Link của bạn
                            </h2>
                            <MyLinksList />
                        </div>

                        <ApiKeySection />
                    </div>
                </div>
            </div>
        </div>
    );
}
