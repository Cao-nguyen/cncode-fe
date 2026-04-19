export interface INotification {
    type: 'comment' | 'reaction_comment' | 'like_post';
    postId: string;
    postTitle?: string;
    commentId?: string;
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