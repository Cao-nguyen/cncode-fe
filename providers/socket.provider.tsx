"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectToken } from "@/store/userSlice";

interface SocketContextType {
    isConnected: boolean;
    emit: (event: string, data: unknown) => void;
    on: (event: string, callback: (data: unknown) => void) => void;
    off: (event: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within SocketProvider");
    }
    return context;
};

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const user = useAppSelector(selectUser);
    const token = useAppSelector(selectToken);
    const listenersRef = useRef<Map<string, ((data: unknown) => void)[]>>(new Map());

    const emit = useCallback((event: string, data: unknown) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        }
    }, [isConnected]);

    const on = useCallback((event: string, callback: (data: unknown) => void) => {
        if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, []);
        }
        listenersRef.current.get(event)?.push(callback);

        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    }, []);

    const off = useCallback((event: string) => {
        const callbacks = listenersRef.current.get(event);
        if (callbacks && socketRef.current) {
            callbacks.forEach((callback) => {
                socketRef.current?.off(event, callback);
            });
            listenersRef.current.delete(event);
        }
    }, []);

    useEffect(() => {
        if (!user?._id || !token) {
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
        const socket = io(socketUrl, {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("register", user._id);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
            console.error("[Socket] Connection error:", error);
            setIsConnected(false);
        });

        listenersRef.current.forEach((callbacks, event) => {
            callbacks.forEach((callback) => {
                socket.on(event, callback);
            });
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [user?._id, token]);

    return (
        <SocketContext.Provider
            value={{
                isConnected,
                emit,
                on,
                off,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}