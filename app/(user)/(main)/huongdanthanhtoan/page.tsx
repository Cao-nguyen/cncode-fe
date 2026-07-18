
'use client';

import { usePublicContent } from '@/hooks/systemSettings/usePublicContent';
import { Wallet } from 'lucide-react';
import SystemSettingsPage from '@/components/systemSettings/SystemSettingsPage';

export default function PaymentGuidePage() {
    const { content, loading } = usePublicContent('huong-dan-thanh-toan');

    return (
        <SystemSettingsPage
            content={content?.content || ''}
            title="Hướng dẫn thanh toán"
            description="Các phương thức thanh toán và hướng dẫn sử dụng"
            icon={<Wallet className="w-8 h-8 text-white" />}
            loading={loading}
        />
    );
}
