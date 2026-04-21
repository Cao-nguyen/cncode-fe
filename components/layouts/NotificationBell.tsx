'use client';

import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Heart, ThumbsUp, Bookmark } from 'lucide-react';
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

interface NotificationItem {
    id: string;
    type: 'comment' | 'reaction_comment' | 'like_post' | 'reply_comment' | 'bookmark';
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

function getNotificationContent(notification: NotificationItem) {
    if (notification.type === 'comment' || notification.type === 'reply_comment') {
        return (
            <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full shrink-0">
                    <MessageCircle size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm">
                        <span className="font-semibold">{notification.userName}</span>{' '}
                        {notification.type === 'reply_comment' ? 'đã trả lời bình luận của bạn' : 'đã bình luận'} về bài viết{' '}
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

    if (notification.type === 'reaction_comment') {
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

    if (notification.type === 'bookmark') {
        return (
            <div className="flex items-start gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full shrink-0">
                    <Bookmark size={16} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm">
                        <span className="font-semibold">{notification.userName}</span>{' '}
                        đã lưu bài viết của bạn{' '}
                        <span className="font-medium">{notification.postTitle}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                </div>
            </div>
        );
    }

    return null;
}

function loadNotifications(userId: string): NotificationItem[] {
    try {
        const saved = localStorage.getItem(`notifications_${userId}`);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function NotificationBellInner({ userId }: { userId: string }) {
    const { socket, isConnected } = useSocket();
    const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
        loadNotifications(userId),
    );
    const [unreadCount, setUnreadCount] = useState<number>(
        () => loadNotifications(userId).filter((n) => !n.read).length,
    );
    const [open, setOpen] = useState(false);

    useEffect(() => {
        console.log('🔔 NotificationBell - Socket state:', { socket: !!socket, isConnected, userId });
    }, [socket, isConnected, userId]);

    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('🔕 NotificationBell - Socket not ready');
            return;
        }

        console.log('🔔 NotificationBell - Setting up notification listener');

        const handleNewNotification = (data: INotification) => {
            console.log('🔔🔔🔔 FRONTEND RECEIVED NOTIFICATION:', data);

            const newNotification: NotificationItem = {
                id: crypto.randomUUID(),
                type: data.type,
                postSlug: data.postSlug || data.postId || '',
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

            let message = '';
            if (data.type === 'like_post') {
                message = `${data.userName} đã thích bài viết "${data.postTitle}"`;
            } else if (data.type === 'comment') {
                message = `${data.userName} đã bình luận về bài viết "${data.postTitle}"`;
            } else if (data.type === 'reply_comment') {
                message = `${data.userName} đã trả lời bình luận của bạn`;
            } else if (data.type === 'reaction_comment') {
                message = `${data.userName} đã phản ứng bình luận của bạn`;
            } else if (data.type === 'bookmark') {
                message = `${data.userName} đã lưu bài viết "${data.postTitle}"`;
            }

            if (message) {
                console.log("success")
            }
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, isConnected, userId]);

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
                                    href={`/baiviet/${notification.postSlug}`}
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
    console.log('🔔 NotificationBell - User:', user?.id);
    if (!user?.id) return null;
    return <NotificationBellInner userId={user.id} />;
}