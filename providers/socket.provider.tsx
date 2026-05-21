'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

// ========== INTERFACES ==========
export type UserRole = "admin" | "teacher" | "user";

export interface OnlineUser {
    userId: string;
    fullName: string;
    avatar: string | null | undefined;
    role: string;
    device: string;
}

export interface OnlineStatsPayload {
    users: number;
    guests: number;
}

export interface CoinsUpdatedPayload { coins: number; }
export interface StreakUpdatedPayload { streak: number; totalCoins: number; }
export interface RoleChangedPayload { newRole: string; }
export interface UserProfilePayload {
    user: {
        _id: string;
        fullName?: string;
        avatar?: string | null;
        role?: string;
        [key: string]: unknown;
    };
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: OnlineUser[];
    onlineStats: OnlineStatsPayload;
    joinPostRoom: (postSlug: string) => void;
    leavePostRoom: (postSlug: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: [],
    onlineStats: { users: 0, guests: 0 },
    joinPostRoom: () => { },
    leavePostRoom: () => { },
});

export const useSocket = () => useContext(SocketContext);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
    : 'https://api.cncode.io.vn';

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user, updateCoins, updateStreak, setUser } = useAuthStore();
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [onlineStats, setOnlineStats] = useState<OnlineStatsPayload>({ users: 0, guests: 0 });

    const socketRef = useRef<Socket | null>(null);

    // Hàm báo danh (Register) - Triển khai ngay khi connect
    const register = useCallback((targetSocket: Socket): void => {
        if (!targetSocket.connected) return;
        const sid = localStorage.getItem('guestSessionId') || Math.random().toString(36).substring(2);
        localStorage.setItem('guestSessionId', sid);

        targetSocket.emit('register', {
            userId: user?._id,
            sessionId: sid,
            role: user?.role?.toUpperCase() || 'GUEST',
            device: /android|iphone|ipad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        });
        console.log('📡 [Socket] Sent Register:', user?._id || 'Guest');
    }, [user?._id, user?.role]);

    useEffect((): (() => void) => {
        if (socketRef.current) return () => { };

        const instance = io(BASE_URL, {
            transports: ['websocket'], // Bắt buộc cho Cloudflare/Nginx
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 2000,
            withCredentials: true,
            timeout: 20000,
        });

        socketRef.current = instance;

        instance.on('connect', () => {
            console.log('🔌 [Socket] Connected:', instance.id);
            setIsConnected(true);
            setSocketState(instance);
            register(instance);
        });

        instance.on('disconnect', (reason) => {
            console.log('🔌 [Socket] Disconnected:', reason);
            setIsConnected(false);
            setSocketState(null);
        });

        // --- LẮNG NGHE SỰ KIỆN ONLINE ---
        instance.on('online_stats', (data: OnlineStatsPayload) => setOnlineStats(data));
        instance.on('online_users', (users: OnlineUser[]) => setOnlineUsers(users));

        // --- LẮNG NGHE NGHIỆP VỤ ---
        instance.on('force_logout', (data: { message: string }) => {
            toast.error('Hệ thống', { description: data.message });
            useAuthStore.getState().logout();
            window.location.href = '/';
        });

        instance.on('coins_updated', (data: CoinsUpdatedPayload) => {
            const current = useAuthStore.getState().coins;
            updateCoins(data.coins - current);
        });

        instance.on('streak_updated', (data: StreakUpdatedPayload) => {
            updateStreak(data.streak);
            const currentCoins = useAuthStore.getState().coins;
            updateCoins(data.totalCoins - currentCoins);
        });

        instance.on('role_changed', (data: RoleChangedPayload) => {
            const current = useAuthStore.getState().user;
            if (current) setUser({ ...current, role: data.newRole.toLowerCase() as UserRole });
        });

        instance.on('profile_updated', (data: UserProfilePayload) => {
            const current = useAuthStore.getState().user;
            if (current && data.user) {
                const safeAvatar = data.user.avatar === null ? undefined : (data.user.avatar || current.avatar);
                setUser({
                    ...current,
                    ...data.user,
                    avatar: safeAvatar,
                    role: (data.user.role?.toLowerCase() || current.role) as UserRole
                });
            }
        });

        // Heartbeat giữ ống dẫn Cloudflare luôn mở
        const heartbeat = setInterval(() => {
            if (instance.connected) instance.emit('heartbeat');
        }, 25000);

        return () => {
            clearInterval(heartbeat);
            instance.disconnect();
            socketRef.current = null;
        };
    }, [register, setUser, updateCoins, updateStreak]);

    // Re-register khi login/logout
    useEffect(() => {
        if (socketRef.current?.connected) register(socketRef.current);
    }, [user?._id, register]);

    const joinPostRoom = useCallback((postSlug: string) => {
        socketRef.current?.emit('join_post_room', { postSlug });
    }, []);

    const leavePostRoom = useCallback((postSlug: string) => {
        socketRef.current?.emit('leave_post_room', { postSlug });
    }, []);

    const value = useMemo(() => ({
        socket: socketState,
        isConnected,
        onlineUsers,
        onlineStats,
        joinPostRoom,
        leavePostRoom
    }), [socketState, isConnected, onlineUsers, onlineStats, joinPostRoom, leavePostRoom]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}