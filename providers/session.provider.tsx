'use client';

import { useEffect } from 'react';

function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        return [...bytes].map((b, i) =>
            [4, 6, 8, 10].includes(i)
                ? `-${b.toString(16).padStart(2, '0')}`
                : b.toString(16).padStart(2, '0')
        ).join('');
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const sessionId = document.cookie.match(/sessionId=([^;]+)/)?.[1];
        if (!sessionId) {
            document.cookie = `sessionId=${generateId()}; path=/; max-age=${30 * 24 * 60 * 60}`;
        }
    }, []);

    return <>{children}</>;
}