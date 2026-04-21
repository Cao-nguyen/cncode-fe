// lib/api/activity.api.ts
import { IActivity, IActivityFilters, IActivityResponse } from '@/types/activity.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const activityApi = {
    getActivities: async (
        token: string,
        filters: IActivityFilters,
        page: number = 1,
        limit: number = 20
    ): Promise<IActivityResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters.type && { type: filters.type }),
            ...(filters.status && { status: filters.status }),
            ...(filters.search && { search: filters.search }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate })
        });

        const response = await fetch(`${API_URL}/api/activities?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },

    getActivityStats: async (token: string) => {
        const response = await fetch(`${API_URL}/api/activities/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        return response.json();
    }
};