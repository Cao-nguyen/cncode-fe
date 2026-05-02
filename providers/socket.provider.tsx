// providers/socket.provider.tsx
'use client';

import { toast } from 'sonner';
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
import type {
    CoinsUpdatedPayload,
    StreakUpdatedPayload,
    RoleChangedPayload,
    NotificationPayload
} from '@/types/notification.type';

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
    const { user, token, updateCoins, updateStreak, setUser } = useAuthStore();
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

    useEffect(() => {
        if (!user?._id || !token) return;
        if (socketRef.current?.connected) return;

        const instance = io(BASE_URL, {
            auth: { token },
            transports: ['polling', 'websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        socketRef.current = instance;

        instance.on('connect', () => {
            console.log('🔌 Socket connected:', instance.id);
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            registeredRef.current = false;
        });

        instance.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        });

        instance.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error);
            setIsConnected(false);
        });

        instance.on('reconnect', (attemptNumber) => {
            console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            registeredRef.current = false;
        });

        instance.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔌 Socket reconnection attempt:', attemptNumber);
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

    useEffect(() => {
        if (!socketState || !isConnected || !user?._id || registeredRef.current) return;

        socketState.emit('register', {
            userId: user._id,
            sessionId: localStorage.getItem('sessionId') || null
        });
        registeredRef.current = true;
        console.log('📡 User registered with socket:', user._id);
    }, [socketState, isConnected, user?._id]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleRoleChanged = (data: RoleChangedPayload) => {
            console.log('📡 Role changed event received:', data);
            if (user && data.newRole !== user.role) {
                setUser({ ...user, role: data.newRole });
            }
        };

        socketState.on('role_changed', handleRoleChanged);
        return () => { socketState.off('role_changed', handleRoleChanged); };
    }, [socketState, isConnected, user, setUser]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleCoinsUpdated = (data: CoinsUpdatedPayload) => {
            console.log('📡 Coins updated event received:', data);
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.coins - currentCoins;
            updateCoins(diff);
        };

        socketState.on('coins_updated', handleCoinsUpdated);
        return () => { socketState.off('coins_updated', handleCoinsUpdated); };
    }, [socketState, isConnected, updateCoins]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleStreakUpdated = (data: StreakUpdatedPayload) => {
            console.log('📡 Streak updated event received:', data);
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

        const handleNewNotification = (data: NotificationPayload) => {
            console.log('📡 New notification event received:', data);
        };

        socketState.on('new_notification', handleNewNotification);
        return () => { socketState.off('new_notification', handleNewNotification); };
    }, [socketState, isConnected]);

    useEffect(() => {
        if (!socketState) return;

        const handleJoinedPostRoom = (data: { postSlug: string; room: string }) => {
            console.log('📡 Joined post room:', data);
        };
        const handleLeftPostRoom = (data: { postSlug: string; room: string }) => {
            console.log('📡 Left post room:', data);
        };

        socketState.on('joined_post_room', handleJoinedPostRoom);
        socketState.on('left_post_room', handleLeftPostRoom);

        return () => {
            socketState.off('joined_post_room', handleJoinedPostRoom);
            socketState.off('left_post_room', handleLeftPostRoom);
        };
    }, [socketState]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleAccountDeleted = (data: { message: string }) => {
            toast.error('Tài khoản của bạn đã bị xóa', {
                description: data.message || 'Vui lòng liên hệ admin để biết thêm chi tiết',
                duration: 5000,
            });

            // Logout user
            const { logout } = useAuthStore.getState();
            logout();

            // Chuyển về trang chủ
            window.location.href = '/';
        };

        socketState.on('account_deleted', handleAccountDeleted);
        return () => { socketState.off('account_deleted', handleAccountDeleted); };
    }, [socketState, isConnected]);

    const value = useMemo<SocketContextType>(
        () => ({ socket: socketState, isConnected, socketId, joinPostRoom, leavePostRoom }),
        [socketState, isConnected, socketId, joinPostRoom, leavePostRoom]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}