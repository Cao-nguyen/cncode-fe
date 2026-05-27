
import axios from 'axios';
import { LinkedProduct, CreateLinkedProductDto, UpdateLinkedProductDto, ProductsResponse } from '@/types/linkedProduct.type';

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

const api = axios.create({
    baseURL: `${API_URL}/api/linked-products`,
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const linkedProductApi = {
    
    getPublicProducts: async () => {
        const response = await api.get<{ success: boolean; products: LinkedProduct[] }>('/public');
        return response.data;
    },

    getUserProducts: async (params?: { page?: number; limit?: number; status?: string }) => {
        const response = await api.get<ProductsResponse>('/my-products', { params });
        return response.data;
    },

    createProduct: async (productData: CreateLinkedProductDto) => {
        const response = await api.post<{ success: boolean; data: LinkedProduct }>('/', productData);
        return response.data;
    },

    updateProduct: async (id: string, productData: UpdateLinkedProductDto) => {
        const response = await api.put<{ success: boolean; data: LinkedProduct }>(`/${id}`, productData);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/${id}`);
        return response.data;
    },

    updateSortOrder: async (updates: { id: string; sortOrder: number }[]) => {
        const response = await api.put<{ success: boolean; message: string }>('/sort-order', { updates });
        return response.data;
    },
};
