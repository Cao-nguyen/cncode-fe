import { create } from 'zustand';

interface UnreadMessagesState {
    unreadCounts: Record<string, number>;
    setUnreadCount: (conversationId: string, count: number, source?: string) => void;
    clearUnreadCount: (conversationId: string) => void;
    getTotalUnread: () => number;
}

// Helper để log read count changes - sẽ xóa sau khi debug xong
function logReadCountChange(
    action: string,
    conversationId: string,
    oldValue: number,
    newValue: number,
    source: string
) {
    console.log(`[READ_COUNT_DEBUG_FE] ${action}:`, {
        conversationId,
        oldValue,
        newValue,
        delta: newValue - oldValue,
        source,
        timestamp: new Date().toISOString(),
        stack: new Error().stack?.split('\n')[2]?.trim() // Log nơi gọi
    });
}

export const useUnreadMessagesStore = create<UnreadMessagesState>((set, get) => ({
    unreadCounts: {},

    // QUAN TRỌNG: CHỈ set giá trị từ server, KHÔNG tự cộng dồn
    setUnreadCount: (conversationId: string, count: number, source = 'unknown') => {
        const oldValue = get().unreadCounts[conversationId] || 0;

        // Log để debug
        if (oldValue !== count) {
            logReadCountChange(
                'SET_UNREAD_COUNT',
                conversationId,
                oldValue,
                count,
                source
            );
        }

        // CHỈ set giá trị, không cộng dồn
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [conversationId]: count
            }
        }));
    },

    clearUnreadCount: (conversationId: string) => {
        const oldValue = get().unreadCounts[conversationId] || 0;

        if (oldValue > 0) {
            logReadCountChange(
                'CLEAR_UNREAD_COUNT',
                conversationId,
                oldValue,
                0,
                'clearUnreadCount'
            );
        }

        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [conversationId]: 0
            }
        }));
    },

    getTotalUnread: () => {
        const counts = get().unreadCounts;
        return Object.values(counts).reduce((sum, count) => sum + count, 0);
    }
}));