// app/admin/dieukhoansudung/page.tsx
'use client';

import PageEditor from '@/components/admin/PageEditor';
import { systemSettingsApi } from '@/lib/api/system-settings.api';

export default function DieuKhoanSuDungPage() {
    return (
        <PageEditor
            title="Điều khoản sử dụng"
            field="dieuKhoanSuDung"
            apiUpdate={systemSettingsApi.updateDieuKhoanSuDung}
            previewLink="/dieukhoansudung"
        />
    );
}