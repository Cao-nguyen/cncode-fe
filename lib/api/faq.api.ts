// lib/api/faq.api.ts
import axios from 'axios';
import { Question, Answer, CreateQuestionDto, CreateAnswerDto, StatisticsData } from '@/types/faq.type';

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

const api = axios.create({
    baseURL: `${API_URL}/api/faq`,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const faqApi = {
    // Public routes
    getQuestions: async (params?: { page?: number; limit?: number; grade?: string; status?: string; search?: string }) => {
        const response = await api.get<{ success: boolean; questions: Question[]; total: number; totalPages: number }>('/', { params });
        return response.data;
    },

    getQuestionBySlug: async (slug: string) => {
        const response = await api.get<{ success: boolean; data: { question: Question; answers: Answer[]; isLiked: boolean } }>(`/${slug}`);
        return response.data;
    },

    getStatistics: async () => {
        const response = await api.get<{ success: boolean; data: StatisticsData }>('/statistics');
        return response.data;
    },

    // Question routes
    createQuestion: async (data: CreateQuestionDto) => {
        const response = await api.post<{ success: boolean; data: Question }>('/questions', data);
        return response.data;
    },

    updateQuestion: async (id: string, data: { title: string; content: string }) => {
        const response = await api.put<{ success: boolean; data: Question }>(`/questions/${id}`, data);
        return response.data;
    },

    deleteQuestion: async (id: string) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/questions/${id}`);
        return response.data;
    },

    toggleLikeQuestion: async (id: string) => {
        const response = await api.post<{ success: boolean; action: 'added' | 'removed'; likeCount: number }>(`/questions/${id}/like`);
        return response.data;
    },

    // Answer routes
    createAnswer: async (data: CreateAnswerDto) => {
        const response = await api.post<{ success: boolean; data: Answer }>('/answers', data);
        return response.data;
    },

    updateAnswer: async (id: string, content: string) => {
        const response = await api.put<{ success: boolean; data: Answer }>(`/answers/${id}`, { content });
        return response.data;
    },

    deleteAnswer: async (id: string) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/answers/${id}`);
        return response.data;
    },

    markBestAnswer: async (answerId: string, questionId: string) => {
        const response = await api.post<{ success: boolean; data: Answer }>('/answers/best', { answerId, questionId });
        return response.data;
    },

    toggleLikeAnswer: async (id: string) => {
        const response = await api.post<{ success: boolean; action: 'added' | 'removed'; likeCount: number }>(`/answers/${id}/like`);
        return response.data;
    },

    // Report
    report: async (type: 'question' | 'answer', targetId: string, reason: string, description: string) => {
        const response = await api.post<{ success: boolean; message: string }>('/report', { type, targetId, reason, description });
        return response.data;
    },

    // Admin routes
    togglePinQuestion: async (id: string) => {
        const response = await api.put<{ success: boolean; data: Question }>(`/admin/questions/${id}/pin`);
        return response.data;
    },

    toggleLockQuestion: async (id: string) => {
        const response = await api.put<{ success: boolean; data: Question }>(`/admin/questions/${id}/lock`);
        return response.data;
    },
};

export { getErrorMessage } from '@/types/faq.type';