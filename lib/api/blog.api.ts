import axios from 'axios';
import type {
    Blog,
    CreateBlogData,
    UpdateBlogData,
    BlogStats,
    BlogGrowthData,
    TopBlogData,
    GetBlogsParams,
    GetBlogsAdminParams,
    ApiResponse,
    BlogPagination
} from '@/types/blog.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    } catch {
        return null;
    }
};

const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface BlogsResponse {
    success: boolean;
    data: Blog[];
    pagination: BlogPagination;
    message?: string;
}

export interface BlogResponse {
    success: boolean;
    data: Blog;
    message?: string;
}

export const blogApi = {
    // Public APIs
    getBlogs: async (params?: GetBlogsParams): Promise<BlogsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sort) queryParams.append('sort', params.sort);

        const response = await apiClient.get(`/blog?${queryParams.toString()}`);
        return response.data;
    },

    getBlogBySlug: async (slug: string): Promise<BlogResponse> => {
        const response = await apiClient.get(`/blog/${slug}`);
        return response.data;
    },

    getRelatedBlogs: async (slug: string, limit?: number): Promise<BlogsResponse> => {
        const response = await apiClient.get(`/blog/${slug}/related${limit ? `?limit=${limit}` : ''}`);
        return response.data;
    },

    // Admin APIs
    getBlogStats: async (): Promise<ApiResponse<BlogStats>> => {
        const response = await apiClient.get('/blog/admin/stats');
        return response.data;
    },

    getBlogGrowthChart: async (days?: number): Promise<ApiResponse<BlogGrowthData[]>> => {
        const response = await apiClient.get(`/blog/admin/growth-chart${days ? `?days=${days}` : ''}`);
        return response.data;
    },

    getTopViewedBlogs: async (limit?: number): Promise<ApiResponse<TopBlogData[]>> => {
        const response = await apiClient.get(`/blog/admin/top-viewed${limit ? `?limit=${limit}` : ''}`);
        return response.data;
    },

    getTopLikedBlogs: async (limit?: number): Promise<ApiResponse<TopBlogData[]>> => {
        const response = await apiClient.get(`/blog/admin/top-liked${limit ? `?limit=${limit}` : ''}`);
        return response.data;
    },

    getAllBlogsAdmin: async (params?: GetBlogsAdminParams): Promise<BlogsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.isPublished) queryParams.append('isPublished', params.isPublished);

        const response = await apiClient.get(`/blog/admin/all?${queryParams.toString()}`);
        return response.data;
    },

    getBlogById: async (id: string): Promise<BlogResponse> => {
        const response = await apiClient.get(`/blog/admin/${id}`);
        return response.data;
    },

    createBlog: async (data: CreateBlogData): Promise<BlogResponse> => {
        const response = await apiClient.post('/blog/admin', data);
        return response.data;
    },

    // User tạo blog (chờ admin duyệt)
    createBlogUser: async (data: CreateBlogData): Promise<BlogResponse> => {
        const response = await apiClient.post('/blog/my/create', data);
        return response.data;
    },

    // User update blog của mình
    updateBlogUser: async (id: string, data: UpdateBlogData): Promise<BlogResponse> => {
        const response = await apiClient.put(`/blog/my/${id}`, data);
        return response.data;
    },

    updateBlog: async (id: string, data: UpdateBlogData): Promise<BlogResponse> => {
        const response = await apiClient.put(`/blog/admin/${id}`, data);
        return response.data;
    },

    deleteBlog: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/blog/admin/${id}`);
        return response.data;
    },

    togglePublish: async (id: string): Promise<BlogResponse> => {
        const response = await apiClient.patch(`/blog/admin/${id}/publish`);
        return response.data;
    },

    // User APIs
    getMyBlogs: async (params?: { page?: number; limit?: number }): Promise<BlogsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const response = await apiClient.get(`/blog/my/blogs?${queryParams.toString()}`);
        return response.data;
    },

    getMyBookmarks: async (params?: { page?: number; limit?: number }): Promise<BlogsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const response = await apiClient.get(`/blog/my/bookmarks?${queryParams.toString()}`);
        return response.data;
    },

    toggleLike: async (blogId: string): Promise<{ success: boolean; liked: boolean; message: string }> => {
        const response = await apiClient.post(`/blog/${blogId}/like`);
        return response.data;
    },

    toggleBookmark: async (blogId: string): Promise<{ success: boolean; bookmarked: boolean; message: string }> => {
        const response = await apiClient.post(`/blog/${blogId}/bookmark`);
        return response.data;
    },

    checkInteraction: async (blogId: string): Promise<{
        success: boolean;
        data: { liked: boolean; bookmarked: boolean };
    }> => {
        const response = await apiClient.get(`/blog/${blogId}/interaction`);
        return response.data;
    }
};

// Re-export Blog type for backward compatibility
export type { Blog };