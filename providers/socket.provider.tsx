'use client';

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo,
    type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

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
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:5000';

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);
    const registeredRef = useRef(false);

    const joinPostRoom = (postSlug: string) => {
        if (socketState && isConnected) {
            console.log(`📢 Joining post room: post_${postSlug}`);
            socketState.emit('join_post_room', { postSlug });
        }
    };

    const leavePostRoom = (postSlug: string) => {
        if (socketState && isConnected) {
            console.log(`📢 Leaving post room: post_${postSlug}`);
            socketState.emit('leave_post_room', { postSlug });
        }
    };

    // ✅ Socket connection - cần cả user._id và token
    useEffect(() => {
        if (!user?._id || !token) {
            console.log('🔌 Socket not connecting - missing requirements', {
                hasUserId: !!user?._id,
                hasToken: !!token
            });
            return;
        }

        if (socketRef.current?.connected) {
            console.log('🔌 Socket already connected');
            return;
        }

        console.log('🔌 Creating socket connection...', BASE_URL);

        const instance = io(BASE_URL, {
            auth: { token },  // ✅ THÊM TOKEN VÀO ĐÂY
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
            console.log('✅ Socket connected:', instance.id);
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            registeredRef.current = false;
        });

        instance.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        });

        instance.on('connect_error', (error) => {
            console.error('⚠️ Socket connection error:', error.message);
            setIsConnected(false);
        });

        instance.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            registeredRef.current = false;
        });

        return () => {
            console.log('🔌 Cleaning up socket connection');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setSocketState(null);
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        };
    }, [user?._id, token]);  // ✅ THÊM token vào dependency

    // ✅ Register user với socket server
    useEffect(() => {
        if (!socketState || !isConnected) return;
        if (!user?._id) return;
        if (registeredRef.current) return;

        console.log('📝 Registering user with socket:', user._id);

        socketState.emit('register', {
            userId: user._id,
            sessionId: localStorage.getItem('sessionId') || null
        });
        registeredRef.current = true;

        socketState.once('registered', (data) => {
            console.log('✅ User registered successfully:', data);
        });
    }, [socketState, isConnected, user?._id]);

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
        () => ({
            socket: socketState,
            isConnected,
            socketId,
            joinPostRoom,
            leavePostRoom
        }),
        [socketState, isConnected, socketId, joinPostRoom, leavePostRoom]
    );

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}