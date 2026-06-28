export interface Review {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        avatar?: string;
    };
    targetType: 'course' | 'product';
    targetId: string;
    rating: number;
    comment: string;
    isHidden: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStats {
    average: number;
    total: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface ReviewsResponse {
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: ReviewStats;
}