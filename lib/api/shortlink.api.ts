
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import type {
    ShortLink,
    ShortLinkWithUser,
    CreateShortLinkPayload,
    UpdateShortLinkPayload,
    ShortLinkStats,
} from '@/types/shortlink.type';

const publicApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    withCredentials: true,
});

const authApi = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`,
    withCredentials: true,
});

authApi.interceptors.request.use((config) => {
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
            const { data } = await authApi.post('/shorten', payload);
            if (!data.success) throw new Error('Tạo link thất bại');
            return data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    checkAlias: async (alias: string): Promise<boolean> => {
        try {
            const { data } = await publicApi.get(`/check-alias/${encodeURIComponent(alias)}`);
            return data.available;
        } catch {
            return false;
        }
    },

    getMyLinks: async (page = 1, limit = 20): Promise<{
        links: ShortLink[];
        total: number;
        page: number;
        totalPages: number;
    }> => {
        try {
            const response = await authApi.get('/my-links', { params: { page, limit } });
            const data = response.data;
            if (!data.success) throw new Error('Lấy danh sách link thất bại');
            return data.data;
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
            const response = await authApi.get('/admin/all', { params: { page, limit, search } });
            const data = response.data;
            if (!data.success) throw new Error(data.message || 'Không thể tải danh sách link');
            return data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    getStats: async (): Promise<ShortLinkStats> => {
        try {
            const response = await authApi.get('/admin/stats');
            const data = response.data;
            if (!data.success) throw new Error('Không thể tải thống kê');
            return data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    update: async (shortCode: string, payload: UpdateShortLinkPayload): Promise<ShortLink> => {
        try {
            const { data } = await authApi.put(`/${shortCode}`, payload);
            if (!data.success) throw new Error('Cập nhật link thất bại');
            return data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    delete: async (shortCode: string): Promise<void> => {
        try {
            await authApi.delete(`/${shortCode}`);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
