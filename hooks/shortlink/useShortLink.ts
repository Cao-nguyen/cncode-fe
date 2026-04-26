'use client';

import { useCallback, useState } from 'react';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import type { ShortLink } from '@/types/shortlink.type';

interface UseShortLinkReturn {
    checkAlias: (alias: string) => Promise<boolean>;
    createLink: (data: { originalUrl: string; customAlias?: string; expiresInDays?: number }) => Promise<ShortLink>;
    isChecking: boolean;
    isCreating: boolean;
}

export function useShortLink(): UseShortLinkReturn {
    const [isChecking, setIsChecking] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const checkAlias = useCallback(async (alias: string): Promise<boolean> => {
        setIsChecking(true);
        try {
            const result = await shortlinkApi.checkAlias(alias);
            return result;
        } finally {
            setIsChecking(false);
        }
    }, []);

    const createLink = useCallback(async (data: {
        originalUrl: string;
        customAlias?: string;
        expiresInDays?: number;
    }): Promise<ShortLink> => {
        setIsCreating(true);
        try {
            const result = await shortlinkApi.create(data);
            return result;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return {
        checkAlias,
        createLink,
        isChecking,
        isCreating,
    };
}