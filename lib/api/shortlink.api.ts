const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IShortLink {
    _id: string;
    originalUrl: string;
    shortCode: string;
    shortUrl?: string;
    clicks: number;
    userId?: string;
    expiresAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateShortLinkResponse {
    success: boolean;
    data: {
        shortUrl: string;
        shortCode: string;
        originalUrl: string;
        clicks: number;
        expiresAt?: string;
        createdAt: string;
    };
    message: string;
}

export interface IGetUserLinksResponse {
    success: boolean;
    data: IShortLink[];
    message?: string;
}

export const shortlinkApi = {
    createShortLink: async (url: string, expiresInDays?: number, token?: string): Promise<ICreateShortLinkResponse> => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}/shortlink/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ url, expiresInDays })
        });
        return response.json();
    },

    getUserLinks: async (token: string): Promise<IGetUserLinksResponse> => {
        const response = await fetch(`${API_URL}/shortlink/user/links`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    deleteLink: async (shortCode: string, token: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/shortlink/${shortCode}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    getLinkStats: async (shortCode: string): Promise<{ success: boolean; data: IShortLink }> => {
        const response = await fetch(`${API_URL}/shortlink/stats/${shortCode}`);
        return response.json();
    }
};