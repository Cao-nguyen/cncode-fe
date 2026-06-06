import type {
    AdminChatConversation,
    AdminChatMessage,
    AdminChatConversationsResponse,
    AdminChatMessagesResponse,
    AdminChatSendMessageDto,
    WorkingHoursResponse,
    CheckWorkingHoursResponse,
    WorkingHours
} from '@/types/adminchat.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

export const adminChatApi = {
    // Get my conversation (user)
    getMyConversation: async (token: string): Promise<AdminChatConversationsResponse> => {
        const res = await fetch(`${API_URL}/api/adminchat/my-conversation`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Get my messages (user)
    getMyMessages: async (token: string, page = 1, limit = 50): Promise<AdminChatMessagesResponse> => {
        const res = await fetch(`${API_URL}/api/adminchat/my-messages?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Send message (user)
    sendMessage: async (token: string, data: AdminChatSendMessageDto): Promise<{ success: boolean; data: AdminChatMessage }> => {
        const res = await fetch(`${API_URL}/api/adminchat/send`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Send image (user)
    sendImage: async (token: string, file: File): Promise<{ success: boolean; data: AdminChatMessage }> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/api/adminchat/send-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return res.json();
    },

    // Mark as read (user)
    markAsRead: async (token: string, conversationId: string): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_URL}/api/adminchat/read/${conversationId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Heart message (user)
    heartMessage: async (token: string, messageId: string): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_URL}/api/adminchat/heart/${messageId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Delete message (user)
    deleteMessage: async (token: string, messageId: string): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_URL}/api/adminchat/delete/${messageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // === ADMIN ROUTES ===
    getAllUsers: async (token: string): Promise<AdminChatConversationsResponse> => {
        const res = await fetch(`${API_URL}/api/adminchat/all-users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    getAllConversations: async (token: string, page = 1, limit = 20): Promise<AdminChatConversationsResponse> => {
        const res = await fetch(`${API_URL}/api/adminchat/conversations?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    getConversationMessages: async (token: string, conversationId: string, page = 1, limit = 50): Promise<AdminChatMessagesResponse> => {
        const res = await fetch(`${API_URL}/api/adminchat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    adminSendMessage: async (token: string, data: { conversationId?: string; userId?: string; content: string }): Promise<{ success: boolean; data: AdminChatMessage }> => {
        const res = await fetch(`${API_URL}/api/adminchat/admin/send`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    adminSendImage: async (token: string, params: { conversationId?: string; userId?: string; file: File }): Promise<{ success: boolean; data: AdminChatMessage }> => {
        const formData = new FormData();
        formData.append('file', params.file);
        if (params.conversationId) formData.append('conversationId', params.conversationId);
        if (params.userId) formData.append('userId', params.userId);
        const res = await fetch(`${API_URL}/api/adminchat/admin/send-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return res.json();
    },

    adminDeleteMessage: async (token: string, messageId: string): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_URL}/api/adminchat/admin/delete/${messageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    adminMarkAsRead: async (token: string, conversationId: string): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_URL}/api/adminchat/admin/read/${conversationId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // === WORKING HOURS ===
    getWorkingHours: async (): Promise<WorkingHoursResponse> => {
        const res = await fetch(`${API_URL}/api/adminchat/working-hours`);
        return res.json();
    },

    checkWorkingHours: async (): Promise<CheckWorkingHoursResponse> => {
        const res = await fetch(`${API_URL}/api/adminchat/check-working-hours`);
        return res.json();
    },

    updateWorkingHours: async (token: string, data: WorkingHours): Promise<{ success: boolean; data: WorkingHours }> => {
        const res = await fetch(`${API_URL}/api/adminchat/working-hours`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        return res.json();
    },
};
