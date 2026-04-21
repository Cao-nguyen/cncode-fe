// lib/api/dashboard.api.ts
import { IAdminDashboard, IUserDashboard } from '@/types/dashboard.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const dashboardApi = {
    getAdminDashboard: async (token: string): Promise<IApiResponse<IAdminDashboard>> => {
        const response = await fetch(`${API_URL}/api/dashboard/admin`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    getUserDashboard: async (token: string): Promise<IApiResponse<IUserDashboard>> => {
        const response = await fetch(`${API_URL}/api/dashboard/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }
};