// app/admin/huongdanthanhtoan/page.tsx
'use client';

import PageEditor from '@/components/admin/PageEditor';
import { systemSettingsApi } from '@/lib/api/system-settings.api';

export default function HuongDanThanhToanPage() {
    return (
        <PageEditor
            title="Hướng dẫn thanh toán"
            field="huongDanThanhToan"
            apiUpdate={systemSettingsApi.updateHuongDanThanhToan}
            previewLink="/huongdanthanhtoan"
        />
    );
}