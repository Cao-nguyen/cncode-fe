// app/admin/antoanbaomat/page.tsx
'use client';

import PageEditor from '@/components/admin/PageEditor';
import { systemSettingsApi } from '@/lib/api/system-settings.api';

export default function AnToanBaoMatPage() {
    return (
        <PageEditor
            title="An toàn & bảo mật"
            field="anToanBaoMat"
            apiUpdate={systemSettingsApi.updateAnToanBaoMat}
            previewLink="/antoanbaomat"
        />
    );
}