import { create } from 'zustand';

export interface Message {
    _id: string;
    sender: {
        _id: string;
        username: string;
        avatar?: string;
        full_name?: string;
    };
    content: string;
    createdAt: string;
    // Optimistic UI states
    isOptimistic?: boolean;
    isSending?: boolean;
    sendError?: string;
}

export interface Conversation {
    _id: string;
    participants: Array<{
        _id: string;
        username: string;
        avatar?: string;
        full_name?: string;
    }>;
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}

interface ConversationsState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    isLoading: boolean;
    setConversations: (conversations: Conversation[]) => void;
    setCurrentConversation: (conversation: Conversation | null) => void;
    setMessages: (messages: Message[]) => void;
    addOptimisticMessage: (message: Message) => string; // Returns temp ID
    confirmMessage: (tempId: string, serverMessage: Message) => void;
    markMessageAsFailed: (tempId: string, error: string) => void;
    removeMessage: (messageId: string) => void;
    updateConversationUnreadCount: (conversationId: string, count: number) => void;
    setLoading: (loading: boolean) => void;
}

export const useConversationsStore = create<ConversationsState>((set, get) => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,

    setConversations: (conversations) => set({ conversations }),

    setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

    setMessages: (messages) => set({ messages }),

    // OPTIMISTIC UI: Thêm message ngay lập tức, trước khi có response từ server
    addOptimisticMessage: (message: Message) => {
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const optimisticMessage: Message = {
            ...message,
            _id: tempId,
            isOptimistic: true,
            isSending: true,
            createdAt: new Date().toISOString()
        };

        set((state) => ({
            messages: [...state.messages, optimisticMessage]
        }));

        console.log('[OPTIMISTIC_UI] Added optimistic message:', tempId);
        return tempId;
    },

    // Xác nhận message đã gửi thành công, thay temp ID bằng ID thật từ server
    confirmMessage: (tempId: string, serverMessage: Message) => {
        set((state) => ({
            messages: state.messages.map((msg) =>
                msg._id === tempId
                    ? {
                        ...serverMessage,
                        isOptimistic: false,
                        isSending: false
                    }
                    : msg
            )
        }));

        console.log('[OPTIMISTIC_UI] Confirmed message:', tempId, '->', serverMessage._id);
    },

    // Đánh dấu message gửi lỗi
    markMessageAsFailed: (tempId: string, error: string) => {
        set((state) => ({
            messages: state.messages.map((msg) =>
                msg._id === tempId
                    ? {
                        ...msg,
                        isSending: false,
                        sendError: error
                    }
                    : msg
            )
        }));

        console.log('[OPTIMISTIC_UI] Message failed:', tempId, error);
    },

    // Xóa message (dùng khi retry thất bại hoặc user cancel)
    removeMessage: (messageId: string) => {
        set((state) => ({
            messages: state.messages.filter((msg) => msg._id !== messageId)
        }));

        console.log('[OPTIMISTIC_UI] Removed message:', messageId);
    },

    // QUAN TRỌNG: CHỈ set giá trị unread count từ server, KHÔNG tự cộng dồn
    updateConversationUnreadCount: (conversationId: string, count: number) => {
        set((state) => ({
            conversations: state.conversations.map((conv) =>
                conv._id === conversationId
                    ? { ...conv, unreadCount: count }
                    : conv
            )
        }));

        console.log('[READ_COUNT_DEBUG_FE] Updated conversation unread count:', {
            conversationId,
            count,
            source: 'conversations.store.updateConversationUnreadCount'
        });
    },

    setLoading: (loading) => set({ isLoading: loading })
}));