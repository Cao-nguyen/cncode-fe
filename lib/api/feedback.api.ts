import axios from 'axios';
import {
    CreateFeedbackDto,
    Feedback,
    FeedbackAdminStats,
    FeedbackDetailResponse,
    FeedbackListResponse,
    ReactFeedbackResult,
    UpdateFeedbackDto,
    ReleaseVersion,
    ReleaseVersionDto,
    ReleaseVersionListResponse,
} from '@/types/feedback.type';

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

const api = axios.create({
    baseURL: `${API_URL}/api/feedback`,
    headers: { 'Content-Type': 'application/json' },
});

const adminApi = axios.create({
    baseURL: `${API_URL}/api/admin/feedback`,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
adminApi.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return (error.response?.data as { message?: string })?.message || 'Có lỗi xảy ra';
    }
    return error instanceof Error ? error.message : 'Có lỗi xảy ra';
}

export type { Feedback };

export interface FeedbackListParams {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
}

export interface AdminFeedbackListParams extends FeedbackListParams {
    priority?: string;
}

export const feedbackApi = {
    getFeedbacks: async (params: FeedbackListParams = {}): Promise<FeedbackListResponse> => {
        const { data } = await api.get<FeedbackListResponse>('/', { params });
        return data;
    },

    getMyFeedbacks: async (params: FeedbackListParams = {}): Promise<FeedbackListResponse> => {
        const { data } = await api.get<FeedbackListResponse>('/my', { params });
        return data;
    },

    getFeedbackById: async (id: string): Promise<FeedbackDetailResponse> => {
        const { data } = await api.get<FeedbackDetailResponse>(`/${id}`);
        return data;
    },

    createFeedback: async (payload: CreateFeedbackDto): Promise<{ success: boolean; message?: string; data: Feedback }> => {
        const { data } = await api.post<{ success: boolean; message?: string; data: Feedback }>('/', payload);
        return data;
    },

    updateFeedback: async (id: string, payload: UpdateFeedbackDto): Promise<{ success: boolean; message?: string; data: Feedback }> => {
        const { data } = await api.put<{ success: boolean; message?: string; data: Feedback }>(`/${id}`, payload);
        return data;
    },

    deleteFeedback: async (id: string): Promise<{ success: boolean; message?: string }> => {
        const { data } = await api.delete<{ success: boolean; message?: string }>(`/${id}`);
        return data;
    },

    reactFeedback: async (id: string): Promise<{ success: boolean; message?: string; data: ReactFeedbackResult }> => {
        const { data } = await api.post<{ success: boolean; message?: string; data: ReactFeedbackResult }>(`/${id}/react`);
        return data;
    },

    adminGetAll: async (params: AdminFeedbackListParams = {}): Promise<FeedbackListResponse> => {
        const { data } = await adminApi.get<FeedbackListResponse>('/all', { params });
        return data;
    },

    adminGetStats: async (): Promise<{ success: boolean; data: FeedbackAdminStats }> => {
        const { data } = await adminApi.get<{ success: boolean; data: FeedbackAdminStats }>('/stats');
        return data;
    },

    adminUpdateStatus: async (
        id: string,
        status: string,
        adminResponse?: string,
    ): Promise<{ success: boolean; message?: string; data: Feedback }> => {
        const { data } = await adminApi.put<{ success: boolean; message?: string; data: Feedback }>(`/${id}/status`, {
            status,
            adminResponse,
        });
        return data;
    },

    adminTogglePin: async (id: string): Promise<{ success: boolean; message?: string; data: Feedback }> => {
        const { data } = await adminApi.post<{ success: boolean; message?: string; data: Feedback }>(`/${id}/pin`);
        return data;
    },

    adminToggleLock: async (id: string): Promise<{ success: boolean; message?: string; data: Feedback }> => {
        const { data } = await adminApi.post<{ success: boolean; message?: string; data: Feedback }>(`/${id}/lock`);
        return data;
    },

    adminDelete: async (id: string): Promise<{ success: boolean; message?: string }> => {
        const { data } = await adminApi.delete<{ success: boolean; message?: string }>(`/${id}`);
        return data;
    },

    getVersions: async (): Promise<ReleaseVersionListResponse> => {
        const { data } = await api.get<ReleaseVersionListResponse>('/versions');
        return data;
    },

    adminGetVersions: async (): Promise<ReleaseVersionListResponse> => {
        const { data } = await adminApi.get<ReleaseVersionListResponse>('/versions');
        return data;
    },

    adminCreateVersion: async (payload: ReleaseVersionDto): Promise<{ success: boolean; message?: string; data: ReleaseVersion }> => {
        const { data } = await adminApi.post<{ success: boolean; message?: string; data: ReleaseVersion }>('/versions', payload);
        return data;
    },

    adminUpdateVersion: async (id: string, payload: Partial<ReleaseVersionDto>): Promise<{ success: boolean; message?: string; data: ReleaseVersion }> => {
        const { data } = await adminApi.put<{ success: boolean; message?: string; data: ReleaseVersion }>(`/versions/${id}`, payload);
        return data;
    },

    adminDeleteVersion: async (id: string): Promise<{ success: boolean; message?: string }> => {
        const { data } = await adminApi.delete<{ success: boolean; message?: string }>(`/versions/${id}`);
        return data;
    },
};
