// hooks/useWebSocket.ts
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import io, { Socket } from 'socket.io-client';

interface OnlineStats {
    total: number;
    guests: number;
    users: number;
    userList: Array<{ userId: string; sessionId: string }>;
}

export const useWebSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineStats, setOnlineStats] = useState<OnlineStats>({ total: 0, guests: 0, users: 0, userList: [] });
    const { user, token } = useAuthStore();
    const isRegistered = useRef(false);

    useEffect(() => {
        const getSessionId = () => {
            const match = document.cookie.match(/sessionId=([^;]+)/);
            if (match && match[1]) {
                return match[1];
            }
            const newSessionId = crypto.randomUUID();
            document.cookie = `sessionId=${newSessionId}; path=/; max-age=${30 * 24 * 60 * 60}`;
            return newSessionId;
        };

        const sessionId = getSessionId();
        console.log('Session ID:', sessionId.substring(0, 8) + '...');
        console.log('Current user:', user?.id || 'Not logged in');

        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        let pingInterval: NodeJS.Timeout;

        const register = () => {
            const userId = user?.id || null;
            console.log(`Registering with userId: ${userId || 'null (guest)'}`);

            socketInstance.emit('register', {
                userId: userId,
                sessionId: sessionId
            });
            isRegistered.current = true;
        };

        socketInstance.on('connect', () => {
            console.log('WebSocket connected');
            register();

            pingInterval = setInterval(() => {
                if (socketInstance.connected) {
                    socketInstance.emit('ping');
                }
            }, 5000);
        });

        socketInstance.on('online_stats', (stats: OnlineStats) => {
            console.log('Online stats updated:', stats);
            setOnlineStats(stats);
        });

        socketInstance.on('disconnect', () => {
            console.log('WebSocket disconnected');
            isRegistered.current = false;
            if (pingInterval) {
                clearInterval(pingInterval);
            }
        });

        setSocket(socketInstance);

        return () => {
            if (pingInterval) {
                clearInterval(pingInterval);
            }
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [user?.id]); // Re-run khi userId thay đổi (đăng nhập/đăng xuất)

    // Re-register khi user thay đổi
    useEffect(() => {
        if (socket && socket.connected && isRegistered.current) {
            const userId = user?.id || null;
            const sessionId = document.cookie.match(/sessionId=([^;]+)/)?.[1] || '';
            console.log(`Re-registering due to user change: ${userId || 'guest'}`);
            socket.emit('register', {
                userId: userId,
                sessionId: sessionId
            });
        }
    }, [user?.id, socket]);

    return { socket, onlineStats };
};