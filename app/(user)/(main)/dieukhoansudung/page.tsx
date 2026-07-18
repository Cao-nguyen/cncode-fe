
'use client';

import { usePublicContent } from '@/hooks/systemSettings/usePublicContent';
import { FileText } from 'lucide-react';
import SystemSettingsPage from '@/components/systemSettings/SystemSettingsPage';

export default function TermsOfUsePage() {
    const { content, loading } = usePublicContent('dieu-khoan-su-dung');

    return (
        <SystemSettingsPage
            content={content?.content || ''}
            title="Điều khoản sử dụng"
            description="Điều khoản và điều kiện sử dụng dịch vụ CNcode"
            icon={<FileText className="w-8 h-8 text-white" />}
            loading={loading}
        />
    );
}
