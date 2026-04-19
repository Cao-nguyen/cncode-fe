'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useMemo,
    type ReactNode,
} from 'react';
import { type Socket } from 'socket.io-client';
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
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!token || !user) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setSocketId(undefined);
            return;
        }

        const init = async () => {
            const { io } = await import('socket.io-client');

            const instance: Socket = io(BASE_URL, {
                auth: { token },
                transports: ['websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
            });

            socketRef.current = instance;

            const onConnect = () => {
                setIsConnected(true);
                setSocketId(instance.id);
            };

            const onDisconnect = () => {
                setIsConnected(false);
                setSocketId(undefined);
            };

            instance.on('connect', onConnect);
            instance.on('disconnect', onDisconnect);
            instance.on('connect_error', onDisconnect);
        };

        init();

        return () => {
            const instance = socketRef.current;
            if (!instance) return;

            instance.off('connect');
            instance.off('disconnect');
            instance.off('connect_error');
            instance.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setSocketId(undefined);
        };
    }, [token, user]);

    const value = useMemo<SocketContextType>(
        () => ({
            socket: socketRef.current,
            isConnected,
            socketId,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isConnected, socketId],
    );

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}