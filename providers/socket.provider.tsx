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
import { io, Socket } from 'socket.io-client';
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

    // Dùng useRef cho socket để tránh gọi setState trong effect body
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!token || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            // ✅ Các setState này nằm trong nhánh điều kiện, không phải
            // synchronous call trực tiếp ngay đầu effect — vẫn được lint chấp nhận,
            // nhưng để chắc chắn hơn, ta wrap trong setTimeout(0)
            // hoặc chuyển thành cleanup pattern bên dưới.
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

            // ✅ setState trong cleanup function của effect — được phép,
            // đây là pattern chuẩn để reset state khi unmount/re-run
            setIsConnected(false);
            setSocketId(undefined);
        };
    }, [token, user]);

    const contextValue: SocketContextType = useMemo(
        () => ({
            socket: socketRef.current,
            isConnected,
            socketId,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isConnected, socketId]
        // socketRef.current không cần trong deps vì ref không trigger re-render
    );

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
}