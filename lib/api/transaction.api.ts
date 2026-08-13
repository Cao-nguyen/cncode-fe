import axios from 'axios';

const getApiRoot = () => {
    const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return raw.replace(/\/api\/?$/, '');
};

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    } catch {
        return null;
    }
};

function unwrapApiPayload<T>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const wrapped = payload as { data?: T };
        if (wrapped.data !== undefined && wrapped.data !== null) {
            return wrapped.data;
        }
    }
    return payload as T;
}

export type CoinTransactionRow = {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    reason: string;
    balanceAfter: number;
    relatedType?: string | null;
    relatedId?: string | null;
    createdAt: string;
};

export type PayOSTransactionRow = {
    id: string;
    title: string;
    amount: number;
    orderCode: string;
    status: 'completed' | 'pending' | 'failed';
    category: 'course' | 'luyentap' | 'cuahangso';
    relatedId?: string;
    createdAt: string;
};

export type TransactionHistoryStats = {
    coinsBalance: number;
    coinCreditTotal: number;
    coinDebitTotal: number;
    payosCompletedTotal: number;
    payosCompletedCount: number;
};

export type TransactionHistory = {
    coinTransactions: CoinTransactionRow[];
    payosTransactions: PayOSTransactionRow[];
    stats: TransactionHistoryStats;
};

export type TransactionUser = {
    _id: string;
    fullName?: string;
    email?: string;
    username?: string;
};

export type AdminCoinTransactionRow = CoinTransactionRow & {
    user?: TransactionUser | null;
};

export type AdminPayOSTransactionRow = PayOSTransactionRow & {
    user?: TransactionUser | null;
};

export type AdminTransactionStats = {
    coinCreditTotal: number;
    coinDebitTotal: number;
    payosCompletedTotal: number;
    payosCompletedCount: number;
    totalCoinCount: number;
    totalPayosCount: number;
};

export type AdminTransactionHistory = {
    type: 'xu' | 'payos';
    items: AdminCoinTransactionRow[] | AdminPayOSTransactionRow[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats: AdminTransactionStats;
};

export const transactionApi = {
    getMyHistory: async (): Promise<TransactionHistory> => {
        const token = getToken();
        const response = await axios.get(`${getApiRoot()}/api/transactions/me`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return unwrapApiPayload<TransactionHistory>(response.data);
    },

    getAdminHistory: async (params?: {
        type?: 'xu' | 'payos';
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<AdminTransactionHistory> => {
        const token = getToken();
        const response = await axios.get(`${getApiRoot()}/api/transactions/admin`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            params,
        });
        return unwrapApiPayload<AdminTransactionHistory>(response.data);
    },
};

export default transactionApi;
