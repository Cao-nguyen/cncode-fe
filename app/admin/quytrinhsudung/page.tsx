'use client';

import PageEditor from '@/components/admin/PageEditor';
import { systemSettingsApi } from '@/lib/api/system-settings.api';

export default function QuyTrinhSuDungPage() {
    return (
        <PageEditor
            title="Quy trình sử dụng dịch vụ"
            field="quyTrinhSuDung"
            apiUpdate={systemSettingsApi.updateQuyTrinhSuDung}
            previewLink="/quytrinhsudungdichvu"
        />
    );
}