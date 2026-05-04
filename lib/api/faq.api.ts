// lib/api/faq.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface IFaqAuthor {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    username?: string;
}

export interface IFaqAnswer {
    _id: string;
    userId: IFaqAuthor | null;
    userType: 'user' | 'admin' | 'ai';
    content: string;
    isAccepted: boolean;
    isBest: boolean;
    likes: number;
    likedBy: string[];
    isAiGenerated: boolean;
    aiModel?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IFaqQuestion {
    _id: string;
    userId: IFaqAuthor;
    title: string;
    content: string;
    category: 'general' | 'technical' | 'account' | 'payment' | 'course' | 'other';
    tags: string[];
    status: 'pending' | 'answered' | 'resolved' | 'closed';
    answers: IFaqAnswer[];
    views: number;
    helpful: number;
    notHelpful: number;
    resolvedAt?: string;
    resolvedBy?: string;
    createdAt: string;
    updatedAt: string;
    answerCount?: number;
    bestAnswer?: IFaqAnswer;
    aiAnswer?: IFaqAnswer;
}

export interface IFaqStats {
    total: number;
    pending: number;
    answered: number;
    resolved: number;
}

export interface IFaqResponse {
    success: boolean;
    data?: IFaqQuestion | IFaqQuestion[];
    message?: string;
    stats?: IFaqStats;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const faqApi = {
    getQuestions: async (page = 1, limit = 10, category?: string, status?: string, search?: string): Promise<IFaqResponse> => {
        try {
            let url = `${API_URL}/api/faq?page=${page}&limit=${limit}`;
            if (category && category !== 'all') url += `&category=${category}`;
            if (status && status !== 'all') url += `&status=${status}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Get questions error:', error);
            return { success: false, message: 'Không thể lấy danh sách câu hỏi' };
        }
    },

    getQuestionById: async (questionId: string): Promise<IFaqResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/${questionId}`);
            return await response.json();
        } catch (error) {
            console.error('Get question error:', error);
            return { success: false, message: 'Không thể lấy chi tiết câu hỏi' };
        }
    },

    createQuestion: async (token: string, data: { title: string; content: string; category: string; tags?: string[] }): Promise<IFaqResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/faq`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Create question error:', error);
            return { success: false, message: 'Không thể tạo câu hỏi' };
        }
    },

    addAnswer: async (token: string, questionId: string, content: string): Promise<IFaqResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/${questionId}/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            return await response.json();
        } catch (error) {
            console.error('Add answer error:', error);
            return { success: false, message: 'Không thể thêm câu trả lời' };
        }
    },

    markBestAnswer: async (token: string, questionId: string, answerId: string): Promise<IFaqResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/${questionId}/answers/${answerId}/best`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Mark best answer error:', error);
            return { success: false, message: 'Không thể đánh dấu câu trả lời hay nhất' };
        }
    },

    likeAnswer: async (token: string, questionId: string, answerId: string): Promise<{ success: boolean; data?: { likes: number; liked: boolean }; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/${questionId}/answers/${answerId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Like answer error:', error);
            return { success: false, message: 'Không thể like câu trả lời' };
        }
    },

    markHelpful: async (token: string, questionId: string, helpful: boolean): Promise<{ success: boolean; data?: { helpful: number; notHelpful: number }; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/${questionId}/helpful`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ helpful })
            });
            return await response.json();
        } catch (error) {
            console.error('Mark helpful error:', error);
            return { success: false, message: 'Không thể đánh giá' };
        }
    },

    deleteQuestion: async (token: string, questionId: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/${questionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Delete question error:', error);
            return { success: false, message: 'Không thể xóa câu hỏi' };
        }
    },

    deleteAnswer: async (token: string, questionId: string, answerId: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/${questionId}/answers/${answerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Delete answer error:', error);
            return { success: false, message: 'Không thể xóa câu trả lời' };
        }
    },

    getMyQuestions: async (token: string, page = 1, limit = 10): Promise<IFaqResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/my/questions?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get my questions error:', error);
            return { success: false, message: 'Không thể lấy câu hỏi của bạn' };
        }
    },

    getRelatedQuestions: async (content: string): Promise<{ success: boolean; data?: IFaqQuestion[]; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/related?content=${encodeURIComponent(content)}`);
            return await response.json();
        } catch (error) {
            console.error('Get related questions error:', error);
            return { success: false, message: 'Không thể lấy câu hỏi liên quan' };
        }
    },

    getStats: async (): Promise<{ success: boolean; data?: IFaqStats; message?: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/faq/stats`);
            return await response.json();
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false, message: 'Không thể lấy thống kê' };
        }
    }
};