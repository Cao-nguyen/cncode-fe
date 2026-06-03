import type {
    Conversation,
    ConversationsResponse,
    ConversationResponse,
    Message,
    MessagesResponse,
    MessageResponse,
    StatsResponse,
    CreateConversationDto,
    SendMessageDto,
} from '@/types/chat.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

// User Chat API
export const chatApi = {
    // Get user's conversations
    getConversations: async (token: string, page = 1, limit = 20): Promise<ConversationsResponse> => {
        const res = await fetch(`${API_URL}/api/chat/conversations?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Get conversation by ID
    getConversation: async (token: string, conversationId: string): Promise<ConversationResponse> => {
        const res = await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Create new conversation
    createConversation: async (token: string, data: CreateConversationDto): Promise<ConversationResponse> => {
        const res = await fetch(`${API_URL}/api/chat/conversations`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Get messages in a conversation
    getMessages: async (
        token: string,
        conversationId: string,
        page = 1,
        limit = 50
    ): Promise<MessagesResponse> => {
        const res = await fetch(
            `${API_URL}/api/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        return res.json();
    },

    // Send message
    sendMessage: async (
        token: string,
        conversationId: string,
        data: SendMessageDto
    ): Promise<MessageResponse> => {
        const res = await fetch(`${API_URL}/api/chat/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Delete message
    deleteMessage: async (token: string, messageId: string): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_URL}/api/chat/messages/${messageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
};

// Admin Chat API
export const adminChatApi = {
    // Get all conversations (admin)
    getConversations: async (
        token: string,
        page = 1,
        limit = 20,
        type?: 'private' | 'group'
    ): Promise<ConversationsResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(type && { type })
        });
        const res = await fetch(`${API_URL}/api/chat/admin/conversations?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Get chat statistics
    getStats: async (token: string): Promise<StatsResponse> => {
        const res = await fetch(`${API_URL}/api/chat/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    // Delete conversation (admin)
    deleteConversation: async (token: string, conversationId: string): Promise<{ success: boolean }> => {
        const res = await fetch(`${API_URL}/api/chat/admin/conversations/${conversationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
};

// Upload API
export const uploadApi = {
    // Upload avatar
    uploadAvatar: async (token: string, file: File): Promise<{ success: boolean; data: { url: string } }> => {
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await fetch(`${API_URL}/api/upload/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        return res.json();
    },
};