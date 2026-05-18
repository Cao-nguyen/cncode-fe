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

// Lấy base URL từ env
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cncode.io.vn';

// Debug log
if (typeof window !== 'undefined') {
    console.log('🔌 Socket.IO connecting to:', BASE_URL);
}

// Lấy session ID từ localStorage
const getSessionId = (): string | null => {
    if (typeof window === 'undefined') return null;
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
};

// Lấy thông tin thiết bị
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
    const registeredRef = useRef(false);
    const reconnectAttempts = useRef(0);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastPongRef = useRef<number | null>(null);
    const forceReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentRoomRef = useRef<string | null>(null);

    // Join post room
    const joinPostRoom = useCallback(
        (postSlug: string) => {
            if (socketState?.connected && currentRoomRef.current !== postSlug) {
                if (currentRoomRef.current) {
                    socketState.emit('leave_post_room', { postSlug: currentRoomRef.current });
                }
                currentRoomRef.current = postSlug;
                socketState.emit('join_post_room', { postSlug });
            }
        },
        [socketState]
    );

    // Leave post room
    const leavePostRoom = useCallback(
        (postSlug: string) => {
            if (socketState?.connected && currentRoomRef.current === postSlug) {
                socketState.emit('leave_post_room', { postSlug });
                currentRoomRef.current = null;
            }
        },
        [socketState]
    );

    // Start heartbeat
    const startHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

        heartbeatIntervalRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('heartbeat', { timestamp: Date.now() });
            }
        }, 20000); // 20 giây
    }, []);

    // Start activity tracking
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
        }, 60000); // 1 phút

        return () => {
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('scroll', handleUserActivity);
            window.removeEventListener('keypress', handleUserActivity);
            window.removeEventListener('mousemove', handleUserActivity);
            if (activityIntervalRef.current) clearInterval(activityIntervalRef.current);
        };
    }, []);

    // Reconnect logic
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
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 10000,
                timeout: 20000,
                withCredentials: true,
                path: '/socket.io',
            });
            socketRef.current = instance;
        }
    }, []);

    // Initialize socket connection
    useEffect(() => {
        if (lastPongRef.current === null) {
            lastPongRef.current = Date.now();
        }

        if (socketRef.current?.connected) return;

        const instance = io(BASE_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            timeout: 20000,
            withCredentials: true,
            path: '/socket.io',
        });

        socketRef.current = instance;

        // Connect event
        instance.on('connect', () => {
            console.log('✅ Socket.IO connected');
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            registeredRef.current = false;
            reconnectAttempts.current = 0;
            lastPongRef.current = Date.now();

            startHeartbeat();
            startActivityTracking();

            const sessionId = getSessionId();
            const device = getDeviceInfo();

            if (token && user?._id) {
                instance.emit('register', { userId: user._id, sessionId, role: user.role, device });
            } else if (sessionId) {
                instance.emit('register', { sessionId, device });
            }
            registeredRef.current = true;
        });

        // Disconnect event
        instance.on('disconnect', (reason) => {
            console.log('🔌 Socket.IO disconnected, reason:', reason);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;

            if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
                forceReconnectTimeoutRef.current = setTimeout(() => {
                    reconnect();
                }, 3000);
            }
        });

        // Connect error event
        instance.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error.message);
            setIsConnected(false);
            reconnectAttempts.current++;

            if (reconnectAttempts.current > 3 && instance.io.opts.transports?.[0] === 'websocket') {
                console.log('Falling back to polling transport');
                instance.io.opts.transports = ['polling', 'websocket'];
                setTimeout(() => {
                    instance.connect();
                }, 1000);
            } else if (reconnectAttempts.current < 10) {
                const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts.current), 15000);
                setTimeout(() => {
                    instance.connect();
                }, delay);
            }
        });

        // Pong event
        instance.on('pong', () => {
            lastPongRef.current = Date.now();
        });

        // Cleanup
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

    // Health check
    useEffect(() => {
        if (!socketState?.connected) return;

        const healthCheck = setInterval(() => {
            const now = Date.now();
            const timeSinceLastPong = lastPongRef.current ? now - lastPongRef.current : 0;

            if (timeSinceLastPong > 90000 && socketState.connected) {
                console.log('Health check failed, reconnecting...');
                reconnect();
            }
        }, 30000);

        return () => clearInterval(healthCheck);
    }, [socketState, reconnect]);

    // Register on auth change
    useEffect(() => {
        if (!socketState || !isConnected) return;
        if (registeredRef.current) return;

        const sessionId = getSessionId();
        const device = getDeviceInfo();

        if (token && user?._id) {
            socketState.emit('register', { userId: user._id, sessionId, role: user.role, device });
            registeredRef.current = true;
        } else if (sessionId) {
            socketState.emit('register', { sessionId, device });
            registeredRef.current = true;
        }
    }, [socketState, isConnected, token, user?._id, user?.role]);

    // Handle online users list
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

    // Handle user online/offline events
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

    // Handle force logout
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

    // Handle role changed
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: RoleChangedPayload) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser && data.newRole !== currentUser.role) {
                setUser({ ...currentUser, role: data.newRole, requestedRole: null });
                toast.info('Quyền hạn đã được cập nhật', {
                    description: `Vai trò mới: ${data.newRole}`,
                });
            }
        };

        socketState.on('role_changed', handler);
        return () => { socketState.off('role_changed', handler); };
    }, [socketState, isConnected, setUser]);

    // Handle role request resolved
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
                if (data.approved) {
                    toast.success('Yêu cầu nâng cấp được chấp thuận!', {
                        description: `Chúc mừng! Bạn đã trở thành ${data.newRole}`,
                    });
                } else {
                    toast.error('Yêu cầu nâng cấp bị từ chối');
                }
            }
        };

        socketState.on('role_request_resolved', handler);
        return () => { socketState.off('role_request_resolved', handler); };
    }, [socketState, isConnected, setUser]);

    // Handle coins updated
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: CoinsUpdatedPayload) => {
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.coins - currentCoins;
            if (diff !== 0) {
                updateCoins(diff);
                if (diff > 0) {
                    toast.success(`+${diff} xu`, {
                        description: `Tổng số xu: ${data.coins}`,
                    });
                }
            }
        };

        socketState.on('coins_updated', handler);
        return () => { socketState.off('coins_updated', handler); };
    }, [socketState, isConnected, updateCoins]);

    // Handle streak updated
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: StreakUpdatedPayload) => {
            updateStreak(data.streak);
            const currentCoins = useAuthStore.getState().coins;
            const diff = data.totalCoins - currentCoins;
            if (diff !== 0) updateCoins(diff);
            toast.success(`🔥 Streak: ${data.streak} ngày!`, {
                description: `Nhận được +${diff} xu`,
            });
        };

        socketState.on('streak_updated', handler);
        return () => { socketState.off('streak_updated', handler); };
    }, [socketState, isConnected, updateStreak, updateCoins]);

    // Handle profile updated
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { user: typeof user }) => {
            if (data.user) setUser(data.user);
        };

        socketState.on('profile_updated', handler);
        return () => { socketState.off('profile_updated', handler); };
    }, [socketState, isConnected, setUser]);

    // Handle avatar updated
    useEffect(() => {
        if (!socketState || !isConnected) return;

        const handler = (data: { avatar: string }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) setUser({ ...currentUser, avatar: data.avatar });
        };

        socketState.on('avatar_updated', handler);
        return () => { socketState.off('avatar_updated', handler); };
    }, [socketState, isConnected, setUser]);

    // Handle visibility change (tab focus)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (socketRef.current && !socketRef.current.connected) {
                    console.log('Tab focused, reconnecting...');
                    reconnect();
                } else if (socketRef.current?.connected) {
                    socketRef.current.emit('ping');
                    const timeout = setTimeout(() => {
                        if (lastPongRef.current && Date.now() - lastPongRef.current > 10000) {
                            console.log('No pong response, reconnecting...');
                            reconnect();
                        }
                    }, 5000);
                    socketRef.current.once('pong', () => clearTimeout(timeout));
                }
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