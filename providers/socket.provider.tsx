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
    const { user, token } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!token || !user) return; 

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
            setIsConnected(true);
            setSocketId(instance.id);
            setSocketState(instance);
            instance.emit('register', user.id);
        });

        instance.on('disconnect', () => {
            setIsConnected(false);
            setSocketId(undefined);
        });

        instance.on('connect_error', (error) => {
            console.error('Socket error:', error.message);
            setIsConnected(false);
        });

        return () => {
            instance.off('connect');
            instance.off('disconnect');
            instance.off('connect_error');
            instance.disconnect();
            socketRef.current = null;
            
            setSocketState(null);
            setIsConnected(false);
            setSocketId(undefined);
        };
    }, [token, user]);

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