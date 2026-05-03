// lib/api/rating.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IRating {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
        username?: string;
    } | null;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface IRatingStats {
    average: number;
    total: number;
    distribution: Record<number, number>;
}

export interface IRatingResponse {
    success: boolean;
    data?: IRating | IRating[];
    message?: string;
    stats?: IRatingStats;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const ratingApi = {
    getRatings: async (page = 1, limit = 10): Promise<IRatingResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/ratings?page=${page}&limit=${limit}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get ratings error:', error);
            return { success: false, message: 'Không thể lấy danh sách đánh giá' };
        }
    },

    createRating: async (token: string, rating: number, content: string): Promise<IRatingResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating, content })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create rating error:', error);
            return { success: false, message: 'Không thể tạo đánh giá' };
        }
    },

    updateRating: async (token: string, ratingId: string, rating: number, content: string): Promise<IRatingResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/ratings/${ratingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating, content })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update rating error:', error);
            return { success: false, message: 'Không thể cập nhật đánh giá' };
        }
    },

    deleteRating: async (token: string, ratingId: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/ratings/${ratingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Delete rating error:', error);
            return { success: false, message: 'Không thể xóa đánh giá' };
        }
    },

    getAllRatingsForAdmin: async (token: string, page = 1, limit = 20, search = ''): Promise<IRatingResponse> => {
        try {
            const url = `${API_URL}/api/ratings/admin/all?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get all ratings error:', error);
            return { success: false, message: 'Không thể lấy danh sách đánh giá' };
        }
    }
};