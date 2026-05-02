// lib/api/notification.api.ts
import { INotification } from '@/types/notification.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getToken = () => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        console.log('🔑 raw auth-storage:', raw); // xem có data không
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        console.log('🔑 token:', parsed?.state?.token); // xem token có không
        return parsed?.state?.token ?? null;
    } catch {
        return null;
    }
};

async function handleResponse<T>(response: Response): Promise<{ success: boolean; data: T; message?: string }> {
    if (!response.ok) {
        let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // Không thể parse JSON
        }
        return {
            success: false,
            data: null as T,
            message: errorMessage,
        };
    }

    const data = await response.json();
    return data;
}

export const notificationApi = {
    getMyNotifications: async (page: number = 1, limit: number = 20): Promise<{
        notifications: INotification[];
        total: number;
        page: number;
        totalPages: number;
        unreadCount: number;
    }> => {
        const token = getToken();
        if (!token) {
            return { notifications: [], total: 0, page: 1, totalPages: 0, unreadCount: 0 };
        }

        const response = await fetch(`${API_URL}/api/notifications/my?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            return { notifications: [], total: 0, page: 1, totalPages: 0, unreadCount: 0 };
        }

        // Backend trả về { success, notifications, total, page, totalPages, unreadCount }
        // KHÔNG có lớp data bọc ngoài
        const result = await response.json();

        if (!result.success) {
            return { notifications: [], total: 0, page: 1, totalPages: 0, unreadCount: 0 };
        }

        return {
            notifications: result.notifications ?? [],
            total: result.total ?? 0,
            page: result.page ?? 1,
            totalPages: result.totalPages ?? 0,
            unreadCount: result.unreadCount ?? 0,
        };
    },

    getUnreadCount: async (): Promise<number> => {
        const token = getToken();
        if (!token) return 0;

        const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) return 0;

        const result = await handleResponse<{ count: number }>(response);
        return result.success ? result.data.count : 0;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        const token = getToken();
        if (!token) return;

        await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    },

    markAllAsRead: async (): Promise<void> => {
        const token = getToken();
        if (!token) return;

        await fetch(`${API_URL}/api/notifications/mark-all-read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    },

    sendToUsers: async (userIds: string[], data: {
        title: string;
        content: string;
        type: 'system' | 'role_request_approved' | 'role_request_rejected' | 'coins_updated' | 'streak_updated';
        meta?: Record<string, unknown>;
    }): Promise<void> => {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/api/notifications/send-to-users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userIds, ...data })
        });

        const result = await response.json();
        if (!result.success) {
            console.error('Send notification failed:', result.message);
        }
    },

    deleteNotification: async (notificationId: string): Promise<void> => {
        const token = getToken();
        if (!token) return;

        await fetch(`${API_URL}/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }
};