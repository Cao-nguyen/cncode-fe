'use client';

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
    type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import type { CoinsUpdatedPayload, StreakUpdatedPayload } from '@/types/notification.type';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    socketId: string | undefined;
    joinPostRoom: (postSlug: string) => void;
    leavePostRoom: (postSlug: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    socketId: undefined,
    joinPostRoom: () => { },
    leavePostRoom: () => { },
});

export const useSocket = () => useContext(SocketContext);

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, token, updateCoins, updateStreak } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);
    const registeredRef = useRef(false);

    const joinPostRoom = useCallback((postSlug: string) => {
        if (socketState && isConnected) {
            socketState.emit('join_post_room', { postSlug });
        }
    }, [socketState, isConnected]);

    const leavePostRoom = useCallback((postSlug: string) => {
        if (socketState && isConnected) {
            socketState.emit('leave_post_room', { postSlug });
        }
    }, [socketState, isConnected]);

    // Socket connection
    useEffect(() => {
        if (!user?._id || !token) return;
        if (socketRef.current?.connected) return;

        const instance = io(BASE_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        socketRef.current = instance;

        instance.on('connect', () => {
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            registeredRef.current = false;
        });

        instance.on('disconnect', () => {
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        });

        instance.on('connect_error', () => {
            setIsConnected(false);
        });

        instance.on('reconnect', () => {
            setIsConnected(true);
            registeredRef.current = false;
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setSocketState(null);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        };
    }, [user?._id, token]);

    // Register user
    useEffect(() => {
        if (!socketState || !isConnected || !user?._id || registeredRef.current) return;

        socketState.emit('register', {
            userId: user._id,
            sessionId: localStorage.getItem('sessionId') || null
        });
        registeredRef.current = true;
    }, [socketState, isConnected, user?._id]);

    // Lắng nghe coins_updated realtime
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleCoinsUpdated = (data: CoinsUpdatedPayload) => {
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.coins - currentCoins;
            updateCoins(diff);
        };

        socketState.on('coins_updated', handleCoinsUpdated);
        return () => { socketState.off('coins_updated', handleCoinsUpdated); };
    }, [socketState, isConnected, updateCoins]);

    // Lắng nghe streak_updated realtime
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleStreakUpdated = (data: StreakUpdatedPayload) => {
            updateStreak(data.streak);
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.totalCoins - currentCoins;
            if (diff !== 0) updateCoins(diff);
        };

        socketState.on('streak_updated', handleStreakUpdated);
        return () => { socketState.off('streak_updated', handleStreakUpdated); };
    }, [socketState, isConnected, updateStreak, updateCoins]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleRoleChanged = (data: { newRole: string }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
                useAuthStore.getState().setUser({ ...currentUser, role: data.newRole as 'user' | 'teacher' | 'admin' });
            }
            // Reload để áp dụng quyền mới
            window.location.href = '/';
        };

        socketState.on('role_changed', handleRoleChanged);
        return () => { socketState.off('role_changed', handleRoleChanged); };
    }, [socketState, isConnected]);

    // Post room events
    useEffect(() => {
        if (!socketState) return;

        const handleJoinedPostRoom = (data: { postSlug: string; room: string }) => {
            console.log('✅ Joined post room:', data);
        };
        const handleLeftPostRoom = (data: { postSlug: string; room: string }) => {
            console.log('✅ Left post room:', data);
        };

        socketState.on('joined_post_room', handleJoinedPostRoom);
        socketState.on('left_post_room', handleLeftPostRoom);

        return () => {
            socketState.off('joined_post_room', handleJoinedPostRoom);
            socketState.off('left_post_room', handleLeftPostRoom);
        };
    }, [socketState]);

    const value = useMemo<SocketContextType>(
        () => ({ socket: socketState, isConnected, socketId, joinPostRoom, leavePostRoom }),
        [socketState, isConnected, socketId, joinPostRoom, leavePostRoom]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}