
export interface HelpCenterFAQ {
    _id: string;
    question: string;
    answer: string;
    category: 'account' | 'payment' | 'course' | 'technical' | 'other';
    order: number;
    isActive: boolean;
    views: number;
    helpfulCount: number;
    helpfulUsers: string[];
    userLiked?: boolean;
    createdBy?: {
        _id: string;
        fullName: string;
        email: string;
    };
    updatedBy?: {
        _id: string;
        fullName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface HelpCenterStats {
    total: number;
    active: number;
    inactive: number;
    byCategory: Record<string, number>;
}

export interface CreateHelpCenterPayload {
    question: string;
    answer: string;
    category: string;
    order?: number;
}

export interface UpdateHelpCenterPayload {
    question?: string;
    answer?: string;
    category?: string;
    order?: number;
    isActive?: boolean;
}

export interface HelpCenterListResponse {
    success: boolean;
    data: HelpCenterFAQ[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

export interface HelpCenterSingleResponse {
    success: boolean;
    data: HelpCenterFAQ;
    message?: string;
}

export interface HelpCenterStatsResponse {
    success: boolean;
    data: HelpCenterStats;
    message?: string;
}
