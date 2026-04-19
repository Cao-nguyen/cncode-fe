export interface IUser {
    id: string;
    fullName: string;
    email: string;
    avatar: string;
    bio?: string;
    role?: string;
}

export interface IReactions {
    like: string[];
    love: string[];
    care: string[];
    haha: string[];
    wow: string[];
    sad: string[];
    angry: string[];
}

export interface IComment {
    _id: string;
    user: IUser;
    content: string;
    parentId: string | null;
    children?: IComment[];
    reactions: IReactions;
    createdAt: string;
    replyToName?: string;
}

export interface IPost {
    _id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    thumbnail: string;
    category: string;
    tags: string[];
    author: IUser;
    views: number;
    likes: number;
    likedBy: string[];
    bookmarks: string[];
    reportedBy: string[];
    comments: IComment[];
    readTime: number;
    status: 'draft' | 'published';
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    relatedPosts?: IPost[];
}

export interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}