import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    files: { url: string; name: string; size: number; type: string }[];
    seller: {
        _id: string;
        fullName: string;
        avatar?: string;
        email: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    views: number;
    purchases: number;
    tags: string[];
    featured: boolean;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductFilters {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    seller?: string;
    search?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
    success: boolean;
    data: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const shopApi = {
    // Get all products
    getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        const response = await apiClient.get(`/shop/products?${params.toString()}`);
        return response.data;
    },

    // Get single product
    getProduct: async (id: string): Promise<{ success: boolean; data: Product }> => {
        const response = await apiClient.get(`/shop/products/${id}`);
        return response.data;
    },

    // Create product
    createProduct: async (data: Partial<Product>): Promise<{ success: boolean; data: Product }> => {
        const response = await apiClient.post('/shop/products', data);
        return response.data;
    },

    // Update product
    updateProduct: async (id: string, data: Partial<Product>): Promise<{ success: boolean; data: Product }> => {
        const response = await apiClient.put(`/shop/products/${id}`, data);
        return response.data;
    },

    // Delete product
    deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/shop/products/${id}`);
        return response.data;
    },

    // Approve product (admin)
    approveProduct: async (id: string): Promise<{ success: boolean; data: Product }> => {
        const response = await apiClient.post(`/shop/products/${id}/approve`);
        return response.data;
    },

    // Reject product (admin)
    rejectProduct: async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post(`/shop/products/${id}/reject`, { reason });
        return response.data;
    },

    // Get stats (admin)
    getStats: async (): Promise<{ success: boolean; data: any }> => {
        const response = await apiClient.get('/shop/admin/stats');
        return response.data;
    },
};