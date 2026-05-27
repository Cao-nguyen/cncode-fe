
import type {
    IAffiliateApiResponse,
    IAffiliateStatsResponse,
    IAffiliateFilters,
    IMyAffiliateInfo,
    ILeaderboardUser,
} from '@/types/affiliate.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function handleResponse<T>(response: Response): Promise<IAffiliateApiResponse<T>> {
    if (!response.ok) {
        let message = `Lỗi ${response.status}: ${response.statusText}`;
        try {
            const err = await response.json();
            message = err.message || message;
        } catch {  }
        return { success: false, data: null as T, message };
    }
    const data = await response.json();
    return data;
}

export const affiliateApi = {
    
    getAdminStats: async (
        filters: IAffiliateFilters,
        token: string
    ): Promise<IAffiliateApiResponse<IAffiliateStatsResponse>> => {
        const params = new URLSearchParams({
            page: filters.page.toString(),
            limit: filters.limit.toString(),
            ...(filters.search ? { search: filters.search } : {}),
        });

        const response = await fetch(
            `${API_URL}/api/affiliate/admin/stats?${params}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return handleResponse<IAffiliateStatsResponse>(response);
    },

    getMyInfo: async (token: string): Promise<IAffiliateApiResponse<IMyAffiliateInfo>> => {
        const response = await fetch(
            `${API_URL}/api/affiliate/my-affiliate`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return handleResponse<IMyAffiliateInfo>(response);
    },

    getLeaderboard: async (limit = 10): Promise<IAffiliateApiResponse<ILeaderboardUser[]>> => {
        const response = await fetch(
            `${API_URL}/api/affiliate/leaderboard?limit=${limit}`
        );
        return handleResponse<ILeaderboardUser[]>(response);
    },

    trackClick: async (code: string): Promise<void> => {
        try {
            await fetch(`${API_URL}/api/affiliate/click/${code}`, { method: 'POST' });
        } catch {  }
    },
};
