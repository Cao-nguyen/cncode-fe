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
        // Chỉ kết nối khi có token VÀ đã onboard VÀ có user.id
        if (!token || !isOnboarded || !user?.id) {
            console.log('Socket not connecting - missing requirements');
            return;
        }

        if (socketRef.current?.connected) {
            console.log('Socket already connected');
            return;
        }

        console.log('Creating socket connection...');
        const instance = io(BASE_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socketRef.current = instance;

        instance.on('connect', () => {
            console.log('Socket connected:', instance.id);
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            registeredRef.current = false;
        });

        instance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
            setSocketId(undefined);
            registeredRef.current = false;
        });

        instance.on('connect_error', (error) => {
            console.error('Socket error:', error.message);
            setIsConnected(false);
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
    }, [token, isOnboarded, user?.id]);

    // Register user sau khi connected
    useEffect(() => {
        if (!socketState || !isConnected) return;
        if (!user?.id) return;
        if (registeredRef.current) return;

        console.log('Registering user:', user.id);
        socketState.emit('register', { userId: user.id });
        registeredRef.current = true;
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