// lib/api/faq.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IFAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
    views: number;
    helpful: number;
    notHelpful: number;
    createdAt: string;
}

export const faqApi = {
    // Public
    getFAQs: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));

        const url = `${API_URL}/api/faq${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await fetch(url, { cache: 'no-store' });
        return response.json();
    },

    getFAQById: async (id: string) => {
        const response = await fetch(`${API_URL}/api/faq/${id}`, { cache: 'no-store' });
        return response.json();
    },

    rateHelpful: async (id: string, helpful: boolean) => {
        const response = await fetch(`${API_URL}/api/faq/${id}/helpful`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ helpful })
        });
        return response.json();
    },

    // Admin
    getAllFAQsAdmin: async (token: string, params?: { category?: string; search?: string; page?: number; limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));

        const url = `${API_URL}/api/faq/admin/all${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    createFAQ: async (data: { question: string; answer: string; category: string; order?: number; isActive?: boolean }, token: string) => {
        const response = await fetch(`${API_URL}/api/faq/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateFAQ: async (id: string, data: Partial<IFAQ>, token: string) => {
        const response = await fetch(`${API_URL}/api/faq/admin/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteFAQ: async (id: string, token: string) => {
        const response = await fetch(`${API_URL}/api/faq/admin/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    }
};