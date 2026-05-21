// providers/socket.provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

// ========== ĐỊNH NGHĨA VÀ EXPORT CÁC INTERFACES ==========

export type UserRole = "admin" | "teacher" | "user";

export interface OnlineUser {
    userId: string;
    fullName: string;
    avatar: string | null;
    role: string;
    device: string;
}

// THÊM EXPORT CHO CÁI NÀY ĐỂ FIX LỖI BẠN VỪA GẶP
export interface OnlineStatsPayload {
    users: number;
    guests: number;
}

export interface CoinsUpdatedPayload {
    coins: number;
}

export interface StreakUpdatedPayload {
    streak: number;
    totalCoins: number;
}

export interface RoleChangedPayload {
    newRole: string;
}

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
    joinPostRoom: (postSlug: string) => void;
    leavePostRoom: (postSlug: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: [],
    joinPostRoom: () => { },
    leavePostRoom: () => { },
});

export const useSocket = () => useContext(SocketContext);

const getBaseUrl = (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl ? apiUrl.replace(/\/api$/, '') : 'https://api.cncode.io.vn';
};

const BASE_URL = getBaseUrl();

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user, updateCoins, updateStreak, setUser } = useAuthStore();
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

    const socketRef = useRef<Socket | null>(null);
    const hasRegisteredRef = useRef<string>("");

    const register = useCallback((targetSocket: Socket): void => {
        if (!targetSocket.connected) return;

        const sid: string = localStorage.getItem('guestSessionId') || Math.random().toString(36).substring(2);
        localStorage.setItem('guestSessionId', sid);

        targetSocket.emit('register', {
            userId: user?._id,
            sessionId: sid,
            role: user?.role?.toUpperCase() || 'GUEST',
            device: /android|iphone|ipad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        });

        hasRegisteredRef.current = targetSocket.id || "";
    }, [user?._id, user?.role]);

    useEffect((): (() => void) => {
        if (socketRef.current) return () => { };

        const instance: Socket = io(BASE_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 10,
            withCredentials: true,
            timeout: 20000,
        });

        socketRef.current = instance;

        instance.on('connect', (): void => {
            setIsConnected(true);
            setSocketState(instance);
            register(instance);
        });

        instance.on('disconnect', (): void => {
            setIsConnected(false);
            setSocketState(null);
            hasRegisteredRef.current = "";
        });

        instance.on('online_users_list', (users: OnlineUser[]): void => {
            setOnlineUsers(users);
        });

        instance.on('force_logout', (data: { message: string }): void => {
            toast.error('🔴 Hệ thống', { description: data.message });
            useAuthStore.getState().logout();
            window.location.href = '/';
        });

        instance.on('coins_updated', (data: CoinsUpdatedPayload): void => {
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.coins - currentCoins;
            if (diff !== 0) updateCoins(diff);
        });

        instance.on('streak_updated', (data: StreakUpdatedPayload): void => {
            updateStreak(data.streak);
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.totalCoins - currentCoins;
            if (diff !== 0) updateCoins(diff);
        });

        instance.on('role_changed', (data: RoleChangedPayload): void => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
                setUser({
                    ...currentUser,
                    role: data.newRole.toLowerCase() as UserRole
                });
            }
        });

        instance.on('profile_updated', (data: UserProfilePayload): void => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser && data.user) {
                const safeAvatar = data.user.avatar === null ? undefined : (data.user.avatar || currentUser.avatar);
                setUser({
                    ...currentUser,
                    ...data.user,
                    avatar: safeAvatar,
                    role: (data.user.role?.toLowerCase() || currentUser.role) as UserRole
                });
            }
        });

        instance.on('avatar_updated', (data: { avatar: string }): void => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
                setUser({ ...currentUser, avatar: data.avatar });
            }
        });

        const heartbeat = setInterval((): void => {
            if (instance.connected) instance.emit('heartbeat');
        }, 25000);

        return () => {
            clearInterval(heartbeat);
            instance.disconnect();
            socketRef.current = null;
        };
    }, [register, setUser, updateCoins, updateStreak]);

    useEffect((): void => {
        if (socketRef.current?.connected) {
            register(socketRef.current);
        }
    }, [user?._id, register]);

    const joinPostRoom = useCallback((postSlug: string): void => {
        socketRef.current?.emit('join_post_room', { postSlug });
    }, []);

    const leavePostRoom = useCallback((postSlug: string): void => {
        socketRef.current?.emit('leave_post_room', { postSlug });
    }, []);

    const value = useMemo((): SocketContextType => ({
        socket: socketState,
        isConnected,
        onlineUsers,
        joinPostRoom,
        leavePostRoom
    }), [socketState, isConnected, onlineUsers, joinPostRoom, leavePostRoom]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}