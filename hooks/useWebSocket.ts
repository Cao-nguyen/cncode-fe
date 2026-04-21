'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import io from 'socket.io-client';

interface OnlineStats {
    guests: number;
    users: number;
    total: number;
    userList: string[];
}

export const useWebSocket = () => {
    const [onlineStats, setOnlineStats] = useState<OnlineStats>({
        guests: 0, users: 0, total: 0, userList: []
    });
    const userId = useAuthStore((state) => state.user?.id);

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

        const getSessionId = (): string | null => {
            const match = document.cookie.match(/sessionId=([^;]+)/);
            return match ? match[1] : null;
        };

        socket.on('connect', () => {
            socket.emit('register', {
                userId: userId ?? null,
                sessionId: getSessionId()
            });
        });

        socket.on('online_stats', (stats: OnlineStats) => {
            setOnlineStats(stats);
        });

        const ping = setInterval(() => socket.emit('ping'), 5000);

        return () => {
            clearInterval(ping);
            socket.disconnect();
        };
    }, [userId]);

    return { onlineStats };
};