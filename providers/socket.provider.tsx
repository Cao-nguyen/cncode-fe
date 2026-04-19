'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useRef,
    useMemo,
} from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
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

interface SocketProviderProps {
    children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const { user, token } = useAuthStore();

    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!token || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setIsConnected(false);
            setSocketId(undefined);
            return;
        }

        const baseURL =
            process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
            'http://localhost:5000';

        const socketInstance: Socket = io(baseURL, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
        });

        socketRef.current = socketInstance;

        const handleConnect = () => {
            setIsConnected(true);
            setSocketId(socketInstance.id);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
            setSocketId(undefined);
        };

        const handleConnectError = () => {
            setIsConnected(false);
            setSocketId(undefined);
        };

        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);

        return () => {
            socketInstance.off('connect', handleConnect);
            socketInstance.off('disconnect', handleDisconnect);
            socketInstance.off('connect_error', handleConnectError);
            socketInstance.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setSocketId(undefined);
        };
    }, [token, user]);

    const contextValue = useMemo<SocketContextType>(
        () => ({
            socket: socketRef.current,
            isConnected,
            socketId,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isConnected, socketId]
    );

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
}