const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const statisticApi = {
    getPublicStats: async () => {
        try {
            const res = await fetch(`${API_URL}/api/statistic/public`, {
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
            const res = await fetch(`${API_URL}/api/statistic/online`, {
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching online stats:', error);
            return { success: false, data: { users: 0, guests: 0 } };
        }
    },

    trackVisit: async (sessionId: string, userId?: string) => {
        try {
            const res = await fetch(`${API_URL}/api/statistic/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, userId })
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error tracking visit:', error);
            return { success: false };
        }
    },

    getOnlineGuests: async () => {
        try {
            const res = await fetch(`${API_URL}/api/statistic/guests`, {
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching guests:', error);
            return { success: false, data: [] };
        }
    }
};
