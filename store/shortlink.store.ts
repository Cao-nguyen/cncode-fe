// store/shortlink.store.ts
import { create } from 'zustand';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import type { ShortLink, CreateShortLinkPayload, UpdateShortLinkPayload, ShortLinkStats } from '@/types/shortlink.type';

interface ShortLinkState {
    links: ShortLink[];
    isLoading: boolean;
    isCreating: boolean;
    currentPage: number;
    totalPages: number;
    total: number;
    stats: ShortLinkStats | null;
    isStatsLoading: boolean;

    fetchMyLinks: (page?: number) => Promise<void>;
    createLink: (payload: CreateShortLinkPayload) => Promise<ShortLink>;
    updateLink: (shortCode: string, payload: UpdateShortLinkPayload) => Promise<void>;
    deleteLink: (shortCode: string) => Promise<void>;
    fetchStats: () => Promise<void>;
    clearLinks: () => void;
}

export const useShortLinkStore = create<ShortLinkState>((set, get) => ({
    links: [],
    isLoading: false,
    isCreating: false,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    stats: null,
    isStatsLoading: false,

    fetchMyLinks: async (page = 1) => {
        set({ isLoading: true });
        try {
            const data = await shortlinkApi.getMyLinks(page);
            set({
                links: data.links,
                currentPage: data.page,
                totalPages: data.totalPages,
                total: data.total,
            });
        } catch (error) {
            console.error('Fetch my links error:', error);
            set({ links: [], total: 0 });
        } finally {
            set({ isLoading: false });
        }
    },

    createLink: async (payload) => {
        set({ isCreating: true });
        try {
            const newLink = await shortlinkApi.create(payload);
            const { currentPage, links, total } = get();
            if (currentPage === 1) {
                set({ links: [newLink, ...links], total: total + 1 });
            } else {
                set({ total: total + 1 });
            }
            return newLink;
        } finally {
            set({ isCreating: false });
        }
    },

    updateLink: async (shortCode, payload) => {
        const updated = await shortlinkApi.update(shortCode, payload);
        set((state) => ({
            links: state.links.map((l) => (l.shortCode === shortCode ? updated : l)),
        }));
    },

    deleteLink: async (shortCode) => {
        await shortlinkApi.delete(shortCode);
        const { links, currentPage, total } = get();
        const remaining = links.filter((l) => l.shortCode !== shortCode);
        set({ links: remaining, total: Math.max(0, total - 1) });
        if (remaining.length === 0 && currentPage > 1) {
            await get().fetchMyLinks(currentPage - 1);
        }
    },

    fetchStats: async () => {
        set({ isStatsLoading: true });
        try {
            const stats = await shortlinkApi.getStats();
            set({ stats });
        } catch (error) {
            console.error('Fetch stats error:', error);
        } finally {
            set({ isStatsLoading: false });
        }
    },

    clearLinks: () => set({ links: [], currentPage: 1, totalPages: 1, total: 0, stats: null }),
}));