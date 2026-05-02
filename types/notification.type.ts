// types/notification.type.ts
export interface CoinsUpdatedPayload {
    coins: number;
    userId: string;
    amount?: number;
}

export interface StreakUpdatedPayload {
    streak: number;
    userId: string;
    totalCoins: number;
}

export interface RoleChangedPayload {
    newRole: 'user' | 'teacher' | 'admin';
    oldRole: string;
    userId: string;
}

export interface NotificationPayload {
    _id: string;
    notificationId: string;
    userId: string;
    type: string;
    content: string;
    meta?: Record<string, unknown>;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface INotification {
    _id: string;
    userId: string;
    senderId?: {
        _id: string;
        fullName: string;
        avatar?: string;
    };
    type: 'comment' | 'reply_comment' | 'like_post' | 'reaction_comment' | 'bookmark' | 'first_login_bonus' | 'streak_bonus' | 'role_request_approved' | 'role_request_rejected' | 'system';
    content: string;
    postId?: string;
    postSlug?: string;
    postTitle?: string;
    reactionType?: string;
    meta?: {
        coins?: number;
        oldRole?: string;
        newRole?: string;
        approved?: boolean;
    };
    read: boolean;
    createdAt: string;
    updatedAt: string;
}