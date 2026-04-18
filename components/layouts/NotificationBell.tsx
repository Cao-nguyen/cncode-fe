'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, MessageCircle, Heart } from 'lucide-react';
import { useSocket } from '@/providers/socket.provider';
import { useAuthStore } from '@/store/auth.store';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { INotification } from '@/types/notification.type';
import Link from 'next/link';

interface Notification {
    id: string;
    type: 'comment' | 'reaction';
    postId: string;
    postTitle: string;
    commentId?: string;
    reactionType?: string;
    userName: string;
    content?: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const { socket } = useSocket();
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (hasLoadedRef.current) return;

        const savedNotifications = localStorage.getItem(`notifications_${user?.id}`);
        if (savedNotifications) {
            const parsed = JSON.parse(savedNotifications);
            setNotifications(parsed);
            setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
            hasLoadedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notificationData: INotification) => {
            const newNotification: Notification = {
                id: Date.now().toString(),
                type: notificationData.type,
                postId: notificationData.postId || '',
                postTitle: notificationData.postTitle || '',
                userName: notificationData.userName || '',
                commentId: notificationData.commentId,
                reactionType: notificationData.reactionType,
                content: notificationData.content,
                read: false,
                createdAt: new Date().toISOString()
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            setNotifications(prevNotifications => {
                const updated = [newNotification, ...prevNotifications];
                localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated));
                return updated;
            });
        };

        socket.on('new_notification', handleNewNotification);
        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, user?.id, notifications]);

    const markAsRead = (notificationId: string) => {
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
        localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated));
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        setUnreadCount(0);
        localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated));
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const getNotificationContent = (notification: Notification) => {
        if (notification.type === 'comment') {
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <MessageCircle size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm">
                            <span className="font-semibold">{notification.userName}</span>{' '}
                            đã bình luận về bài viết{' '}
                            <span className="font-medium">{notification.postTitle}</span>
                        </p>
                        {notification.content && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.content}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                    </div>
                </div>
            );
        } else {
            const reactionNames: Record<string, string> = {
                like: '👍 thích',
                love: '❤️ yêu thích',
                care: '🤗 quan tâm',
                haha: '😂 haha',
                wow: '😲 wow',
                sad: '😢 buồn',
                angry: '😠 phẫn nộ'
            };
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                        <Heart size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm">
                            <span className="font-semibold">{notification.userName}</span>{' '}
                            đã {reactionNames[notification.reactionType || 'like']} bình luận của bạn
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                    </div>
                </div>
            );
        }
    };

    if (!user) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Thông báo</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                        >
                            Đánh dấu đã đọc
                        </button>
                    )}
                </div>
                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Bell size={40} className="mb-2 opacity-50" />
                            <p className="text-sm">Chưa có thông báo nào</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={`/baiviet/${notification.postId}`}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        setOpen(false);
                                    }}
                                    className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                                        }`}
                                >
                                    {getNotificationContent(notification)}
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}