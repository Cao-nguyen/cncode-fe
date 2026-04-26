export interface INotification {
    type: 'comment' | 'reaction_comment' | 'like_post' | 'reply_comment' | 'bookmark';
    postSlug?: string;
    postId?: string;
    postTitle?: string;
    commentId?: string;
    reactionType?: string;
    userName?: string;
    content?: string;
}