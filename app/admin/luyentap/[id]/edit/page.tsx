'use client';

import { useParams, useSearchParams } from 'next/navigation';
import LuyentapExerciseEditorOverlay from '@/components/luyentap/LuyentapExerciseEditorOverlay';

export default function ExerciseEditorPage() {
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const isUpload = searchParams.get('upload') === '1';

    if (!id) return null;

    return <LuyentapExerciseEditorOverlay exerciseId={id} isUpload={isUpload} />;
}
