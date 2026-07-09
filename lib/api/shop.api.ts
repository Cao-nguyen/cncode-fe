const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export const shopApi = {
    // Get all products
    async getProducts(filters: ProductFilters = {}, token?: string) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/shop/products?${params}`, {
            headers,
        });
        return response.json();
    },

    // Get single product
    async getProduct(id: string, token?: string) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/shop/products/${id}`, {
            headers,
        });
        return response.json();
    },

    // Create product
    async createProduct(data: Partial<Product>, token: string) {
        const response = await fetch(`${API_URL}/api/shop/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    // Update product
    async updateProduct(id: string, data: Partial<Product>, token: string) {
        const response = await fetch(`${API_URL}/api/shop/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    // Delete product
    async deleteProduct(id: string, token: string) {
        const response = await fetch(`${API_URL}/api/shop/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.json();
    },

    // Approve product (admin)
    async approveProduct(id: string, token: string) {
        const response = await fetch(`${API_URL}/api/shop/products/${id}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.json();
    },

    // Reject product (admin)
    async rejectProduct(id: string, reason: string, token: string) {
        const response = await fetch(`${API_URL}/api/shop/products/${id}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
        });
        return response.json();
    },

    // Get stats (admin)
    async getStats(token: string) {
        const response = await fetch(`${API_URL}/api/shop/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.json();
    },
};