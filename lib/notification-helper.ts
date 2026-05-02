// lib/notification-helper.ts
import { notificationApi } from './api/notification.api';

interface SendNotificationParams {
    userIds: string[];
    title: string;
    content: string;
    type: 'system' | 'role_request_approved' | 'role_request_rejected' | 'coins_updated' | 'streak_updated';
    meta?: Record<string, unknown>;
}

export async function sendSystemNotification({
    userIds,
    title,
    content,
    type,
    meta = {}
}: SendNotificationParams): Promise<void> {
    try {
        await notificationApi.sendToUsers(userIds, {
            title,
            content,
            type,
            meta
        });
    } catch (error) {
        console.error('Send notification error:', error);
    }
}

export const NotificationType = {
    SYSTEM: 'system',
    ROLE_REQUEST_APPROVED: 'role_request_approved',
    ROLE_REQUEST_REJECTED: 'role_request_rejected',
    COINS_UPDATED: 'coins_updated',
    STREAK_UPDATED: 'streak_updated',
} as const;