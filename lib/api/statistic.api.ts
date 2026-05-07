// lib/api/statistic.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const statisticApi = {
    getPublicStats: async () => {
        try {
            const res = await fetch(`${API_URL}/api/public/stats`, {
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching public stats:', error);
            return { success: false, data: { totalVisits: 0, todayVisits: 0 } };
        }
    },

    getOnlineStats: async () => {
        try {
            const res = await fetch(`${API_URL}/api/online-stats`, {
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching online stats:', error);
            return { success: false, data: { users: 0, guests: 0 } };
        }
    }
};