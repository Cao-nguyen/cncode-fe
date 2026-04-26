export interface INotification {
    _id: string;
    userId: string;
    type: 'comment' | 'reaction_comment' | 'like_post' | 'reply_comment' | 'bookmark';
    postId?: string;
    postSlug?: string;
    postTitle?: string;
    commentId?: string;
    reactionType?: string;
    senderId: {
        _id: string;
        fullName: string;
        avatar?: string;
    };
    content?: string;
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