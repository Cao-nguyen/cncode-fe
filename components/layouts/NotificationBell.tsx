'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Bell, MessageCircle, Heart, ThumbsUp, Bookmark,
    CheckCheck, Coins, Flame, Info, XCircle,
} from 'lucide-react';
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
import { notificationApi } from '@/lib/api/notification.api';
import type { INotification } from '@/types/notification.type';

// ─── Types ────────────────────────────────────────────────────────────────────

const REACTION_NAMES: Record<string, string> = {
    like: '👍 thích',
    love: '❤️ yêu thích',
    care: '🤗 quan tâm',
    haha: '😂 haha',
    wow: '😲 wow',
    sad: '😢 buồn',
    angry: '😠 phẫn nộ',
};

// Loại notification chỉ dành cho admin — KHÔNG hiển thị trong Bell người dùng thường
const ADMIN_ONLY_TYPES: INotification['type'][] = [
    'role_request_pending' as INotification['type'],
    'new_user_registered' as INotification['type'],
    'post_reported' as INotification['type'],
    'comment_reported' as INotification['type'],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isAdminOnlyType(type: INotification['type']): boolean {
    return ADMIN_ONLY_TYPES.includes(type);
}

function NotificationIcon({ type }: { type: INotification['type'] }) {
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
        case 'first_login_bonus':
            return <Coins className="w-4 h-4 text-yellow-500" />;
        case 'streak_bonus':
            return <Flame className="w-4 h-4 text-orange-500" />;
        case 'role_request_approved':
            return <CheckCheck className="w-4 h-4 text-green-500" />;
        case 'role_request_rejected':
            return <XCircle className="w-4 h-4 text-red-500" />;
        default:
            return <Info className="w-4 h-4 text-gray-500" />;
    }
}

function SystemAvatar({ type }: { type: INotification['type'] }) {
    if (type === 'first_login_bonus') {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 text-lg">
                🎉
            </div>
        );
    }
    if (type === 'streak_bonus') {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 text-lg">
                🔥
            </div>
        );
    }
    if (type === 'role_request_approved') {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 text-lg">
                ✅
            </div>
        );
    }
    if (type === 'role_request_rejected') {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0 text-lg">
                ❌
            </div>
        );
    }
    return (
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-gray-400" />
        </div>
    );
}

function getNotificationMessage(notification: INotification): string {
    const senderName = notification.senderId?.fullName || 'Ai đó';

    switch (notification.type) {
        case 'first_login_bonus':
            return notification.content || `Chào mừng! Bạn nhận được ${notification.meta?.coins ?? 100} xu khi đăng nhập lần đầu.`;
        case 'streak_bonus':
            return notification.content || `🔥 Bạn nhận được ${notification.meta?.coins} xu thưởng streak!`;
        case 'comment':
            return `${senderName} đã bình luận về bài viết "${notification.postTitle}"`;
        case 'reply_comment':
            return `${senderName} đã trả lời bình luận của bạn`;
        case 'like_post':
            return `${senderName} đã thích bài viết "${notification.postTitle}"`;
        case 'reaction_comment': {
            const reaction = REACTION_NAMES[notification.reactionType || 'like'];
            return `${senderName} đã ${reaction} bình luận của bạn`;
        }
        case 'bookmark':
            return `${senderName} đã lưu bài viết "${notification.postTitle}"`;
        default:
            return notification.content || `${senderName} đã có hoạt động mới`;
    }
}

const isSystemType = (type: INotification['type']) =>
    ['first_login_bonus', 'streak_bonus', 'system', 'role_request_approved', 'role_request_rejected'].includes(type);

const isRoleRequestType = (type: INotification['type']) =>
    type === 'role_request_approved' || type === 'role_request_rejected';

// ─── NotificationContent ──────────────────────────────────────────────────────

function NotificationContent({ data }: { data: INotification }) {
    return (
        <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 dark:text-gray-200">
                {isRoleRequestType(data.type) ? data.content : getNotificationMessage(data)}
            </p>

            {!isRoleRequestType(data.type) && (data.meta?.coins ?? 0) > 0 && (
                <p className="text-xs text-yellow-600 font-medium mt-0.5">
                    +{data.meta!.coins} xu
                </p>
            )}

            <div className="flex items-center gap-2 mt-1.5">
                <NotificationIcon type={data.type} />
                <span className="text-xs text-gray-400">{formatTime(data.createdAt)}</span>
                {!data.read && <span className="w-2 h-2 bg-main rounded-full" />}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationBell() {
    const { user, token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const isFetchingRef = useRef(false);

    const filterByRole = useCallback(
        (list: INotification[]): INotification[] => {
            if (user?.role === 'admin') return list;
            return list.filter(n => !isAdminOnlyType(n.type));
        },
        [user?.role]
    );

    const fetchNotifications = useCallback(
        async (pageNum: number = 1) => {
            if (!token || !user?._id || isFetchingRef.current) return;

            isFetchingRef.current = true;
            setIsLoading(true);
            try {
                const data = await notificationApi.getMyNotifications(pageNum);
                const filtered = filterByRole(data.notifications);

                if (pageNum === 1) {
                    setNotifications(filtered);
                    setUnreadCount(filtered.filter(n => !n.read).length);
                } else {
                    setNotifications(prev => {
                        const existingIds = new Set(prev.map(n => n._id));
                        const newItems = filtered.filter(n => !existingIds.has(n._id));
                        return [...prev, ...newItems];
                    });
                }
                setPage(data.page);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error('Fetch notifications error:', error);
            } finally {
                setIsLoading(false);
                isFetchingRef.current = false;
            }
        },
        [token, user?._id, filterByRole]
    );

    useEffect(() => {
        if (token && user?._id) {
            fetchNotifications(1);
        }
    }, [token, user?._id]);

    useEffect(() => {
        if (open && token && user?._id && unreadCount > 0) {
            fetchNotifications(1);
        }
    }, [open]);

    // ─── Socket: nhận notification mới realtime ─────────────────────────────────
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('❌ Socket not connected');
            return;
        }
        if (!user?._id) {
            console.log('❌ No user ID');
            return;
        }

        const handler = (data: INotification) => {
            console.log('🔔 Received new_notification:', data);

            // Bỏ qua nếu không phải role phù hợp
            if (isAdminOnlyType(data.type) && user.role !== 'admin') {
                console.log('⏭️ Skipping admin-only notification for non-admin');
                return;
            }

            setNotifications(prev => {
                // Chống duplicate
                if (prev.some(n => n._id === data._id)) {
                    console.log('⏭️ Duplicate notification, skipping');
                    return prev;
                }
                const updated = [data, ...prev];
                setUnreadCount(updated.filter(n => !n.read).length);
                console.log('✅ Added new notification, total:', updated.length);
                return updated;
            });
        };

        socket.on('new_notification', handler);
        console.log('🎧 Listening for new_notification events');

        return () => {
            socket.off('new_notification', handler);
            console.log('🔇 Stopped listening for new_notification');
        };
    }, [socket, isConnected, user?._id, user?.role]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await notificationApi.markAsRead(notificationId);
            setNotifications(prev => {
                const updated = prev.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                );
                setUnreadCount(updated.filter(n => !n.read).length);
                return updated;
            });
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    }, []);

    const loadMore = () => {
        if (page < totalPages && !isLoading) {
            fetchNotifications(page + 1);
        }
    };

    if (!token || !user?._id) return null;

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
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-[380px] p-0 mr-4" align="end" sideOffset={5}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Thông báo
                        {unreadCount > 0 && (
                            <span className="ml-2 text-xs text-gray-500">({unreadCount} chưa đọc)</span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-8">
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
                            <p className="text-xs text-gray-400 mt-1">
                                Khi có hoạt động mới, thông báo sẽ hiển thị tại đây
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {notifications.map(notification => {
                                const isSystem = isSystemType(notification.type);

                                const content = (
                                    <div
                                        className={`flex gap-3 p-4 ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                                            } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer`}
                                        onClick={() => !notification.read && markAsRead(notification._id)}
                                    >
                                        {isSystem ? (
                                            <SystemAvatar type={notification.type} />
                                        ) : (
                                            <div className="flex-shrink-0">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={notification.senderId?.avatar} />
                                                    <AvatarFallback className="bg-main text-white text-sm">
                                                        {notification.senderId?.fullName?.charAt(0) || 'N'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        )}
                                        <NotificationContent data={notification} />
                                    </div>
                                );

                                const linkHref =
                                    notification.postSlug || notification.postId
                                        ? `/baiviet/${notification.postSlug || notification.postId}`
                                        : null;

                                if (!linkHref || isSystem) {
                                    return <div key={notification._id}>{content}</div>;
                                }

                                return (
                                    <Link
                                        key={notification._id}
                                        href={linkHref}
                                        onClick={() => {
                                            if (!notification.read) markAsRead(notification._id);
                                            setOpen(false);
                                        }}
                                        className="block"
                                    >
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {totalPages > 1 && page < totalPages && (
                        <div className="p-3 text-center border-t border-gray-200 dark:border-gray-800">
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