export interface AdminChatConversation {
    _id: string;
    userId: { _id: string; fullName: string; avatar?: string; phoneNumber?: string; role?: string };
    assignedAdmin?: { _id: string; fullName: string; avatar?: string };
    lastMessage?: { content: string; senderId?: string; sentAt?: string; createdAt?: string };
    unreadCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdminChatMessageAttachment {
    url: string;
    type: string;
    name: string;
    size: number;
}

export interface AdminChatMessage {
    _id: string;
    conversationId: string;
    senderId: { _id: string; fullName: string; avatar?: string; role: string };
    content: string;
    type: 'text' | 'image' | 'file';
    attachments: AdminChatMessageAttachment[];
    isRead: boolean;
    readAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
    isHearted: boolean;
    heartedBy?: string;
    createdAt: string;
}

export interface AdminChatConversationsResponse {
    success: boolean;
    data: AdminChatConversation[];
    total?: number;
    totalUnread?: number;
    hasMore?: boolean;
    page?: number;
    limit?: number;
}

export interface AdminChatMessagesResponse {
    success: boolean;
    data: AdminChatMessage[];
    total?: number;
    hasMore?: boolean;
}

export interface AdminChatSendMessageDto {
    content: string;
    type?: 'text' | 'image' | 'file';
}

export interface AdminTypingEvent {
    conversationId: string;
    userId: string;
    isTyping: boolean;
}

export interface UserStatusEvent {
    userId: string;
    status: 'online' | 'offline';
    role: string;
    lastSeen?: string;
}

export interface OnlineUser {
    userId: string;
    status: 'online';
    role: string;
}

export interface WorkingHours {
    _id?: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    isWorkingDay: boolean;
    startTime: string; // Format: "HH:mm"
    endTime: string; // Format: "HH:mm"
}

export interface WorkingHoursResponse {
    success: boolean;
    data: WorkingHours[];
}

export interface CheckWorkingHoursResponse {
    success: boolean;
    isWithinWorkingHours: boolean;
}
