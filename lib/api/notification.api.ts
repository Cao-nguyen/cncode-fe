import type { INotification, NotificationResponse, UnreadCountResponse } from '@/types/notification.type';
import { useAuthStore } from '@/store/auth.store';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api` || 'http://localhost:5000/api';

// Helper lấy token từ store mà không cần hook (dùng được ngoài component)
const getToken = () => useAuthStore.getState().token;

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
});

export const notificationApi = {
    getMyNotifications: async (page = 1, limit = 20): Promise<NotificationResponse['data']> => {
        const response = await fetch(
            `${API_URL}/notifications/my?page=${page}&limit=${limit}`,
            { headers: authHeaders() }
        );
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data: NotificationResponse = await response.json();
        return data.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await fetch(
            `${API_URL}/notifications/unread-count`,
            { headers: authHeaders() }
        );
        if (!response.ok) throw new Error('Failed to fetch unread count');
        const data: UnreadCountResponse = await response.json();
        return data.data.unreadCount;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        await fetch(`${API_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: authHeaders(),
        });
    },

    markAllAsRead: async (): Promise<void> => {
        await fetch(`${API_URL}/notifications/mark-all-read`, {
            method: 'PUT',
            headers: authHeaders(),
        });
    },

    deleteNotification: async (notificationId: string): Promise<void> => {
        await fetch(`${API_URL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },

    sendToUsers: async (userIds: string[], data: { title: string; content: string; type: string; meta: Record<string, unknown> }) => {
        const response = await fetch(`${API_URL}/api/notifications/send-to-users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ userIds, ...data })
        });
    },
};