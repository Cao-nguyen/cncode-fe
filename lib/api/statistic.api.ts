const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const statisticApi = {
    getPublicStats: async () => {
        const res = await fetch(`${API_URL}/api/public/stats`, { cache: 'no-store' });
        return res.json();
    }
};