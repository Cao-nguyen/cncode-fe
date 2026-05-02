// lib/api/shortlink.api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import type {
    ShortLink,
    ShortLinkWithUser,
    CreateShortLinkPayload,
    UpdateShortLinkPayload,
} from '@/types/shortlink.type';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const handleApiError = (error: unknown): never => {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('Có lỗi xảy ra');
};

export const shortlinkApi = {
    create: async (payload: CreateShortLinkPayload): Promise<ShortLink> => {
        try {
            const { data } = await api.post('/shorten', payload);
            if (!data.success) {
                throw new Error('Tạo link thất bại');
            }
            return data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    checkAlias: async (alias: string): Promise<boolean> => {
        try {
            const { data } = await api.get(`/check-alias/${encodeURIComponent(alias)}`);
            return data.available;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getMyLinks: async (page = 1, limit = 20): Promise<{
        links: ShortLink[];
        total: number;
        page: number;
        totalPages: number;
    }> => {
        try {
            const response = await api.get('/my-links', { params: { page, limit } });
            const data = response.data;

            if (!data.success) {
                throw new Error('Lấy danh sách link thất bại');
            }

            // Xử lý cấu trúc data
            if (data.data && data.data.links) {
                return data.data;
            }

            // Fallback nếu response trực tiếp
            return {
                links: data.links || [],
                total: data.total || 0,
                page: data.page || page,
                totalPages: data.totalPages || 1,
            };
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getAllLinks: async (page = 1, limit = 50, search = ''): Promise<{
        links: ShortLinkWithUser[];
        total: number;
        page: number;
        totalPages: number;
    }> => {
        try {
            const response = await api.get('/admin/all', { params: { page, limit, search } });
            const data = response.data;

            console.log('API Response:', data); // Debug

            if (!data.success) {
                throw new Error(data.message || 'Không thể tải danh sách link');
            }

            // Xử lý cấu trúc data
            if (data.data && data.data.links) {
                return data.data;
            }

            // Fallback nếu response trực tiếp
            return {
                links: data.links || [],
                total: data.total || 0,
                page: data.page || page,
                totalPages: data.totalPages || 1,
            };
        } catch (error) {
            console.error('Get all links error:', error);
            throw handleApiError(error);
        }
    },

    update: async (shortCode: string, payload: UpdateShortLinkPayload): Promise<ShortLink> => {
        try {
            const { data } = await api.put(`/${shortCode}`, payload);
            if (!data.success) {
                throw new Error('Cập nhật link thất bại');
            }
            return data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    delete: async (shortCode: string): Promise<void> => {
        try {
            await api.delete(`/${shortCode}`);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};