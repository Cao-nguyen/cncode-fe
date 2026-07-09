export interface User {
    _id: string;
    fullName: string;
    avatar?: string;
    email: string;
    role: string;
}

export interface Participant {
    userId: User;
    role: 'admin' | 'member';
    joinedAt: string;
    lastReadAt: string;
}

export interface Conversation {
    _id: string;
    name?: string;
    type: 'private' | 'group';
    avatar?: string;
    description?: string;
    participants: Participant[];
    lastMessage?: {
        content: string;
        senderId: string;
        sentAt: string;
    };
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: User;
    content: string;
    type: 'text' | 'image' | 'file' | 'sticker' | 'poll' | 'reminder';
    attachments?: string[];
    replyTo?: string;
    readBy?: Array<{ userId: User; readAt: string }>;
    isRead?: boolean;
    isHearted?: boolean;
    heartedBy?: User[];
    reminder?: {
        scheduledTime: string;
        isTriggered: boolean;
        triggeredAt?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ChatStats {
    totalConversations: number;
    totalMessages: number;
    activeConversations: number;
    groupConversations: number;
    privateConversations: number;
}

export interface CreateConversationDto {
    type: 'private' | 'group';
    name?: string;
    description?: string;
    avatar?: string;
    participantIds: string[];
}

export interface SendMessageDto {
    content: string;
    type?: 'text' | 'image' | 'file';
    attachments?: string[];
    replyTo?: string;
}

export interface ConversationsResponse {
    success: boolean;
    data: Conversation[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface MessagesResponse {
    success: boolean;
    data: Message[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface StatsResponse {
    success: boolean;
    data: ChatStats;
}

export interface ConversationResponse {
    success: boolean;
    data: Conversation;
}

export interface MessageResponse {
    success: boolean;
    data: Message;
}