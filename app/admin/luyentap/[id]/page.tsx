'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLuyentapOverviewPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    useEffect(() => {
        if (!id) return;
        router.replace(`/admin/luyentap?overview=${encodeURIComponent(id)}`);
    }, [id, router]);

    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
    );
}
