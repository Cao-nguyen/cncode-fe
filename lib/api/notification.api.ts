import axios from 'axios';
import type { INotification, NotificationResponse, UnreadCountResponse } from '@/types/notification.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const notificationApi = {
    getMyNotifications: async (page = 1, limit = 20): Promise<NotificationResponse['data']> => {
        const response = await api.get<NotificationResponse>('/notifications/my', {
            params: { page, limit },
        });
        return response.data.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
        return response.data.data.unreadCount;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        await api.put(`/notifications/${notificationId}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.put('/notifications/mark-all-read');
    },

    deleteNotification: async (notificationId: string): Promise<void> => {
        await api.delete(`/notifications/${notificationId}`);
    },
};