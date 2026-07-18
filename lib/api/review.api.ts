import axios from 'axios';
import { ReviewsResponse, ReviewStats, Review } from '@/types/review.type';

export type { Review, ReviewStats };

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
    getAllReviews: async (page = 1, limit = 10): Promise<ReviewsResponse> => {
        const { data } = await api.get('/', { params: { page, limit } });
        return data;
    },

    getStats: async (): Promise<ReviewStats> => {
        const { data } = await api.get('/stats');
        return data;
    },

    getMyReview: async (): Promise<Review | null> => {
        try {
            const { data } = await api.get('/my');
            return data;
        } catch {
            return null;
        }
    },

    create: async (payload: { rating: number; content: string }): Promise<Review> => {
        const { data } = await api.post('/', payload);
        return data;
    },

    update: async (id: string, payload: { rating?: number; content?: string }): Promise<Review> => {
        const { data } = await api.put(`/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/${id}`);
    }
};
