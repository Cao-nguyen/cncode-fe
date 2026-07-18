import axios from 'axios';
import { ISystemSettings, IPublicContent, IApiResponse, IHistoryItem } from '@/types/systemSettings.type';

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
    baseURL: `${API_URL}/api/system-settings`,
});

const adminApi = axios.create({
    baseURL: `${API_URL}/api/admin/system-settings`,
});

adminApi.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const systemSettingsApi = {
    // Public
    getPublicContent: async (slug: string): Promise<IApiResponse<IPublicContent>> => {
        const response = await api.get<IApiResponse<IPublicContent>>(`/public/${slug}`);
        return response.data;
    },

    // Admin
    getSettings: async (): Promise<IApiResponse<ISystemSettings>> => {
        const response = await adminApi.get<IApiResponse<ISystemSettings>>('/settings');
        return response.data;
    },

    updateGioiThieu: async (content: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await adminApi.put<IApiResponse<ISystemSettings>>('/settings/gioi-thieu', { content });
        return response.data;
    },

    updateDieuKhoanSuDung: async (content: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await adminApi.put<IApiResponse<ISystemSettings>>('/settings/dieu-khoan-su-dung', { content });
        return response.data;
    },

    updateAnToanBaoMat: async (content: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await adminApi.put<IApiResponse<ISystemSettings>>('/settings/an-toan-bao-mat', { content });
        return response.data;
    },

    updateQuyTrinhSuDung: async (content: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await adminApi.put<IApiResponse<ISystemSettings>>('/settings/quy-trinh-su-dung', { content });
        return response.data;
    },

    updateHuongDanThanhToan: async (content: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await adminApi.put<IApiResponse<ISystemSettings>>('/settings/huong-dan-thanh-toan', { content });
        return response.data;
    },

    updateChinhSachBaoHanh: async (content: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await adminApi.put<IApiResponse<ISystemSettings>>('/settings/chinh-sach-bao-hanh', { content });
        return response.data;
    },

    getHistory: async (field?: string): Promise<IApiResponse<IHistoryItem[]>> => {
        const params = field ? { field } : {};
        const response = await adminApi.get<IApiResponse<IHistoryItem[]>>('/settings/history', { params });
        return response.data;
    }
};
