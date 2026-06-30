const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface IGift {
    _id: string;
    name: string;
    description?: string;
    image: string;
    priceInXu: number;
    category: 'heart' | 'star' | 'flower' | 'special' | 'other';
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface IGiftTransaction {
    _id: string;
    sender: {
        _id: string;
        fullName: string;
        username?: string;
        avatar?: string;
    };
    recipient: {
        _id: string;
        fullName: string;
        username?: string;
        avatar?: string;
    };
    gift: IGift;
    targetType: 'user' | 'post';
    targetId: string;
    message?: string;
    coinsSpent: number;
    xuReceived: number;
    createdAt: string;
}

export interface IGiftTransactionsResponse {
    transactions: IGiftTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
    }
    return response.json();
}

export const giftApi = {
    // Admin routes
    getAllGifts: async (token: string): Promise<IGift[]> => {
        const response = await fetch(`${API_URL}/api/gifts/admin/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IGift[]>(response);
    },

    createGift: async (gift: Partial<IGift>, token: string): Promise<IGift> => {
        const response = await fetch(`${API_URL}/api/gifts/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(gift)
        });
        return handleResponse<IGift>(response);
    },

    updateGift: async (id: string, gift: Partial<IGift>, token: string): Promise<IGift> => {
        const response = await fetch(`${API_URL}/api/gifts/admin/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(gift)
        });
        return handleResponse<IGift>(response);
    },

    deleteGift: async (id: string, token: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_URL}/api/gifts/admin/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<{ message: string }>(response);
    },

    // Public routes
    getActiveGifts: async (): Promise<IGift[]> => {
        const response = await fetch(`${API_URL}/api/gifts/active`);
        return handleResponse<IGift[]>(response);
    },

    // User routes
    sendGift: async (data: {
        giftId: string;
        recipientId: string;
        targetType: 'user' | 'post';
        targetId: string;
        message?: string;
    }, token: string): Promise<IGiftTransaction> => {
        const response = await fetch(`${API_URL}/api/gifts/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return handleResponse<IGiftTransaction>(response);
    },

    getReceivedGifts: async (token: string, page: number = 1, limit: number = 20): Promise<IGiftTransactionsResponse> => {
        const response = await fetch(`${API_URL}/api/gifts/received?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IGiftTransactionsResponse>(response);
    },

    getSentGifts: async (token: string, page: number = 1, limit: number = 20): Promise<IGiftTransactionsResponse> => {
        const response = await fetch(`${API_URL}/api/gifts/sent?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return handleResponse<IGiftTransactionsResponse>(response);
    },

    getGiftsForTarget: async (targetType: 'user' | 'post', targetId: string, page: number = 1, limit: number = 20): Promise<IGiftTransactionsResponse> => {
        const response = await fetch(`${API_URL}/api/gifts/target/${targetType}/${targetId}?page=${page}&limit=${limit}`);
        return handleResponse<IGiftTransactionsResponse>(response);
    },

    convertGifts: async (giftId: string, token: string): Promise<{ success: boolean; message: string; xuReceived: number }> => {
        const response = await fetch(`${API_URL}/api/gifts/convert/${giftId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return handleResponse<{ success: boolean; message: string; xuReceived: number }>(response);
    }
};
