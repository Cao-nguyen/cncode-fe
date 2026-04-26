import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import type {
    ShortLink,
    ShortLinkWithUser,
    CreateShortLinkPayload,
    UpdateShortLinkPayload,
    ShortLinkResponse,
    ShortLinkListResponse,
    ShortLinkAdminListResponse,
    CheckAliasResponse,
} from '@/types/shortlink.type';

// ✅ Tự động thêm /api vào baseURL
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

export const shortlinkApi = {
    create: async (payload: CreateShortLinkPayload): Promise<ShortLink> => {
        const { data } = await api.post<ShortLinkResponse>('/shorten', payload);
        return data.data;
    },

    checkAlias: async (alias: string): Promise<boolean> => {
        const { data } = await api.get<CheckAliasResponse>(`/check-alias/${encodeURIComponent(alias)}`);
        return data.available;
    },

    getMyLinks: async (page = 1, limit = 20): Promise<ShortLinkListResponse['data']> => {
        const { data } = await api.get<ShortLinkListResponse>('/my-links', {
            params: { page, limit },
        });
        return data.data;
    },

    getAllLinks: async (page = 1, limit = 50, search = ''): Promise<ShortLinkAdminListResponse['data']> => {
        const { data } = await api.get<ShortLinkAdminListResponse>('/admin/all', {
            params: { page, limit, search },
        });
        return data.data;
    },

    update: async (shortCode: string, payload: UpdateShortLinkPayload): Promise<ShortLink> => {
        const { data } = await api.put<ShortLinkResponse>(`/${shortCode}`, payload);
        return data.data;
    },

    delete: async (shortCode: string): Promise<void> => {
        await api.delete(`/${shortCode}`);
    },
};

export type { ShortLink, ShortLinkWithUser };