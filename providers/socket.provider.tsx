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
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    socketId: undefined,
});

export const useSocket = () => useContext(SocketContext);

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:5000';

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, token, isOnboarded } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);
    const registeredRef = useRef(false);

    useEffect(() => {
        if (!token || !isOnboarded || !user?.id) {
            console.log('🔌 Socket not connecting - missing requirements', {
                hasToken: !!token,
                isOnboarded,
                hasUserId: !!user?.id
            });
            return;
        }

        if (socketRef.current?.connected) {
            console.log('🔌 Socket already connected');
            return;
        }

        console.log('🔌 Creating socket connection...', BASE_URL);

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
    }, [token, isOnboarded, user?.id]);

    useEffect(() => {
        if (!socketState || !isConnected) return;
        if (!user?.id) {
            console.log('⚠️ Cannot register: no user.id');
            return;
        }
        if (registeredRef.current) return;

        console.log('📝 Registering user with socket:', user.id);

        // ✅ Gửi userId, sessionId có thể null — server không chặn nữa
        socketState.emit('register', {
            userId: user.id,
            sessionId: null  // httpOnly cookie không đọc được từ JS, server xử lý ok
        });
        registeredRef.current = true;

        socketState.once('registered', (data) => {
            console.log('✅ User registered successfully:', data);
        });
    }, [socketState, isConnected, user?.id]);

    const value = useMemo<SocketContextType>(
        () => ({ socket: socketState, isConnected, socketId }),
        [socketState, isConnected, socketId],
    );

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}