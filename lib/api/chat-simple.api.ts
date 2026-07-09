// Simplified chat API that matches the actual backend structure
// This wraps the backend's simpler format

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper to get token from localStorage
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token') || '';
    }
    return '';
};

// Helper to get auth headers
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

export interface SimpleUser {
    _id: string;
    username: string | undefined;
    avatar: string;
    fullName?: string;
}

export interface SimpleMessage {
    _id: string;
    sender: SimpleUser;
    content: string;
    createdAt: string;
}

export interface SimpleConversation {
    _id: string;
    participants: SimpleUser[];
    lastMessage?: SimpleMessage;
    unreadCount: number;
    updatedAt: string;
}

export const simpleChatApi = {
    // Get conversations
    getConversations: async (): Promise<SimpleConversation[]> => {
        const res = await fetch(`${API_URL}/api/chat/conversations`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },

    // Get messages
    getMessages: async (conversationId: string): Promise<SimpleMessage[]> => {
        const res = await fetch(`${API_URL}/api/chat/conversations/${conversationId}/messages`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        return data.messages || [];
    },

    // Send message
    sendMessage: async (conversationId: string, content: string): Promise<SimpleMessage> => {
        const res = await fetch(`${API_URL}/api/chat/send-message`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ conversationId, content })
        });
        const data = await res.json();
        return data.message;
    },

    // Mark as read
    markAsRead: async (conversationId: string): Promise<void> => {
        await fetch(`${API_URL}/api/chat/conversations/${conversationId}/read`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
    },

    // Create or get conversation
    createOrGetConversation: async (participantId: string): Promise<SimpleConversation> => {
        const res = await fetch(`${API_URL}/api/chat/conversations`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ participantId })
        });
        return res.json();
    }
};