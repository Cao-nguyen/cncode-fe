// lib/api/system-settings.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IHistoryItem {
    field: string;
    oldValue: string;
    newValue: string;
    updatedBy: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    updatedAt: string;
}

export interface ISystemSettings {
    _id: string;
    chinhSachBaoHanh: string;
    huongDanThanhToan: string;
    quyTrinhSuDung: string;
    gioiThieu: string;
    anToanBaoMat: string;
    dieuKhoanSuDung: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    updatedBy?: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    updateHistory: IHistoryItem[];
}

export interface IPublicContent {
    title: string;
    content: string;
    slug: string;
}

export interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const systemSettingsApi = {
    // Public
    getPublicContent: async (slug: string): Promise<IApiResponse<IPublicContent>> => {
        const response = await fetch(`${API_URL}/api/system-settings/public/${slug}`, {
            cache: 'no-store'
        });
        return response.json();
    },

    // Admin
    getSettings: async (token: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await fetch(`${API_URL}/api/system-settings/admin/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    updateChinhSachBaoHanh: async (content: string, token: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await fetch(`${API_URL}/api/system-settings/admin/settings/chinh-sach-bao-hanh`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        return response.json();
    },

    updateHuongDanThanhToan: async (content: string, token: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await fetch(`${API_URL}/api/system-settings/admin/settings/huong-dan-thanh-toan`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        return response.json();
    },

    updateQuyTrinhSuDung: async (content: string, token: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await fetch(`${API_URL}/api/system-settings/admin/settings/quy-trinh-su-dung`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        return response.json();
    },

    updateGioiThieu: async (content: string, token: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await fetch(`${API_URL}/api/system-settings/admin/settings/gioi-thieu`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        return response.json();
    },

    updateAnToanBaoMat: async (content: string, token: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await fetch(`${API_URL}/api/system-settings/admin/settings/an-toan-bao-mat`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        return response.json();
    },

    updateDieuKhoanSuDung: async (content: string, token: string): Promise<IApiResponse<ISystemSettings>> => {
        const response = await fetch(`${API_URL}/api/system-settings/admin/settings/dieu-khoan-su-dung`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        return response.json();
    },

    getHistory: async (token: string, field?: string): Promise<IApiResponse<IHistoryItem[]>> => {
        const url = field
            ? `${API_URL}/api/system-settings/admin/settings/history?field=${field}`
            : `${API_URL}/api/system-settings/admin/settings/history`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    }
};