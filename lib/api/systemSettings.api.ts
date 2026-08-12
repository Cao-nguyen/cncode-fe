import axios from 'axios';
import { ISystemSettings, IPublicContent, IApiResponse, IHistoryItem } from '@/types/systemSettings.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const FIELD_ENDPOINT_MAP: Record<string, string> = {
    gioiThieu: 'gioi-thieu',
    dieuKhoanSuDung: 'dieu-khoan-su-dung',
    anToanBaoMat: 'an-toan-bao-mat',
    quyTrinhSuDung: 'quy-trinh-su-dung',
    huongDanThanhToan: 'huong-dan-thanh-toan',
    chinhSachBaoHanh: 'chinh-sach-bao-hanh',
};

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
    getPublicContent: async (slug: string): Promise<IApiResponse<IPublicContent>> => {
        const response = await api.get<IApiResponse<IPublicContent>>(`/public/${slug}`);
        return response.data;
    },

    getSettings: async (): Promise<IApiResponse<ISystemSettings>> => {
        const response = await adminApi.get<IApiResponse<ISystemSettings>>('/settings');
        return response.data;
    },

    updateSetting: async (fieldKey: string, content: string): Promise<IApiResponse<ISystemSettings>> => {
        const endpoint = FIELD_ENDPOINT_MAP[fieldKey];
        if (!endpoint) {
            throw new Error('Trường cài đặt không hợp lệ');
        }

        const response = await adminApi.put<IApiResponse<ISystemSettings>>(`/settings/${endpoint}`, { content });
        return response.data;
    },

    getHistory: async (field?: string): Promise<IApiResponse<IHistoryItem[]>> => {
        const params = field ? { field } : {};
        const response = await adminApi.get<IApiResponse<IHistoryItem[]>>('/settings/history', { params });
        return response.data;
    },
};
