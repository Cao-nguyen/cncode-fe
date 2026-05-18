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
    role?: string;
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
        sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
};

// Hàm lấy thông tin thiết bị
const getDeviceInfo = () => {
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
    const registeredRef = useRef(false);
    const reconnectAttempts = useRef(0);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastPongRef = useRef<number | null>(null);
    const forceReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const startHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

        heartbeatIntervalRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('heartbeat', { timestamp: Date.now() });
            }
        }, 25000);
    }, []);

    const startActivityTracking = useCallback(() => {
        if (activityIntervalRef.current) clearInterval(activityIntervalRef.current);

        const handleUserActivity = () => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('user_activity', { timestamp: Date.now() });
            }
        };

        window.addEventListener('click', handleUserActivity);
        window.addEventListener('scroll', handleUserActivity);
        window.addEventListener('keypress', handleUserActivity);
        window.addEventListener('mousemove', handleUserActivity);

        activityIntervalRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('user_activity', { timestamp: Date.now() });
            }
        }, 60000);

        return () => {
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('scroll', handleUserActivity);
            window.removeEventListener('keypress', handleUserActivity);
            window.removeEventListener('mousemove', handleUserActivity);
            if (activityIntervalRef.current) clearInterval(activityIntervalRef.current);
        };
    }, []);

    const reconnect = useCallback(() => {
        if (forceReconnectTimeoutRef.current) clearTimeout(forceReconnectTimeoutRef.current);

        if (socketRef.current) {
            console.log('🔄 Attempting to reconnect...');
            socketRef.current.disconnect();
            socketRef.current.connect();
        } else {
            const instance = io(BASE_URL, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 10000,
                timeout: 30000,
                withCredentials: true,
            });
            socketRef.current = instance;
        }
    }, []);

    useEffect(() => {
        if (lastPongRef.current === null) {
            lastPongRef.current = Date.now();
        }

        if (socketRef.current?.connected) return;

        const instance = io(BASE_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            timeout: 30000,
            withCredentials: true,
        });

        socketRef.current = instance;

        instance.on('connect', () => {
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            registeredRef.current = false;
            reconnectAttempts.current = 0;
            lastPongRef.current = Date.now();

            startHeartbeat();
            startActivityTracking();

            // FIX: Truyền thêm thiết bị và role khi kết nối lại
            const sessionId = getSessionId();
            const device = getDeviceInfo();

            if (token && user?._id) {
                instance.emit('register', { userId: user._id, sessionId, role: user.role, device });
            } else if (sessionId) {
                instance.emit('register', { sessionId, device });
            }
            registeredRef.current = true;
        });

        instance.on('disconnect', (reason) => {
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;

            if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
                forceReconnectTimeoutRef.current = setTimeout(() => {
                    reconnect();
                }, 3000);
            }
        });

        instance.on('connect_error', (error) => {
            setIsConnected(false);
            reconnectAttempts.current++;

            if (reconnectAttempts.current > 3 && instance.io.opts.transports?.[0] === 'websocket') {
                instance.io.opts.transports = ['polling', 'websocket'];
                instance.connect();
            } else if (reconnectAttempts.current < 10) {
                setTimeout(() => {
                    instance.connect();
                }, Math.min(1000 * Math.pow(1.5, reconnectAttempts.current), 15000));
            }
        });

        instance.on('pong', () => {
            lastPongRef.current = Date.now();
        });

        return () => {
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
            if (activityIntervalRef.current) clearInterval(activityIntervalRef.current);
            if (forceReconnectTimeoutRef.current) clearTimeout(forceReconnectTimeoutRef.current);
            instance.disconnect();
            socketRef.current = null;
            setSocketState(null);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        };
    }, [user?._id, token, startHeartbeat, startActivityTracking, reconnect, user?.role]);

    useEffect(() => {
        if (!socketState?.connected) return;

        const healthCheck = setInterval(() => {
            const now = Date.now();
            const timeSinceLastPong = lastPongRef.current ? now - lastPongRef.current : 0;

            if (timeSinceLastPong > 90000 && socketState.connected) {
                reconnect();
            }
        }, 30000);

        return () => clearInterval(healthCheck);
    }, [socketState, reconnect]);

    useEffect(() => {
        if (!socketState || !isConnected) return;
        if (registeredRef.current) return;

        // FIX: Truyền thiết bị và Role vào socket khi user đăng nhập / đổi trạng thái token
        const sessionId = getSessionId();
        const device = getDeviceInfo();

        if (token && user?._id) {
            socketState.emit('register', { userId: user._id, sessionId, role: user.role, device });
        } else if (sessionId) {
            socketState.emit('register', { sessionId, device });
        }

        registeredRef.current = true;
    }, [socketState, isConnected, token, user?._id, user?.role]);

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

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && socketRef.current && !socketRef.current.connected) {
                reconnect();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); };
    }, [reconnect]);

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