const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IShortLink {
    _id: string;
    originalUrl: string;
    slug: string;
    clicks: number;
    expiresAt?: string;
    createdAt: string;
}

export const shortlinkApi = {
    createShortLink: async (url: string, customSlug?: string, expiresInDays?: number, token?: string) => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/shortlink/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ url, customSlug, expiresInDays })
        });
        return res.json();
    },

    getUserLinks: async (token: string) => {
        const res = await fetch(`${API_URL}/shortlink/user/links`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.json();
    },

    deleteLink: async (slug: string, token: string) => {
        const res = await fetch(`${API_URL}/shortlink/${slug}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.json();
    }
};