'use client';

import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Heart, ThumbsUp, Bookmark, Trash2, CheckCheck } from 'lucide-react';
import { useSocket } from '@/providers/socket.provider';
import { useAuthStore } from '@/store/auth.store';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { notificationApi } from '@/lib/api/notification.api';
import type { INotification } from '@/types/notification.type';

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
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

function getNotificationIcon(type: string, reactionType?: string) {
    switch (type) {
        case 'comment':
        case 'reply_comment':
            return <MessageCircle className="w-4 h-4 text-blue-500" />;
        case 'like_post':
            return <ThumbsUp className="w-4 h-4 text-red-500" />;
        case 'reaction_comment':
            return <Heart className="w-4 h-4 text-purple-500" />;
        case 'bookmark':
            return <Bookmark className="w-4 h-4 text-yellow-500" />;
        default:
            return <Bell className="w-4 h-4 text-gray-500" />;
    }
}

function getNotificationMessage(notification: INotification): string {
    const senderName = notification.senderId?.fullName || 'Ai đó';

    switch (notification.type) {
        case 'comment':
            return `${senderName} đã bình luận về bài viết "${notification.postTitle}"`;
        case 'reply_comment':
            return `${senderName} đã trả lời bình luận của bạn`;
        case 'like_post':
            return `${senderName} đã thích bài viết "${notification.postTitle}"`;
        case 'reaction_comment':
            const reaction = REACTION_NAMES[notification.reactionType || 'like'];
            return `${senderName} đã ${reaction} bình luận của bạn`;
        case 'bookmark':
            return `${senderName} đã lưu bài viết "${notification.postTitle}"`;
        default:
            return `${senderName} đã có hoạt động mới`;
    }
}

export default function NotificationBell() {
    const { user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchNotifications = async (pageNum: number = 1) => {
        setIsLoading(true);
        try {
            const data = await notificationApi.getMyNotifications(pageNum);
            if (pageNum === 1) {
                setNotifications(data.notifications);
            } else {
                setNotifications(prev => [...prev, ...data.notifications]);
            }
            setUnreadCount(data.unreadCount);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationApi.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationApi.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
            toast.success('Đã đánh dấu tất cả là đã đọc');
        } catch (error) {
            console.error('Mark all as read error:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await notificationApi.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            toast.success('Đã xóa thông báo');
        } catch (error) {
            console.error('Delete notification error:', error);
            toast.error('Xóa thất bại');
        }
    };

    const loadMore = () => {
        if (page < totalPages && !isLoading) {
            fetchNotifications(page + 1);
        }
    };

    useEffect(() => {
        if (open && notifications.length === 0) {
            fetchNotifications(1);
        }
    }, [open]);

    useEffect(() => {
        if (user?._id) {
            fetchUnreadCount();
        }
    }, [user?._id]);

    useEffect(() => {
        if (!socket || !isConnected || !user?._id) return;

        const handleNewNotification = (data: INotification) => {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast.success('Thông báo mới!', {
                description: getNotificationMessage(data),
                duration: 3000,
            });
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, isConnected, user?._id]);

    if (!user?._id) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-label="Thông báo"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Thông báo
                        {unreadCount > 0 && (
                            <span className="ml-2 text-xs text-gray-500">({unreadCount} chưa đọc)</span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs h-8"
                        >
                            <CheckCheck className="w-3.5 h-3.5 mr-1" />
                            Đọc tất cả
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-main" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Bell className="w-12 h-12 mb-3 opacity-50" />
                            <p className="text-sm">Chưa có thông báo nào</p>
                            <p className="text-xs text-gray-400 mt-1">Khi có hoạt động mới, thông báo sẽ hiển thị tại đây</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification._id}
                                    href={`/baiviet/${notification.postSlug || notification.postId}`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            markAsRead(notification._id);
                                        }
                                        setOpen(false);
                                    }}
                                    className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={notification.senderId?.avatar} />
                                                <AvatarFallback className="bg-main/10 text-main text-sm">
                                                    {notification.senderId?.fullName?.charAt(0) || 'N'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                {getNotificationMessage(notification)}
                                            </p>
                                            {notification.content && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.content}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-400">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => deleteNotification(notification._id, e)}
                                            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                            aria-label="Xóa"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && page < totalPages && (
                        <div className="p-3 text-center border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadMore}
                                disabled={isLoading}
                                className="text-xs"
                            >
                                {isLoading ? 'Đang tải...' : 'Xem thêm'}
                            </Button>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}