
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Bell, MessageCircle, Heart, ThumbsUp, Bookmark,
    CheckCheck, Coins, Flame, Info, XCircle, Loader2, X, FileText,
    PartyPopper, CheckCircle2, AlertCircle, Share2, Handshake, Gift
} from 'lucide-react';
import { useSocket } from '@/providers/socket.provider';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { notificationApi } from '@/lib/api/notification.api';
import type { INotification } from '@/types/notification.type';
import { CustomButton } from '../custom/CustomButton';
import {
    subscribeToPushNotifications,
    isPushSubscribed,
    isPushNotificationSupported
} from '@/lib/push-notification';

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
    'cross_promotion_new',
];

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
        case 'admin_chat_message':
            return <MessageCircle className={`${iconClass} text-indigo-500`} />;
        case 'cross_promotion_new':
            return <Handshake className={`${iconClass} text-blue-500`} />;
        case 'cross_promotion_status_updated':
            return <Share2 className={`${iconClass} text-emerald-500`} />;
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
        case 'policy_update':
            return <FileText className={`${iconClass} text-blue-600`} />;
        case 'gift_received':
            return <Gift className={`${iconClass} text-pink-500`} />;
        default:
            return <Info className={`${iconClass} text-gray-500`} />;
    }
}

function SystemAvatar({ type }: { type: INotification['type'] }) {
    const sizeClass = "w-8 h-8 sm:w-10 sm:h-10";
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5";

    if (type === 'first_login_bonus') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0`}>
                <PartyPopper className={`${iconClass} text-white`} />
            </div>
        );
    }
    if (type === 'streak_bonus') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0`}>
                <Flame className={`${iconClass} text-white`} />
            </div>
        );
    }
    if (type === 'role_request_approved') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0`}>
                <CheckCircle2 className={`${iconClass} text-white`} />
            </div>
        );
    }
    if (type === 'role_request_rejected') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0`}>
                <AlertCircle className={`${iconClass} text-white`} />
            </div>
        );
    }
    if (type === 'policy_update') {
        return (
            <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0`}>
                <FileText className={`${iconClass} text-white`} />
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
        case 'admin_chat_message':
            return notification.content || `${senderName} đã gửi tin nhắn hỗ trợ`;
        case 'cross_promotion_new':
            return notification.content || `${senderName} vừa gửi yêu cầu truyền thông chéo mới`;
        case 'cross_promotion_status_updated':
            return notification.content || 'Yêu cầu truyền thông chéo của bạn đã được cập nhật';
        case 'first_login_bonus':
            return notification.content || `Chào mừng ${senderName}! Bạn nhận được ${notification.meta?.coins ?? 100} xu khi đăng nhập lần đầu.`;
        case 'streak_bonus':
            return notification.content || `🔥 Bạn nhận được ${notification.meta?.coins} xu thưởng streak!`;
        case 'policy_update':
            return notification.content;
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
        case 'gift_received':
            return notification.content || `${senderName} đã tặng bạn ${notification.meta?.giftName || 'một món quà'}`;
        default:
            return notification.content || `${senderName} đã có hoạt động mới`;
    }
}

const isSystemType = (type: INotification['type']) =>
    ['first_login_bonus', 'streak_bonus', 'system', 'role_request_approved', 'role_request_rejected', 'policy_update'].includes(type);

const isRoleRequestType = (type: INotification['type']) =>
    type === 'role_request_approved' || type === 'role_request_rejected';

interface NotificationItemProps {
    notification: INotification;
    onMarkAsRead: (id: string, isBroadcast?: boolean) => void;
    onClose: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
    const isSystem = isSystemType(notification.type);
    const isRead = notification.read;
    const isBroadcast = 'isBroadcast' in notification ? (notification as { isBroadcast?: boolean }).isBroadcast : false;
    const linkHref = notification.type === 'admin_chat_message'
        ? '/admin/chatwithadmin'
        : notification.type === 'cross_promotion_new'
            ? '/admin/truyenthongcheo'
            : notification.type === 'cross_promotion_status_updated'
                ? '/truyenthongcheo'
                : notification.meta?.url
                    ? notification.meta.url
                    : notification.postSlug || notification.postId
                        ? `/blog/${notification.postSlug || notification.postId}`
                        : null;

    const content = (
        <div
            className={`flex gap-2 sm:gap-3 p-3 sm:p-4 transition-colors cursor-pointer ${!isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-800/50`}
            onClick={() => !isRead && onMarkAsRead(notification._id, isBroadcast)}
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
                    {isRoleRequestType(notification.type) || notification.type === 'policy_update' ? notification.content : getNotificationMessage(notification)}
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
                            onMarkAsRead(notification._id, isBroadcast);
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
            if (!isRead) onMarkAsRead(notification._id, isBroadcast);
            onClose();
        }} className="block">
            {content}
        </Link>
    );
}



export default function NotificationBell() {
    const { user, token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [bellAnimation, setBellAnimation] = useState(false);

    const isFetchingRef = useRef(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (token && user?._id) {
            fetchNotifications(1);

            // Auto-subscribe to push notifications nếu chưa subscribe
            if (isPushNotificationSupported()) {
                isPushSubscribed().then(isSubscribed => {
                    if (!isSubscribed) {
                        // Đợi 3 giây rồi hỏi user
                        setTimeout(() => {
                            subscribeToPushNotifications().catch(() => {
                                // User declined - không cần log error
                            });
                        }, 3000);
                    }
                }).catch(() => {
                    // Silent fail - không cần log
                });
            }
        }
    }, [token, user?._id]);

    useEffect(() => {
        if (!socket || !isConnected || !user?._id) return;

        const handler = (data: INotification) => {
            console.log('🔔 Frontend received new_notification:', data);
            if (isAdminOnlyType(data.type) && user.role !== 'admin') {
                console.log('⚠️ Admin-only notification for non-admin user, skipping');
                return;
            }

            setNotifications(prev => {
                if (prev.some(n => n._id === data._id)) {
                    console.log('⚠️ Duplicate notification, skipping');
                    return prev;
                }
                const updated = [data, ...prev];
                setUnreadCount(updated.filter(n => !n.read).length);
                console.log('✅ Notification added to list. Total unread:', updated.filter(n => !n.read).length);
                return updated;
            });

            // Trigger bell animation
            setBellAnimation(true);
            setTimeout(() => setBellAnimation(false), 1000);
        };

        // Handler cho broadcast notifications
        const broadcastHandler = () => {
            if (user.role === 'admin') return; // Admin không nhận broadcast

            // Refetch notifications để lấy broadcasts mới
            fetchNotifications(1);

            // Trigger bell animation
            setBellAnimation(true);
            setTimeout(() => setBellAnimation(false), 1000);
        };

        socket.on('new_notification', handler);
        socket.on('new_broadcast_notification', broadcastHandler);

        return () => {
            socket.off('new_notification', handler);
            socket.off('new_broadcast_notification', broadcastHandler);
        };
    }, [socket, isConnected, user?._id, user?.role, fetchNotifications]);

    const markAsRead = useCallback(async (notificationId: string, isBroadcast: boolean = false) => {
        try {
            await notificationApi.markAsRead(notificationId, isBroadcast);
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

    const handleButtonClick = () => {
        setOpen(!open);
    };

    if (!token || !user?._id) return null;

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleButtonClick}
                className="relative p-1.5 lg:p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 transition-all duration-200 group"
                aria-label="Thông báo"
            >
                <Bell
                    data-filled={true}
                    className={`w-4 lg:w-5 h-4 lg:h-5 text-[var(--cn-text-sub)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${bellAnimation ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`}
                />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-[bounce_1s_ease-in-out_3]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    {/* Mobile backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setOpen(false)}
                    />

                    {/* Notification panel - mobile sidebar, desktop dropdown */}
                    <div className="fixed inset-y-0 right-0 w-full max-w-sm
                        md:absolute md:inset-y-auto md:right-0 md:mt-3 md:w-[400px] lg:w-[440px] md:max-w-none
                        bg-[var(--cn-bg-card)] border-l md:border border-[var(--cn-border)] 
                        md:rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden
                        animate-[slideInRight_0.3s_ease-out] md:animate-[slideDown_0.2s_ease-out]">
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[var(--cn-border)] bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-base font-bold text-[var(--cn-text-main)]">
                                    Thông báo
                                    {unreadCount > 0 && (
                                        <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                            {unreadCount}
                                        </span>
                                    )}
                                </h3>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Đọc tất cả</span>
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
                                    {notifications.map((notification, index) => (
                                        <NotificationItem
                                            key={notification._id || `notification-${index}-${notification.createdAt}`}
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
                </>
            )}
        </div>
    );
}
