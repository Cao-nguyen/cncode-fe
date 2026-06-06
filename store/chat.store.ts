import { create } from 'zustand';

interface ChatStore {
    unreadAdminChatCount: number;
    setUnreadAdminChatCount: (count: number) => void;
    incrementUnreadAdminChat: () => void;
    resetUnreadAdminChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    unreadAdminChatCount: 0,
    setUnreadAdminChatCount: (count: number) => set({ unreadAdminChatCount: count }),
    incrementUnreadAdminChat: () =>
        set((state) => ({ unreadAdminChatCount: state.unreadAdminChatCount + 1 })),
    resetUnreadAdminChat: () => set({ unreadAdminChatCount: 0 }),
}));