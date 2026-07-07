const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface IForumUser {
    _id: string;
    fullName: string;
    username?: string;
    avatar?: string;
}

export interface IForumPostReaction {
    userId: string | IForumUser;
    reaction: string;
}

export interface IForumPost {
    _id: string;
    content: string;
    images: string[];
    videos: string[];
    author: {
        _id: string;
        fullName: string;
        username: string;
        avatar: string;
        role: string;
    };
    reactions: {
        like: number;
        love: number;
        haha: number;
        wow: number;
        sad: number;
        angry: number;
    };
    userReactions: IForumPostReaction[];
    likeCount: number;
    comments: string[];
    commentCount: number;
    shares: string[];
    shareCount: number;
    privacy: 'public' | 'friends' | 'private';
    feeling: string | null;
    location: string | null;
    taggedUsers: any[];
    isPinned: boolean;
    isEdited: boolean;
    editedAt: Date | null;
    originalPost: any;
    createdAt: string;
    updatedAt: string;
}

interface IForumPostsResponse {
    success: boolean;
    data: IForumPost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface IForumPostResponse {
    success: boolean;
    data: IForumPost;
    message?: string;
}

interface IForumActionResponse {
    success: boolean;
    message: string;
    likeCount?: number;
    reactions?: {
        like: number;
        love: number;
        haha: number;
        wow: number;
        sad: number;
        angry: number;
    };
    userReactions?: Array<{
        userId: string | {
            _id: string;
            fullName: string;
            username?: string;
            avatar?: string;
        };
        reaction: string;
    }>;
    userReaction?: string;
    isLiked?: boolean;
    isPinned?: boolean;
}

const handleResponse = async <T = any>(response: Response): Promise<T> => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }
    return data as T;
};

export const forumApi = {
    // Get all posts (feed)
    getPosts: async (page: number = 1, limit: number = 20, token?: string): Promise<IForumPostsResponse> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}/api/forum?page=${page}&limit=${limit}`, {
            headers,
        });
        return handleResponse<IForumPostsResponse>(response);
    },

    // Get single post by ID
    getPostById: async (postId: string): Promise<IForumPostResponse> => {
        const response = await fetch(`${API_URL}/api/forum/${postId}`);
        return handleResponse<IForumPostResponse>(response);
    },

    // Get posts by author
    getPostsByAuthor: async (authorId: string, page: number = 1, limit: number = 20): Promise<IForumPostsResponse> => {
        const response = await fetch(`${API_URL}/api/forum/author/${authorId}?page=${page}&limit=${limit}`);
        return handleResponse<IForumPostsResponse>(response);
    },

    // Create a new post
    createPost: async (
        postData: {
            content: string;
            images?: string[];
            videos?: string[];
            privacy?: 'public' | 'friends' | 'private';
            feeling?: string;
            location?: string;
            taggedUsers?: string[];
        },
        token: string
    ): Promise<IForumPostResponse> => {
        const response = await fetch(`${API_URL}/api/forum`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
        });
        return handleResponse<IForumPostResponse>(response);
    },

    // Update a post
    updatePost: async (
        postId: string,
        postData: {
            content?: string;
            images?: string[];
            videos?: string[];
            privacy?: 'public' | 'friends' | 'private';
            feeling?: string;
            location?: string;
            namedUsers?: string[];
        },
        token: string
    ): Promise<IForumPostResponse> => {
        const response = await fetch(`${API_URL}/api/forum/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
        });
        return handleResponse<IForumPostResponse>(response);
    },

    // Delete a post (soft delete)
    deletePost: async (postId: string, token: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/api/forum/${postId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return handleResponse<{ success: boolean; message: string }>(response);
    },

    // Like/Unlike a post
    toggleLikePost: async (postId: string, token: string, reaction: string = 'like'): Promise<IForumActionResponse> => {
        const response = await fetch(`${API_URL}/api/forum/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reaction }),
        });
        return handleResponse<IForumActionResponse>(response);
    },

    // Pin/Unpin a post
    togglePinPost: async (postId: string, token: string): Promise<IForumActionResponse> => {
        const response = await fetch(`${API_URL}/api/forum/${postId}/pin`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return handleResponse<IForumActionResponse>(response);
    },

    // Share a post
    sharePost: async (
        postId: string,
        content: string,
        token: string
    ): Promise<IForumPostResponse> => {
        const response = await fetch(`${API_URL}/api/forum/${postId}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        });
        return handleResponse<IForumPostResponse>(response);
    },
};
