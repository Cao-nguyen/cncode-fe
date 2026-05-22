// providers/socket.provider.tsx
// ✅ FIXED: Tương thích tốt với Cloudflare + VPS NAT

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
    role?: string;      // ✅ Thêm dòng này
    device?: string;
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

const getBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return 'http://localhost:5000';
    return apiUrl.replace(/\/api$/, '');
};

const BASE_URL = getBaseUrl();

const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
        sessionId =
            crypto.randomUUID?.() ||
            Math.random().toString(36).substring(2) + Date.now().toString(36);
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
    const reconnectAttempts = useRef(0);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const activityCleanupRef = useRef<(() => void) | null>(null);
    const lastPongRef = useRef<number | null>(null);
    const forceReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const joinPostRoom = useCallback(
        (postSlug: string) => {
            if (socketState?.connected) socketState.emit('join_post_room', { postSlug });
        },
        [socketState]
    );

    const leavePostRoom = useCallback(
        (postSlug: string) => {
            if (socketState?.connected) socketState.emit('leave_post_room', { postSlug });
        },
        [socketState]
    );

    // ─── Heartbeat ────────────────────────────────────────────────────────────

    const startHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('heartbeat', { timestamp: Date.now() });
            }
        }, 25000); // mỗi 25s — dưới ngưỡng 30s của Cloudflare
    }, []);

    // ─── Activity tracking ────────────────────────────────────────────────────

    const startActivityTracking = useCallback(() => {
        const handle = () => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('user_activity', { timestamp: Date.now() });
            }
        };

        window.addEventListener('click', handle);
        window.addEventListener('keypress', handle);
        // ❌ Bỏ scroll + mousemove — quá nhiều event, không cần thiết

        activityCleanupRef.current = () => {
            window.removeEventListener('click', handle);
            window.removeEventListener('keypress', handle);
        };
    }, []);

    // ─── Reconnect ────────────────────────────────────────────────────────────

    const reconnect = useCallback(() => {
        if (forceReconnectTimeoutRef.current) clearTimeout(forceReconnectTimeoutRef.current);
        if (socketRef.current) {
            console.log('🔄 Force reconnecting...');
            socketRef.current.disconnect();
            socketRef.current.connect();
        }
    }, []);

    // ─── Khởi tạo Socket ──────────────────────────────────────────────────────

    useEffect(() => {
        if (lastPongRef.current === null) lastPongRef.current = Date.now();
        if (socketRef.current?.connected) return;

        console.log('🔌 Connecting to socket at:', BASE_URL);

        const instance = io(BASE_URL, {
            // ✅ FIX QUAN TRỌNG: polling TRƯỚC để handshake ổn định qua Cloudflare,
            // rồi tự động upgrade lên websocket
            transports: ['polling', 'websocket'],
            upgrade: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 15000,
            // ✅ Tăng timeout — Cloudflare free có thể delay connection lần đầu
            timeout: 60000,
            withCredentials: true,
        });

        socketRef.current = instance;

        // ── connect ──
        instance.on('connect', () => {
            console.log('🔌 Socket connected:', instance.id);
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            registeredRef.current = false;
            reconnectAttempts.current = 0;
            lastPongRef.current = Date.now();

            startHeartbeat();
            startActivityTracking();

            // Register ngay sau khi connect
            const sessionId = getSessionId();
            if (token && user?._id) {
                instance.emit('register', { userId: user._id, sessionId });
                console.log('📡 Registered user:', user._id);
            } else if (sessionId) {
                instance.emit('register', { sessionId });
                console.log('📡 Registered guest:', sessionId);
            }
            registeredRef.current = true;

            // ✅ FIX CHÍNH: Sau register, chủ động xin danh sách online users
            // Delay 800ms để server xử lý register xong
            setTimeout(() => {
                if (instance.connected) {
                    instance.emit('request_online_users');
                    console.log('📋 Requested online users list');
                }
            }, 800);
        });

        // ── disconnect ──
        instance.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;

            if (
                reason === 'io server disconnect' ||
                reason === 'transport close' ||
                reason === 'transport error'
            ) {
                forceReconnectTimeoutRef.current = setTimeout(reconnect, 3000);
            }
        });

        // ── connect_error ──
        instance.on('connect_error', (error) => {
            console.error('Socket connect error:', error.message);
            setIsConnected(false);
            reconnectAttempts.current++;

            // Nếu websocket fail nhiều lần, fallback về polling
            if (
                reconnectAttempts.current > 3 &&
                instance.io.opts.transports?.[0] === 'websocket'
            ) {
                console.log('⚠️ Falling back to polling...');
                instance.io.opts.transports = ['polling', 'websocket'];
            }
        });

        // ── pong ──
        instance.on('pong', () => {
            lastPongRef.current = Date.now();
        });

        // Cleanup khi unmount
        return () => {
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
            if (forceReconnectTimeoutRef.current) clearTimeout(forceReconnectTimeoutRef.current);
            activityCleanupRef.current?.();
            instance.disconnect();
            socketRef.current = null;
            setSocketState(null);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id, token]);

    // ─── Health check ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (!socketState?.connected) return;

        const healthCheck = setInterval(() => {
            const now = Date.now();
            const sinceLastPong = lastPongRef.current ? now - lastPongRef.current : 0;

            // Nếu > 90s không có pong → coi connection chết
            if (sinceLastPong > 90000 && socketState.connected) {
                console.log('⚠️ Connection seems dead, forcing reconnect...');
                reconnect();
            }
        }, 30000);

        return () => clearInterval(healthCheck);
    }, [socketState, reconnect]);

    // ─── Register (fallback nếu connect event không trigger đủ) ───────────────

    useEffect(() => {
        if (!socketState || !isConnected || registeredRef.current) return;

        const sessionId = getSessionId();
        if (token && user?._id) {
            socketState.emit('register', { userId: user._id, sessionId });
            console.log('📡 Re-registered user:', user._id);
        } else if (sessionId) {
            socketState.emit('register', { sessionId });
            console.log('📡 Re-registered guest:', sessionId);
        }
        registeredRef.current = true;
    }, [socketState, isConnected, token, user?._id]);

    // ─── online_users ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handleOnlineUsers = (users: OnlineUser[]) => {
            console.log('👥 Received online_users:', users.length);
            setOnlineUsers(users);
        };

        socketState.on('online_users', handleOnlineUsers);

        // ✅ Mỗi khi effect này chạy lại (reconnect), chủ động xin lại danh sách
        socketState.emit('request_online_users');

        return () => {
            socketState.off('online_users', handleOnlineUsers);
        };
    }, [socketState, isConnected]);

    // ─── user_online / user_offline (cập nhật realtime) ──────────────────────

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

    // ─── force_logout ─────────────────────────────────────────────────────────

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

    // ─── role_changed ─────────────────────────────────────────────────────────

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

    // ─── role_request_resolved ────────────────────────────────────────────────

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { approved: boolean; newRole: string }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
                setUser({ ...currentUser, role: data.newRole as typeof currentUser.role, requestedRole: null });
            }
        };

        socketState.on('role_request_resolved', handler);
        return () => { socketState.off('role_request_resolved', handler); };
    }, [socketState, isConnected, setUser]);

    // ─── coins_updated ────────────────────────────────────────────────────────

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

    // ─── streak_updated ───────────────────────────────────────────────────────

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

    // ─── profile_updated ──────────────────────────────────────────────────────

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { user: typeof user }) => {
            if (data.user) setUser(data.user);
        };

        socketState.on('profile_updated', handler);
        return () => { socketState.off('profile_updated', handler); };
    }, [socketState, isConnected, setUser]);

    // ─── avatar_updated ───────────────────────────────────────────────────────

    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { avatar: string }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) setUser({ ...currentUser, avatar: data.avatar });
        };

        socketState.on('avatar_updated', handler);
        return () => { socketState.off('avatar_updated', handler); };
    }, [socketState, isConnected, setUser]);

    // ─── Visibility change ────────────────────────────────────────────────────

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (socketRef.current && !socketRef.current.connected) {
                    console.log('📱 Tab visible, reconnecting...');
                    reconnect();
                } else if (socketRef.current?.connected) {
                    // ✅ Tab trở lại visible → xin lại danh sách (có thể đã thay đổi)
                    socketRef.current.emit('request_online_users');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [reconnect]);

    // ─── Context value ────────────────────────────────────────────────────────

    const value = useMemo<SocketContextType>(
        () => ({
            socket: socketState,
            isConnected,
            socketId,
            onlineUsers,
            joinPostRoom,
            leavePostRoom,
        }),
        [socketState, isConnected, socketId, onlineUsers, joinPostRoom, leavePostRoom]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}