// lib/api/transaction.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ITransactionUser {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
}

export interface ITransactionProduct {
    _id: string;
    name: string;
    thumbnail: string;
    price: number;
}

export interface ITransaction {
    _id: string;
    user: ITransactionUser;
    product: ITransactionProduct;
    paymentMethod: 'xu' | 'banking';
    amount: number;
    xuAmount: number;
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    transactionId: string;
    payosOrderId?: string;
    createdAt: string;
    updatedAt: string;  // ✅ Thêm dòng này
}

export interface ITransactionStats {
    totalRevenue: number;
    totalXuSpent: number;
    totalOrders: number;
    pendingOrders: number;
    todayRevenue: number;
}

export const transactionApi = {
    getAllTransactions: async (
        token: string,
        params: {
            page?: number;
            limit?: number;
            search?: string;
            paymentMethod?: string;
            status?: string;
            startDate?: string;
            endDate?: string;
        } = {}
    ) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, String(value));
        });

        const url = `${API_URL}/api/payments/admin/transactions${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    getTransactionById: async (id: string, token: string) => {
        const response = await fetch(`${API_URL}/api/payments/admin/transactions/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    },

    updateTransactionStatus: async (id: string, status: string, token: string, note?: string) => {
        const response = await fetch(`${API_URL}/api/payments/admin/transactions/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status, note })
        });
        return response.json();
    }
};