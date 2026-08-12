
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

function mapReview(raw: Record<string, unknown>): IRating {
    const user = raw.userId as Record<string, unknown> | null | undefined;
    return {
        _id: String(raw._id),
        userId: user
            ? {
                _id: String(user._id),
                fullName: String(user.fullName || ''),
                email: String(user.email || ''),
                avatar: user.avatar ? String(user.avatar) : undefined,
                username: user.username ? String(user.username) : undefined,
            }
            : null,
        rating: Number(raw.rating),
        content: String(raw.content || ''),
        createdAt: String(raw.createdAt || ''),
        updatedAt: String(raw.updatedAt || ''),
    };
}

async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
    }
    return response.json() as Promise<Record<string, unknown>>;
}

export const ratingApi = {
    getRatings: async (page = 1, limit = 10): Promise<IRatingResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/reviews?page=${page}&limit=${limit}`);
            if (!response.ok) {
                return { success: false, message: `Không thể lấy danh sách đánh giá (${response.status})` };
            }

            const data = await parseJsonSafe(response);
            const reviews = Array.isArray(data.reviews) ? data.reviews : [];

            return {
                success: true,
                data: reviews.map((item) => mapReview(item as Record<string, unknown>)),
                stats: data.stats as IRatingStats | undefined,
                pagination: {
                    page: Number(data.page ?? page),
                    limit: Number(data.limit ?? limit),
                    total: Number(data.total ?? reviews.length),
                    totalPages: Number(data.totalPages ?? 1),
                },
            };
        } catch (error) {
            console.error('Get ratings error:', error);
            return { success: false, message: 'Không thể lấy danh sách đánh giá' };
        }
    },

    createRating: async (token: string, rating: number, content: string): Promise<IRatingResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating, content }),
            });

            const data = await parseJsonSafe(response);
            if (!response.ok) {
                return { success: false, message: String(data.message || 'Không thể tạo đánh giá') };
            }

            return { success: true, data: mapReview(data) };
        } catch (error) {
            console.error('Create rating error:', error);
            return { success: false, message: 'Không thể tạo đánh giá' };
        }
    },

    updateRating: async (token: string, ratingId: string, rating: number, content: string): Promise<IRatingResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/reviews/${ratingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating, content }),
            });

            const data = await parseJsonSafe(response);
            if (!response.ok) {
                return { success: false, message: String(data.message || 'Không thể cập nhật đánh giá') };
            }

            return { success: true, data: mapReview(data) };
        } catch (error) {
            console.error('Update rating error:', error);
            return { success: false, message: 'Không thể cập nhật đánh giá' };
        }
    },

    deleteRating: async (token: string, ratingId: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/reviews/${ratingId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await parseJsonSafe(response);
            if (!response.ok) {
                return { success: false, message: String(data.message || 'Không thể xóa đánh giá') };
            }

            return { success: true, message: String(data.message || 'Đã xóa đánh giá') };
        } catch (error) {
            console.error('Delete rating error:', error);
            return { success: false, message: 'Không thể xóa đánh giá' };
        }
    },

    getAllRatingsForAdmin: async (token: string, page = 1, limit = 20, search = ''): Promise<IRatingResponse> => {
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (search) params.set('search', search);

            const response = await fetch(`${API_URL}/api/admin/reviews?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                return { success: false, message: `Không thể lấy danh sách đánh giá (${response.status})` };
            }

            const data = await parseJsonSafe(response);
            const reviews = Array.isArray(data.reviews) ? data.reviews : [];

            return {
                success: true,
                data: reviews.map((item) => mapReview(item as Record<string, unknown>)),
                stats: data.stats as IRatingStats | undefined,
                pagination: {
                    page: Number(data.page ?? page),
                    limit: Number(data.limit ?? limit),
                    total: Number(data.total ?? reviews.length),
                    totalPages: Number(data.totalPages ?? 1),
                },
            };
        } catch (error) {
            console.error('Get all ratings error:', error);
            return { success: false, message: 'Không thể lấy danh sách đánh giá' };
        }
    },
};
