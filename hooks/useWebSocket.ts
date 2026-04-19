'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import io from 'socket.io-client';

export const useWebSocket = () => {
    const [onlineStats, setOnlineStats] = useState({ guests: 0, users: 0, total: 0, userList: [] });
    const { user } = useAuthStore();

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

        const getSessionId = () => {
            const match = document.cookie.match(/sessionId=([^;]+)/);
            return match ? match[1] : null;
        };

        socket.on('connect', () => {
            socket.emit('register', {
                userId: user?.id || null,
                sessionId: getSessionId()
            });
        });

        socket.on('online_stats', (stats) => {
            setOnlineStats(stats);
        });

        const ping = setInterval(() => socket.emit('ping'), 5000);

        return () => {
            clearInterval(ping);
            socket.disconnect();
        };
    }, [user?.id]);

    return { onlineStats };
};