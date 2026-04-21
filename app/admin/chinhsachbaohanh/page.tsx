// app/admin/chinhsachbaohanh/page.tsx
'use client';

import PageEditor from '@/components/admin/PageEditor';
import { systemSettingsApi } from '@/lib/api/system-settings.api';
import { useAuthStore } from '@/store/auth.store';

export default function ChinhSachBaoHanhPage() {
    const { token } = useAuthStore();

    return (
        <PageEditor
            title="Chính sách bảo hành"
            field="chinhSachBaoHanh"
            apiUpdate={systemSettingsApi.updateChinhSachBaoHanh}
            previewLink="/chinhsachbaohanh"
        />
    );
}