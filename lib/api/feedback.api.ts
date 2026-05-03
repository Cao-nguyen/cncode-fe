// lib/api/feedback.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IFeedback {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
        username?: string;
    } | null;
    title: string;
    content: string;
    category: 'bug' | 'feature' | 'improvement' | 'other';
    status: 'pending' | 'viewed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
    adminNote: string;
    isPublic: boolean;
    likes: number;
    likedBy: string[];
    viewedAt?: string;
    approvedAt?: string;
    inProgressAt?: string;
    completedAt?: string;
    rejectedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IFeedbackResponse {
    success: boolean;
    data?: IFeedback | IFeedback[];
    message?: string;
    stats?: {
        byStatus: Record<string, number>;
        byCategory: Record<string, number>;
    };
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const feedbackApi = {
    getFeedbacks: async (page = 1, limit = 10, status?: string, category?: string): Promise<IFeedbackResponse> => {
        try {
            let url = `${API_URL}/api/feedback?page=${page}&limit=${limit}`;
            if (status && status !== 'all') url += `&status=${status}`;
            if (category && category !== 'all') url += `&category=${category}`;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Get feedbacks error:', error);
            return { success: false, message: 'Không thể lấy danh sách góp ý' };
        }
    },

    createFeedback: async (token: string, data: { title: string; content: string; category: string; isPublic?: boolean }): Promise<IFeedbackResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Create feedback error:', error);
            return { success: false, message: 'Không thể tạo góp ý' };
        }
    },

    getAllFeedbacksForAdmin: async (token: string, page = 1, limit = 20, status?: string, category?: string, search?: string): Promise<IFeedbackResponse> => {
        try {
            let url = `${API_URL}/api/feedback/admin/all?page=${page}&limit=${limit}`;
            if (status && status !== 'all') url += `&status=${status}`;
            if (category && category !== 'all') url += `&category=${category}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get all feedbacks error:', error);
            return { success: false, message: 'Không thể lấy danh sách góp ý' };
        }
    },

    updateFeedbackStatus: async (token: string, feedbackId: string, status: string, adminNote?: string): Promise<IFeedbackResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/feedback/admin/${feedbackId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminNote })
            });
            return await response.json();
        } catch (error) {
            console.error('Update feedback status error:', error);
            return { success: false, message: 'Không thể cập nhật trạng thái' };
        }
    },

    likeFeedback: async (token: string, feedbackId: string): Promise<{ success: boolean; data?: { likes: number; liked: boolean }; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/feedback/${feedbackId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Like feedback error:', error);
            return { success: false, message: 'Không thể like góp ý' };
        }
    },

    deleteFeedback: async (token: string, feedbackId: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/feedback/${feedbackId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Delete feedback error:', error);
            return { success: false, message: 'Không thể xóa góp ý' };
        }
    },

    getMyFeedbacks: async (token: string, page = 1, limit = 10): Promise<IFeedbackResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/feedback/my?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get my feedbacks error:', error);
            return { success: false, message: 'Không thể lấy góp ý của bạn' };
        }
    },

    updateFeedback: async (token: string, feedbackId: string, data: { title: string; content: string; category: string }): Promise<IFeedbackResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/feedback/${feedbackId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Update feedback error:', error);
            return { success: false, message: 'Không thể cập nhật góp ý' };
        }
    },
};