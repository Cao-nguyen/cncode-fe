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
import { useAuthStore } from '@/store/auth.store';

type SocketInstance = ReturnType<typeof import('socket.io-client')['io']>;

interface SocketContextType {
    socket: SocketInstance | null;
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

    const socketRef = useRef<SocketInstance | null>(null);
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

        let cancelled = false;

        const init = async () => {
            const { io } = await import('socket.io-client');

            if (cancelled) return;

            const instance = io(BASE_URL, {
                auth: { token },
                transports: ['websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
            });

            socketRef.current = instance;

            instance.on('connect', () => {
                setIsConnected(true);
                setSocketId(instance.id);
            });

            instance.on('disconnect', () => {
                setIsConnected(false);
                setSocketId(undefined);
            });

            instance.on('connect_error', () => {
                setIsConnected(false);
                setSocketId(undefined);
            });
        };

        init();

        return () => {
            cancelled = true;
            socketRef.current?.off('connect');
            socketRef.current?.off('disconnect');
            socketRef.current?.off('connect_error');
            socketRef.current?.disconnect();
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