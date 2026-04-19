import { IApiResponse, IPost, IComment } from '@/types/post.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const postApi = {
    getPosts: async (params?: {
        category?: string;
        search?: string;
        sort?: string;
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<IApiResponse<IPost[]>> => {
        const query = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    query.append(key, String(value));
                }
            });
        }
        const response = await fetch(`${API_URL}/api/posts${query.toString() ? `?${query}` : ''}`);
        return response.json();
    },

    getPostBySlug: async (slug: string): Promise<IApiResponse<IPost>> => {
        const response = await fetch(`${API_URL}/api/posts/${slug}`);
        return response.json();
    },

    createPost: async (data: {
        title: string;
        description: string;
        content: string;
        category: string;
        thumbnail: string;
        tags?: string[];
        status: 'draft' | 'published';
    }, token: string): Promise<IApiResponse<IPost>> => {
        const response = await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updatePost: async (slug: string, data: {
        title?: string;
        description?: string;
        content?: string;
        category?: string;
        thumbnail?: string;
        tags?: string[];
        status?: 'draft' | 'published';
    }, token: string): Promise<IApiResponse<IPost>> => {
        const response = await fetch(`${API_URL}/api/posts/${slug}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deletePost: async (slug: string, token: string): Promise<IApiResponse<null>> => {
        const response = await fetch(`${API_URL}/api/posts/${slug}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    getUserPosts: async (token: string, params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<IApiResponse<IPost[]>> => {
        const query = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query.append(key, String(value));
                }
            });
        }
        const response = await fetch(`${API_URL}/api/posts/user${query.toString() ? `?${query}` : ''}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    likePost: async (id: string, token: string): Promise<IApiResponse<{ liked: boolean; likes: number }>> => {
        const response = await fetch(`${API_URL}/api/posts/${id}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    bookmarkPost: async (id: string, token: string): Promise<IApiResponse<{ bookmarked: boolean }>> => {
        const response = await fetch(`${API_URL}/api/posts/${id}/bookmark`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    reportPost: async (id: string, reason: string, token: string): Promise<IApiResponse<null>> => {
        const response = await fetch(`${API_URL}/api/posts/${id}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });
        return response.json();
    },

    addComment: async (
        id: string,
        content: string,
        token: string,
        parentId: string | null = null
    ): Promise<IApiResponse<IComment[]>> => {
        const response = await fetch(`${API_URL}/api/posts/${id}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content, parentId })
        });
        return response.json();
    },

    deleteComment: async (postId: string, commentId: string, token: string): Promise<IApiResponse<IComment[]>> => {
        const response = await fetch(`${API_URL}/api/posts/${postId}/comment/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    reportComment: async (postId: string, commentId: string, reason: string, token: string): Promise<IApiResponse<null>> => {
        const response = await fetch(`${API_URL}/api/posts/${postId}/comment/${commentId}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });
        return response.json();
    },

    toggleCommentReaction: async (
        postId: string,
        commentId: string,
        type: string,
        token: string
    ): Promise<IApiResponse<{ type: string; hasReacted: boolean }>> => {
        const response = await fetch(`${API_URL}/api/posts/${postId}/comment/${commentId}/reaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type })
        });
        return response.json();
    }
};