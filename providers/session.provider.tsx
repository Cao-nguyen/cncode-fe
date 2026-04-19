'use client';

import { useEffect } from 'react';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const sessionId = document.cookie.match(/sessionId=([^;]+)/)?.[1];
        if (!sessionId) {
            document.cookie = `sessionId=${crypto.randomUUID()}; path=/; max-age=${30 * 24 * 60 * 60}`;
        }
    }, []);

    return <>{children}</>;
}