import axios from 'axios';
import { HelpProject, CreateHelpProjectDto, UpdateHelpProjectDto, HelpProjectStats } from '@/types/helpproject.type';

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

export interface HelpProjectListParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

export interface HelpProjectListResponse {
    success: boolean;
    data: HelpProject[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface HelpProjectAdminStats {
    total: number;
    pending: number;
    answered: number;
    totalViews: number;
}

export const helpProjectApi = {
    createProject: async (data: CreateHelpProjectDto) => {
        const res = await apiClient.post('/helpproject', data);
        return res.data;
    },

    getUserProjects: async (params: HelpProjectListParams = {}): Promise<HelpProjectListResponse> => {
        const res = await apiClient.get('/helpproject/my-projects', { params });
        return res.data;
    },

    getMyStats: async (): Promise<{ success: boolean; data: HelpProjectStats }> => {
        const res = await apiClient.get('/helpproject/my-stats');
        return res.data;
    },

    getProjectById: async (id: string) => {
        const res = await apiClient.get(`/helpproject/${id}`);
        return res.data;
    },

    incrementView: async (id: string) => {
        const res = await apiClient.post(`/helpproject/${id}/increment-view`);
        return res.data;
    },

    updateProject: async (id: string, data: UpdateHelpProjectDto) => {
        const res = await apiClient.put(`/helpproject/${id}`, data);
        return res.data;
    },

    deleteProject: async (id: string) => {
        const res = await apiClient.delete(`/helpproject/${id}`);
        return res.data;
    },

    addReply: async (id: string, content: string, parentId?: string) => {
        const res = await apiClient.post(`/helpproject/${id}/reply`, { content, parentId });
        return res.data;
    },

    getAllProjects: async (params: HelpProjectListParams = {}): Promise<HelpProjectListResponse> => {
        const res = await apiClient.get('/admin/helpproject/all', { params });
        return res.data;
    },

    getStatistics: async (): Promise<{ success: boolean; data: HelpProjectAdminStats }> => {
        const res = await apiClient.get('/admin/helpproject/statistics');
        return res.data;
    },

    adminGetProjectById: async (id: string) => {
        const res = await apiClient.get(`/admin/helpproject/${id}`);
        return res.data;
    },

    adminAddReply: async (id: string, content: string, parentId?: string) => {
        const res = await apiClient.post(`/admin/helpproject/${id}/reply`, { content, parentId });
        return res.data;
    },

    updateStatus: async (id: string, status: string) => {
        const res = await apiClient.put(`/admin/helpproject/${id}/status`, { status });
        return res.data;
    },

    adminDeleteProject: async (id: string) => {
        const res = await apiClient.delete(`/admin/helpproject/${id}`);
        return res.data;
    },
};
