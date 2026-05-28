
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CommentUser {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    username?: string;
}

export interface CommentType {
    _id: string;
    userId: CommentUser;
    content: string;
    attachments: string[];
    reactions: Record<string, number>;
    replyCount: number;
    isEdited: boolean;
    editedAt: string | null;
    isDeleted: boolean;
    createdAt: string;
    parentId?: string;
    userReaction?: string | null;
    replies?: CommentType[];
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

export const commentApi = {
    getComments: async (targetType: string, targetId: string, page = 1, limit = 20, sortBy = 'latest') => {
        try {
            const token = getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${API_URL}/api/comments/target/${targetType}/${targetId}?page=${page}&limit=${limit}&sortBy=${sortBy}`,
                { headers }
            );
            return await response.json();
        } catch (error) {
            console.error('Get comments error:', error);
            return { success: false, message: 'Không thể tải bình luận' };
        }
    },

    getReplies: async (parentId: string, page = 1, limit = 20) => {
        try {
            const response = await fetch(`${API_URL}/api/comments/replies/${parentId}?page=${page}&limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Get replies error:', error);
            return { success: false, message: 'Không thể tải phản hồi' };
        }
    },

    createComment: async (token: string, data: {
        targetType: string;
        targetId: string;
        parentId?: string;
        content: string;
        attachments?: string[];
    }) => {
        try {
            const response = await fetch(`${API_URL}/api/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Create comment error:', error);
            return { success: false, message: 'Không thể tạo bình luận' };
        }
    },

    updateComment: async (token: string, commentId: string, content: string) => {
        try {
            const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            return await response.json();
        } catch (error) {
            console.error('Update comment error:', error);
            return { success: false, message: 'Không thể cập nhật bình luận' };
        }
    },

    deleteComment: async (token: string, commentId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Delete comment error:', error);
            return { success: false, message: 'Không thể xóa bình luận' };
        }
    },

    reactToComment: async (token: string, commentId: string, type: string) => {
        try {
            const response = await fetch(`${API_URL}/api/comments/${commentId}/react`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type })
            });
            return await response.json();
        } catch (error) {
            console.error('React to comment error:', error);
            return { success: false, message: 'Không thể thả cảm xúc' };
        }
    },

    reportComment: async (token: string, commentId: string, reason: string, description?: string) => {
        try {
            const response = await fetch(`${API_URL}/api/comments/${commentId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason, description })
            });
            return await response.json();
        } catch (error) {
            console.error('Report comment error:', error);
            return { success: false, message: 'Không thể gửi báo cáo' };
        }
    },

    getReactionUsers: async (token: string, commentId: string, reactionType?: string, page = 1, limit = 50) => {
        try {

            let url = `${API_URL}/api/comments/${commentId}/reactions?page=${page}&limit=${limit}`;
            if (reactionType && reactionType !== 'all') {
                url += `&type=${reactionType}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Không thể tải danh sách');
            }

            return {
                success: true,
                data: data.data || [],
                total: data.total,
                page: data.page,
                totalPages: data.totalPages
            };
        } catch (error) {
            console.error('Get reaction users error:', error);
            return { success: false, message: 'Không thể tải danh sách người dùng', data: [], total: 0, page: 1, totalPages: 0 };
        }
    },
};
