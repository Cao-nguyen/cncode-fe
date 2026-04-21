// types/activity.type.ts
export interface IActivityUser {
    fullName: string;
    email: string;
    avatar?: string;
}

export interface IActivityMetadata {
    // Post specific
    views?: number;
    likes?: number;
    comments?: number;
    slug?: string;

    // Product specific
    price?: number;
    downloads?: number;
    rating?: number;

    // Payment specific
    amount?: number;
    xuAmount?: number;
    method?: 'xu' | 'banking';
    methodText?: string;
    amountText?: string;
    productId?: string;
    productSlug?: string;
}

export interface IActivity {
    id: string;
    type: 'post' | 'product' | 'payment';
    action: string;
    title: string;
    status?: 'draft' | 'pending' | 'published' | 'rejected' | 'success' | 'failed';
    user: IActivityUser;
    metadata?: IActivityMetadata;
    createdAt: string;
    link?: string;
}

export interface IActivityFilters {
    type: string;
    status: string;
    search: string;
    startDate: string;
    endDate: string;
}

export interface IActivityResponse {
    success: boolean;
    data: IActivity[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}