export type CrossPromotionStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type CooperationType = 'blog-post' | 'fanpage-post';

export interface CrossPromotionRequester {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
}

export interface CrossPromotionRequesterInfo {
    organizationName?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
}

export interface CrossPromotionAdminResponse {
    message: string;
    respondedBy?: { _id: string; fullName: string };
    respondedAt: string;
}

export interface CrossPromotionRequest {
    _id: string;
    title: string;
    content: string;
    cooperationType: CooperationType;
    requester: CrossPromotionRequester;
    requesterInfo: CrossPromotionRequesterInfo;
    status: CrossPromotionStatus;
    createdAt: string;
    updatedAt?: string;
    adminResponse?: CrossPromotionAdminResponse;
    completedAt?: string;
}

export interface CrossPromotionStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
}

export interface CrossPromotionPagination {
    total: number;
    page: number;
    pages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: CrossPromotionPagination;
}
