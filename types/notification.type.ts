export interface INotification {
    _id: string;
    notificationId: string; // unique string ID (added)
    userId: string;
    type:
    | 'comment'
    | 'reaction_comment'
    | 'like_post'
    | 'reply_comment'
    | 'bookmark'
    | 'first_login_bonus'
    | 'streak_bonus'
    | 'system'
    | 'role_request_rejected'
    | 'role_request_approved';
    postId?: string;
    postSlug?: string;
    postTitle?: string;
    commentId?: string;
    reactionType?: string;
    senderId?: {
        _id: string;
        fullName: string;
        avatar?: string;
    } | null;
    content?: string;
    meta?: {
        coins?: number;
        streak?: number;
        adminName?: string;
    };
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    success: boolean;
    data: {
        notifications: INotification[];
        unreadCount: number;
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface UnreadCountResponse {
    success: boolean;
    data: {
        unreadCount: number;
    };
}

// Socket events
export interface CoinsUpdatedPayload {
    coins: number;
    delta: number;
    reason: 'first_login_bonus' | 'streak_bonus' | 'purchase' | string;
}

export interface StreakUpdatedPayload {
    streak: number;
    coinsEarned: number;
    totalCoins: number;
}