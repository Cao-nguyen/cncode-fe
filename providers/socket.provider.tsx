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

// Định nghĩa đầy đủ interface để tránh lỗi 'any'
interface OnlineUser {
    userId: string;
    fullName: string;
    avatar?: string;
    role?: string;
    device?: string;
}

interface OnlineStats {
    users: number;
    guests: number;
    total: number;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    socketId: string | undefined;
    onlineUsers: OnlineUser[];
    onlineStats: OnlineStats;
    joinPostRoom: (postSlug: string) => void;
    leavePostRoom: (postSlug: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    socketId: undefined,
    onlineUsers: [],
    onlineStats: { users: 0, guests: 0, total: 0 },
    joinPostRoom: () => { },
    leavePostRoom: () => { },
});

export const useSocket = () => useContext(SocketContext);

const getBaseUrl = (): string => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.cncode.io.vn';
};

const BASE_URL = getBaseUrl();

const getSessionId = (): string | null => {
    if (typeof window === 'undefined') return null;
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
};

const getDeviceInfo = (): string => {
    if (typeof window === 'undefined') return 'Unknown';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/windows/i.test(ua)) return 'Windows';
    if (/mac/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Web/Other';
};

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, token, updateCoins, updateStreak, setUser } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [onlineStats, setOnlineStats] = useState<OnlineStats>({ users: 0, guests: 0, total: 0 });

    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentRoomRef = useRef<string | null>(null);

    const joinPostRoom = useCallback((postSlug: string) => {
        if (socketRef.current?.connected && currentRoomRef.current !== postSlug) {
            if (currentRoomRef.current) socketRef.current.emit('leave_post_room', { postSlug: currentRoomRef.current });
            currentRoomRef.current = postSlug;
            socketRef.current.emit('join_post_room', { postSlug });
        }
    }, []);

    const leavePostRoom = useCallback((postSlug: string) => {
        if (socketRef.current?.connected && currentRoomRef.current === postSlug) {
            socketRef.current.emit('leave_post_room', { postSlug });
            currentRoomRef.current = null;
        }
    }, []);

    const emitRegister = useCallback((socket: Socket) => {
        const sessionId = getSessionId();
        const device = getDeviceInfo();
        if (token && user?._id) {
            socket.emit('register', { userId: user._id, sessionId, role: user.role, device });
        } else if (sessionId) {
            socket.emit('register', { sessionId, device });
        }
    }, [token, user]);

    useEffect(() => {
        const instance = io(BASE_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 2000,
            withCredentials: true,
            path: '/socket.io',
        });

        socketRef.current = instance;

        instance.on('connect', () => {
            console.log('✅ Socket.IO connected');
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            emitRegister(instance);

            // Start Heartbeat
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = setInterval(() => {
                if (instance.connected) instance.emit('heartbeat', { timestamp: Date.now() });
            }, 20000);
        });

        instance.on('disconnect', (reason) => {
            console.log('🔌 Socket.IO disconnected:', reason);
            setIsConnected(false);
            setSocketId(undefined);
        });

        // --- ONLINE DATA LISTENERS ---
        instance.on('online_stats', (data: OnlineStats) => {
            setOnlineStats(data);
        });

        instance.on('online_users', (users: OnlineUser[]) => {
            setOnlineUsers(users);
        });

        instance.on('user_online', (userData: OnlineUser) => {
            setOnlineUsers(prev => {
                if (prev.some(u => u.userId === userData.userId)) return prev;
                return [...prev, userData];
            });
        });

        instance.on('user_offline', (data: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
        });

        // --- BUSINESS LOGIC & NOTIFICATIONS ---
        instance.on('force_logout', (data: { code?: string; message: string }) => {
            const isBanned = data.code === 'USER_BANNED';
            toast.error(isBanned ? '🔴 Tài khoản bị khóa' : '⛔ Tài khoản bị xóa', {
                description: data.message || 'Vui lòng liên hệ quản trị viên',
            });
            useAuthStore.getState().logout();
            window.location.href = '/';
        });

        instance.on('role_changed', (data: RoleChangedPayload) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser && data.newRole !== currentUser.role) {
                setUser({ ...currentUser, role: data.newRole as any, requestedRole: null });
                toast.info('Quyền hạn đã được cập nhật', { description: `Vai trò mới: ${data.newRole}` });
            }
        });

        instance.on('role_request_resolved', (data: { approved: boolean; newRole: string }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
                setUser({ ...currentUser, role: data.newRole as any, requestedRole: null });
                data.approved ? toast.success('Yêu cầu nâng cấp thành công!') : toast.error('Yêu cầu bị từ chối');
            }
        });

        instance.on('coins_updated', (data: CoinsUpdatedPayload) => {
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.coins - currentCoins;
            if (diff !== 0) {
                updateCoins(diff);
                if (diff > 0) toast.success(`+${diff} xu`, { description: `Tổng: ${data.coins}` });
            }
        });

        instance.on('streak_updated', (data: StreakUpdatedPayload) => {
            updateStreak(data.streak);
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.totalCoins - currentCoins;
            if (diff !== 0) updateCoins(diff);
            toast.success(`🔥 Streak: ${data.streak} ngày!`, { description: `Nhận +${diff} xu` });
        });

        instance.on('profile_updated', (data: { user: any }) => {
            if (data.user) setUser(data.user);
        });

        instance.on('avatar_updated', (data: { avatar: string }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) setUser({ ...currentUser, avatar: data.avatar });
        });

        return () => {
            instance.disconnect();
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
            socketRef.current = null;
        };
    }, [emitRegister, updateCoins, updateStreak, setUser]);

    // Re-register khi Auth thay đổi
    useEffect(() => {
        if (socketRef.current?.connected) emitRegister(socketRef.current);
    }, [user?._id, token, emitRegister]);

    const value = useMemo(() => ({
        socket: socketState,
        isConnected,
        socketId,
        onlineUsers,
        onlineStats,
        joinPostRoom,
        leavePostRoom
    }), [socketState, isConnected, socketId, onlineUsers, onlineStats, joinPostRoom, leavePostRoom]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}