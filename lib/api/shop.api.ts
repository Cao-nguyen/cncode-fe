import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
            const parsed = JSON.parse(raw);
            const token = parsed?.state?.token;
            if (token) return token;
        }
    } catch {
        // ignore parse errors
    }
    return localStorage.getItem('token');
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

function getShopApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string; errors?: string[] } | undefined;
        if (data?.errors?.length) return data.errors.join(', ');
        if (data?.message) return data.message;
        if (error.response?.status === 401) return 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại';
    }
    return fallback;
}

export interface ShopCategoryStat {
    _id: string;
    count: number;
}

export interface ShopTopProductStat {
    productId: string;
    title: string;
    category: string;
    purchases: number;
    revenue: number;
    views: number;
    downloads: number;
}

export interface ShopRevenueTrendPoint {
    label: string;
    revenue: number;
    orders: number;
}

export interface ShopCategoryRevenueStat {
    category: string;
    revenue: number;
    orders: number;
}

export interface ShopAdminStats {
    totalProducts: number;
    pendingProducts: number;
    approvedProducts: number;
    rejectedProducts: number;
    totalViews: number;
    totalPurchases: number;
    totalDownloads: number;
    totalRevenue: number;
    categoryCounts: ShopCategoryStat[];
    topProducts: ShopTopProductStat[];
    revenueTrend: ShopRevenueTrendPoint[];
    categoryRevenue: ShopCategoryRevenueStat[];
}

export type ShopCategory = 'Tài liệu' | 'PowerPoint' | 'Code' | 'Khác';

export interface ProductFile {
    url?: string;
    name: string;
    size: number;
    type: string;
}

export interface ProductPreviewFile {
    url: string;
    name: string;
    size: number;
    type: string;
}

export interface Product {
    _id: string;
    slug?: string;
    title: string;
    description: string;
    price: number;
    discountType?: 'percent' | 'vnd';
    discountValue?: number;
    discountPrice?: number | null;
    allowCoinPayment?: boolean;
    coverImage?: string;
    preview?: ProductPreviewFile | null;
    category: ShopCategory | string;
    images: string[];
    files: ProductFile[];
    seller: {
        _id: string;
        fullName: string;
        avatar?: string;
        email: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    views: number;
    purchases: number;
    downloads?: number;
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
        pages: number;
    };
}

export interface CreateProductPayload {
    title: string;
    description: string;
    price: number;
    category: ShopCategory;
    coverImage?: string;
    preview?: ProductPreviewFile | null;
    images?: string[];
    files?: ProductFile[];
    discountType?: 'percent' | 'vnd';
    discountValue?: number;
    allowCoinPayment?: boolean;
}

export interface ShopReviewUser {
    _id: string;
    fullName: string;
    avatar?: string;
}

export interface ShopProductReview {
    _id: string;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: ShopReviewUser | null;
}

export interface ShopReviewStats {
    average: number;
    total: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ShopReviewsResponse {
    success: boolean;
    data: ShopProductReview[];
    stats: ShopReviewStats;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    message?: string;
}

export interface ShopMyReviewResponse {
    success: boolean;
    data: {
        canReview: boolean;
        myReview: Pick<ShopProductReview, '_id' | 'rating' | 'content' | 'createdAt' | 'updatedAt'> | null;
    };
    message?: string;
}

export const SHOP_CATEGORIES: ShopCategory[] = ['Tài liệu', 'PowerPoint', 'Code', 'Khác'];

export const shopApi = {
    getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        const response = await apiClient.get(`/shop/products?${params.toString()}`);
        return response.data;
    },

    getProduct: async (id: string): Promise<{ success: boolean; data: Product; owned?: boolean }> => {
        const response = await apiClient.get(`/shop/products/${id}`);
        return response.data;
    },

    getProductBySlug: async (slug: string): Promise<{ success: boolean; data: Product; owned?: boolean }> => {
        const response = await apiClient.get(`/shop/products/slug/${slug}`);
        return response.data;
    },

    getMyProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });
        const response = await apiClient.get(`/shop/me/products?${params.toString()}`);
        return response.data;
    },

    createProduct: async (data: CreateProductPayload): Promise<{ success: boolean; data?: Product; message?: string }> => {
        try {
            const response = await apiClient.post('/shop/products', data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: getShopApiErrorMessage(error, 'Không thể đăng sản phẩm'),
            };
        }
    },

    updateProduct: async (id: string, data: Partial<CreateProductPayload>): Promise<{ success: boolean; data?: Product; message?: string }> => {
        try {
            const response = await apiClient.put(`/shop/products/${id}`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: getShopApiErrorMessage(error, 'Không thể cập nhật sản phẩm'),
            };
        }
    },

    deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/shop/products/${id}`);
        return response.data;
    },

    getPurchaseStatus: async (id: string): Promise<{ success: boolean; data: { owned: boolean; isSeller?: boolean; amount: number } }> => {
        const response = await apiClient.get(`/shop/products/${id}/purchase-status`);
        return response.data;
    },

    purchaseProduct: async (id: string): Promise<{ success: boolean; data?: { product: Product; coins?: number; alreadyOwned?: boolean }; message?: string }> => {
        try {
            const response = await apiClient.post(`/shop/products/${id}/purchase`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: getShopApiErrorMessage(error, 'Không thể mua sản phẩm'),
            };
        }
    },

    purchaseProductWithPayos: async (id: string): Promise<{
        success: boolean;
        data?: { checkoutUrl?: string; alreadyOwned?: boolean; product?: Product };
        message?: string;
    }> => {
        try {
            const response = await apiClient.post(`/shop/products/${id}/purchase/payos`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: getShopApiErrorMessage(error, 'Không tạo được thanh toán'),
            };
        }
    },

    approveProduct: async (id: string): Promise<{ success: boolean; data: Product; message?: string }> => {
        const response = await apiClient.post(`/shop/products/${id}/approve`);
        return response.data;
    },

    rejectProduct: async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post(`/shop/products/${id}/reject`, { reason });
        return response.data;
    },

    getStats: async (): Promise<{ success: boolean; data?: ShopAdminStats; message?: string }> => {
        const response = await apiClient.get('/shop/admin/stats');
        return response.data;
    },

    getProductReviews: async (
        productId: string,
        page = 1,
        limit = 10,
    ): Promise<ShopReviewsResponse> => {
        const response = await apiClient.get(
            `/shop/products/${productId}/reviews?page=${page}&limit=${limit}`,
        );
        return response.data;
    },

    getMyProductReview: async (productId: string): Promise<ShopMyReviewResponse> => {
        const response = await apiClient.get(`/shop/products/${productId}/reviews/me`);
        return response.data;
    },

    createProductReview: async (
        productId: string,
        payload: { rating: number; content: string },
    ): Promise<{ success: boolean; data?: ShopProductReview; stats?: ShopReviewStats; message?: string }> => {
        try {
            const response = await apiClient.post(`/shop/products/${productId}/reviews`, payload);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: getShopApiErrorMessage(error, 'Không thể gửi đánh giá'),
            };
        }
    },

    updateProductReview: async (
        productId: string,
        reviewId: string,
        payload: { rating?: number; content?: string },
    ): Promise<{ success: boolean; data?: ShopProductReview; stats?: ShopReviewStats; message?: string }> => {
        try {
            const response = await apiClient.put(
                `/shop/products/${productId}/reviews/${reviewId}`,
                payload,
            );
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: getShopApiErrorMessage(error, 'Không thể cập nhật đánh giá'),
            };
        }
    },

    deleteProductReview: async (
        productId: string,
        reviewId: string,
    ): Promise<{ success: boolean; stats?: ShopReviewStats; message?: string }> => {
        try {
            const response = await apiClient.delete(
                `/shop/products/${productId}/reviews/${reviewId}`,
            );
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: getShopApiErrorMessage(error, 'Không thể xóa đánh giá'),
            };
        }
    },

    recordProductDownload: async (
        productId: string,
        fileIndex: number,
    ): Promise<{ success: boolean; data?: { downloads: number; counted?: boolean }; message?: string }> => {
        try {
            const response = await apiClient.post(`/shop/products/${productId}/downloads`, { fileIndex });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: getShopApiErrorMessage(error, 'Không thể ghi nhận lượt tải'),
            };
        }
    },
};
