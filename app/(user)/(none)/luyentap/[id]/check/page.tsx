'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import LuyentapCheckClient from '@/components/luyentap/LuyentapCheckClient';

export default function LuyentapCheckPage() {
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const answerId = searchParams.get('answerId');
    const scoreParam = parseFloat(searchParams.get('score') || '0');
    const passedParam = searchParams.get('passed') === 'true';
    const coinsParam = parseInt(searchParams.get('coins') || '0', 10);
    const totalParam = parseInt(searchParams.get('total') || '0', 10);

    return (
        <LuyentapCheckClient
            slug={id}
            answerId={answerId}
            scoreParam={scoreParam}
            passedParam={passedParam}
            coinsParam={coinsParam}
            totalParam={totalParam}
        />
    );
}
