import axios from 'axios';
import {
    Question,
    Answer,
    CreateQuestionDto,
    CreateAnswerDto,
    FaqListResponse,
    FaqDetailResponse,
    FaqPublicMeta,
    FaqStatistics,
    LikeActionResult,
    ViewCountResult,
} from '@/types/faq.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        return JSON.parse(raw)?.state?.token ?? null;
    } catch {
        return null;
    }
};

const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export interface FaqListParams {
    page?: number;
    limit?: number;
    grade?: string;
    status?: string;
    search?: string;
}

export const faqApi = {
    getQuestions: async (params: FaqListParams = {}): Promise<FaqListResponse> => {
        const res = await apiClient.get<FaqListResponse>('/faq', { params });
        return res.data;
    },

    getQuestionBySlug: async (slug: string): Promise<FaqDetailResponse> => {
        const res = await apiClient.get<FaqDetailResponse>(`/faq/${encodeURIComponent(slug)}`);
        return res.data;
    },

    getPublicMeta: async (slug: string): Promise<{ success: boolean; data: FaqPublicMeta }> => {
        const res = await apiClient.get<{ success: boolean; data: FaqPublicMeta }>(`/faq/public/${encodeURIComponent(slug)}`);
        return res.data;
    },

    incrementView: async (slug: string, guestId?: string): Promise<{ success: boolean; data: ViewCountResult }> => {
        const res = await apiClient.post<{ success: boolean; data: ViewCountResult }>(
            `/faq/increment-view/${encodeURIComponent(slug)}`,
            guestId ? { guestId } : {},
        );
        return res.data;
    },

    getStatistics: async (): Promise<{ success: boolean; data: FaqStatistics }> => {
        const res = await apiClient.get<{ success: boolean; data: FaqStatistics }>('/faq/statistics');
        return res.data;
    },

    createQuestion: async (data: CreateQuestionDto): Promise<{ success: boolean; data: Question }> => {
        const res = await apiClient.post<{ success: boolean; data: Question }>('/faq/questions', data);
        return res.data;
    },

    updateQuestion: async (id: string, data: { title: string; content: string }): Promise<{ success: boolean; data: Question }> => {
        const res = await apiClient.put<{ success: boolean; data: Question }>(`/faq/questions/${id}`, data);
        return res.data;
    },

    deleteQuestion: async (id: string): Promise<{ success: boolean; message: string }> => {
        const res = await apiClient.delete<{ success: boolean; message: string }>(`/faq/questions/${id}`);
        return res.data;
    },

    toggleLikeQuestion: async (id: string): Promise<{ success: boolean; data: LikeActionResult }> => {
        const res = await apiClient.post<{ success: boolean; data: LikeActionResult }>(`/faq/questions/${id}/like`);
        return res.data;
    },

    createAnswer: async (data: CreateAnswerDto): Promise<{ success: boolean; data: Answer }> => {
        const res = await apiClient.post<{ success: boolean; data: Answer }>('/faq/answers', data);
        return res.data;
    },

    markBestAnswer: async (answerId: string, questionId: string): Promise<{ success: boolean; data: Answer }> => {
        const res = await apiClient.put<{ success: boolean; data: Answer }>('/faq/answers/best', { answerId, questionId });
        return res.data;
    },

    toggleLikeAnswer: async (id: string): Promise<{ success: boolean; data: LikeActionResult }> => {
        const res = await apiClient.post<{ success: boolean; data: LikeActionResult }>(`/faq/answers/${id}/like`);
        return res.data;
    },

    deleteAnswer: async (id: string): Promise<{ success: boolean; message: string }> => {
        const res = await apiClient.delete<{ success: boolean; message: string }>(`/faq/answers/${id}`);
        return res.data;
    },

    report: async (type: 'question' | 'answer', targetId: string, reason: string, description: string) => {
        const res = await apiClient.post<{ success: boolean; message: string }>('/faq/report', {
            type, targetId, reason, description,
        });
        return res.data;
    },

    adminGetQuestions: async (params: FaqListParams = {}): Promise<FaqListResponse> => {
        const res = await apiClient.get<FaqListResponse>('/admin/faq', { params });
        return res.data;
    },

    adminGetStatistics: async (): Promise<{ success: boolean; data: FaqStatistics }> => {
        const res = await apiClient.get<{ success: boolean; data: FaqStatistics }>('/admin/faq/statistics');
        return res.data;
    },

    adminGetQuestionBySlug: async (slug: string): Promise<FaqDetailResponse> => {
        const res = await apiClient.get<FaqDetailResponse>(`/admin/faq/${encodeURIComponent(slug)}`);
        return res.data;
    },

    adminUpdateAnswer: async (id: string, content: string): Promise<{ success: boolean; data: Answer }> => {
        const res = await apiClient.put<{ success: boolean; data: Answer }>(`/admin/faq/answers/${id}`, { content });
        return res.data;
    },

    adminTogglePin: async (id: string): Promise<{ success: boolean; data: Question }> => {
        const res = await apiClient.put<{ success: boolean; data: Question }>(`/admin/faq/questions/${id}/pin`);
        return res.data;
    },

    adminToggleLock: async (id: string): Promise<{ success: boolean; data: Question }> => {
        const res = await apiClient.put<{ success: boolean; data: Question }>(`/admin/faq/questions/${id}/lock`);
        return res.data;
    },

    adminDeleteQuestion: async (id: string): Promise<{ success: boolean; message: string }> => {
        const res = await apiClient.delete<{ success: boolean; message: string }>(`/admin/faq/questions/${id}`);
        return res.data;
    },

    adminDeleteAnswer: async (id: string): Promise<{ success: boolean; message: string }> => {
        const res = await apiClient.delete<{ success: boolean; message: string }>(`/admin/faq/answers/${id}`);
        return res.data;
    },
};

export { getErrorMessage } from '@/types/faq.type';
