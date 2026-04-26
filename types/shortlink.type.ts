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
        name: string;
        email: string;
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

export interface ShortLinkResponse {
    success: boolean;
    data: ShortLink;
}

export interface ShortLinkListResponse {
    success: boolean;
    data: {
        links: ShortLink[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface ShortLinkAdminListResponse {
    success: boolean;
    data: {
        links: ShortLinkWithUser[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface CheckAliasResponse {
    alias: string;
    available: boolean;
}