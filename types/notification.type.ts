export interface INotification {
    type: 'comment' | 'reaction_comment' | 'like_post' | 'reply_comment' | 'bookmark';
    postId: string;
    postSlug?: string;
    postTitle?: string;
    commentId?: string;
    reactionType?: string;
    userName?: string;
    userId?: string;
    content?: string;
    recipientId?: string;
    createdAt?: string;
}

export interface Notification extends INotification {
    id: string;
    read: boolean;
    createdAt: string;
}