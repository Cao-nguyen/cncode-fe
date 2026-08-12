'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ExerciseEditorPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isUpload = searchParams.get('upload') === '1';

    useEffect(() => {
        if (!id) return;
        const params = new URLSearchParams({ edit: id });
        if (isUpload) params.set('upload', '1');
        router.replace(`/admin/luyentap?${params.toString()}`);
    }, [id, isUpload, router]);

    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
    );
}
