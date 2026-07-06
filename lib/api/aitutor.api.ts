const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIChat {
  _id: string;
  userId: string;
  messages: AIMessage[];
  title: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  used: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const aitutorApi = {
  createChat: async (token: string): Promise<{ success: boolean; data: AIChat }> => {
    const response = await fetch(`${API_URL}/api/aitutor/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return handleResponse<{ success: boolean; data: AIChat }>(response);
  },

  getChats: async (token: string): Promise<{ success: boolean; data: AIChat[] }> => {
    const response = await fetch(`${API_URL}/api/aitutor/chats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse<{ success: boolean; data: AIChat[] }>(response);
  },

  getChatById: async (chatId: string, token: string): Promise<{ success: boolean; data: AIChat }> => {
    const response = await fetch(`${API_URL}/api/aitutor/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse<{ success: boolean; data: AIChat }>(response);
  },

  sendMessage: async (chatId: string | null, message: string, token: string): Promise<{ 
    success: boolean; 
    data: { 
      message: string; 
      chat: AIChat; 
      remaining: number 
    } 
  }> => {
    const response = await fetch(`${API_URL}/api/aitutor/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ chatId, message })
    });
    return handleResponse<{ success: boolean; data: { message: string; chat: AIChat; remaining: number } }>(response);
  },

  deleteChat: async (chatId: string, token: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/api/aitutor/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  getRateLimit: async (token: string): Promise<{ success: boolean; data: RateLimitInfo }> => {
    const response = await fetch(`${API_URL}/api/aitutor/rate-limit`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse<{ success: boolean; data: RateLimitInfo }>(response);
  }
};
