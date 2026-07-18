
'use client';

import { usePublicContent } from '@/hooks/systemSettings/usePublicContent';
import { Shield } from 'lucide-react';
import SystemSettingsPage from '@/components/systemSettings/SystemSettingsPage';

export default function SecurityPolicyPage() {
    const { content, loading } = usePublicContent('an-toan-bao-mat');

    return (
        <SystemSettingsPage
            content={content?.content || ''}
            title="An toàn bảo mật"
            description="Chính sách bảo mật thông tin của CNcode"
            icon={<Shield className="w-8 h-8 text-white" />}
            loading={loading}
        />
    );
}
