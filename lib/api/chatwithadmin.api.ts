import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ChatMessage {
  _id: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  content: string;
  read: boolean;
  timestamp: string;
}

export interface ChatWithAdmin {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  adminId?: string;
  messages: ChatMessage[];
  lastMessageAt: string;
  unreadCount: number;
  userUnreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const chatwithadminApi = {
  // Get all chats for admin
  getAllChatsForAdmin: async (): Promise<ApiResponse<ChatWithAdmin[]>> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/chatwithadmin/chats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get chat by ID
  getChatById: async (chatId: string): Promise<ApiResponse<ChatWithAdmin>> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/chatwithadmin/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Create new chat
  createChat: async (): Promise<ApiResponse<ChatWithAdmin>> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/chatwithadmin/chats`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Send message
  sendMessage: async (chatId: string, content: string): Promise<ApiResponse<ChatWithAdmin>> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/chatwithadmin/chats/${chatId}/messages`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Mark as read
  markAsRead: async (chatId: string): Promise<ApiResponse<ChatWithAdmin>> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/chatwithadmin/chats/${chatId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Delete chat
  deleteChat: async (chatId: string): Promise<ApiResponse<void>> => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/chatwithadmin/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default chatwithadminApi;
export { chatwithadminApi };
