import axios from 'axios';
import type {
    PracticeSet,
    CreatePracticeDto,
    PracticeListResponse,
    SubmitResult,
    PracticeAttempt,
    PracticeAnswer,
} from '@/types/luyentap.type';

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
    baseURL: `${API_URL}/api/luyentap`,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const luyentapApi = {
    list: async (params?: { page?: number; limit?: number; tier?: string; search?: string }) => {
        const res = await apiClient.get<ApiResponse<PracticeListResponse>>('/', { params });
        return res.data;
    },

    getById: async (id: string) => {
        const res = await apiClient.get<ApiResponse<PracticeSet>>(`/${id}`);
        return res.data;
    },

    getForTaking: async (id: string) => {
        const res = await apiClient.get<ApiResponse<PracticeSet>>(`/${id}/take`);
        return res.data;
    },

    submit: async (id: string, answers: PracticeAnswer[]) => {
        const res = await apiClient.post<ApiResponse<SubmitResult>>(`/${id}/submit`, { answers });
        return res.data;
    },

    getAttempt: async (attemptId: string) => {
        const res = await apiClient.get<ApiResponse<PracticeAttempt>>(`/attempt/${attemptId}`);
        return res.data;
    },

    getMyAttempts: async (id: string) => {
        const res = await apiClient.get<ApiResponse<PracticeAttempt[]>>(`/${id}/attempts`);
        return res.data;
    },

    runCodeTest: async (payload: { language: string; code: string; input?: string; expectedOutput: string }) => {
        const res = await apiClient.post<ApiResponse<{ output: string; passed: boolean; error?: string }>>('/run-code', payload);
        return res.data;
    },

    // Admin
    adminList: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
        const res = await apiClient.get<ApiResponse<PracticeListResponse>>('/admin/all', { params });
        return res.data;
    },

    adminGetById: async (id: string) => {
        const res = await apiClient.get<ApiResponse<PracticeSet>>(`/admin/${id}`);
        return res.data;
    },

    adminCreate: async (data: CreatePracticeDto) => {
        const res = await apiClient.post<ApiResponse<PracticeSet>>('/admin', data);
        return res.data;
    },

    adminUpdate: async (id: string, data: Partial<CreatePracticeDto>) => {
        const res = await apiClient.put<ApiResponse<PracticeSet>>(`/admin/${id}`, data);
        return res.data;
    },

    adminDelete: async (id: string) => {
        const res = await apiClient.delete<ApiResponse<null>>(`/admin/${id}`);
        return res.data;
    },

    adminApprove: async (id: string) => {
        const res = await apiClient.put<ApiResponse<PracticeSet>>(`/admin/${id}/approve`);
        return res.data;
    },

    adminReject: async (id: string, reason: string) => {
        const res = await apiClient.put<ApiResponse<PracticeSet>>(`/admin/${id}/reject`, { reason });
        return res.data;
    },

    // Teacher
    teacherList: async (params?: { page?: number; limit?: number; status?: string }) => {
        const res = await apiClient.get<ApiResponse<PracticeListResponse>>('/teacher/mine', { params });
        return res.data;
    },

    teacherGetById: async (id: string) => {
        const res = await apiClient.get<ApiResponse<PracticeSet>>(`/teacher/${id}`);
        return res.data;
    },

    teacherCreate: async (data: CreatePracticeDto) => {
        const res = await apiClient.post<ApiResponse<PracticeSet>>('/teacher', data);
        return res.data;
    },

    teacherUpdate: async (id: string, data: Partial<CreatePracticeDto>) => {
        const res = await apiClient.put<ApiResponse<PracticeSet>>(`/teacher/${id}`, data);
        return res.data;
    },

    teacherDelete: async (id: string) => {
        const res = await apiClient.delete<ApiResponse<null>>(`/teacher/${id}`);
        return res.data;
    },

    teacherSubmitForReview: async (id: string) => {
        const res = await apiClient.put<ApiResponse<PracticeSet>>(`/teacher/${id}/submit`);
        return res.data;
    },
};

export default luyentapApi;
