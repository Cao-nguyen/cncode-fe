// providers/socket.provider.tsx (thêm phần online users vào context)
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
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import type {
    CoinsUpdatedPayload,
    StreakUpdatedPayload,
    RoleChangedPayload,
} from '@/types/notification.type';

interface OnlineUser {
    userId: string;
    fullName: string;
    avatar?: string;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    socketId: string | undefined;
    onlineUsers: OnlineUser[];
    joinPostRoom: (postSlug: string) => void;
    leavePostRoom: (postSlug: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    socketId: undefined,
    onlineUsers: [],
    joinPostRoom: () => { },
    leavePostRoom: () => { },
});

export const useSocket = () => useContext(SocketContext);

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
};

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, token, updateCoins, updateStreak, setUser } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const registeredRef = useRef(false);

    const joinPostRoom = useCallback(
        (postSlug: string) => {
            if (socketState?.connected) {
                socketState.emit('join_post_room', { postSlug });
            }
        },
        [socketState]
    );

    const leavePostRoom = useCallback(
        (postSlug: string) => {
            if (socketState?.connected) {
                socketState.emit('leave_post_room', { postSlug });
            }
        },
        [socketState]
    );

    // Khởi tạo socket
    useEffect(() => {
        if (socketRef.current?.connected) return;

        const instance = io(BASE_URL, {
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

        instance.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        });

        instance.on('connect_error', (error) => {
            console.error('Socket connect error:', error);
            setIsConnected(false);
        });

        return () => {
            instance.disconnect();
            socketRef.current = null;
            setSocketState(null);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        };
    }, []);

    // Register
    useEffect(() => {
        if (!socketState || !isConnected || registeredRef.current) return;

        const sessionId = getSessionId();

        if (token && user?._id) {
            socketState.emit('register', { userId: user._id, sessionId });
            console.log('📡 Registered user:', user._id);
        } else if (sessionId) {
            socketState.emit('register', { sessionId });
            console.log('📡 Registered guest:', sessionId);
        }

        registeredRef.current = true;
    }, [socketState, isConnected, token, user?._id]);

    // Ping interval
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const pingInterval = setInterval(() => {
            if (socketState.connected) {
                socketState.emit('ping');
            }
        }, 10000);

        return () => clearInterval(pingInterval);
    }, [socketState, isConnected]);

    // Lắng nghe online_users từ server
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleOnlineUsers = (users: OnlineUser[]) => {
            setOnlineUsers(users);
        };

        socketState.on('online_users', handleOnlineUsers);

        return () => {
            socketState.off('online_users', handleOnlineUsers);
        };
    }, [socketState, isConnected]);

    // Lắng nghe user_online và user_offline events
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleUserOnline = (userData: OnlineUser) => {
            setOnlineUsers(prev => {
                if (prev.some(u => u.userId === userData.userId)) return prev;
                return [...prev, userData];
            });
        };

        const handleUserOffline = (data: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
        };

        socketState.on('user_online', handleUserOnline);
        socketState.on('user_offline', handleUserOffline);

        return () => {
            socketState.off('user_online', handleUserOnline);
            socketState.off('user_offline', handleUserOffline);
        };
    }, [socketState, isConnected]);

    // Các event listeners khác...
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { code?: string; message: string }) => {
            const isBanned = data.code === 'USER_BANNED';
            toast.error(isBanned ? '🔴 Tài khoản bị khóa' : '⛔ Tài khoản bị xóa', {
                description: data.message || 'Vui lòng liên hệ quản trị viên',
                duration: 6000,
            });
            useAuthStore.getState().logout();
            localStorage.removeItem('token');
            localStorage.removeItem('auth-storage');
            window.location.href = '/';
        };

        socketState.on('force_logout', handler);
        return () => { socketState.off('force_logout', handler); };
    }, [socketState, isConnected]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: RoleChangedPayload) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser && data.newRole !== currentUser.role) {
                setUser({ ...currentUser, role: data.newRole, requestedRole: null });
            }
        };

        socketState.on('role_changed', handler);
        return () => { socketState.off('role_changed', handler); };
    }, [socketState, isConnected, setUser]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { approved: boolean; newRole: string }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
                setUser({
                    ...currentUser,
                    role: data.newRole as typeof currentUser.role,
                    requestedRole: null,
                });
            }
        };

        socketState.on('role_request_resolved', handler);
        return () => { socketState.off('role_request_resolved', handler); };
    }, [socketState, isConnected, setUser]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: CoinsUpdatedPayload) => {
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.coins - currentCoins;
            if (diff !== 0) updateCoins(diff);
        };

        socketState.on('coins_updated', handler);
        return () => { socketState.off('coins_updated', handler); };
    }, [socketState, isConnected, updateCoins]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: StreakUpdatedPayload) => {
            updateStreak(data.streak);
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.totalCoins - currentCoins;
            if (diff !== 0) updateCoins(diff);
        };

        socketState.on('streak_updated', handler);
        return () => { socketState.off('streak_updated', handler); };
    }, [socketState, isConnected, updateStreak, updateCoins]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { user: typeof user }) => {
            if (data.user) setUser(data.user);
        };

        socketState.on('profile_updated', handler);
        return () => { socketState.off('profile_updated', handler); };
    }, [socketState, isConnected, setUser]);

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { avatar: string }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) setUser({ ...currentUser, avatar: data.avatar });
        };

        socketState.on('avatar_updated', handler);
        return () => { socketState.off('avatar_updated', handler); };
    }, [socketState, isConnected, setUser]);

    const value = useMemo<SocketContextType>(
        () => ({
            socket: socketState,
            isConnected,
            socketId,
            onlineUsers,
            joinPostRoom,
            leavePostRoom
        }),
        [socketState, isConnected, socketId, onlineUsers, joinPostRoom, leavePostRoom]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}