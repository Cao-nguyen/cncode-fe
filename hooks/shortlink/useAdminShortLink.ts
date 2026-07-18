'use client';

import { useCallback, useState } from 'react';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import type { ShortLinkWithUser, ShortLinkStats } from '@/types/shortlink.type';

interface UseAdminShortLinkReturn {
    getAllLinks: (page?: number, limit?: number, search?: string) => Promise<{
        links: ShortLinkWithUser[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats: () => Promise<ShortLinkStats>;
    deleteLink: (shortCode: string) => Promise<void>;
    isLoading: boolean;
}

export function useAdminShortLink(): UseAdminShortLinkReturn {
    const [isLoading, setIsLoading] = useState(false);

    const getAllLinks = useCallback(async (page = 1, limit = 50, search = '') => {
        setIsLoading(true);
        try {
            const result = await shortlinkApi.getAllLinks(page, limit, search);
            return result;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await shortlinkApi.getStats();
            return result;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteLink = useCallback(async (shortCode: string) => {
        setIsLoading(true);
        try {
            await shortlinkApi.delete(shortCode);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        getAllLinks,
        getStats,
        deleteLink,
        isLoading,
    };
}
