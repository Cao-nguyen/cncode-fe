import { Voucher, UserVoucher, CreateVoucherDto } from '@/types/voucher.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const voucherApi = {
    // ============ USER ============
    getUserVouchers: async (params: { page?: number; limit?: number; status?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.status) query.append('status', params.status);

        const url = `${API_URL}/api/vouchers/my-vouchers${query.toString() ? `?${query}` : ''}`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        return response.json();
    },

    useVoucher: async (userVoucherId: string) => {
        const response = await fetch(`${API_URL}/api/vouchers/use`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userVoucherId })
        });
        return response.json();
    },

    // ============ ADMIN ============
    getAllVouchers: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.search) query.append('search', params.search);
        if (params.status) query.append('status', params.status);

        const url = `${API_URL}/api/vouchers/admin/list${query.toString() ? `?${query}` : ''}`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        return response.json();
    },

    getStatistics: async () => {
        const response = await fetch(`${API_URL}/api/vouchers/admin/statistics`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getVoucherById: async (id: string) => {
        const response = await fetch(`${API_URL}/api/vouchers/admin/${id}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    createVoucher: async (data: CreateVoucherDto) => {
        const response = await fetch(`${API_URL}/api/vouchers/admin`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateVoucher: async (id: string, data: Partial<CreateVoucherDto>) => {
        const response = await fetch(`${API_URL}/api/vouchers/admin/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteVoucher: async (id: string) => {
        const response = await fetch(`${API_URL}/api/vouchers/admin/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getAssignedUsers: async (id: string) => {
        const response = await fetch(`${API_URL}/api/vouchers/admin/${id}/users`, {
            headers: getAuthHeaders()
        });
        return response.json();
    }
};