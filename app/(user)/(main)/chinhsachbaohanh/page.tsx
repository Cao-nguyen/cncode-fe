
'use client';

import { usePublicContent } from '@/hooks/systemSettings/usePublicContent';
import { Lock } from 'lucide-react';
import SystemSettingsPage from '@/components/systemSettings/SystemSettingsPage';

export default function WarrantyPolicyPage() {
    const { content, loading } = usePublicContent('chinh-sach-bao-hanh');

    return (
        <SystemSettingsPage
            content={content?.content || ''}
            title="Chính sách bảo hành"
            description="Quy định và điều kiện bảo hành của CNcode"
            icon={<Lock className="w-8 h-8 text-white" />}
            loading={loading}
        />
    );
}
