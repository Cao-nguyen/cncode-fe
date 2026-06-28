import axios from 'axios';
import { ReviewsResponse, ReviewStats, Review } from '@/types/review.type';

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

const api = axios.create({ baseURL: `${API_URL}/api/reviews` });

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const reviewApi = {
    getByTarget: async (targetType: string, targetId: string, page = 1, limit = 10): Promise<ReviewsResponse> => {
        const { data } = await api.get(`/${targetType}/${targetId}`, { params: { page, limit } });
        return data;
    },

    getStats: async (targetType: string, targetId: string): Promise<ReviewStats> => {
        const { data } = await api.get(`/${targetType}/${targetId}/stats`);
        return data;
    },

    getMyReview: async (targetType: string, targetId: string): Promise<Review | null> => {
        try {
            const { data } = await api.get(`/my/${targetType}/${targetId}`);
            return data;
        } catch {
            return null;
        }
    },

    create: async (payload: { targetType: string; targetId: string; rating: number; comment: string }): Promise<Review> => {
        const { data } = await api.post('/', payload);
        return data;
    },

    update: async (id: string, payload: { rating?: number; comment?: string }): Promise<Review> => {
        const { data } = await api.put(`/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/${id}`);
    }
};