export interface INotification {
    type: 'comment' | 'reaction';
    commentId?: string;
    postId?: string;
    postTitle?: string;
    reactionType?: string;
    userName?: string;
    content?: string;
    createdAt?: string;
}

export interface Notification extends INotification {
    id: string;
    read: boolean;
    createdAt: string;
}