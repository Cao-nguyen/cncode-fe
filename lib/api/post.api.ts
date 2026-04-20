import { IApiResponse, IPost, IComment } from '@/types/post.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const buildQuery = (params: Record<string, string | number | boolean | undefined | null>): string => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, String(value));
        }
    });
    return query.toString();
};

const apiFetch = async <T>(
    url: string,
    options?: RequestInit & { cache?: RequestCache; revalidate?: number },
): Promise<T> => {
    const res = await fetch(url, {
        ...options,
        next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'API Error');
    }
    return res.json();
};

export const postApi = {
    getFeaturedPosts: async (limit: number = 3): Promise<IApiResponse<IPost[]>> => {
        const response = await fetch(`${API_URL}/api/posts/featured?limit=${limit}`, {
            cache: 'no-store'
        });
        return response.json();
    },

    getPosts: (params?: {
        category?: string;
        search?: string;
        sort?: string;
        page?: number;
        limit?: number;
        status?: string;
        createdAt?: string;
    }): Promise<IApiResponse<IPost[]>> => {
        const qs = params ? buildQuery(params) : '';
        return apiFetch(`${API_URL}/api/posts${qs ? `?${qs}` : ''}`, {
            cache: 'no-store',
        });
    },

    getPostBySlug: (slug: string): Promise<IApiResponse<IPost>> =>
        apiFetch(`${API_URL}/api/posts/${slug}`, { cache: 'no-store' }),

    getPostById: (id: string, token: string): Promise<IApiResponse<IPost>> =>
        apiFetch(`${API_URL}/api/posts/post/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }),

    trackView: (slug: string): Promise<void> =>
        fetch(`${API_URL}/api/posts/${slug}/view`, { method: 'POST' }).then(() => undefined),

    createPost: (
        data: {
            title: string;
            description: string;
            content: string;
            category: string;
            thumbnail: string;
            tags?: string[];
            status?: 'draft' | 'published';
        },
        token: string,
    ): Promise<IApiResponse<IPost>> =>
        apiFetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...data, status: 'pending' }),
        }),

    updatePost: (
        id: string,
        data: {
            title?: string;
            description?: string;
            content?: string;
            thumbnail?: string;
            status?: 'draft' | 'published';
        },
        token: string,
    ): Promise<IApiResponse<IPost>> =>
        apiFetch(`${API_URL}/api/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        }),

    deletePost: (id: string, token: string): Promise<IApiResponse<null>> =>
        apiFetch(`${API_URL}/api/posts/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        }),

    getUserPosts: (token: string): Promise<IApiResponse<IPost[]>> => {
        return apiFetch(`${API_URL}/api/posts/user`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    },

    likePost: (id: string, token: string): Promise<IApiResponse<{ liked: boolean; likes: number }>> =>
        apiFetch(`${API_URL}/api/posts/${id}/like`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        }),

    bookmarkPost: (id: string, token: string): Promise<IApiResponse<{ bookmarked: boolean }>> =>
        apiFetch(`${API_URL}/api/posts/${id}/bookmark`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        }),

    reportPost: (id: string, reason: string, token: string): Promise<IApiResponse<null>> =>
        apiFetch(`${API_URL}/api/posts/${id}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ reason }),
        }),

    addComment: (
        id: string,
        content: string,
        token: string,
        parentId: string | null = null,
    ): Promise<IApiResponse<IComment[]>> =>
        apiFetch(`${API_URL}/api/posts/${id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content, parentId }),
        }),

    deleteComment: (postId: string, commentId: string, token: string): Promise<IApiResponse<IComment[]>> =>
        apiFetch(`${API_URL}/api/posts/${postId}/comment/${commentId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        }),

    editComment: (
        postId: string,
        commentId: string,
        content: string,
        token: string,
    ): Promise<IApiResponse<IComment[]>> =>
        apiFetch(`${API_URL}/api/posts/${postId}/comment/${commentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content }),
        }),

    reportComment: (
        postId: string,
        commentId: string,
        reason: string,
        token: string,
    ): Promise<IApiResponse<null>> =>
        apiFetch(`${API_URL}/api/posts/${postId}/comment/${commentId}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ reason }),
        }),

    toggleCommentReaction: (
        postId: string,
        commentId: string,
        type: string,
        token: string,
    ): Promise<IApiResponse<{ type: string; hasReacted: boolean }>> =>
        apiFetch(`${API_URL}/api/posts/${postId}/comment/${commentId}/reaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type }),
        }),
};