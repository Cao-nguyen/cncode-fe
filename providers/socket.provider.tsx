'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUnreadMessagesStore } from '@/store/unreadMessages.store';
import { useConversationsStore, Message } from '@/store/conversations.store';

interface OnlineUser {
    userId?: string;
    fullName: string;
    avatar?: string;
    role?: string;
    device?: string;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: OnlineUser[];
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: [],
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const socketRef = useRef<Socket | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const { setUnreadCount } = useUnreadMessagesStore();
    const { setMessages, confirmMessage, updateConversationUnreadCount } = useConversationsStore();

    useEffect(() => {
        const getToken = (): string | null => {
            if (typeof window === 'undefined') return null;
            try {
                const raw = localStorage.getItem('auth-storage');
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                return parsed?.state?.token ?? null;
            } catch {
                return null;
            }
        };

        const token = getToken();
        if (!token) {
            console.log('[SOCKET] No token found, skipping connection');
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        console.log('[SOCKET] Connecting to:', socketUrl);

        const newSocket = io(socketUrl, {
            auth: { token },
            transports: ['polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('[SOCKET] Connected:', newSocket.id);
            setSocket(newSocket);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('[SOCKET] Disconnected:', reason);
            setSocket(null);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('[SOCKET] Connection error:', error);
            setIsConnected(false);
        });

        // QUAN TRỌNG: Xử lý new_message event
        // CHỈ set giá trị unread count từ server, KHÔNG tự cộng dồn
        newSocket.on('new_message', (data: {
            conversationId: string;
            message: Message;
            unreadCount: number;
            isOwnMessage: boolean;
        }) => {
            console.log('[SOCKET] Received new_message:', data);

            // QUAN TRỌNG: CHỈ set giá trị từ server
            setUnreadCount(
                data.conversationId,
                data.unreadCount,
                'socket.provider:new_message'
            );

            // Update conversation unread count
            updateConversationUnreadCount(data.conversationId, data.unreadCount);

            // Nếu là tin nhắn của mình (đã gửi thành công), confirm optimistic message
            if (data.isOwnMessage) {
                // Tìm optimistic message tương ứng (message cuối cùng đang isSending)
                const currentMessages = useConversationsStore.getState().messages;
                const optimisticMsg = currentMessages.find(
                    (msg: Message) => msg.isSending && msg.content === data.message.content
                );

                if (optimisticMsg) {
                    console.log('[SOCKET] Confirming optimistic message:', optimisticMsg._id, '->', data.message._id);
                    confirmMessage(optimisticMsg._id, data.message);
                }
            } else {
                // Tin nhắn từ người khác, thêm vào messages
                const currentMessages = useConversationsStore.getState().messages;
                setMessages([...currentMessages, data.message]);
            }
        });

        // Xử lý conversation_read event
        newSocket.on('conversation_read', (data: {
            conversationId: string;
            unreadCount: number;
        }) => {
            console.log('[SOCKET] Received conversation_read:', data);

            // CHỈ set giá trị từ server
            setUnreadCount(
                data.conversationId,
                data.unreadCount,
                'socket.provider:conversation_read'
            );

            updateConversationUnreadCount(data.conversationId, data.unreadCount);
        });

        // Xử lý online_users event
        newSocket.on('online_users', (data: { users: OnlineUser[] }) => {
            console.log('[SOCKET] Received online_users:', data);
            console.log('[SOCKET] Users data:', JSON.stringify(data.users, null, 2));
            setOnlineUsers(data.users || []);
        });

        // Cleanup: Xóa TẤT CẢ listeners khi unmount để tránh duplicate
        return () => {
            console.log('[SOCKET] Cleaning up socket connection');
            newSocket.off('connect');
            newSocket.off('disconnect');
            newSocket.off('connect_error');
            newSocket.off('new_message');
            newSocket.off('conversation_read');
            newSocket.off('online_users');
            newSocket.close();
        };
    }, []); // Chỉ chạy 1 lần khi mount

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
}