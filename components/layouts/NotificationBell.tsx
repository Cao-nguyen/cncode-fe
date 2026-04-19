'use client';

import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Heart, ThumbsUp } from 'lucide-react';
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
    type: 'comment' | 'reaction_comment' | 'like_post';
    postSlug: string;
    postTitle: string;
    commentId?: string;
    reactionType?: string;
    userName: string;
    content?: string;
    read: boolean;
    createdAt: string;
}

const REACTION_NAMES: Record<string, string> = {
    like: '👍 thích',
    love: '❤️ yêu thích',
    care: '🤗 quan tâm',
    haha: '😂 haha',
    wow: '😲 wow',
    sad: '😢 buồn',
    angry: '😠 phẫn nộ',
};

function formatTime(dateString: string): string {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(dateString).toLocaleDateString('vi-VN');
}

function getNotificationContent(notification: Notification) {
    if (notification.type === 'comment') {
        return (
            <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full shrink-0">
                    <MessageCircle size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm">
                        <span className="font-semibold">{notification.userName}</span>{' '}
                        đã bình luận về bài viết{' '}
                        <span className="font-medium">{notification.postTitle}</span>
                    </p>
                    {notification.content && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.content}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                </div>
            </div>
        );
    }

    if (notification.type === 'like_post') {
        return (
            <div className="flex items-start gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full shrink-0">
                    <ThumbsUp size={16} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm">
                        <span className="font-semibold">{notification.userName}</span>{' '}
                        đã thích bài viết{' '}
                        <span className="font-medium">{notification.postTitle}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full shrink-0">
                <Heart size={16} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm">
                    <span className="font-semibold">{notification.userName}</span>{' '}
                    đã {REACTION_NAMES[notification.reactionType || 'like']} bình luận của bạn
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
            </div>
        </div>
    );
}

function loadNotifications(userId: string): Notification[] {
    try {
        const saved = localStorage.getItem(`notifications_${userId}`);
        return saved ? (JSON.parse(saved) as Notification[]) : [];
    } catch {
        return [];
    }
}

function NotificationBellInner({ userId }: { userId: string }) {
    const { socket } = useSocket();

    const [notifications, setNotifications] = useState<Notification[]>(() =>
        loadNotifications(userId),
    );
    const [unreadCount, setUnreadCount] = useState<number>(
        () => loadNotifications(userId).filter((n) => !n.read).length,
    );
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data: INotification) => {
            const newNotification: Notification = {
                id: crypto.randomUUID(),
                type: data.type,
                postSlug: data.postId || '',  // ✅ BE gửi field tên postId nhưng chứa slug
                postTitle: data.postTitle || '',
                userName: data.userName || 'Người dùng',
                commentId: data.commentId,
                reactionType: data.reactionType,
                content: data.content,
                read: false,
                createdAt: new Date().toISOString(),
            };

            setNotifications((prev) => {
                const updated = [newNotification, ...prev];
                localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
                return updated;
            });
            setUnreadCount((prev) => prev + 1);
        };

        socket.on('new_notification', handleNewNotification);
        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, userId]);

    const markAsRead = (notificationId: string) => {
        setNotifications((prev) => {
            const updated = prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n,
            );
            setUnreadCount(updated.filter((n) => !n.read).length);
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
            return updated;
        });
    };

    const markAllAsRead = () => {
        setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, read: true }));
            setUnreadCount(0);
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
            return updated;
        });
    };

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
                                    href={`/baiviet/${notification.postSlug}`} // ✅ dùng postSlug
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        setOpen(false);
                                    }}
                                    className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${!notification.read
                                        ? 'bg-blue-50 dark:bg-blue-950/20'
                                        : ''
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

export default function NotificationBell() {
    const { user } = useAuthStore();
    if (!user?.id) return null;
    return <NotificationBellInner userId={user.id} />;
}