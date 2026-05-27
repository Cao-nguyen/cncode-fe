
export interface ShortLink {
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    isCustom: boolean;
    clicks: number;
    expiresAt: string | null;
    createdAt: string;
}

export interface ShortLinkWithUser extends ShortLink {
    user: {
        id: string;
        fullName: string;
        email: string;
        username: string;
        avatarUrl?: string;
    } | null;
}

export interface CreateShortLinkPayload {
    originalUrl: string;
    customAlias?: string;
    expiresInDays?: number;
}

export interface UpdateShortLinkPayload {
    newAlias?: string;
    expiresInDays?: number;
}

export interface ShortLinkStats {
    totalLinks: number;
    totalClicks: number;
    activeLinks: number;
    expiredLinks: number;
    customLinks: number;
    recentClicks: Array<{
        date: string;
        clicks: number;
    }>;
    topLinks: Array<{
        shortCode: string;
        originalUrl: string;
        clicks: number;
    }>;
}
