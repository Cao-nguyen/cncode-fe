// app/admin/gioithieu/page.tsx
'use client';

import PageEditor from '@/components/admin/PageEditor';
import { systemSettingsApi } from '@/lib/api/system-settings.api';

export default function GioiThieuPage() {
    return (
        <PageEditor
            title="Giới thiệu về CNcode"
            field="gioiThieu"
            apiUpdate={systemSettingsApi.updateGioiThieu}
            previewLink="/gioithieu"
        />
    );
}