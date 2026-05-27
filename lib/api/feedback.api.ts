
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
    category: 'bug' | 'ui_ux' | 'feature_request' | 'performance' | 'security' | 'other';
    status: 'pending' | 'viewed' | 'approved' | 'improving' | 'completed' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    adminResponse: string;
    reactCount: number;
    likedBy: string[];  
    viewCount: number;
    commentCount: number;
    isPinned: boolean;
    isLocked: boolean;
    reviewedBy?: {
        _id: string;
        fullName: string;
    };
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

const getToken = () => {
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

export const feedbackApi = {
    getFeedbacks: async (page = 1, limit = 10, status?: string, category?: string) => {
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

    createFeedback: async (token: string, data: { title: string; content: string; category: string; priority?: string }) => {
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

    reactFeedback: async (token: string, feedbackId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/feedback/${feedbackId}/react`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return {
                success: data.success,
                message: data.message,
                data: data.data 
            };
        } catch (error) {
            console.error('React feedback error:', error);
            return { success: false, message: 'Không thể ủng hộ' };
        }
    },

    updateFeedback: async (token: string, feedbackId: string, data: { title: string; content: string; category: string }) => {
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

    deleteFeedback: async (token: string, feedbackId: string) => {
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

    getAllFeedbacksForAdmin: async (token: string, page = 1, limit = 20, status?: string, category?: string, search?: string) => {
        try {
            let url = `${API_URL}/api/feedback/admin/all?page=${page}&limit=${limit}`;
            if (status && status !== 'all') url += `&status=${status}`;
            if (category && category !== 'all') url += `&category=${category}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Get all feedbacks error:', error);
            return { success: false, message: 'Không thể lấy danh sách góp ý' };
        }
    },

    updateFeedbackStatus: async (token: string, feedbackId: string, status: string, adminResponse?: string) => {
        try {
            const response = await fetch(`${API_URL}/api/feedback/admin/${feedbackId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminResponse })
            });
            return await response.json();
        } catch (error) {
            console.error('Update feedback status error:', error);
            return { success: false, message: 'Không thể cập nhật trạng thái' };
        }
    },

    updateFeedbackPriority: async (token: string, feedbackId: string, priority: string): Promise<{ success: boolean; message?: string; data?: IFeedback }> => {
        try {
            const response = await fetch(`${API_URL}/api/feedback/admin/${feedbackId}/priority`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ priority })
            });
            return await response.json();
        } catch (error) {
            console.error('Update feedback priority error:', error);
            return { success: false, message: 'Không thể cập nhật độ ưu tiên' };
        }
    },
};
