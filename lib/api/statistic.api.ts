// lib/api/statistic.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IPublicStats {
    totalVisits: number;
    todayVisits: number;
}

export interface IOnlineStats {
    total: number;
    guests: number;
    users: number;
    userList: Array<{ userId: string; sessionId: string }>;
}

export interface IStatistics {
    total: {
        visits: number;
        today: number;
    };
    online: {
        total: number;
        guest: number;
        user: number;
    };
    last7Days: Record<string, { visits: number; guests: number; users: number }>;
    topPages: Array<{ page: string; views: number }>;
    topReferrers: Array<{ referrer: string; visits: number }>;
}

export interface IOnlineUser {
    user: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    lastActivity: string;
    currentPage: string;
}

export const statisticApi = {
    // Lấy thống kê công khai (cho trang chủ)
    getPublicStats: async (): Promise<{ success: boolean; data: IPublicStats }> => {
        const response = await fetch(`${API_URL}/api/public/stats`, {
            cache: 'no-store'
        });
        return response.json();
    },

    // Lấy thống kê chi tiết (cho admin)
    getStatistics: async (token: string): Promise<{ success: boolean; data: IStatistics }> => {
        const response = await fetch(`${API_URL}/api/statistics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });
        return response.json();
    },

    // Lấy danh sách user online (cho admin)
    getOnlineUsers: async (token: string, limit: number = 50): Promise<{ success: boolean; data: IOnlineUser[] }> => {
        const response = await fetch(`${API_URL}/api/online-users?limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    // Reset thống kê (cho admin)
    resetStatistics: async (token: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/api/statistics/reset`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }
};