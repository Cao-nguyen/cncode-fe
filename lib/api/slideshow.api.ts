import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface SlideshowItem {
    _id: string;
    title: string;
    subtitle: string;
    description: string;
    cta: string;
    href: string;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    gradient: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

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
    baseURL: `${API_URL}/api/slideshow`,
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

export const slideshowApi = {
    // Public: lấy slide đang active
    getActiveSlides: async (): Promise<ApiResponse<SlideshowItem[]>> => {
        const response = await axios.get(`${API_URL}/api/slideshow/active`);
        return response.data;
    },

    // Admin: lấy tất cả slide
    getAllSlides: async (params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<SlideshowItem>> => {
        const response = await apiClient.get('/', { params });
        return response.data;
    },

    // Admin: tạo slide mới
    createSlide: async (data: {
        title: string;
        subtitle?: string;
        description?: string;
        cta?: string;
        href?: string;
        imageUrl?: string;
        imageWidth?: number;
        imageHeight?: number;
        gradient?: string;
        order?: number;
        isActive?: boolean;
    }): Promise<ApiResponse<SlideshowItem>> => {
        const response = await apiClient.post('/', data);
        return response.data;
    },

    // Admin: cập nhật slide
    updateSlide: async (id: string, data: Partial<{
        title: string;
        subtitle: string;
        description: string;
        cta: string;
        href: string;
        imageUrl: string;
        imageWidth: number;
        imageHeight: number;
        gradient: string;
        order: number;
        isActive: boolean;
    }>): Promise<ApiResponse<SlideshowItem>> => {
        const response = await apiClient.put(`/${id}`, data);
        return response.data;
    },

    // Admin: xoá slide
    deleteSlide: async (id: string): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete(`/${id}`);
        return response.data;
    },
};