import axios from 'axios';

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

export interface IGift {
    _id: string;
    name: string;
    description?: string;
    image: string;
    priceInXu: number;
    category: 'special' | 'other';
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface IGiftTransaction {
    _id: string;
    sender: {
        _id: string;
        fullName: string;
        username?: string;
        avatar?: string;
    };
    recipient: {
        _id: string;
        fullName: string;
        username?: string;
        avatar?: string;
    };
    gift: IGift;
    targetType: 'user' | 'post';
    targetId: string;
    message?: string;
    coinsSpent: number;
    xuReceived: number;
    isConverted?: boolean;
    convertedAt?: string;
    createdAt: string;
}

export interface IGiftTransactionsResponse {
    success: boolean;
    data: IGiftTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface IGiftStats {
    totalGifts: number;
    activeGifts: number;
    inactiveGifts: number;
    totalTransactions: number;
    totalRevenue: number;
    totalConverted: number;
}

export interface IGiftTopItem {
    _id: string;
    name: string;
    image: string;
    priceInXu: number;
    category: IGift['category'];
    isActive: boolean;
    count: number;
    revenue: number;
}

export interface IGiftRevenueChartItem {
    date: string;
    revenue: number;
    count: number;
}

export interface IGiftCategoryChartItem {
    category: string;
    count: number;
    revenue: number;
}

export const giftApi = {
    // Admin APIs
    getStats: async (): Promise<{ success: boolean; data: IGiftStats }> => {
        const response = await apiClient.get('/admin/gifts/stats');
        return response.data;
    },

    getRevenueChart: async (days: number = 10): Promise<{ success: boolean; data: IGiftRevenueChartItem[] }> => {
        const response = await apiClient.get(`/admin/gifts/revenue-chart?days=${days}`);
        return response.data;
    },

    getTopGifts: async (limit: number = 5): Promise<{ success: boolean; data: IGiftTopItem[] }> => {
        const response = await apiClient.get(`/admin/gifts/top-gifts?limit=${limit}`);
        return response.data;
    },

    getCategoryChart: async (): Promise<{ success: boolean; data: IGiftCategoryChartItem[] }> => {
        const response = await apiClient.get('/admin/gifts/category-chart');
        return response.data;
    },

    getAllGifts: async (): Promise<{ success: boolean; data: IGift[] }> => {
        const response = await apiClient.get('/admin/gifts/all');
        return response.data;
    },

    createGift: async (gift: Partial<IGift>): Promise<{ success: boolean; data: IGift }> => {
        const response = await apiClient.post('/admin/gifts', gift);
        return response.data;
    },

    updateGift: async (id: string, gift: Partial<IGift>): Promise<{ success: boolean; data: IGift }> => {
        const response = await apiClient.put(`/admin/gifts/${id}`, gift);
        return response.data;
    },

    deleteGift: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/admin/gifts/${id}`);
        return response.data;
    },

    // Public APIs
    getActiveGifts: async (): Promise<{ success: boolean; data: IGift[] }> => {
        const response = await apiClient.get('/gifts/active');
        return response.data;
    },

    // User APIs
    sendGift: async (data: {
        giftId: string;
        recipientId: string;
        targetType: 'user' | 'post';
        targetId: string;
        message?: string;
    }): Promise<{ success: boolean; data: IGiftTransaction }> => {
        const response = await apiClient.post('/gifts/send', data);
        return response.data;
    },

    getReceivedGifts: async (page: number = 1, limit: number = 20): Promise<IGiftTransactionsResponse> => {
        const response = await apiClient.get(`/gifts/received?page=${page}&limit=${limit}`);
        return response.data;
    },

    getSentGifts: async (page: number = 1, limit: number = 20): Promise<IGiftTransactionsResponse> => {
        const response = await apiClient.get(`/gifts/sent?page=${page}&limit=${limit}`);
        return response.data;
    },

    getGiftsForTarget: async (
        targetType: 'user' | 'post',
        targetId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<IGiftTransactionsResponse> => {
        const response = await apiClient.get(`/gifts/target/${targetType}/${targetId}?page=${page}&limit=${limit}`);
        return response.data;
    },

    convertGifts: async (giftId: string): Promise<{ success: boolean; message: string; xuReceived: number }> => {
        const response = await apiClient.post(`/gifts/convert/${giftId}`);
        return response.data;
    }
};
