// /components/custom/NotificationBell.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Bell, MessageCircle, Heart, ThumbsUp, Bookmark,
    CheckCheck, Coins, Flame, Info, XCircle, Loader2
} from 'lucide-react';
import { useSocket } from '@/providers/socket.provider';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { notificationApi } from '@/lib/api/notification.api';
import type { INotification } from '@/types/notification.type';
import { CustomButton } from '../custom/CustomButton';

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
    const iconClass = "w-3.5 h-3.5 sm:w-4 sm:h-4";

    switch (type) {
        case 'comment':
        case 'reply_comment':
            return <MessageCircle className={`${iconClass} text-blue-500`} />;
        case 'like_post':
            return <ThumbsUp className={`${iconClass} text-red-500`} />;
        case 'reaction_comment':
            return <Heart className={`${iconClass} text-purple-500`} />;
        case 'bookmark':
            return <Bookmark className={`${iconClass} text-yellow-500`} />;
        case 'first_login_bonus':
            return <Coins className={`${iconClass} text-yellow-500`} />;
        case 'streak_bonus':
            return <Flame className={`${iconClass} text-orange-500`} />;
        case 'role_request_approved':
            return <CheckCheck className={`${iconClass} text-green-500`} />;
        case 'role_request_rejected':
            return <XCircle className={`${iconClass} text-red-500`} />;
        default:
            return <Info className={`${iconClass} text-gray-500`} />;
    }
}

function SystemAvatar({ type }: { type: INotification['type'] }) {
    const sizeClass = "w-8 h-8 sm:w-10 sm:h-10";
    const textClass = "text-base sm:text-lg";

    if (type === 'first_login_bonus') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 ${textClass}`}>
                🎉
            </div>
        );
    }
    if (type === 'streak_bonus') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 ${textClass}`}>
                🔥
            </div>
        );
    }
    if (type === 'role_request_approved') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 ${textClass}`}>
                ✅
            </div>
        );
    }
    if (type === 'role_request_rejected') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0 ${textClass}`}>
                ❌
            </div>
        );
    }
    return (
        <div className={`${sizeClass} rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0`}>
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
    );
}

function UserAvatar({ avatar, name }: { avatar?: string; name?: string }) {
    const getInitials = (fullName?: string) => {
        if (!fullName) return 'N';
        return fullName.charAt(0).toUpperCase();
    };

    return (
        <div className="flex-shrink-0">
            {avatar ? (
                <img
                    src={avatar}
                    alt={name || 'Avatar'}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
            ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--cn-primary)] flex items-center justify-center text-white text-sm sm:text-base font-semibold">
                    {getInitials(name)}
                </div>
            )}
        </div>
    );
}

function getNotificationMessage(notification: INotification): string {
    const senderName = notification.senderId?.fullName || 'Ai đó';

    switch (notification.type) {
        case 'first_login_bonus':
            return notification.content || `Chào mừng ${senderName}! Bạn nhận được ${notification.meta?.coins ?? 100} xu khi đăng nhập lần đầu.`;
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

// ─── Notification Item Component ──────────────────────────────────────────────

interface NotificationItemProps {
    notification: INotification;
    onMarkAsRead: (id: string) => void;
    onClose: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
    const isSystem = isSystemType(notification.type);
    const isRead = notification.read;
    const linkHref = notification.postSlug || notification.postId
        ? `/baiviet/${notification.postSlug || notification.postId}`
        : null;

    const content = (
        <div
            className={`flex gap-2 sm:gap-3 p-3 sm:p-4 transition-colors cursor-pointer ${!isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-800/50`}
            onClick={() => !isRead && onMarkAsRead(notification._id)}
        >
            {isSystem ? (
                <SystemAvatar type={notification.type} />
            ) : (
                <UserAvatar
                    avatar={notification.senderId?.avatar}
                    name={notification.senderId?.fullName}
                />
            )}

            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 break-words">
                    {isRoleRequestType(notification.type) ? notification.content : getNotificationMessage(notification)}
                </p>

                {!isRoleRequestType(notification.type) && (notification.meta?.coins ?? 0) > 0 && (
                    <p className="text-[10px] sm:text-xs text-yellow-600 font-medium mt-0.5">
                        +{notification.meta!.coins} xu
                    </p>
                )}

                {!isRead && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification._id);
                        }}
                        className="text-[10px] sm:text-xs text-blue-500 hover:text-blue-600 mt-1"
                    >
                        Đánh dấu đã đọc
                    </button>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                    <NotificationIcon type={notification.type} />
                    <span className="text-[10px] sm:text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                    </span>
                    {!isRead && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--cn-primary)] rounded-full" />}
                </div>
            </div>
        </div>
    );

    if (!linkHref || isSystem) {
        return <div>{content}</div>;
    }

    return (
        <Link href={linkHref} onClick={() => {
            if (!isRead) onMarkAsRead(notification._id);
            onClose();
        }} className="block">
            {content}
        </Link>
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
    const dropdownRef = useRef<HTMLDivElement>(null); // Thêm ref cho dropdown

    // Filter by role
    const filterByRole = useCallback(
        (list: INotification[]): INotification[] => {
            if (user?.role === 'admin') return list;
            return list.filter(n => !isAdminOnlyType(n.type));
        },
        [user?.role]
    );

    // Fetch notifications
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

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    // Initial fetch
    useEffect(() => {
        if (token && user?._id) {
            fetchNotifications(1);
        }
    }, [token, user?._id]);

    // Fetch when open
    useEffect(() => {
        if (open && token && user?._id && unreadCount > 0) {
            fetchNotifications(1);
        }
    }, [open]);

    // Socket
    useEffect(() => {
        if (!socket || !isConnected || !user?._id) return;

        const handler = (data: INotification) => {
            if (isAdminOnlyType(data.type) && user.role !== 'admin') return;

            setNotifications(prev => {
                if (prev.some(n => n._id === data._id)) return prev;
                const updated = [data, ...prev];
                setUnreadCount(updated.filter(n => !n.read).length);
                return updated;
            });
        };

        socket.on('new_notification', handler);

        return () => {
            socket.off('new_notification', handler);
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
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Thông báo"
            >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--cn-text-sub)]" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-[3px] sm:px-1 whitespace-nowrap">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 
                    w-80 max-w-[calc(100vw-32px)] sm:w-[380px] lg:w-[420px]
                    bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-[var(--cn-radius-md)] shadow-[var(--cn-shadow-lg)] z-20 overflow-hidden animate-slideDown">

                    <div className="sticky top-0 z-10 flex items-center justify-between p-3 sm:p-4 border-b border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                        <h3 className="text-sm sm:text-base font-semibold text-[var(--cn-text-main)]">
                            Thông báo
                            {unreadCount > 0 && (
                                <span className="ml-2 text-xs text-[var(--cn-text-muted)]">
                                    ({unreadCount})
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs text-[var(--cn-primary)] hover:text-[var(--cn-primary-hover)] transition-colors"
                            >
                                <CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">Đọc tất cả</span>
                                <span className="sm:hidden">Đọc hết</span>
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {isLoading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--cn-primary)] animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-[var(--cn-text-muted)]">
                                <Bell className="w-10 h-10 sm:w-12 sm:h-12 mb-2 opacity-50" />
                                <p className="text-xs sm:text-sm">Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--cn-border)]">
                                {notifications.map(notification => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                        onClose={() => setOpen(false)}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && page < totalPages && (
                            <div className="p-2 sm:p-3 text-center border-t border-[var(--cn-border)]">
                                <CustomButton
                                    variant="outline-primary"
                                    size="small"
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    loading={isLoading}
                                    fullWidth
                                    className="text-xs sm:text-sm"
                                >
                                    {isLoading ? 'Đang tải...' : 'Xem thêm'}
                                </CustomButton>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}