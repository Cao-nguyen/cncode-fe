import type { Metadata } from 'next';
import { CreateShortLink } from '@/components/shortlink/CreateShortLink';
import { MyLinksList } from '@/components/shortlink/MyLinksList';
import { UserStatsOverview } from '@/components/shortlink/UserStatsOverview';

export const metadata: Metadata = {
    title: 'Rút gọn link',
    description: 'Tạo link rút gọn miễn phí, tùy chỉnh theo ý bạn. Theo dõi lượt click và quản lý link dễ dàng.',
};

export default function RutgonLinkPage() {
    return (
        <div className="min-h-screen pt-12 sm:pt-12 md:pt-16 lg:pt-[20px] pb-8 px-4 sm:px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cn-text-main)]">Rút gọn link</h1>
                    <p className="text-xs sm:text-sm text-[var(--cn-text-muted)] mt-1">
                        Tạo link ngắn gọn, dễ nhớ. Tùy chỉnh theo ý muốn và theo dõi hiệu quả.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="mb-6">
                    <UserStatsOverview />
                </div>

                {/* Main Content - 2 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-4">
                    {/* Left Column - Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                            <CreateShortLink />
                        </div>
                    </div>

                    {/* Right Column - Links List */}
                    <div className="md:col-span-2">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-[var(--cn-text-main)] mb-4">
                                Danh sách link
                            </h2>
                            <MyLinksList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
