// providers/socket.provider.tsx
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

    // ─── Khởi tạo socket ────────────────────────────────────────────
    useEffect(() => {
        if (!user?._id || !token) return;
        // Nếu đã có kết nối đang chạy thì không tạo mới
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

        return () => {
            instance.disconnect();
            socketRef.current = null;
            setSocketState(null);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        };
    }, [user?._id, token]);

    // ─── Register vào room cá nhân ──────────────────────────────────
    useEffect(() => {
        if (!socketState || !isConnected || !user?._id || registeredRef.current) return;

        socketState.emit('register', {
            userId: user._id,
            sessionId: typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null,
        });
        registeredRef.current = true;
    }, [socketState, isConnected, user?._id]);

    // ─── force_logout ────────────────────────────────────────────────
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

    // ─── role_changed ─────────────────────────────────────────────────
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: RoleChangedPayload) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser && data.newRole !== currentUser.role) {
                // FIX: reset requestedRole khi role thay đổi
                setUser({ ...currentUser, role: data.newRole, requestedRole: null });
            }
        };

        socketState.on('role_changed', handler);
        return () => { socketState.off('role_changed', handler); };
    }, [socketState, isConnected, setUser]);

    // ─── role_request_resolved ────────────────────────────────────────
    // FIX: Lắng nghe event mới để reset requestedRole khi admin approve/reject
    // Xử lý cả trường hợp rejected (role không đổi nhưng requestedRole phải = null)
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

    // ─── coins_updated ────────────────────────────────────────────────
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

    // ─── streak_updated ───────────────────────────────────────────────
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

    // ─── profile_updated ──────────────────────────────────────────────
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { user: typeof user }) => {
            if (data.user) setUser(data.user);
        };

        socketState.on('profile_updated', handler);
        return () => { socketState.off('profile_updated', handler); };
    }, [socketState, isConnected, setUser]);

    // ─── avatar_updated ───────────────────────────────────────────────
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
        () => ({ socket: socketState, isConnected, socketId, joinPostRoom, leavePostRoom }),
        [socketState, isConnected, socketId, joinPostRoom, leavePostRoom]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}