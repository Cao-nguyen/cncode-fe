
'use client';

import { usePublicContent } from '@/hooks/systemSettings/usePublicContent';
import { Settings } from 'lucide-react';
import SystemSettingsPage from '@/components/systemSettings/SystemSettingsPage';

export default function UsagePolicyPage() {
    const { content, loading } = usePublicContent('quy-trinh-su-dung');

    return (
        <SystemSettingsPage
            content={content?.content || ''}
            title="Quy trình sử dụng"
            description="Hướng dẫn sử dụng các tính năng của CNcode"
            icon={<Settings className="w-8 h-8 text-white" />}
            loading={loading}
        />
    );
}
