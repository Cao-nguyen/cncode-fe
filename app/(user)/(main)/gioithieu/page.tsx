
'use client';

import { usePublicContent } from '@/hooks/systemSettings/usePublicContent';
import { Info } from 'lucide-react';
import SystemSettingsPage from '@/components/systemSettings/SystemSettingsPage';

export default function AboutPage() {
    const { content, loading } = usePublicContent('gioi-thieu');

    return (
        <SystemSettingsPage
            content={content?.content || ''}
            title="Giới thiệu"
            description="Về CNcode - Nền tảng học công nghệ và đổi mới sáng tạo"
            icon={<Info className="w-8 h-8 text-white" />}
            loading={loading}
        />
    );
}
