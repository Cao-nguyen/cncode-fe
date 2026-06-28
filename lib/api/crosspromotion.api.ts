import axios from 'axios';
import type {
    ApiResponse,
    CrossPromotionRequest,
    CrossPromotionStats,
    CrossPromotionStatus,
} from '@/types/crosspromotion.type';

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
    baseURL: `${API_URL}/api`,
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

export interface GetAdminRequestsParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

export const crossPromotionApi = {
    getAllRequestsAdmin: async (params?: GetAdminRequestsParams): Promise<ApiResponse<CrossPromotionRequest[]>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);

        const response = await apiClient.get(`/cross-promotion/admin?${queryParams.toString()}`);
        return response.data;
    },

    getStats: async (): Promise<ApiResponse<CrossPromotionStats>> => {
        const response = await apiClient.get('/cross-promotion/admin/stats');
        return response.data;
    },

    updateRequestStatus: async (
        id: string,
        status: CrossPromotionStatus,
        message: string
    ): Promise<ApiResponse<CrossPromotionRequest>> => {
        const response = await apiClient.put(`/cross-promotion/admin/${id}/status`, { status, message });
        return response.data;
    },

    deleteRequest: async (id: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete(`/cross-promotion/admin/${id}`);
        return response.data;
    },
};
